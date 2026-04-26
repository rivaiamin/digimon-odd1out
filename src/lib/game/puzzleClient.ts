import type { Puzzle } from './types';

export async function fetchPuzzle(retryCount = 0): Promise<Puzzle> {
	const response = await fetch('/api/puzzle');
	if (!response.ok) {
		const error = await response.json().catch(() => ({}));
		if (retryCount < 5 && typeof error?.error === 'string' && error.error.includes('data in DB')) {
			await new Promise((resolve) => setTimeout(resolve, 3000));
			return fetchPuzzle(retryCount + 1);
		}
		throw new Error(error?.error || 'Failed to fetch puzzle from server');
	}
	return response.json();
}
