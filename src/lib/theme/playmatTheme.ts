export type PlaymatTheme = 'night' | 'day';

const STORAGE_KEY = 'digi-playmat-theme';

export function readStoredPlaymatTheme(): PlaymatTheme {
	if (typeof localStorage === 'undefined') return 'night';
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw === 'day' ? 'day' : 'night';
	} catch {
		return 'night';
	}
}

export function applyPlaymatTheme(theme: PlaymatTheme) {
	if (typeof document === 'undefined') return;
	document.documentElement.setAttribute('data-playmat', theme);
	try {
		localStorage.setItem(STORAGE_KEY, theme);
	} catch {
		// ignore quota / private mode
	}
}

export function initPlaymatTheme(): PlaymatTheme {
	const theme = readStoredPlaymatTheme();
	applyPlaymatTheme(theme);
	return theme;
}

export function togglePlaymatTheme(current: PlaymatTheme): PlaymatTheme {
	const next = current === 'night' ? 'day' : 'night';
	applyPlaymatTheme(next);
	return next;
}
