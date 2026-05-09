<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly, scale } from 'svelte/transition';
	import { cubicOut, quintOut } from 'svelte/easing';
	import { RefreshCw } from 'lucide-svelte';
	import type { GameState, Puzzle } from '$lib/game/types';
	import { GAME, SCENE } from '$lib/game/constants';
	import { fetchPuzzle } from '$lib/game/puzzleClient';
	import DigiCardDom from '$lib/components/DigiCardDom.svelte';
	import { computeHandLayout } from '$lib/ui/handLayout';

	let started = $state(false);

	let puzzle = $state<Puzzle | null>(null);
	let loading = $state(false);
	let score = $state(0);
	let lives = $state<number>(GAME.startingLives);
	let selectedIndex = $state<number | null>(null);
	let gameState = $state<GameState>('dealing');
	let isFlipped = $state(false);
	let guessStartMs = $state<number | null>(null);

	let dealTimeout: ReturnType<typeof setTimeout> | null = null;
	let gameOverTimeout: ReturnType<typeof setTimeout> | null = null;

	function clearTimers() {
		if (dealTimeout) clearTimeout(dealTimeout);
		if (gameOverTimeout) clearTimeout(gameOverTimeout);
		dealTimeout = null;
		gameOverTimeout = null;
	}

	async function fetchNewPuzzle() {
		clearTimers();
		loading = true;
		gameState = 'dealing';
		isFlipped = false;
		guessStartMs = null;
		selectedIndex = null;
		try {
			const newPuzzle = await fetchPuzzle();
			puzzle = newPuzzle;

			dealTimeout = setTimeout(() => {
				gameState = 'guessing';
				isFlipped = true;
				guessStartMs = typeof performance !== 'undefined' ? performance.now() : Date.now();
			}, GAME.dealFlipDelayMs);
		} catch (err) {
			console.error('Failed to fetch puzzle', err);
		} finally {
			loading = false;
		}
	}

	function handleSelect(index: number) {
		if (gameState !== 'guessing') return;
		selectedIndex = index;
		gameState = 'revealing';

		if (index === puzzle?.answer_index) {
			const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
			const elapsed = guessStartMs == null ? GAME.scoreSpeedWindowMs : Math.max(0, now - guessStartMs);
			const t = Math.min(1, elapsed / GAME.scoreSpeedWindowMs); // 0..1
			const speedBonus = Math.round(GAME.scoreSpeedBonusMax * (1 - t));
			score = score + GAME.scorePerCorrect + speedBonus;
			return;
		}

		const nextLives = lives - 1;
		lives = nextLives;
		if (nextLives <= 0) {
			gameOverTimeout = setTimeout(() => {
				gameState = 'gameOver';
			}, GAME.gameOverDelayMs);
		}
	}

	function restartGame() {
		score = 0;
		lives = GAME.startingLives;
		fetchNewPuzzle();
	}

	function startGame() {
		started = true;
		restartGame();
	}

	onMount(() => () => clearTimers());

	const logicText = $derived(
		gameState === 'revealing' && puzzle
			? puzzle.explanation
			: 'Analyze the data nodes. Three entities share a structural compatibility tier. Identify the anomaly to resolve the loop.'
	);

	let showLogicLog = $state(false);

	let viewportSize = $state({ width: 0, height: 0 });
	let boardEl = $state<HTMLDivElement | null>(null);

	let isMobile = $state(false);
	let isPortrait = $state(false);

	function computeOrientationState() {
		if (typeof window === 'undefined') return;
		isMobile =
			/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
			('ontouchstart' in window && window.innerWidth < 1024);
		isPortrait =
			window.matchMedia?.('(orientation: portrait)')?.matches ??
			window.innerHeight > window.innerWidth;
	}

	async function requestFullscreenLandscape() {
		try {
			if (typeof document === 'undefined') return;
			if (!document.fullscreenElement) {
				await document.documentElement.requestFullscreen?.();
			}
			// Best-effort: works on some Android browsers, limited on iOS.
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const orientation = (screen as any)?.orientation;
			if (orientation?.lock) {
				await orientation.lock('landscape');
			}
		} catch {
			// ignore - many browsers disallow/limit this
		} finally {
			computeOrientationState();
		}
	}

	$effect(() => {
		if (!boardEl) return;
		const ro = new ResizeObserver(([entry]) => {
			viewportSize = {
				width: entry.contentRect.width,
				height: entry.contentRect.height
			};
		});
		ro.observe(boardEl);
		return () => ro.disconnect();
	});

	function computeCardSize(vw: number, vh: number) {
		// Tune sizing so phones get smaller cards without changing desktop.
		const { minW, maxW, divisor } =
			vw < 380
				? { minW: 96, maxW: 152, divisor: 6.1 }
				: vw < 480
					? { minW: 106, maxW: 170, divisor: 5.6 }
					: vh < 520
						? { minW: 118, maxW: 200, divisor: 5.1 }
						: { minW: 150, maxW: 240, divisor: 4.6 };

		const estimatedW = vw / divisor;
		const cardWidth = Math.max(minW, Math.min(maxW, estimatedW));
		const cardHeight = (cardWidth * 340) / 240;

		return { cardWidth, cardHeight };
	}

	const cardLayout = $derived.by(() => {
		const cards = puzzle?.cards ?? [];
		if (!viewportSize.width || !viewportSize.height) return [];

		const { cardWidth, cardHeight } = computeCardSize(viewportSize.width, viewportSize.height);
		const cardXSpacingPx = cardWidth * 1.12;
		const groupYOffsetPx = viewportSize.height < 480 ? -20 : SCENE.cardsGroupPosition[1] * -80;

		return computeHandLayout(cards.length, {
			width: viewportSize.width,
			height: viewportSize.height,
			cardWidth,
			cardHeight,
			cardXSpacingPx,
			groupYOffsetPx
		});
	});

	const cardSizeStyle = $derived.by(() => {
		if (!viewportSize.width || !viewportSize.height) return '';
		const { cardWidth, cardHeight } = computeCardSize(viewportSize.width, viewportSize.height);
		return `--cardW:${cardWidth}px; --cardH:${cardHeight}px;`;
	});

	onMount(() => {
		computeOrientationState();
		const onChange = () => computeOrientationState();
		window.addEventListener('resize', onChange, { passive: true });
		window.addEventListener('orientationchange', onChange, { passive: true });
		return () => {
			window.removeEventListener('resize', onChange);
			window.removeEventListener('orientationchange', onChange);
		};
	});
