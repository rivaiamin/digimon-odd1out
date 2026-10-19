import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

const url = process.env.GAME_URL ?? 'http://127.0.0.1:5173/';
const chromePath = process.env.CHROME_PATH ?? '/usr/bin/google-chrome';

async function waitForGameReady(timeoutMs = 60_000) {
	const puzzleUrl = new URL('/api/puzzle', url).href;
	const started = Date.now();

	while (Date.now() - started < timeoutMs) {
		try {
			const [home, puzzle] = await Promise.all([
				fetch(url, { signal: AbortSignal.timeout(5000) }),
				fetch(puzzleUrl, { signal: AbortSignal.timeout(5000) })
			]);
			if (home.ok && puzzle.ok) return;
		} catch {
			// Vite may still be restarting after `pnpm install` — retry.
		}
		await new Promise((resolve) => setTimeout(resolve, 1000));
	}

	console.error(
		`Game not ready at ${url} (home + /api/puzzle must return 200).\n` +
			`In a separate terminal run: pnpm dev\n` +
			`Then run: pnpm test:card-hover\n` +
			`Do not chain install + test in one command while the dev server is restarting.`
	);
	process.exit(1);
}

function faceState(el) {
	const back = el.querySelector('.card-back');
	const front = el.querySelector('.card-front');
	const motion = el.querySelector('.card-motion');
	const frontImg = el.querySelector('.art-window img');
	const motionStyle = motion ? getComputedStyle(motion) : null;
	const matrix = motionStyle?.transform?.match(/matrix\(([^)]+)\)/);
	const scaleX = matrix ? Number.parseFloat(matrix[1].split(',')[0]) : 1;
	return {
		hasBack: Boolean(back),
		hasFront: Boolean(front),
		isFaceUp: el.classList.contains('is-face-up'),
		scaleX,
		frontImgAlt: frontImg?.getAttribute('alt') ?? null
	};
}

await waitForGameReady();

const launchOptions = {
	headless: true,
	args: ['--no-sandbox']
};

try {
	const { accessSync } = await import('node:fs');
	accessSync(chromePath);
	launchOptions.executablePath = chromePath;
} catch {
	// Fall back to Playwright-managed Chromium when system Chrome is absent.
}

const browser = await chromium.launch(launchOptions);
const page = await browser.newPage();

const consoleErrors = [];
page.on('console', (msg) => {
	if (msg.type() === 'error') consoleErrors.push(msg.text());
});

await page.goto(url, { waitUntil: 'networkidle' });

const dealBtn = page.getByRole('button', { name: /Deal the cards/i });
await dealBtn.waitFor({ state: 'visible', timeout: 15_000 });
await dealBtn.scrollIntoViewIfNeeded();
await dealBtn.click({ force: true });

try {
	await page.waitForSelector('.card-wrapper', { timeout: 30000 });
	await page.waitForSelector('.art-window img', { timeout: 30000 });
	await page.waitForTimeout(1800);
} catch {
	const bodyText = await page.locator('body').innerText();
	writeFileSync('/tmp/digi-page-debug.txt', bodyText.slice(0, 4000));
	await page.screenshot({ path: '/tmp/digi-page-debug.png', fullPage: true });
	console.error('Timed out waiting for face-up cards. See /tmp/digi-page-debug.png');
	await browser.close();
	process.exit(1);
}

const card = page.locator('.card-wrapper').filter({ has: page.locator('.art-window img') }).first();
const idle = await card.evaluate(faceState);
await card.hover({ force: true });
await page.waitForTimeout(350);
const hovered = await card.evaluate(faceState);

writeFileSync('/tmp/digi-card-hover.png', await card.screenshot());

const pass =
	consoleErrors.length === 0 &&
	!hovered.hasBack &&
	Boolean(hovered.frontImgAlt) &&
	hovered.scaleX > idle.scaleX + 0.03;

const report = { consoleErrors, idle, hovered, pass };
console.log(JSON.stringify(report, null, 2));

await browser.close();
process.exit(pass ? 0 : 1);
