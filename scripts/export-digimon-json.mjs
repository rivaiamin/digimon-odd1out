import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import Database from 'better-sqlite3';

function parseArgs(argv) {
	const args = { db: undefined, out: undefined };
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		if (a === '--db') args.db = argv[++i];
		else if (a === '--out') args.out = argv[++i];
	}
	return args;
}

const { db: dbArg, out: outArg } = parseArgs(process.argv.slice(2));

const dbPath = dbArg ?? process.env.DATABASE_URL ?? 'digimon.db';
const outPath = outArg ?? 'src/lib/server/digimon/digimon.json';

if (!fs.existsSync(dbPath)) {
	console.error(
		`DB file not found at "${dbPath}". Provide --db <path> or set DATABASE_URL to a local sqlite file.`
	);
	process.exit(1);
}

const db = new Database(dbPath, { readonly: true });
const rows = db
	.prepare('SELECT id, name, image, level, attribute, type, field FROM digimon ORDER BY id ASC')
	.all();

const normalized = rows.map((r) => ({
	id: Number(r.id),
	name: r.name ?? '',
	image: r.image ?? '',
	level: r.level ?? 'Unknown',
	attribute: r.attribute ?? 'Unknown',
	type: r.type ?? 'Unknown',
	field: r.field ?? 'Unknown'
}));

const absOut = path.resolve(process.cwd(), outPath);
fs.mkdirSync(path.dirname(absOut), { recursive: true });
fs.writeFileSync(absOut, JSON.stringify(normalized, null, 2) + '\n', 'utf8');

console.log(`Exported ${normalized.length} digimon -> ${outPath}`);
