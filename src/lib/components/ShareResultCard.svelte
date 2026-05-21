<script lang="ts">
	let {
		score,
		playUrl,
		root = $bindable<HTMLElement | null>(null)
	}: {
		score: number;
		playUrl: string;
		root?: HTMLElement | null;
	} = $props();

	const formattedScore = $derived(score.toLocaleString());
	const displayUrl = $derived(playUrl.replace(/^https?:\/\//, ''));
</script>

<div class="share-card" bind:this={root}>
	<div class="bg-grid" aria-hidden="true"></div>
	<div class="bg-glow" aria-hidden="true"></div>

	<header class="brand">
		<p class="eyebrow">Digimon puzzle challenge</p>
		<h1>DIGI-ODD ONE OUT</h1>
	</header>

	<p class="pitch">
		Four Digimon enter the arena. Three share a hidden trait. One is the anomaly. Find the odd one
		out.
	</p>

	<div class="cards" aria-hidden="true">
		{#each Array.from({ length: 4 }, (_, i) => i) as i (i)}
			<div class="mini-card" class:odd={i === 3}>
				<span class="mini-card-mark">{i === 3 ? '?' : '◆'}</span>
			</div>
		{/each}
	</div>

	<div class="score-block">
		<p class="score-label">Cycle Potential</p>
		<p class="score-value">{formattedScore}</p>
		<p class="challenge">Can you beat my score?</p>
	</div>

	<footer class="cta-block">
		<p class="cta-label">Play now</p>
		<p class="cta-url">{displayUrl}</p>
	</footer>
</div>

<style>
	.share-card {
		position: relative;
		width: 1080px;
		height: 1080px;
		box-sizing: border-box;
		padding: 72px 64px 64px;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		overflow: hidden;
		background: #05070a;
		color: #e2e8f0;
		font-family: 'Outfit', ui-sans-serif, system-ui, sans-serif;
	}

	.bg-grid {
		position: absolute;
		inset: 0;
		opacity: 0.45;
		background-image:
			linear-gradient(rgba(0, 242, 255, 0.08) 1px, transparent 1px),
			linear-gradient(90deg, rgba(0, 242, 255, 0.08) 1px, transparent 1px);
		background-size: 64px 64px;
		pointer-events: none;
	}

	.bg-glow {
		position: absolute;
		left: 50%;
		top: 42%;
		width: 720px;
		height: 720px;
		transform: translate(-50%, -50%);
		background:
			radial-gradient(circle at center, rgba(0, 242, 255, 0.2), transparent 62%),
			radial-gradient(circle at 28% 58%, rgba(255, 0, 122, 0.14), transparent 55%);
		pointer-events: none;
	}

	.brand {
		position: relative;
		z-index: 1;
		margin: 0;
	}

	.eyebrow {
		margin: 0 0 12px;
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 22px;
		letter-spacing: 0.32em;
		text-transform: uppercase;
		color: #64748b;
	}

	.brand h1 {
		margin: 0;
		font-size: 72px;
		font-weight: 900;
		font-style: italic;
		letter-spacing: -0.05em;
		line-height: 0.95;
		color: white;
		text-decoration: underline;
		text-decoration-color: #00f2ff;
		text-decoration-thickness: 6px;
		text-underline-offset: 14px;
	}

	.pitch {
		position: relative;
		z-index: 1;
		margin: 28px 0 0;
		max-width: 820px;
		font-size: 30px;
		line-height: 1.55;
		font-weight: 650;
		color: #94a3b8;
	}

	.cards {
		position: relative;
		z-index: 1;
		margin-top: 48px;
		display: flex;
		gap: 22px;
		justify-content: center;
	}

	.mini-card {
		width: 132px;
		height: 188px;
		border-radius: 18px;
		border: 3px solid rgba(0, 242, 255, 0.35);
		background: linear-gradient(160deg, rgba(15, 23, 42, 0.95), rgba(2, 6, 23, 0.98));
		box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45);
		display: grid;
		place-items: center;
		transform: skewX(-10deg);
	}

	.mini-card.odd {
		border-color: rgba(255, 0, 122, 0.75);
		box-shadow:
			0 0 28px rgba(255, 0, 122, 0.35),
			0 18px 40px rgba(0, 0, 0, 0.45);
	}

	.mini-card-mark {
		transform: skewX(10deg);
		font-size: 40px;
		font-weight: 900;
		color: #00f2ff;
	}

	.mini-card.odd .mini-card-mark {
		color: #ff007a;
	}

	.score-block {
		position: relative;
		z-index: 1;
		margin-top: auto;
		width: 100%;
		max-width: 760px;
		padding: 36px 40px;
		border-radius: 28px;
		border: 2px solid #1e293b;
		background: rgba(15, 23, 42, 0.72);
		transform: skewX(-10deg);
	}

	.score-label {
		margin: 0 0 8px;
		transform: skewX(10deg);
		font-weight: 900;
		text-transform: uppercase;
		font-size: 22px;
		letter-spacing: 0.22em;
		color: #64748b;
	}

	.score-value {
		margin: 0;
		transform: skewX(10deg);
		font-size: 112px;
		font-weight: 900;
		line-height: 1;
		letter-spacing: -0.05em;
		color: #00f2ff;
		font-variant-numeric: tabular-nums;
	}

	.challenge {
		margin: 16px 0 0;
		transform: skewX(10deg);
		font-size: 28px;
		font-weight: 800;
		color: white;
	}

	.cta-block {
		position: relative;
		z-index: 1;
		margin-top: 28px;
	}

	.cta-label {
		margin: 0;
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 20px;
		letter-spacing: 0.28em;
		text-transform: uppercase;
		color: #64748b;
	}

	.cta-url {
		margin: 8px 0 0;
		font-size: 34px;
		font-weight: 900;
		color: #00f2ff;
		word-break: break-all;
	}
</style>
