import { json } from '@sveltejs/kit';
import { startDigimonSync } from '$lib/server/digimon/sync';
import { generatePuzzle } from '$lib/server/digimon/puzzle';

export function GET() {
	// Ensure background sync has started (idempotent).
	startDigimonSync();

	try {
		const result = generatePuzzle();
		if ('error' in result) {
			return json({ error: result.error }, { status: 500 });
		}
		return json(result);
	} catch (err) {
		console.error(err);
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
