<script lang="ts">
	import Showcase from '#lib/Showcase.svelte';
</script>

<svelte:head>
	<title>gpuix-svelte + SvelteKit</title>
</svelte:head>

<main>
	<Showcase />
	<footer>
		The same components open in a native window with <code>npm start</code>. Source on
		<a href="https://github.com/khromov/gpuix-svelte-sveltekit-shared-components-demo">GitHub</a>, built on
		<a href="https://github.com/khromov/gpuix-svelte">gpuix-svelte</a>.
	</footer>
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 24px;
		min-height: 100vh;
		padding: 32px 16px;
	}
	footer {
		font-size: 13px;
		color: var(--muted);
	}
	a {
		color: var(--accent);
	}
	code {
		font-size: 12px;
		padding: 1px 5px;
		border-radius: 4px;
		background-color: var(--raised);
	}
</style>