</script>

<div class="game-root">
	<!-- Background Theme Elements -->
	<div class="digital-grid" aria-hidden="true"></div>
	<div class="glow-orb" aria-hidden="true"></div>

	{#if !started}
		<div class="overlay home" role="dialog" aria-modal="true" in:fade={{ duration: 180 }}>
			<div class="panel home-panel" in:scale={{ start: 0.98, duration: 220, easing: cubicOut }}>
				<h1 class="home-title">DIGI-ODD ONE OUT</h1>
				<p class="home-brief">
					Four Digimon enter the arena. Three share a hidden trait. One is the anomaly. Identify the
					odd one out to stabilize the loop.
				</p>

				<button class="start" type="button" onclick={startGame}>
					<span>Start</span>
				</button>
			</div>
		</div>
	{/if}

	<!-- Card Viewport (DOM/CSS 3D) -->
	<div class="viewport">
		<div class="board" aria-label="Card board" bind:this={boardEl}>
			{#if puzzle}
				{#each puzzle.cards as card, idx (card.name)}
					<DigiCardDom
						name={card.name}
						imageUrl={card.imageUrl ?? ''}
						{isFlipped}
						isSelected={selectedIndex === idx}
						isCorrect={puzzle.answer_index === idx}
						isRevealed={gameState === 'revealing'}
						style={`${cardSizeStyle} transform:${cardLayout[idx]?.transform ?? ''}; z-index:${cardLayout[idx]?.zIndex ?? 0};`}
						onClick={() => handleSelect(idx)}
					/>
				{/each}
			{/if}
		</div>
	</div>

	<!-- UI Overlay: Header -->
	<header class="hud header" class:is-hidden={!started}>
		<div
			class="title"
			in:fly={{ x: -20, duration: 420, easing: quintOut }}
			out:fade={{ duration: 140 }}
		>
			<h1>DIGI-ODD ONE OUT</h1>
		</div>

		<div
			class="stats"
			in:fly={{ x: 20, duration: 420, easing: quintOut }}
			out:fade={{ duration: 140 }}
		>
			<div class="stat lives">
				<p class="label">Lives Remaining</p>
				<div class="bars">
					{#each Array.from({ length: GAME.startingLives }, (_, i) => i) as i (i)}
						<div class="bar" class:is-on={i < lives}></div>
					{/each}
				</div>
			</div>

			<div class="stat score">
				<p class="label">Synchro Score</p>
				<p class="value">{score.toLocaleString()}</p>
			</div>
		</div>
	</header>

	<!-- UI Overlay: Footer -->
	<footer class="hud footer" class:is-hidden={!started}>
		<div class="footer-left">
			<button class="log-btn" type="button" onclick={() => (showLogicLog = true)}>
				View logic log
			</button>
		</div>

		<div class="footer-right" aria-live="polite">
			{#key gameState === 'revealing' ? 'next' : 'sync'}
				{#if gameState === 'revealing' && lives > 0}
					<button
						class="next"
						type="button"
						onclick={fetchNewPuzzle}
						in:fly={{ x: 10, duration: 200, easing: cubicOut }}
						out:fly={{ x: -10, duration: 160, easing: cubicOut }}
					>
						INITIALIZE NEXT SEQUENCE
					</button>
				{:else}
					<div class="sync" in:fade={{ duration: 220 }} out:fade={{ duration: 140 }}>
						<div class="sync-bars" aria-hidden="true">
							<div class="sync-bar on"></div>
							<div class="sync-bar on"></div>
							<div class="sync-bar"></div>
						</div>
						<p class="sync-label">Sync Potential</p>
					</div>
				{/if}
			{/key}
		</div>
	</footer>

	{#if started && showLogicLog}
		<div
			class="overlay logic-log"
			role="dialog"
			aria-modal="true"
			aria-label="Logic log"
			tabindex="0"
			onclick={(e) => {
				if (e.currentTarget === e.target) showLogicLog = false;
			}}
			onkeydown={(e) => {
				if (e.key === 'Escape') showLogicLog = false;
			}}
			in:fade={{ duration: 140 }}
			out:fade={{ duration: 120 }}
		>
			<div class="panel logic-log-panel" in:scale={{ start: 0.98, duration: 160, easing: cubicOut }}>
				<div class="logic-log-head">
					<p class="log-label">LOGIC_LOG_V2.04</p>
					<button class="close" type="button" onclick={() => (showLogicLog = false)}>Close</button>
				</div>
				<p class="log-text">{logicText}</p>
			</div>
		</div>
	{/if}

	<!-- Loading Overlay -->
	{#if started && loading}
		<div
			class="overlay loading"
			role="status"
			aria-live="polite"
			in:fade={{ duration: 160 }}
			out:fade={{ duration: 140 }}
		>
			<div class="spinner" aria-hidden="true"></div>
			<h2>DECRYPTING DATA NODES...</h2>
			<div class="pulse" aria-hidden="true">
				<span></span>
				<span></span>
				<span></span>
			</div>
		</div>
	{/if}

	<!-- Game Over Overlay -->
	{#if started && gameState === 'gameOver'}
		<div
			class="overlay gameover"
			role="dialog"
			aria-modal="true"
			in:fade={{ duration: 180 }}
			out:fade={{ duration: 120 }}
		>
			<div class="panel" in:scale={{ start: 0.98, duration: 200, easing: cubicOut }}>
				<div class="badge" aria-hidden="true">
					<RefreshCw class="badge-icon" />
				</div>
				<h2>NETWORK<br />COLLAPSE</h2>
				<p class="sub">Critical system failure detected</p>

				<div class="result">
					<p class="result-label">Cycle Potential Result</p>
					<p class="result-score">{score}</p>
				</div>

				<button class="restart" type="button" onclick={restartGame}>
					<span>Initialize Reboot</span>
				</button>
			</div>
		</div>
	{/if}

	<!-- Scanlines -->
	<div class="scanline" aria-hidden="true"></div>

	{#if started && isMobile && isPortrait}
		<div class="overlay rotate" role="dialog" aria-modal="true">
			<div class="panel rotate-panel" in:scale={{ start: 0.98, duration: 180, easing: cubicOut }}>
				<h2>ROTATE DEVICE</h2>
				<p class="sub">This game is best experienced in landscape.</p>

				<div class="rotate-actions">
					<button class="restart" type="button" onclick={requestFullscreenLandscape}>
						<span>Go Fullscreen</span>
					</button>
					<p class="rotate-hint">If fullscreen is blocked, just rotate your device.</p>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.game-root {
		position: relative;
		width: 100%;
		height: 100%;
		overflow: hidden;
		user-select: none;
		background: #05070a;
	}

	/* Theme effect classes are global in `src/routes/layout.css` */

	.viewport {
		position: absolute;
		inset: 0;
		z-index: 10;
		perspective: 1200px;
	}

	.board {
		position: relative;
		width: 100%;
		height: 100%;
		transform-style: preserve-3d;
	}

	/* Keep cards centered and not blocked by HUD */
	.board :global(.card-wrapper) {
		transform-style: preserve-3d;
	}

	.hud {
		position: absolute;
		inset-inline: 3rem;
		z-index: 20;
		pointer-events: none;
	}

	.hud.is-hidden {
		opacity: 0;
		pointer-events: none;
	}

	.header {
		top: 3rem;
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 3rem;
	}

	.title h1 {
		font-size: clamp(2rem, 3.6vw, 3.25rem);
		font-weight: 900;
		font-style: italic;
		letter-spacing: -0.04em;
		color: white;
		text-decoration: underline;
		text-decoration-color: #00f2ff;
		text-decoration-thickness: 4px;
		text-underline-offset: 10px;
	}

	.stats {
		display: flex;
		gap: 3rem;
		pointer-events: auto;
	}

	.label {
		font-family:
			ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
			monospace;
		font-size: 10px;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: rgb(100 116 139);
		margin-bottom: 0.25rem;
		text-align: right;
	}

	.bars {
		display: flex;
		gap: 0.5rem;
		justify-content: flex-end;
	}

	.bar {
		width: 32px;
		height: 8px;
		background: rgb(30 41 59);
		transition: all 500ms ease;
	}

	.bar.is-on {
		background: #ff007a;
		box-shadow: 0 0 10px rgba(255, 0, 122, 0.6);
	}

	.value {
		font-size: 2rem;
		font-weight: 800;
		letter-spacing: -0.02em;
		color: #00f2ff;
		text-align: right;
		font-variant-numeric: tabular-nums;
	}

	.footer {
		bottom: clamp(1rem, 5vh, 3rem);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		padding: 0.75rem 0.75rem calc(0.75rem + env(safe-area-inset-bottom));
	}

	.footer-left {
		pointer-events: auto;
	}

	.log-label {
		font-family:
			ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
			monospace;
		font-size: 10px;
		letter-spacing: 0.3em;
		text-transform: uppercase;
		color: #00f2ff;
		margin-bottom: 0.75rem;
	}

	.log-text {
		font-size: 0.95rem;
		line-height: 1.6;
		font-style: italic;
		font-weight: 600;
		color: rgb(148 163 184);
	}

	.log-btn {
		pointer-events: auto;
		padding: 0.65rem 0.9rem;
		border-radius: 999px;
		border: 1px solid rgba(255, 255, 255, 0.14);
		background: rgba(255, 255, 255, 0.06);
		color: rgb(226 232 240);
		font-weight: 800;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		font-size: 0.7rem;
		cursor: pointer;
		transition: background 150ms ease, border-color 150ms ease;
	}

	.log-btn:hover {
		background: rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.24);
	}

	.footer-right {
		pointer-events: auto;
		display: flex;
		flex-direction: row;
		align-items: flex-end;
	}

	.next {
		background: #00f2ff;
		color: black;
		font-weight: 900;
		padding: 0.85rem 3rem;
		text-transform: uppercase;
		letter-spacing: -0.02em;
		font-size: 0.85rem;
		transform: skewX(-12deg);
		transition: background-color 180ms ease;
		cursor: pointer;
		pointer-events: auto;
		border-radius: 6px;
	}

	.next:hover {
		background: white;
	}

	.sync {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.sync-bars {
		display: flex;
		gap: 0.25rem;
	}

	.sync-bar {
		width: 32px;
		height: 8px;
		background: rgb(30 41 59);
	}

	.sync-bar.on {
		background: #00f2ff;
		box-shadow: 0 0 8px rgba(0, 242, 255, 0.4);
	}

	.sync-label {
		font-family:
			ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
			monospace;
		font-size: 10px;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: rgb(100 116 139);
	}

	.logic-log {
		background: rgba(5, 7, 10, 0.82);
		backdrop-filter: blur(18px);
	}

	.logic-log-panel {
		max-width: 760px;
		width: 100%;
	}

	.logic-log-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.close {
		pointer-events: auto;
		border: 1px solid rgba(255, 255, 255, 0.14);
		background: rgba(255, 255, 255, 0.06);
		color: rgb(226 232 240);
		padding: 0.6rem 0.8rem;
		border-radius: 999px;
		cursor: pointer;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-size: 0.7rem;
	}

	.close:hover {
		background: rgba(255, 255, 255, 0.1);
	}

	.overlay {
		position: absolute;
		inset: 0;
		z-index: 80;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.5rem;
	}

	.home {
		z-index: 90;
		background: rgba(5, 7, 10, 0.92);
		backdrop-filter: blur(28px);
	}

	.home-panel {
		max-width: 720px;
		width: 100%;
		text-align: center;
	}

	.home-title {
		font-size: clamp(2.8rem, 6vw, 4.75rem);
		font-weight: 900;
		font-style: italic;
		letter-spacing: -0.05em;
		color: white;
		text-decoration: underline;
		text-decoration-color: #00f2ff;
		text-decoration-thickness: 4px;
		text-underline-offset: 12px;
	}

	.home-brief {
		margin-top: 1.25rem;
		margin-bottom: 3rem;
		font-size: clamp(1rem, 1.7vw, 1.15rem);
		line-height: 1.7;
		font-weight: 650;
		color: rgb(148 163 184);
	}

	.start {
		width: min(480px, 100%);
		padding: 1.25rem 1rem;
		background: #00f2ff;
		color: black;
		font-weight: 900;
		font-size: 1.25rem;
		border-radius: 16px;
		transform: skewX(-12deg);
		cursor: pointer;
		transition:
			transform 120ms ease,
			background-color 180ms ease;
		box-shadow: 0 20px 40px -10px rgba(0, 242, 255, 0.4);
		pointer-events: auto;
	}

	.start:hover {
		background: white;
	}

	.start:active {
		transform: skewX(-12deg) scale(0.98);
	}

	.start span {
		display: block;
		transform: skewX(12deg);
		text-transform: uppercase;
		letter-spacing: -0.02em;
	}

	.loading {
		background: rgba(5, 7, 10, 0.9);
		backdrop-filter: blur(24px);
		flex-direction: column;
		text-align: center;
	}

	.spinner {
		width: 80px;
		height: 80px;
		border-radius: 999px;
		border: 4px solid #00f2ff;
		border-top-color: transparent;
		animation: spin 1s linear infinite;
		margin-bottom: 2rem;
	}

	.loading h2 {
		font-size: clamp(1.8rem, 3vw, 2.6rem);
		font-weight: 900;
		font-style: italic;
		letter-spacing: -0.03em;
		color: white;
	}

	.pulse {
		display: flex;
		gap: 0.5rem;
		margin-top: 1rem;
	}

	.pulse span {
		width: 48px;
		height: 4px;
		background: #00f2ff;
		animation: pulse 900ms ease-in-out infinite;
	}

	.pulse span:nth-child(2) {
		animation-delay: 75ms;
	}
	.pulse span:nth-child(3) {
		animation-delay: 150ms;
	}

	.gameover {
		z-index: 100;
		background: rgba(5, 7, 10, 0.95);
		backdrop-filter: blur(36px);
	}

	.rotate {
		z-index: 110;
		background: rgba(5, 7, 10, 0.95);
		backdrop-filter: blur(36px);
	}

	.rotate-panel {
		max-width: 540px;
		width: 100%;
		text-align: center;
	}

	.rotate-actions {
		margin-top: 2rem;
		display: grid;
		gap: 1rem;
	}

	.rotate-hint {
		font-family:
			ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
			monospace;
		font-size: 10px;
		letter-spacing: 0.3em;
		text-transform: uppercase;
		color: rgb(100 116 139);
	}

	.panel {
		max-width: 540px;
		width: 100%;
		text-align: center;
	}

	.badge {
		width: 96px;
		height: 96px;
		margin: 0 auto 2rem;
		display: grid;
		place-items: center;
		border-radius: 24px;
		background: #ff007a;
		color: white;
		font-weight: 900;
		transform: skewX(-12deg);
		box-shadow: 0 0 60px rgba(255, 0, 122, 0.4);
	}

	:global(.badge-icon) {
		width: 48px;
		height: 48px;
		transform: skewX(12deg);
	}

	.panel h2 {
		font-size: clamp(3rem, 6vw, 4.5rem);
		font-weight: 900;
		font-style: italic;
		letter-spacing: -0.05em;
		color: white;
		line-height: 0.9;
	}

	.sub {
		margin-top: 1rem;
		margin-bottom: 3rem;
		font-family:
			ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
			monospace;
		font-size: 10px;
		letter-spacing: 0.4em;
		text-transform: uppercase;
		color: rgb(100 116 139);
	}

	.result {
		background: rgba(15, 23, 42, 0.5);
		border: 1px solid rgb(30 41 59);
		border-radius: 24px;
		padding: 2rem;
		transform: skewX(-12deg);
		margin-bottom: 3rem;
	}

	.result-label {
		font-weight: 900;
		text-transform: uppercase;
		font-size: 12px;
		letter-spacing: 0.2em;
		color: rgb(100 116 139);
		margin-bottom: 0.5rem;
		transform: skewX(12deg);
	}

	.result-score {
		font-size: 4rem;
		font-weight: 900;
		letter-spacing: -0.05em;
		color: #00f2ff;
		font-variant-numeric: tabular-nums;
		transform: skewX(12deg);
	}

	.restart {
		width: 100%;
		padding: 1.25rem 1rem;
		background: #00f2ff;
		color: black;
		font-weight: 900;
		font-size: 1.25rem;
		border-radius: 16px;
		transform: skewX(-12deg);
		cursor: pointer;
		transition:
			transform 120ms ease,
			background-color 180ms ease;
		box-shadow: 0 20px 40px -10px rgba(0, 242, 255, 0.4);
		pointer-events: auto;
	}

	.restart:hover {
		background: white;
	}

	.restart:active {
		transform: skewX(-12deg) scale(0.98);
	}

	.restart span {
		display: block;
		transform: skewX(12deg);
		text-transform: uppercase;
		letter-spacing: -0.02em;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 0.3;
		}
		50% {
			opacity: 1;
		}
	}

	@media (max-width: 900px) {
		.hud {
			inset-inline: 1.25rem;
		}
		.header {
			top: 1.5rem;
			flex-direction: row;
			align-items: flex-start;
			gap: 1rem;
		}
		.title h1 {
			font-size: clamp(1.6rem, 5.2vw, 2.3rem);
			text-underline-offset: 8px;
		}
		.stats {
			width: auto;
			justify-content: flex-end;
			gap: 1rem;
		}
		/* Mobile header: keep lives compact, move score to corner */
		.stat.lives .label {
			display: none;
		}
		.stat.lives .bars .bar {
			margin-top: 0.5rem;
			width: 18px;
			height: 7px;
		}
		.stat.score {
			position: fixed;
			top: 1.5rem;
			right: 1.25rem;
			text-align: right;
		}
		.stat.score .label {
			display: none;
		}
		.stat.score .value {
			font-size: 1.6rem;
		}
		.footer {
			bottom: 1.5rem;
			flex-direction: row;
			align-items: center;
			justify-content: center;
			flex-wrap: nowrap;
			gap: 0.75rem;
		}
		.footer-right {
			align-items: center;
			justify-content: center;
		}
		.next {
			padding-inline: 1.25rem;
			text-align: center;
		}
		.log-btn {
			width: auto;
		}
	}

	@media (max-width: 900px) and (max-height: 520px) and (orientation: landscape) {
		.overlay.gameover {
			padding: 0.75rem;
		}

		.gameover .panel {
			max-width: min(720px, 100%);
			display: grid;
			grid-template-columns: 64px 1fr;
			column-gap: 0.85rem;
			row-gap: 0.35rem;
			align-items: center;
			text-align: left;
		}

		.gameover .badge {
			width: 64px;
			height: 64px;
			margin: 0;
			border-radius: 18px;
			grid-row: 1 / span 2;
			grid-column: 1;
			align-self: start;
		}

		.gameover :global(.badge-icon) {
			width: 32px;
			height: 32px;
		}

		.gameover .panel h2 {
			grid-column: 2;
			margin: 0;
			font-size: clamp(1.85rem, 4.8vw, 2.5rem);
			line-height: 0.95;
		}

		.gameover .panel h2 br {
			display: none;
		}

		.gameover .sub {
			grid-column: 2;
			margin: 0;
			letter-spacing: 0.28em;
		}

		.gameover .result {
			grid-column: 1 / -1;
			margin: 0.35rem 0 0.75rem;
			padding: 1rem 1.25rem;
			border-radius: 18px;
		}

		.gameover .result-label {
			margin-bottom: 0.25rem;
			font-size: 11px;
		}

		.gameover .result-score {
			font-size: 2.75rem;
			line-height: 1;
		}

		.gameover .restart {
			grid-column: 1 / -1;
			padding: 0.9rem 0.9rem;
			font-size: 1rem;
			border-radius: 14px;
		}
	}

	@media (max-height: 420px) {
		.header {
			top: 0.5rem;
		}
		.title h1 {
			font-size: clamp(1.35rem, 6.4vw, 1rem);
		}
	}
</style>
