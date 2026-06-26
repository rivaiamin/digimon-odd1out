import { onMount } from 'svelte';

import { GAME } from './constants';
import { fetchPuzzle } from './puzzleClient';
import type { GameState, Puzzle } from './types';

export interface UseGameOptions {
	closeLogicLog?: () => void;
	closeSharePreview?: () => void;
}

class GameController {
	started = $state(false);
	puzzle = $state.raw<Puzzle | null>(null);
	loading = $state(false);
	puzzleError = $state<string | null>(null);
	score = $state(0);
	lives = $state<number>(GAME.startingLives);
	selectedIndex = $state<number | null>(null);
	gameState = $state<GameState>('dealing');
	isFlipped = $state(false);
	guessStartMs = $state<number | null>(null);
	/** High-frequency clock while guessing; drives HUD countdown only. */
	guessTickMs = $state(0);

	guessRemainingMs = $derived.by(() => {
		if (this.gameState !== 'guessing' || this.guessStartMs == null) return 0;
		const tick = this.guessTickMs;
		return Math.max(0, this.guessStartMs + GAME.guessTimeLimitMs - tick);
	});

	guessSecondsLabel = $derived(
		this.gameState === 'guessing' ? Math.ceil(this.guessRemainingMs / 1000) : null
	);

	guessBarPct = $derived(
		this.gameState === 'guessing'
			? Math.min(100, Math.max(0, (this.guessRemainingMs / GAME.guessTimeLimitMs) * 100))
			: 100
	);

	logicText = $derived(
		this.gameState === 'revealing' && this.puzzle
			? this.puzzle.explanation
			: 'Three cards are linked by one hidden category. Pick the one that breaks the pattern to reveal it.'
	);

	private dealTimeout: ReturnType<typeof setTimeout> | null = null;
	private guessLimitTimeout: ReturnType<typeof setTimeout> | null = null;
	private gameOverTimeout: ReturnType<typeof setTimeout> | null = null;
	private fetchRequestSeq = 0;
	private activeFetchRequestId = 0;
	private dealTimerSeq = 0;
	private activeDealTimerId: number | null = null;
	private guessTimerSeq = 0;
	private activeGuessTimerId: number | null = null;
	private guessFrame: number | null = null;
	private guessTickerRunning = false;
	private options: UseGameOptions;

	constructor(options: UseGameOptions = {}) {
		this.options = options;
	}

	dismissPuzzleError = () => {
		this.puzzleError = null;
	};

	fetchNewPuzzle = async () => {
		if (this.loading) {
			return;
		}
		this.options.closeLogicLog?.();
		this.clearTimers();
		const requestId = ++this.fetchRequestSeq;
		this.activeFetchRequestId = requestId;
		const snapshot = {
			hadPuzzle: this.puzzle !== null,
			gameState: this.gameState,
			isFlipped: this.isFlipped,
			selectedIndex: this.selectedIndex,
			guessStartMs: this.guessStartMs
		};

		this.loading = true;
		this.puzzleError = null;

		if (!snapshot.hadPuzzle) {
			this.gameState = 'dealing';
			this.isFlipped = false;
			this.guessStartMs = null;
			this.selectedIndex = null;
		}

		try {
			const newPuzzle = await fetchPuzzle();
			if (requestId !== this.activeFetchRequestId) {
				return;
			}
			this.puzzle = newPuzzle;
			this.puzzleError = null;

			this.gameState = 'dealing';
			this.isFlipped = false;
			this.guessStartMs = null;
			this.selectedIndex = null;

			const dealTimerId = ++this.dealTimerSeq;
			this.activeDealTimerId = dealTimerId;
			this.dealTimeout = setTimeout(() => {
				if (requestId !== this.activeFetchRequestId || dealTimerId !== this.activeDealTimerId) {
					return;
				}
				this.gameState = 'guessing';
				this.isFlipped = true;
				const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
				this.guessStartMs = now;
				this.guessTickMs = now;
				this.startGuessTicker();
				const guessTimerId = ++this.guessTimerSeq;
				this.activeGuessTimerId = guessTimerId;
				this.guessLimitTimeout = setTimeout(
					() => this.handleGuessTimeUp({ requestId, guessTimerId }),
					GAME.guessTimeLimitMs
				);
			}, GAME.dealFlipDelayMs);
		} catch (err) {
			console.error('Failed to fetch puzzle', err);
			if (requestId !== this.activeFetchRequestId) {
				return;
			}
			this.puzzleError = this.formatPuzzleError(err);

			if (snapshot.hadPuzzle) {
				this.gameState = snapshot.gameState;
				this.isFlipped = snapshot.isFlipped;
				this.selectedIndex = snapshot.selectedIndex;
				this.guessStartMs = snapshot.guessStartMs;
			}
		} finally {
			if (requestId === this.activeFetchRequestId) {
				this.loading = false;
			}
		}
	};

