<script lang="ts">
	type Props = {
		name: string;
		imageUrl: string;
		isFlipped: boolean;
		isSelected: boolean;
		isCorrect?: boolean;
		isRevealed?: boolean;
		style?: string;
		onClick: () => void;
	};

	let {
		name,
		imageUrl,
		isFlipped,
		isSelected,
		isCorrect = false,
		isRevealed = false,
		style = '',
		onClick
	}: Props = $props();

	const nameLen = $derived(name.trim().length);
	const isLongName = $derived(nameLen > 20);
	const isVeryLongName = $derived(nameLen > 28);

	let wrapperEl = $state<HTMLButtonElement | null>(null);
	let tiltX = $state(0);
	let tiltY = $state(0);

	function attachWrapperEl(node: HTMLButtonElement) {
		wrapperEl = node;
		return () => {
			if (wrapperEl === node) wrapperEl = null;
		};
	}

	function borderColor() {
		if (isRevealed) return isCorrect ? '#ff9d00' : '#ff007a';
		return isSelected ? '#ff9d00' : 'rgba(255, 157, 0, 0.55)';
	}

	function handlePointerMove(e: PointerEvent) {
		if (!wrapperEl) return;
		const rect = wrapperEl.getBoundingClientRect();
		const px = (e.clientX - rect.left) / rect.width; // 0..1
		const py = (e.clientY - rect.top) / rect.height; // 0..1
		const nx = (px - 0.5) * 2; // -1..1
		const ny = (py - 0.5) * 2; // -1..1

		// small, premium tilt range
		tiltX = ny * -10;
		tiltY = nx * 12;
	}

	function handlePointerLeave() {
		tiltX = 0;
		tiltY = 0;
	}
</script>

<button
	class="card-wrapper"
	type="button"
	aria-label={`Card ${name}`}
	style={`--border:${borderColor()}; --tiltX:${tiltX}deg; --tiltY:${tiltY}deg; ${style}`}
	onpointermove={handlePointerMove}
	onpointerleave={handlePointerLeave}
	onclick={(e) => {
		e.stopPropagation();
		onClick();
	}}
	{@attach attachWrapperEl}
>
	<div class="card-visual" class:is-flipped={isFlipped}>
		<div class="card-face card-back" aria-hidden="true">
			<div class="back-grid"></div>
		</div>

		<div class="card-face card-front">
			<div class="front-border"></div>
			<div class="front-inner">
				<div class="art">
					{#if imageUrl}
						<img src={imageUrl} alt={name} draggable="false" />
					{/if}
					<div class="scanlines" aria-hidden="true"></div>
				</div>

				<div
					class="name"
					class:long-name={isLongName}
					class:very-long-name={isVeryLongName}
				>
					{name.toUpperCase()}
				</div>

				<!-- badges intentionally omitted on small screens -->
			</div>
		</div>
	</div>
</button>

<style>
	.card-wrapper {
		position: absolute;
		top: 0;
		left: 0;
		width: var(--cardW, 240px);
		height: var(--cardH, 340px);
		padding: 0;
		border: 0;
		background: transparent;
		cursor: pointer;
		transform-style: preserve-3d;
		pointer-events: auto;
		-webkit-tap-highlight-color: transparent;
	}

	.card-visual {
		--flipY: 0deg;
		--hoverZ: 0px;
		--hoverScale: 1;
		position: relative;
		width: 100%;
		height: 100%;
		transform-style: preserve-3d;
		transition:
			transform 260ms cubic-bezier(0.2, 0.8, 0.2, 1),
			filter 260ms ease;
		will-change: transform;
		transform: translateZ(var(--hoverZ)) scale(var(--hoverScale)) rotateY(var(--flipY))
			rotateX(var(--tiltX)) rotateY(var(--tiltY));
	}

	.card-wrapper:hover .card-visual {
		/* Subtle "float off the board" — only adjust Z/scale */
		--hoverZ: 40px;
		--hoverScale: 1.02;
		filter: drop-shadow(0 30px 40px rgba(0, 0, 0, 0.55));
	}

	.card-face {
		position: absolute;
		inset: 0;
		border-radius: 18px;
		backface-visibility: hidden;
		transform-style: preserve-3d;
	}

	.card-back {
		background:
			radial-gradient(circle at top left, rgba(255, 157, 0, 0.14), transparent 55%),
			linear-gradient(180deg, rgba(10, 15, 25, 0.95), rgba(5, 7, 10, 0.95));
		border: 2px solid rgba(255, 157, 0, 0.35);
		box-shadow: inset 0 0 0 1px rgba(255, 157, 0, 0.08);
		transform: rotateY(0deg);
		overflow: hidden;
	}

	.back-grid {
		position: absolute;
		inset: -40%;
		background-image:
			linear-gradient(rgba(255, 157, 0, 0.1) 1px, transparent 1px),
			linear-gradient(90deg, rgba(255, 157, 0, 0.1) 1px, transparent 1px);
		background-size: 32px 32px;
		opacity: 0.25;
		transform: rotate(20deg);
	}

	.card-front {
		/* Nudge forward to avoid z-fighting when hovering/tilting */
		transform: rotateY(180deg) translateZ(0.5px);
	}

	.front-border {
		position: absolute;
		inset: 0;
		border-radius: 18px;
		border: 2px solid var(--border);
		transform: translateZ(1px);
		box-shadow:
			0 0 0 1px rgba(255, 157, 0, 0.12),
			0 0 22px rgba(255, 157, 0, 0.16);
		opacity: 0.95;
	}

	.front-inner {
		position: absolute;
		inset: 10px;
		border-radius: 14px;
		background: rgba(10, 15, 25, 0.92);
		border: 1px solid rgba(15, 23, 42, 0.9);
		transform: translateZ(2px);
		transform-style: preserve-3d;
		display: grid;
		grid-template-rows: 1fr auto auto;
		gap: 10px;
		padding: 12px;
	}

	.art {
		position: relative;
		border-radius: 12px;
		/* background: linear-gradient(135deg, rgba(26, 28, 44, 1), rgba(0, 68, 255, 0.22)); */
		background: white;
		border: 1px solid rgba(255, 157, 0, 0.18);
		overflow: hidden;
		/* padding: 12px; */
	}

	.art img {
		width: 100%;
		height: 100%;
		object-fit: contain;
		display: block;
		user-select: none;
		pointer-events: none;
	}

	.scanlines {
		position: absolute;
		inset: 0;
		opacity: 0.06;
		background: repeating-linear-gradient(
			to bottom,
			rgba(255, 255, 255, 0.2) 0px,
			rgba(255, 255, 255, 0.2) 1px,
			transparent 3px,
			transparent 7px
		);
		mix-blend-mode: overlay;
		pointer-events: none;
	}

	.name {
		font-weight: 900;
		font-size: 1rem;
		line-height: 1.05;
		letter-spacing: -0.03em;
		text-align: center;
		text-wrap: balance;
		color: white;
		text-shadow: 0 0 18px rgba(255, 157, 0, 0.18);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		max-height: calc(2 * 1.05em);
	}

	.name.long-name {
		font-size: 0.88rem;
	}

	.name.very-long-name {
		font-size: 0.78rem;
	}

	.card-visual.is-flipped {
		--flipY: 180deg;
	}

	@media (max-width: 720px) {
		.front-inner {
			padding: 10px;
			gap: 8px;
		}

		.name {
			font-size: 0.95rem;
		}

		.name.long-name {
			font-size: 0.84rem;
		}

		.name.very-long-name {
			font-size: 0.74rem;
		}
	}
</style>
