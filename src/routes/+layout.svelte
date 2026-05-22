<script lang="ts">
	import type { Pathname } from '$app/types';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import BackgroundMusicPlayer from '$lib/components/BackgroundMusicPlayer.svelte';

	/** Served from `static/og-image.jpg` — stable URL for social crawlers. */
	const ogImagePath = '/og-image.jpg';

	let { children } = $props();

	const siteName = 'Digi-Odd One Out';
	const defaultTitle = 'Digi-Odd One Out';
	const defaultDescription =
		'Pick the odd Digimon card out of four. Three share Attribute, Level, Type, or Field — one does not. A fast, lore-driven puzzle game.';
	const ogImageAlt =
		'Digi-Odd One Out — four Digimon enter the arena; three share a trait, one is the anomaly.';
	const ogImageWidth = 1200;
	const ogImageHeight = 630;

	function absoluteUrl(pathOrUrl: string) {
		// Prefer an explicit public site URL for correct canonical/OG URLs in production.
		const origin = import.meta.env.PUBLIC_SITE_URL ?? page.url.origin;
		if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
		return `${origin}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>{defaultTitle}</title>

	<meta name="description" content={defaultDescription} />
	<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
	<meta name="theme-color" content="#0b1220" />

	<link rel="canonical" href={absoluteUrl(page.url.pathname)} />

	{#each locales as locale (locale)}
		<link
			rel="alternate"
			hreflang={locale}
			href={absoluteUrl(resolve(localizeHref(page.url.pathname, { locale }) as Pathname))}
		/>
	{/each}
	<link rel="alternate" hreflang="x-default" href={absoluteUrl(page.url.pathname)} />

	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={siteName} />
	<meta property="og:title" content={defaultTitle} />
	<meta property="og:description" content={defaultDescription} />
	<meta property="og:url" content={absoluteUrl(page.url.pathname)} />
	<meta property="og:image" content={absoluteUrl(ogImagePath)} />
	<meta property="og:image:width" content={String(ogImageWidth)} />
	<meta property="og:image:height" content={String(ogImageHeight)} />
	<meta property="og:image:alt" content={ogImageAlt} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={defaultTitle} />
	<meta name="twitter:description" content={defaultDescription} />
	<meta name="twitter:image" content={absoluteUrl(ogImagePath)} />
	<meta name="twitter:image:alt" content={ogImageAlt} />
</svelte:head>
{@render children()}

<BackgroundMusicPlayer />

<div style="display:none">
	{#each locales as locale (locale)}
		<a href={resolve(localizeHref(page.url.pathname, { locale }) as Pathname)}>{locale}</a>
	{/each}
</div>
