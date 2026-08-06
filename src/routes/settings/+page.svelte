<script lang="ts">
	let { theme = 'light' } = $props();
	let file = $state<File | null>(null);

	async function exportCSV() {
		const { exportTakeoffCSV } = await import('$lib/sync/settings');
		const text = await exportTakeoffCSV('demo-project');
		const blob = new Blob([text], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'takeoff.csv';
		a.click();
		URL.revokeObjectURL(url);
	}

	async function importCSV() {
		if (!file) return;
		const { importTakeoffCSV } = await import('$lib/sync/settings');
		const text = await file.text();
		await importTakeoffCSV('demo-project', text);
		alert('Imported');
	}
</script>

<div class="grid gap-4 lg:grid-cols-2">
	<div class="rounded-xl border border-border bg-white p-4">
		<h2 class="mb-3 font-semibold">Theme</h2>
		<p class="mb-3 text-sm text-muted-foreground">Current theme: {theme}</p>
		<button class="rounded border border-border px-3 py-2 text-sm" onclick={() => document.documentElement.classList.toggle('dark')}>Toggle</button>
	</div>
	<div class="rounded-xl border border-border bg-white p-4">
		<h2 class="mb-3 font-semibold">Data</h2>
		<button class="mb-2 rounded bg-primary px-3 py-2 text-sm text-white" onclick={exportCSV}>Export takeoff CSV</button>
		<input class="mt-2 block text-sm" type="file" accept="text/csv" onchange={(e) => file = e.currentTarget.files?.[0] ?? null} />
		<button class="mt-2 rounded border border-border px-3 py-2 text-sm" onclick={importCSV}>Import takeoff CSV</button>
	</div>
</div>
