<script lang="ts">
	import { onMount } from 'svelte';

	const src = import.meta.env.PUBLIC_BG_MUSIC_URL ?? '/digimon-card-game.mp3';
	const shouldAutoplay = import.meta.env.PUBLIC_BG_MUSIC_AUTOPLAY === 'true';
	const autoplayMuted = import.meta.env.PUBLIC_BG_MUSIC_AUTOPLAY_MUTED !== 'false';

	const LS_PLAYING = 'bgm:playing';
	const LS_VOLUME = 'bgm:volume';
	const LS_MUTED = 'bgm:muted';

	let audio = $state<HTMLAudioElement | null>(null);
	let isPlaying = $state(false);
	let volume = $state(0.4);
	let muted = $state(false);
	let error = $state<string | null>(null);
	let showVolume = $state(false);
	let volumeEl = $state<HTMLInputElement | null>(null);
	let volumeToggleEl = $state<HTMLButtonElement | null>(null);

	onMount(() => {
		try {
			const v = localStorage.getItem(LS_VOLUME);
			if (v != null) {
				const n = Number(v);
				if (!Number.isNaN(n)) volume = Math.min(1, Math.max(0, n));
			}

			const m = localStorage.getItem(LS_MUTED);
			if (m != null) muted = m === 'true';

			const p = localStorage.getItem(LS_PLAYING);
			if (p != null) isPlaying = p === 'true';
		} catch {
			// ignore storage failures (private mode, disabled storage, etc.)
		}

		if (audio) {
			audio.volume = volume;
			audio.muted = muted;

			if (shouldAutoplay) {
				// Muted autoplay is the only option that works reliably across browsers.
				audio.muted = autoplayMuted ? true : muted;
				void audio
					.play()
					.then(() => {
						isPlaying = true;
						if (autoplayMuted) muted = true;
					})
					.catch(() => {
						// Browser blocked autoplay (no gesture). Keep paused and let the user start it.
						isPlaying = false;
					});
			} else {
				// Keep paused until the user clicks Play.
				isPlaying = false;
			}
		}

		return () => {
			// Nothing to cleanup; all effects are reactive.
		};
	});

	$effect(() => {
		if (!audio) return;
		audio.volume = volume;
		audio.muted = muted;
	});

	$effect(() => {
		try {
			localStorage.setItem(LS_VOLUME, String(volume));
			localStorage.setItem(LS_MUTED, String(muted));
			localStorage.setItem(LS_PLAYING, String(isPlaying));
		} catch {
			// ignore
		}
	});

	$effect(() => {
		if (!showVolume) return;
		queueMicrotask(() => volumeEl?.focus());
	});

	async function toggle() {
		error = null;
		if (!audio) return;

		if (isPlaying) {
			audio.pause();
			isPlaying = false;
			return;
		}

		try {
			await audio.play();
			isPlaying = true;
		} catch (e) {
			isPlaying = false;
			error = e instanceof Error ? e.message : 'Unable to play audio';
		}
	}

	function toggleVolumePanel() {
		showVolume = !showVolume;
		if (!showVolume) queueMicrotask(() => volumeToggleEl?.focus());
	}
</script>

