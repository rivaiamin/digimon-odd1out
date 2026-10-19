<script lang="ts">
	import { CARD_BACK_IMAGE } from '$lib/game/constants';

	type Props = {
		name: string;
		imageUrl: string;
		shortcut: number;
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
		shortcut,
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

	function frameAccent() {
		if (isRevealed) return isCorrect ? 'var(--digi-correct)' : 'var(--digi-wrong)';
		if (isSelected) return 'var(--digi-gold-hi)';
		return 'var(--digi-gold-mid)';
	}
</script>

<button
	class={[
		'card-wrapper',
		{
			'is-selected': isSelected,
			'is-revealed': isRevealed,
			'is-correct': isCorrect,
			'is-face-up': isFlipped
		}
	]}
	type="button"
	aria-label={`Card ${shortcut}: ${name}. Press ${shortcut} to choose.`}
	style={`--frame-accent:${frameAccent()}; ${style}`}
	onclick={(e) => {
		e.stopPropagation();
		onClick();
	}}
>
	<div class="card-motion">
		{#if isFlipped}
			<div class="card-surface card-front">
				<div class="frame-outer">
					<div class="frame-inner">
						<div class="corner corner-tl" aria-hidden="true"></div>
						<span class="card-shortcut" aria-hidden="true">{shortcut}</span>
						<div class="corner corner-tr" aria-hidden="true"></div>

						<div class="art-window">
							{#if imageUrl}
								<img src={imageUrl} alt={name} draggable="false" />
							{/if}
						</div>

						<div class="name-band">
							<p class={['name', { 'long-name': isLongName, 'very-long-name': isVeryLongName }]}>
								{name}
							</p>
						</div>

						<div class="card-footer" aria-hidden="true">
							<span class="stat-pip"></span>
							<span class="stat-pip filled"></span>
							<span class="stat-pip"></span>
						</div>
					</div>
				</div>
			</div>
		{:else}
			<div class="card-surface card-back" aria-hidden="true">
				<div class="back-frame">
					<div class="back-core">
						<img
							class="back-art"
							src={CARD_BACK_IMAGE}
							alt=""
							draggable="false"
							loading="lazy"
							decoding="async"
						/>
					</div>
				</div>
			</div>
		{/if}
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
		pointer-events: auto;
		-webkit-tap-highlight-color: transparent;
	}

	.card-motion {
		--hoverScale: 1;
		position: relative;
		width: 100%;
		height: 100%;
		transition:
			transform 320ms cubic-bezier(0.32, 0.72, 0, 1),
			filter 320ms cubic-bezier(0.32, 0.72, 0, 1);
		transform: scale(var(--hoverScale));
		transform-origin: center center;
	}

	.card-wrapper:hover .card-motion,
	.card-wrapper:focus-visible .card-motion {
		--hoverScale: 1.06;
		filter: drop-shadow(0 12px 20px rgba(8, 16, 40, 0.4));
	}

	.card-wrapper:focus-visible {
		outline: none;
	}

	.card-wrapper:focus-visible .frame-outer {
		box-shadow:
			0 0 0 3px var(--digi-card-ink),
			0 0 0 6px var(--digi-gold-hi),
			0 0 24px rgba(255, 210, 74, 0.45);
	}

	.card-wrapper.is-selected .card-motion {
		filter: drop-shadow(0 0 20px rgba(255, 210, 74, 0.35));
	}

	.card-wrapper.is-revealed:not(.is-correct) .card-motion {
		filter: grayscale(0.35) brightness(0.85);
	}

	.card-wrapper.is-face-up .card-motion {
		animation: card-reveal-pop 420ms cubic-bezier(0.32, 0.72, 0, 1);
	}

	@keyframes card-reveal-pop {
		0% {
			opacity: 0.82;
		}
		100% {
			opacity: 1;
		}
	}

	.card-surface {
		position: absolute;
		inset: 0;
		border-radius: 14px;
	}

	.back-frame {
		position: absolute;
		inset: 0;
		padding: 5px;
		border-radius: 14px;
		background: var(--digi-frame-fill);
		border: 2px solid var(--digi-frame-border);
		box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.15) inset;
	}

	.back-core {
		position: relative;
		height: 100%;
		border-radius: 10px;
		overflow: hidden;
		background: #0a1630;
	}

	.back-art {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center;
		display: block;
		user-select: none;
		pointer-events: none;
	}

	.frame-outer {
		position: absolute;
		inset: 0;
		padding: 5px;
		border-radius: 14px;
		background: var(--digi-frame-fill);
		border: 2px solid var(--digi-frame-border);
		box-shadow:
			0 0 0 1px rgba(255, 255, 255, 0.18) inset,
			0 0 20px color-mix(in srgb, var(--frame-accent) 35%, transparent);
	}

	.frame-inner {
		position: relative;
		height: 100%;
		border-radius: 10px;
		background: var(--digi-card-paper);
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.85);
		display: grid;
		grid-template-rows: 1fr auto auto;
		gap: 0;
		padding: 8px;
		overflow: hidden;
	}

	.card-shortcut {
		position: absolute;
		top: 8px;
		right: 8px;
		z-index: 3;
		display: grid;
		place-items: center;
		width: clamp(1.25rem, 9%, 1.65rem);
		aspect-ratio: 1;
		border-radius: 50%;
		background: #f0dfbd;
		color: var(--digi-card-ink);
		font-family: var(--font-mono);
		font-size: clamp(0.62rem, 3vw, 0.78rem);
		font-weight: 700;
		box-shadow: 0 1px 5px rgba(12, 26, 51, 0.28);
	}

	.corner {
		position: absolute;
		width: 22px;
		height: 22px;
		border-radius: 50%;
		background: var(--digi-gold-mid);
		border: 2px solid rgba(255, 255, 255, 0.5);
		box-shadow: 0 2px 6px rgba(139, 94, 18, 0.45);
		z-index: 2;
	}

	.corner-tl {
		top: 6px;
		left: 6px;
	}

	.corner-tr {
		top: 6px;
		right: 6px;
	}

	.art-window {
		position: relative;
		margin: 4px 4px 0;
		border-radius: 8px;
		overflow: hidden;
		background: #e8eef8;
		border: 2px solid color-mix(in srgb, var(--frame-accent) 55%, var(--digi-gold-lo));
		box-shadow: inset 0 2px 8px rgba(12, 26, 51, 0.12);
		min-height: 0;
	}

	.art-window img {
		width: 100%;
		height: 100%;
		object-fit: contain;
		display: block;
		user-select: none;
		pointer-events: none;
	}

	.name-band {
		margin: 8px 4px 4px;
		padding: 6px 10px;
		border-radius: 6px;
		background: var(--digi-card-band);
		border: 1px solid rgba(255, 210, 74, 0.35);
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15);
	}

	.name {
		margin: 0;
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 0.92rem;
		line-height: 1.1;
		letter-spacing: 0.04em;
		text-align: center;
		text-transform: uppercase;
		color: #f8fafc;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		max-height: calc(2 * 1.1em);
	}

	.name.long-name {
		font-size: 0.8rem;
	}

	.name.very-long-name {
		font-size: 0.72rem;
	}

	.card-footer {
		display: flex;
		justify-content: center;
		gap: 6px;
		padding: 6px 4px 2px;
	}

	.stat-pip {
		width: 28px;
		height: 5px;
		border-radius: 999px;
		background: var(--digi-card-paper-shadow);
	}

	.stat-pip.filled {
		background: var(--digi-gold-mid);
	}

	@media (prefers-reduced-motion: reduce) {
		.card-wrapper.is-face-up .card-motion {
			animation: none;
		}

		.card-wrapper:hover .card-motion,
		.card-wrapper:focus-visible .card-motion {
			--hoverScale: 1;
		}
	}

	@media (max-width: 720px) {
		.frame-inner {
			padding: 6px;
		}

		.corner {
			width: 18px;
			height: 18px;
		}

		.name {
			font-size: 0.86rem;
		}

		.name.long-name {
			font-size: 0.76rem;
		}

		.name.very-long-name {
			font-size: 0.68rem;
		}
	}
</style>
