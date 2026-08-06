<script>
  import './app.css';
  let { children } = $props();

  function toggleTheme() {
    const html = document.documentElement;
    const current = html.classList.contains('dark') ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    html.classList.toggle('dark', next === 'dark');
    localStorage.setItem('koral:theme', next);
  }
</script>

<div class="min-h-screen bg-background text-foreground">
  <header class="sticky top-0 z-10 border-b border-border bg-white/80 backdrop-blur">
    <div class="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
      <div class="flex items-center gap-2">
        <span class="font-semibold tracking-tight">Koral</span>
        <span class="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">MVP</span>
      </div>
      <nav class="flex items-center gap-3">
        <a class="text-sm text-muted-foreground hover:text-foreground" href="/">Projects</a>
        <a class="text-sm text-muted-foreground hover:text-foreground" href="/settings">Settings</a>
        <button class="rounded border border-border px-3 py-1.5 text-sm" onclick={toggleTheme}>Theme</button>
      </nav>
    </div>
  </header>
  <main class="mx-auto max-w-6xl p-4">
    {@render children?.()}
  </main>
</div>