<div class="bgm" data-playing={isPlaying ? 'true' : 'false'}>
	<audio bind:this={audio} {src} loop preload="none" playsinline></audio>

	<button class="bgm__btn" type="button" onclick={toggle} aria-pressed={isPlaying}>
		{#if isPlaying}
			<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 16 16" style="display:inline;vertical-align:middle">
				<rect x="3.25" y="3" width="3.2" height="10" rx="1"/>
				<rect x="9.55" y="3" width="3.2" height="10" rx="1"/>
			</svg>
			<span class="sr-only">Pause music</span>
		{:else}
			<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 16 16" style="display:inline;vertical-align:middle">
				<polygon points="4,3 13,8 4,13" />
			</svg>
			<span class="sr-only">Play music</span>
		{/if}
	</button>

	<div class="bgm__vol">
		<button
			class="bgm__btn bgm__btn--vol"
			type="button"
			onclick={toggleVolumePanel}
			aria-haspopup="dialog"
			aria-expanded={showVolume}
			aria-controls="bgm-volume-panel"
			bind:this={volumeToggleEl}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="18"
				height="18"
				fill="none"
				stroke="currentColor"
				stroke-width="1.8"
				stroke-linecap="round"
				stroke-linejoin="round"
				viewBox="0 0 16 16"
				style="display:inline;vertical-align:middle"
			>
				<path d="M5.5 6H3v4h2.5l3 3V3z" />
				<path d="M11 6.2c.7.7 1.1 1.6 1.1 2.5s-.4 1.8-1.1 2.5" />
			</svg>
			<span class="sr-only">Adjust volume</span>
		</button>

		{#if showVolume}
			<div
				id="bgm-volume-panel"
				class="bgm__vol-panel"
				role="dialog"
				aria-label="Volume"
				tabindex="-1"
				onkeydown={(e) => {
					if (e.key === 'Escape') {
						showVolume = false;
						queueMicrotask(() => volumeToggleEl?.focus());
						e.preventDefault();
						e.stopPropagation();
					}
				}}
			>
				<input
					class="bgm__vol-slider"
					type="range"
					min="0"
					max="1"
					step="0.01"
					bind:value={volume}
					aria-label="Background music volume"
					bind:this={volumeEl}
				/>
			</div>
		{/if}
	</div>

	<button
		class="bgm__btn bgm__btn--mute"
		type="button"
		onclick={() => (muted = !muted)}
		aria-pressed={muted}
	>
		{#if muted}
			<!-- Muted (volume off) icon -->
			<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 16 16" style="display:inline;vertical-align:middle">
				<path d="M5.5 6H3v4h2.5l3 3V3z" />
				<line x1="13" y1="5" x2="11" y2="7" />
				<line x1="13" y1="11" x2="11" y2="9" />
			</svg>
			<span class="sr-only">Unmute</span>
		{:else}
			<!-- Unmuted (volume up) icon -->
			<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 16 16" style="display:inline;vertical-align:middle">
				<path d="M5.5 6H3v4h2.5l3 3V3z" />
				<path d="M11 5c.9.9 1.5 2.2 1.5 3.5S11.9 11.1 11 12" />
			</svg>
			<span class="sr-only">Mute</span>
		{/if}
	</button>

	{#if error}
		<div class="bgm__err" role="status">{error}</div>
	{/if}
</div>

<style>
	.bgm {
		position: fixed;
		right: 12px;
		bottom: 12px;
		z-index: 50;
		display: grid;
		grid-auto-flow: column;
		align-items: center;
		gap: 10px;
		padding: 10px 12px;
		border-radius: 999px;
		background: rgba(11, 18, 32, 0.75);
		border: 1px solid rgba(255, 255, 255, 0.12);
		backdrop-filter: blur(10px);
		color: #f7f7fb;
		font: 600 12px/1.2 system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
	}

	.bgm__btn {
		border: 1px solid rgba(255, 255, 255, 0.18);
		background: rgba(255, 255, 255, 0.08);
		color: inherit;
		padding: 8px 10px;
		border-radius: 999px;
		cursor: pointer;
		transition: background 150ms ease, border-color 150ms ease;
	}

	.bgm__btn:hover {
		background: rgba(255, 255, 255, 0.12);
		border-color: rgba(255, 255, 255, 0.28);
	}

	.bgm__btn:focus-visible {
		outline: 2px solid rgba(255, 157, 0, 0.7);
		outline-offset: 2px;
	}

	.bgm__vol {
		position: relative;
		display: grid;
	}

	.bgm__vol-panel {
		position: absolute;
		right: 0;
		bottom: calc(100% + 10px);
		padding: 10px 10px;
		border-radius: 14px;
		background: rgba(11, 18, 32, 0.85);
		border: 1px solid rgba(255, 255, 255, 0.12);
		backdrop-filter: blur(10px);
	}

	.bgm__vol-slider {
		/* Default: rotate for broad compatibility. */
		height: 26px;
		width: 120px;
		transform: rotate(-90deg);
		transform-origin: center;
		accent-color: #ff9d00;
		touch-action: none;
	}

	/* Prefer native vertical sliders where supported. */
	@supports (writing-mode: vertical-rl) {
		.bgm__vol-slider {
			transform: none;
			writing-mode: vertical-rl;
			direction: rtl; /* puts min at bottom in most UAs */
			height: 120px;
			width: 20px;
		}
	}

	/* WebKit-only legacy vertical slider support. */
	@supports (-webkit-appearance: slider-vertical) {
		.bgm__vol-slider {
			transform: none;
			-webkit-appearance: slider-vertical;
			appearance: slider-vertical;
			height: 120px;
			width: 20px;
		}
	}

	.bgm__err {
		position: absolute;
		right: 12px;
		bottom: 52px;
		max-width: 260px;
		padding: 8px 10px;
		border-radius: 12px;
		background: rgba(255, 0, 122, 0.12);
		border: 1px solid rgba(255, 0, 122, 0.28);
		color: #ffd0e2;
	}
	@media (max-width: 520px) {
		/* Avoid overlapping the in-game HUD footer on small screens */
		.bgm {
			bottom: 72px;
		}
		.bgm__vol-slider {
			width: 104px;
		}
	}

	@supports (writing-mode: vertical-rl) {
		@media (max-width: 520px) {
			.bgm__vol-slider {
				width: 20px;
				height: 104px;
			}
		}
	}

	@supports (-webkit-appearance: slider-vertical) {
		@media (max-width: 520px) {
			.bgm__vol-slider {
				width: 20px;
				height: 104px;
			}
		}
	}
</style>

