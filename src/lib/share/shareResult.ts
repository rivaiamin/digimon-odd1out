import { toBlob } from 'html-to-image';

const SHARE_CARD_SIZE = 1080;
const CAPTURE_OPTIONS = {
	width: SHARE_CARD_SIZE,
	height: SHARE_CARD_SIZE,
	pixelRatio: 1,
	cacheBust: true,
	skipFonts: false,
	backgroundColor: '#05070a'
} as const;

export function getShareFilename(score: number): string {
	return `digi-odd-one-out-${score}.png`;
}

export function getShareText(score: number, playUrl: string): string {
	return `I scored ${score.toLocaleString()} on DIGI-ODD ONE OUT! Can you beat me? ${playUrl}`;
}

function waitForPaint(): Promise<void> {
	return new Promise((resolve) => {
		requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
	});
}

async function isPngMostlyBlank(blob: Blob): Promise<boolean> {
	try {
		const bitmap = await createImageBitmap(blob);
		const sample = 48;
		const canvas = document.createElement('canvas');
		canvas.width = sample;
		canvas.height = sample;
		const ctx = canvas.getContext('2d', { willReadFrequently: true });
		if (!ctx) {
			bitmap.close();
			return false;
		}

		ctx.drawImage(bitmap, 0, 0, sample, sample);
		bitmap.close();

		const { data } = ctx.getImageData(0, 0, sample, sample);
		let visiblePixels = 0;
		const total = data.length / 4;

		for (let i = 0; i < data.length; i += 4) {
			const alpha = data[i + 3];
			const luminance = data[i] + data[i + 1] + data[i + 2];
			if (alpha > 12 && luminance > 24) visiblePixels++;
		}

		return visiblePixels / total < 0.02;
	} catch {
		return false;
	}
}

async function renderShareBlob(target: HTMLElement): Promise<Blob | null> {
	return toBlob(target, CAPTURE_OPTIONS);
}

async function captureWithVisibleHost(element: HTMLElement): Promise<Blob | null> {
	await waitForPaint();
	return renderShareBlob(element);
}

async function captureWithMountedClone(element: HTMLElement): Promise<Blob | null> {
	const host = document.createElement('div');
	host.className = 'share-capture-mount';
	host.style.cssText =
		'position:fixed;left:0;top:0;width:1080px;height:1080px;overflow:hidden;z-index:2147483647;pointer-events:none;background:#05070a;';

	const clone = element.cloneNode(true) as HTMLElement;
	host.appendChild(clone);
	document.body.appendChild(host);
	await waitForPaint();

	try {
		return await renderShareBlob(clone);
	} finally {
		host.remove();
	}
}

export async function captureShareCard(element: HTMLElement): Promise<Blob> {
	await document.fonts?.ready;

	const attempts = [() => captureWithVisibleHost(element), () => captureWithMountedClone(element)];

	for (const attempt of attempts) {
		const blob = await attempt();
		if (!blob || blob.size === 0) continue;
		if (await isPngMostlyBlank(blob)) continue;
		return blob;
	}

	throw new Error('Share image render produced a blank image');
}

export function downloadShareImage(blob: Blob, filename: string): void {
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement('a');
	anchor.href = url;
	anchor.download = filename;
	anchor.rel = 'noopener';
	document.body.appendChild(anchor);
	anchor.click();
	anchor.remove();
	window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export type ShareImageOutcome = 'shared-file' | 'shared-link' | 'downloaded';

export async function shareOrDownloadImage(
	blob: Blob,
	options: { filename: string; title: string; text: string; url: string }
): Promise<ShareImageOutcome> {
	const file = new File([blob], options.filename, { type: 'image/png' });

	if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') {
		downloadShareImage(blob, options.filename);
		return 'downloaded';
	}

	if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
		await navigator.share({
			files: [file],
			title: options.title,
			text: options.text
		});
		return 'shared-file';
	}

	downloadShareImage(blob, options.filename);

	try {
		await navigator.share({
			title: options.title,
			text: options.text,
			url: options.url
		});
		return 'shared-link';
	} catch (err) {
		if (err instanceof DOMException && err.name === 'AbortError') {
			return 'downloaded';
		}
		throw err;
	}
}
