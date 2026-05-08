<script lang="ts">
	import type { Pathname } from '$app/types';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();

	const siteName = 'Digi-Odd One Out';
	const defaultTitle = 'Digi-Odd One Out';
	const defaultDescription =
		'Digimon Odd1Out — explore Digimon, evolutions, and odd facts. A fast, modern Digimon encyclopedia.';

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
	<meta property="og:image" content={absoluteUrl(favicon)} />

	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={defaultTitle} />
	<meta name="twitter:description" content={defaultDescription} />
	<meta name="twitter:image" content={absoluteUrl(favicon)} />
</svelte:head>
{@render children()}

<div style="display:none">
	{#each locales as locale (locale)}
		<a href={resolve(localizeHref(page.url.pathname, { locale }) as Pathname)}>{locale}</a>
	{/each}
</div>
