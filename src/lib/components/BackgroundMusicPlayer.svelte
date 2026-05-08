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
</script>

<div class="bgm" data-playing={isPlaying ? 'true' : 'false'}>
	<audio bind:this={audio} {src} loop preload="none" playsinline></audio>

	<button class="bgm__btn" type="button" onclick={toggle} aria-pressed={isPlaying}>
		{#if isPlaying}
			Pause music
		{:else}
			Play music
		{/if}
	</button>

	<label class="bgm__vol">
		<span class="bgm__label">Vol</span>
		<input
			type="range"
			min="0"
			max="1"
			step="0.01"
			bind:value={volume}
			aria-label="Background music volume"
		/>
	</label>

	<button
		class="bgm__btn bgm__btn--mute"
		type="button"
		onclick={() => (muted = !muted)}
		aria-pressed={muted}
	>
		{muted ? 'Unmute' : 'Mute'}
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
		outline: 2px solid rgba(0, 242, 255, 0.7);
		outline-offset: 2px;
	}

	.bgm__vol {
		display: grid;
		grid-auto-flow: column;
		align-items: center;
		gap: 8px;
	}

	.bgm__label {
		opacity: 0.9;
	}

	input[type='range'] {
		width: 110px;
		accent-color: #00f2ff;
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
		input[type='range'] {
			width: 86px;
		}
	}
</style>

