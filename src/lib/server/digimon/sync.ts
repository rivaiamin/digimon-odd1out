import { getSqliteDb } from './db';

let started = false;

type HttpError = Error & { status: number };

async function fetchJson(url: string) {
	const res = await fetch(url);
	if (!res.ok) {
		const err = new Error(`HTTP ${res.status}`) as HttpError;
		err.status = res.status;
		throw err;
	}
	return res.json();
}

export function startDigimonSync() {
	if (started) return;
	started = true;

	// Fire-and-forget background sync like the React Express server.
	void (async () => {
		const db = getSqliteDb();
		const row = db.prepare('SELECT COUNT(*) as count FROM digimon').get() as { count: number };
		if (row.count >= 1400) {
			console.log('Database already populated.');
			return;
		}

		console.log('Starting Digimon Data Sync (1-1400)... This might take a while.');

		const insert = db.prepare(
			'INSERT OR REPLACE INTO digimon (id, name, image, level, attribute, type, field) VALUES (?, ?, ?, ?, ?, ?, ?)'
		);

		for (let i = 1; i <= 1400; i++) {
			try {
				const data = await fetchJson(`https://digi-api.com/api/v1/digimon/${i}`);

				const level = data.levels?.[0]?.level || 'Unknown';
				const attribute = data.attributes?.[0]?.attribute || 'Unknown';
				const type = data.types?.[0]?.type || 'Unknown';
				const field = data.fields?.[0]?.field || 'Unknown';
				const image = data.images?.[0]?.href || '';

				insert.run(data.id, data.name, image, level, attribute, type, field);

				if (i % 50 === 0) console.log(`Synced ${i} Digimon...`);
			} catch (error: unknown) {
				const obj =
					typeof error === 'object' && error !== null
						? (error as Record<string, unknown>)
						: undefined;
				const status = obj && typeof obj.status === 'number' ? obj.status : undefined;
				const message = obj && typeof obj.message === 'string' ? obj.message : undefined;
				if (status !== 404) {
					console.error(`Error fetching ID ${i}:`, message ?? String(error));
				}
			}
		}

		console.log('Sync Complete.');
	})();
}
