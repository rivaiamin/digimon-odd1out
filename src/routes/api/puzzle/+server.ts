import { json } from '@sveltejs/kit';
import { generatePuzzle } from '$lib/server/digimon/puzzle';

export function GET() {
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
