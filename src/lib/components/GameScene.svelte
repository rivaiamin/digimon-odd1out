<script lang="ts">
	import { T } from '@threlte/core';
	import type { GameState, Puzzle } from '$lib/game/types';
	import { SCENE } from '$lib/game/constants';
	import DigiCard from '$lib/components/DigiCard.svelte';

	let { puzzle, isFlipped, selectedIndex, gameState, onSelect } = $props<{
		puzzle: Puzzle;
		isFlipped: boolean;
		selectedIndex: number | null;
		gameState: GameState;
		onSelect: (index: number) => void;
	}>();
</script>

<T.Group position={SCENE.cardsGroupPosition}>
	{#each puzzle.cards as card, idx (card.name)}
		<DigiCard
			position={[(idx - 1.5) * SCENE.cardXSpacing, 0, 0]}
			name={card.name}
			image={card.imageUrl ?? ''}
			{isFlipped}
			isSelected={selectedIndex === idx}
			isCorrect={puzzle.answer_index === idx}
			isRevealed={gameState === 'revealing'}
			onClick={() => onSelect(idx)}
		/>
	{/each}
</T.Group>
