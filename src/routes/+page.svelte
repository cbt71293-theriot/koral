<script lang="ts">
	import { db, type Note } from '$lib/db';

	type View = 'notes' | 'search' | 'tags';
	type Sort = 'updated' | 'created' | 'title';

	let notes = $state<Note[]>([]);
	let title = $state('');
	let body = $state('');
	let tagsInput = $state('');
	let query = $state('');
	let activeTag = $state<string | null>(null);
	let view = $state<View>('notes');
	let selectedNoteId = $state<number | null>(null);
	let sort = $state<Sort>('updated');
	let showDateFilter = $state(false);
	let dateFrom = $state('');
	let dateTo = $state('');

	const selectedNote = $derived(notes.find((n) => n.id === selectedNoteId) ?? null);

	const filtered = $derived.by(() => {
		let base = notes.filter((n) => !n.deletedAt);
		if (activeTag) {
			base = base.filter((n) => n.tags.includes(activeTag));
		}
		if (view === 'search' && query.trim()) {
			const q = query.trim().toLowerCase();
			const terms = q.split(/\s+/);
			const scored = base.map((n) => {
				const text = `${n.title} ${n.body} ${n.tags.join(' ')}`.toLowerCase();
				const raw = terms.reduce((acc, term) => acc + (text.includes(term) ? 1 : 0), 0);
				const exactTitle = n.title.toLowerCase().includes(q) ? 2 : 0;
				return { note: n, score: raw + exactTitle };
			});
			scored.sort((a, b) => b.score - a.score);
			return scored.filter((s) => s.score > 0).map((s) => s.note);
		}
		if (showDateFilter && (dateFrom || dateTo)) {
			base = base.filter((n) => {
				const t = n.updatedAt;
				const from = dateFrom ? new Date(dateFrom).getTime() : -Infinity;
				const to = dateTo ? new Date(dateTo).getTime() + 86400000 : Infinity;
				return t >= from && t < to;
			});
		}
		return base;
	});

	const tagCounts = $derived.by(() => {
		const counts = new Map<string, number>();
		for (const n of notes.filter((n) => !n.deletedAt)) {
			for (const t of n.tags) {
				counts.set(t, (counts.get(t) ?? 0) + 1);
			}
		}
		return counts;
	});

	const backlinks = $derived.by(() => {
		if (!selectedNote) return [];
		const targetTitle = selectedNote.title.trim().toLowerCase();
		return notes.filter((n) => n.id !== selectedNote.id && !n.deletedAt && n.body.toLowerCase().includes(`[[${targetTitle}]]`));
	});

	async function load() {
		notes = await db.notes.where('deletedAt').equals(0).or('deletedAt').equals(null).toArray();
	}

	async function addNote() {
		const trimmedTitle = title.trim();
		const trimmedBody = body.trim();
		if (!trimmedTitle && !trimmedBody) return;
		const tags = tagsInput
			.split(/[,\s]+/)
			.map((t) => t.trim().toLowerCase())
			.filter(Boolean);
		await db.notes.add({
			title: trimmedTitle || 'Untitled',
			body: trimmedBody,
			tags,
			createdAt: Date.now(),
			updatedAt: Date.now()
		});
		title = '';
		body = '';
		tagsInput = '';
		await load();
	}

	async function deleteNote(id: number) {
		await db.notes.update(id, { deletedAt: Date.now(), updatedAt: Date.now() });
		if (selectedNoteId === id) selectedNoteId = null;
		await load();
	}

	function formatDate(ts: number) {
		return new Date(ts).toLocaleString();
	}

	function selectNote(id: number) {
		selectedNoteId = id;
	}

	function renderMarkdown(source: string) {
		let html = source
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;');
		html = html.replace(/\[\[([^\]]+)\]\]/g, (_, raw) => {
			const target = raw.trim();
			const exists = notes.some((n) => n.title.trim().toLowerCase() === target.toLowerCase());
			const cls = exists ? 'text-coral underline' : 'text-driftwood underline';
			return `<a href="#" class="${cls}" data-wiki="${target}">${target}</a>`;
		});
		html = html
			.replace(/^### (.*$)/gim, '<h3>$1</h3>')
			.replace(/^## (.*$)/gim, '<h2>$1</h2>')
			.replace(/^# (.*$)/gim, '<h1>$1</h1>')
			.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
			.replace(/\*(.*?)\*/g, '<em>$1</em>')
			.replace(/`([^`]+)`/g, '<code>$1</code>')
			.replace(/^\- (.*$)/gim, '<li>$1</li>')
			.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
		html = html.replace(/\n/g, '<br />');
		return html;
	}

	function onPreviewClick(e: MouseEvent) {
		const target = e.target as HTMLElement;
		const link = target.closest('a[data-wiki]');
		if (!link) return;
		e.preventDefault();
		const name = link.getAttribute('data-wiki') || '';
		const match = notes.find((n) => n.title.trim().toLowerCase() === name.toLowerCase());
		if (match) selectedNoteId = match.id;
	}

	load();
</script>

<div class="mx-auto max-w-6xl p-4">
	<div class="flex flex-col gap-4 md:flex-row">
		<aside class="md:w-64">
			<div class="flex items-center gap-3">
				<h1 class="text-2xl font-semibold">Koral</h1>
				<span class="rounded-full bg-coral/10 px-2 py-1 text-xs font-semibold text-coral">Notes</span>
			</div>
			<nav class="mt-4 flex gap-2 text-sm" aria-label="Notes navigation">
				<button
					class="rounded-xl border border-sand px-3 py-2 transition hover:border-coral {view === 'notes' ? 'bg-coral/10' : 'bg-white'}"
					onclick={() => {
						view = 'notes';
						activeTag = null;
					}}
				>
					Notes
				</button>
				<button
					class="rounded-xl border border-sand px-3 py-2 transition hover:border-coral {view === 'search' ? 'bg-coral/10' : 'bg-white'}"
					onclick={() => (view = 'search')}
				>
					Search
				</button>
				<button
					class="rounded-xl border border-sand px-3 py-2 transition hover:border-coral {view === 'tags' ? 'bg-coral/10' : 'bg-white'}"
					onclick={() => (view = 'tags')}
				>
					Tags
				</button>
			</nav>
			<div class="mt-6">
				<h2 class="text-xs font-semibold uppercase tracking-tight text-driftwood">Tags</h2>
				<div class="mt-2 flex flex-wrap gap-2">
					{#if tagCounts.size === 0}
						<p class="text-xs text-driftwood">No tags yet.</p>
					{/if}
					{#each [...tagCounts.entries()].sort((a, b) => a[0].localeCompare(b[0])) as [tag, count]}
						<button
							class="rounded-full border border-sand px-2 py-1 text-xs transition hover:border-coral {activeTag === tag ? 'bg-coral/10' : ''}"
							onclick={() => {
								activeTag = activeTag === tag ? null : tag;
								view = 'notes';
							}}
						>
							#{tag} ({count})
						</button>
					{/each}
				</div>
			</div>
		</aside>

		<section class="flex-1">
			<div class="flex items-center justify-between gap-3">
				<div>
					<h2 class="text-lg font-semibold">
						{#if view === 'search'}Search{:else if activeTag}Tag: #{activeTag}{:else}Notes{/if}
					</h2>
					<p class="text-xs text-driftwood">
						{filtered.length} result{filtered.length === 1 ? '' : 's'}
					</p>
				</div>
				<div class="flex items-center gap-2">
					<select
						class="rounded-xl border border-sand bg-white px-2 py-2 text-xs"
						bind:value={sort}
						aria-label="Sort notes"
					>
						<option value="updated">Sort: Updated</option>
						<option value="created">Sort: Created</option>
						<option value="title">Sort: Title</option>
					</select>
					<button
						class="rounded-xl border border-sand bg-white px-3 py-2 text-sm font-semibold transition hover:border-coral"
						onclick={() => {
							const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
							document.documentElement.setAttribute('data-theme', next);
							localStorage.setItem('theme', next || 'system');
						}}
						aria-label="Toggle theme"
					>
						Theme
					</button>
				</div>
			</div>

			<form
				class="mt-4 flex flex-col gap-3"
				onsubmit={(e) => {
					e.preventDefault();
					addNote();
				}}
			>
				<input
					class="w-full rounded-xl border border-sand bg-white px-3 py-2 text-sm outline-none focus:border-coral"
					placeholder="Title"
					bind:value={title}
				/>
				<textarea
					class="h-28 w-full rounded-xl border border-sand bg-white px-3 py-2 text-sm outline-none focus:border-coral"
					placeholder="Write a note... Supports **bold**, *italic*, headings, lists, and [[wiki links]]."
					bind:value={body}
				></textarea>
				<input
					class="w-full rounded-xl border border-sand bg-white px-3 py-2 text-sm outline-none focus:border-coral"
					placeholder="Tags (comma or space separated)"
					bind:value={tagsInput}
				/>
				<div class="flex gap-2">
					<button class="rounded-xl bg-coral px-4 py-2 text-sm font-semibold text-white" type="submit">
						Add
					</button>
					<button
						type="button"
						class="rounded-xl border border-sand bg-white px-3 py-2 text-xs font-semibold transition hover:border-coral"
						onclick={() => (showDateFilter = !showDateFilter)}
					>
						{showDateFilter ? 'Hide filters' : 'Filter dates'}
					</button>
				</div>
				{#if showDateFilter}
					<div class="flex flex-col gap-2 md:flex-row">
						<input
							type="date"
							class="w-full rounded-xl border border-sand bg-white px-3 py-2 text-sm outline-none focus:border-coral"
							bind:value={dateFrom}
						/>
						<input
							type="date"
							class="w-full rounded-xl border border-sand bg-white px-3 py-2 text-sm outline-none focus:border-coral"
							bind:value={dateTo}
						/>
					</div>
				{/if}
			</form>

			{#if view === 'search'}
				<div class="mt-4">
					<input
						class="w-full rounded-xl border border-sand bg-white px-3 py-2 text-sm outline-none focus:border-coral"
						placeholder="Search notes, tags, and content"
						bind:value={query}
					/>
				</div>
			{/if}

			{#if activeTag}
				<div class="mt-4 flex items-center gap-2">
					<span class="text-sm text-driftwood">Filtered by:</span>
					<button
						class="rounded-full bg-coral/10 px-2 py-1 text-xs font-semibold text-coral"
						onclick={() => {
							activeTag = null;
						}}
					>
						Clear filter
					</button>
				</div>
			{/if}

			<ul class="mt-4 grid gap-3">
				{#each filtered
					.slice()
					.sort((a, b) => {
						if (sort === 'title') return a.title.localeCompare(b.title);
						if (sort === 'created') return a.createdAt - b.createdAt;
						return b.updatedAt - a.updatedAt;
					}) as note (note.id)}
					<li class="rounded-2xl border border-sand bg-white p-4 shadow-sm">
						<div class="flex items-start justify-between gap-3">
							<div>
								<h3 class="text-sm font-semibold text-deep-ocean">{note.title || 'Untitled'}</h3>
								<p class="mt-1 text-xs text-driftwood">{formatDate(note.updatedAt)}</p>
							</div>
							<div class="flex gap-2">
								<button
									class="rounded-lg border border-sand px-2 py-1 text-xs font-semibold text-driftwood transition hover:border-coral hover:text-coral"
									onclick={() => selectNote(note.id)}
								>
									Open
								</button>
								<button
									class="rounded-lg border border-sand px-2 py-1 text-xs font-semibold text-driftwood transition hover:border-coral hover:text-coral"
									onclick={() => deleteNote(note.id)}
								>
									Delete
								</button>
							</div>
						</div>
						{#if selectedNoteId === note.id}
							<div class="mt-3 rounded-xl border border-sand bg-foam p-3">
								<div class="text-sm text-deep-ocean" innerHTML={renderMarkdown(note.body)}></div>
							</div>
							{#if backlinks.length}
								<div class="mt-3">
									<h4 class="text-xs font-semibold uppercase tracking-tight text-driftwood">Backlinks</h4>
									<ul class="mt-2 space-y-1">
										{#each backlinks as link}
											<li>
												<button
													class="text-sm text-coral underline"
													onclick={() => selectNote(link.id)}
												>
													{link.title || 'Untitled'}
												</button>
											</li>
										{/each}
									</ul>
								</div>
							{/if}
						{/if}
					</li>
				{:else}
					<li class="rounded-2xl border border-sand bg-white p-4 text-sm text-driftwood shadow-sm">
						{view === 'search' ? 'No matches for your query.' : 'No notes yet. Add one above.'}
					</li>
				{/each}
			</ul>
		</section>
	</div>
</div>

<svelte:window on:click={onPreviewClick} />
