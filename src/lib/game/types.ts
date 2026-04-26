export type GameState = 'dealing' | 'guessing' | 'revealing' | 'gameOver';

export interface DigimonCard {
	name: string;
	image_query: string;
	lore_hint: string;
	imageUrl?: string;
	categoryValue?: string;
}

export interface Puzzle {
	cards: DigimonCard[];
	answer_index: number;
	connection: string;
	explanation: string;
}
