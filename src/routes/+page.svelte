<script lang="ts">
  import { onMount } from 'svelte';
  import { db, type Project } from '$lib/db';
  import { listProjects, createProject } from '$lib/projects/service';

  let projects = $state<Project[]>([]);
  let name = $state('');

  onMount(async () => {
    projects = await listProjects();
  });

  async function handleCreate() {
    if (!name.trim()) return;
    await createProject(name.trim());
    name = '';
    projects = await listProjects();
  }
</script>

<h1 class="mb-4 text-2xl font-semibold">Projects</h1>
<form class="mb-6 flex gap-2" onsubmit={(e) => { e.preventDefault(); handleCreate(); }}>
  <input
    class="w-full rounded border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary"
    placeholder="New project"
    bind:value={name}
  />
  <button class="rounded bg-primary px-3 py-2 text-sm text-primary-foreground" type="submit">Add</button>
</form>

<ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
  {#each projects as project}
    <li class="rounded-xl border border-border bg-card p-4 shadow-sm">
      <a class="text-lg font-medium hover:underline" href={`/projects/${project.id}`}>{project.name}</a>
      <p class="mt-2 text-sm text-muted-foreground">Updated: {new Date(project.updatedAt).toLocaleString()}</p>
    </li>
  {/each}
</ul>
