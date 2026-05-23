<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import agumon from '$lib/assets/agumon.png';
</script>

<div class="home-brand">
	<img class="home-mascot" src={agumon} alt="Agumon" width="128" height="128" decoding="async" />
	<p class="home-subtitle">
		<span class="home-subtitle-box">
			<span class="home-subtitle-text" aria-hidden="true">
				<span class="home-subtitle-o">
					<img src={favicon} alt="" width="32" height="32" decoding="async" />
				</span>
				DD 
				<span class="home-subtitle-o">
					<img src={favicon} alt="" width="32" height="32" decoding="async" />
				</span>
				NE 
				<span class="home-subtitle-o">
					<img src={favicon} alt="" width="32" height="32" decoding="async" />
				</span>
				UT
			</span>
			<span class="sr-only">Odd One Out</span>
		</span>
	</p>
	<h1 class="home-title">
		<span class="home-title-block" aria-hidden="true">DIGI-INTRUDER</span>
		<span class="sr-only">Digi-Intruder</span>
	</h1>

</div>

<style>
	.home-brand {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
	}

	.home-mascot {
		width: 128px;
		height: 128px;
		object-fit: contain;
	}

	@media (max-width: 900px) {
		.home-brand {
			gap: 0.5rem;
		}

		.home-mascot {
			width: 88px;
			height: 88px;
		}

		.home-title {
			font-size: clamp(1.85rem, 8vw, 2.6rem);
		}

		.home-subtitle {
			font-size: 0.65rem;
			letter-spacing: 0.28em;
		}

		.home-subtitle-box {
			padding: 0.35rem 0.85rem;
		}
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	.home-subtitle {
		margin: 0;
		font-size: clamp(0.72rem, 1.4vw, 0.85rem);
		font-weight: 300;
		letter-spacing: 0.38em;
		text-transform: uppercase;
		color: #f7f7fb;
	}

	.home-subtitle-box {
		display: inline-block;
		padding: 0.45rem 1.1rem;
		border: 1px solid var(--color-digital-cyan, #ff9d00);
	}

	.home-subtitle-text {
		display: inline-flex;
		align-items: center;
		gap: 0;
		line-height: 1;
	}

	.home-subtitle-o {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 0.95em;
		height: 0.95em;
		/* margin-right: -0.02em; */
		vertical-align: middle;
	}

	.home-subtitle-o img {
		width: 100%;
		height: 100%;
		display: block;
	}

	.home-title {
		margin: 0;
		font-size: clamp(2.4rem, 5.5vw, 4.25rem);
		font-weight: 900;
		font-style: normal;
		letter-spacing: -0.04em;
		line-height: 1;
		text-transform: uppercase;
	}

	.home-title-block {
		display: inline-block;
		padding: 0.35rem 1.15rem 0.45rem;
		background: var(--color-digital-cyan, #ff9d00);
		color: #05070a;
		box-shadow: 0 12px 32px -8px rgba(255, 157, 0, 0.45);
	}
</style>
