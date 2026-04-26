import { getSqliteDb } from './db';

const CATEGORIES = ['attribute', 'level', 'type', 'field'] as const;
type Category = (typeof CATEGORIES)[number];

type DigimonRow = {
	name: string;
	image: string;
} & Record<Category, string> &
	Record<string, unknown>;

const CATEGORY_NAMES: Record<Category, string> = {
	attribute: 'Attribute',
	level: 'Digivolution Level',
	type: 'Type',
	field: 'Field'
};

export function generatePuzzle() {
	const db = getSqliteDb();
	const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];

	// 1) Pick a random category value that has enough rows
	const valueRow = db
		.prepare(
			`
      SELECT ${category} as val FROM digimon
      WHERE ${category} != 'Unknown' AND ${category} != ''
      GROUP BY ${category}
      HAVING COUNT(*) >= 5
      ORDER BY RANDOM() LIMIT 1
    `
		)
		.get() as { val: string } | undefined;

	if (!valueRow) {
		return { error: 'Not enough data in DB. Please wait for sync.' as const };
	}

	const connectionValue = valueRow.val;

	// 2) Fetch 3 Digimon with this value
	const sameGroup = db
		.prepare(`SELECT * FROM digimon WHERE ${category} = ? ORDER BY RANDOM() LIMIT 3`)
		.all(connectionValue) as DigimonRow[];

	// 3) Fetch 1 Digimon with a different value
	const oddOne = db
		.prepare(
			`SELECT * FROM digimon WHERE ${category} != ? AND ${category} != 'Unknown' AND ${category} != '' ORDER BY RANDOM() LIMIT 1`
		)
		.get(connectionValue) as DigimonRow | undefined;

	if (sameGroup.length < 3 || !oddOne) {
		return { error: 'Failed to generate puzzle with current data.' as const };
	}

	const cards = sameGroup.concat(oddOne).map((d) => ({
		name: d.name,
		image_query: d.name,
		lore_hint: `${d.level} | ${d.type}`,
		imageUrl: d.image,
		categoryValue: d[category]
	}));

	const shuffled = cards.sort(() => Math.random() - 0.5);
	const answerIndex = shuffled.findIndex((c) => c.name === oddOne.name);

	return {
		cards: shuffled,
		answer_index: answerIndex,
		connection: `These three are all ${connectionValue} (${CATEGORY_NAMES[category]}).`,
		explanation: `${oddOne.name} is the odd one out! The others are all ${connectionValue} ${CATEGORY_NAMES[category]}, while ${oddOne.name} is ${oddOne[category]}.`
	};
}
