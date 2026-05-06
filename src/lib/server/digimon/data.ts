import digimon from './digimon.json';

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

export function getDigimonData(): Digimon[] {
	if (_cache) return _cache;
	_cache = Array.isArray(digimon) ? (digimon as Digimon[]) : [];
	return _cache;
}
