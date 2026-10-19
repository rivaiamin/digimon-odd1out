<script lang="ts">
	import { onMount } from 'svelte';
	import {
		initPlaymatTheme,
		togglePlaymatTheme,
		type PlaymatTheme
	} from '$lib/theme/playmatTheme';

	let theme = $state<PlaymatTheme>('night');

	onMount(() => {
		theme = initPlaymatTheme();
	});

	function onToggle() {
		theme = togglePlaymatTheme(theme);
	}
</script>

<button
	class="playmat-toggle"
	type="button"
	onclick={onToggle}
	aria-pressed={theme === 'day'}
	title={theme === 'night' ? 'Switch to tournament table (light playmat)' : 'Switch to night playmat'}
>
	<span class="playmat-toggle-shell" aria-hidden="true">
		<span class="playmat-toggle-icon" class:is-day={theme === 'day'}></span>
	</span>
	<span class="playmat-toggle-label">{theme === 'night' ? 'Night mat' : 'Day mat'}</span>
</button>

<style>
	.playmat-toggle {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.35rem 0.45rem 0.35rem 0.35rem;
		border: 0;
		border-radius: 999px;
		background: var(--digi-frame-fill);
		border: 2px solid var(--digi-frame-border);
		cursor: pointer;
		pointer-events: auto;
		transition: transform 280ms var(--digi-ease-out);
		box-shadow: 0 8px 24px -8px rgba(0, 0, 0, 0.35);
	}

	.playmat-toggle:hover {
		transform: scale(1.04);
	}

	.playmat-toggle:active {
		transform: scale(0.97);
	}

	.playmat-toggle-shell {
		display: grid;
		place-items: center;
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
		background: #f5e6c8;
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.85);
	}

	.playmat-toggle-icon {
		width: 1rem;
		height: 1rem;
		border-radius: 50%;
		background: #2d6bff;
		box-shadow: inset 0 -2px 4px rgba(0, 0, 0, 0.25);
		transition:
			transform 400ms var(--digi-ease-out),
			background 400ms var(--digi-ease-out);
	}

	.playmat-toggle-icon.is-day {
		background: #e6a817;
		box-shadow:
			0 0 10px rgba(255, 210, 74, 0.55),
			inset 0 -2px 4px rgba(139, 94, 18, 0.35);
		transform: rotate(12deg) scale(1.05);
	}

	.playmat-toggle-label {
		padding-right: 0.65rem;
		font-family: var(--font-mono);
		font-size: 9px;
		font-weight: 700;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--digi-card-ink);
	}
</style>