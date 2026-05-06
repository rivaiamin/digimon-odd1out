import { getDigimonData } from './data';

const CATEGORIES = ['attribute', 'level', 'type', 'field'] as const;
type Category = (typeof CATEGORIES)[number];

const CATEGORY_NAMES: Record<Category, string> = {
	attribute: 'Attribute',
	level: 'Digivolution Level',
	type: 'Type',
	field: 'Field'
};

function isUsableValue(v: string | null | undefined) {
	return !!v && v !== 'Unknown';
}

function pickRandom<T>(arr: T[]) {
	return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]) {
	return arr.slice().sort(() => Math.random() - 0.5);
}

export function generatePuzzle() {
	const all = getDigimonData();
	if (all.length < 10) {
		return { error: 'Not enough data. Run `pnpm export:digimon` first.' as const };
	}

	const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];

	// 1) Choose a random category value that has enough rows (>= 5)
	const groups = new Map<string, typeof all>();
	for (const d of all) {
		const v = d[category];
		if (!isUsableValue(v)) continue;
		const existing = groups.get(v);
		if (existing) existing.push(d);
		else groups.set(v, [d]);
	}

	const eligibleValues = [...groups.entries()].filter(([, arr]) => arr.length >= 5).map(([v]) => v);
	const connectionValue = pickRandom(eligibleValues);
	if (!connectionValue) {
		return { error: 'Not enough data to generate a puzzle.' as const };
	}

	// 2) Pick 3 digimon from that group
	const sameGroup = shuffle(groups.get(connectionValue) ?? []).slice(0, 3);

	// 3) Pick 1 digimon outside that group (usable values only)
	const oddCandidates = all.filter(
		(d) => isUsableValue(d[category]) && d[category] !== connectionValue
	);
	const oddOne = pickRandom(oddCandidates);

	if (sameGroup.length < 3 || !oddOne) return { error: 'Failed to generate puzzle.' as const };

	const cards = sameGroup.concat(oddOne).map((d) => ({
		name: d.name,
		image_query: d.name,
		lore_hint: `${d.level} | ${d.type}`,
		imageUrl: d.image,
		categoryValue: d[category]
	}));

	const shuffled = shuffle(cards);
	const answerIndex = shuffled.findIndex((c) => c.name === oddOne.name);

	return {
		cards: shuffled,
		answer_index: answerIndex,
		connection: `These three are all ${connectionValue} (${CATEGORY_NAMES[category]}).`,
		explanation: `${oddOne.name} is the odd one out! The others are all ${connectionValue} ${CATEGORY_NAMES[category]}, while ${oddOne.name} is ${oddOne[category]}.`
	};
}
