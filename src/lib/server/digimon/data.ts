import fs from 'node:fs';

export type Digimon = {
	id: number;
	name: string;
	image: string;
	level: string;
	attribute: string;
	type: string;
	field: string;
};

let _cache: Digimon[] | null = null;

function readDigimonJsonFile(): Digimon[] {
	// Kept under `src/lib/server/` to avoid client bundling.
	const url = new URL('./digimon.json', import.meta.url);
	try {
		const raw = fs.readFileSync(url, 'utf8');
		const parsed = JSON.parse(raw) as unknown;
		if (!Array.isArray(parsed)) return [];
		return parsed as Digimon[];
	} catch {
		return [];
	}
}

export function getDigimonData(): Digimon[] {
	if (_cache) return _cache;
	const data = readDigimonJsonFile();
	_cache = data;
	return data;
}