	handleSelect = (index: number) => {
		if (this.gameState !== 'guessing') return;
		if (this.guessLimitTimeout) {
			clearTimeout(this.guessLimitTimeout);
			this.guessLimitTimeout = null;
		}
		this.activeGuessTimerId = null;
		this.stopGuessTicker();
		this.selectedIndex = index;
		this.gameState = 'revealing';

		if (index === this.puzzle?.answer_index) {
			const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
			const elapsed =
				this.guessStartMs == null ? GAME.scoreSpeedWindowMs : Math.max(0, now - this.guessStartMs);
			const t = Math.min(1, elapsed / GAME.scoreSpeedWindowMs); // 0..1
			const speedBonus = Math.round(GAME.scoreSpeedBonusMax * (1 - t));
			this.score = this.score + GAME.scorePerCorrect + speedBonus;
			return;
		}

		this.applyWrongAnswer();
	};

	restartGame = () => {
		this.options.closeSharePreview?.();
		this.score = 0;
		this.lives = GAME.startingLives;
		this.fetchNewPuzzle();
	};

	startGame = () => {
		this.started = true;
		this.restartGame();
	};

	destroy = () => {
		this.clearTimers();
	};

	private clearTimers() {
		if (this.dealTimeout) clearTimeout(this.dealTimeout);
		if (this.guessLimitTimeout) clearTimeout(this.guessLimitTimeout);
		if (this.gameOverTimeout) clearTimeout(this.gameOverTimeout);
		this.dealTimeout = null;
		this.guessLimitTimeout = null;
		this.gameOverTimeout = null;
		this.activeDealTimerId = null;
		this.activeGuessTimerId = null;
		this.stopGuessTicker();
	}

	private startGuessTicker() {
		this.stopGuessTicker();
		this.guessTickerRunning = true;
		const loop = () => {
			if (!this.guessTickerRunning) return;
			this.guessTickMs = typeof performance !== 'undefined' ? performance.now() : Date.now();
			this.guessFrame = requestAnimationFrame(loop);
		};
		this.guessFrame = requestAnimationFrame(loop);
	}

	private stopGuessTicker() {
		this.guessTickerRunning = false;
		if (this.guessFrame != null) {
			cancelAnimationFrame(this.guessFrame);
		}
		this.guessFrame = null;
	}

	private applyWrongAnswer() {
		const nextLives = this.lives - 1;
		this.lives = nextLives;
		if (nextLives <= 0) {
			this.gameOverTimeout = setTimeout(() => {
				this.gameState = 'gameOver';
			}, GAME.gameOverDelayMs);
		}
	}

	private handleGuessTimeUp(meta?: { requestId: number; guessTimerId: number }) {
		const staleByRequestId =
			meta?.requestId != null ? meta.requestId !== this.activeFetchRequestId : false;
		const staleByGuessTimerId =
			meta?.guessTimerId != null && this.activeGuessTimerId != null
				? meta.guessTimerId !== this.activeGuessTimerId
				: false;
		if (staleByRequestId || staleByGuessTimerId) return;
		this.guessLimitTimeout = null;
		this.activeGuessTimerId = null;
		if (this.gameState !== 'guessing') return;
		this.stopGuessTicker();
		this.options.closeLogicLog?.();
		this.selectedIndex = null;
		this.gameState = 'revealing';
		this.applyWrongAnswer();
	}

	private formatPuzzleError(err: unknown): string {
		const message = err instanceof Error ? err.message : 'Failed to load the next puzzle.';
		if (message.includes('export:digimon') || message.includes('Not enough data')) {
			return 'Digimon data is not ready yet. If you are running locally, run pnpm export:digimon and try again.';
		}
		if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
			return 'Could not reach the server. Check your connection and try again.';
		}
		return message;
	}
}

export type UseGame = GameController;

export function useGame(options?: UseGameOptions) {
	const game = new GameController(options);
	onMount(() => game.destroy);
	return game;
}
