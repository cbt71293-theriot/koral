<script lang="ts">
  import { onMount } from 'svelte';
  import { db, type Project, type Drawing } from '$lib/db';
  import { listDrawings, addDrawing, getCalibration, setCalibration, addMeasurement, listMeasurements } from '$lib/takeoff/service';
  import { pxToUnit, formatNumber } from '$lib/takeoff/engine';

  let { params } = $props();
  let project = $state<Project | null>(null);
  let drawings = $state<Drawing[]>([]);
  let activeDrawing = $state<Drawing | null>(null);
  let measurements = $state<any[]>([]);
  let fileInput: HTMLInputElement;
  let name = $state('');
  let tool = $state<'pan' | 'count' | 'length' | 'area'>('pan');
  let calibrationUnit = $state<'in' | 'ft' | 'cm' | 'mm'>('in');
  let calibrationPx = $state(100);
  let calibrationMm = $state(25.4);
  let status = $state('');
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let drawing = $state(false);
  let start = $state<{ x: number; y: number } | null>(null);
  let currentPath: { x: number; y: number }[] = $state([]);
  let imageObjectUrl = $state<string | null>(null);

  onMount(async () => {
    project = await db.projects.get(params.id);
    await refreshDrawings();
  });

  async function refreshDrawings() {
    drawings = await listDrawings(params.id);
    measurements = activeDrawing ? await listMeasurements(activeDrawing.id) : [];
  }

  async function selectDrawing(d: Drawing) {
    activeDrawing = d;
    measurements = await listMeasurements(d.id);
  }

  async function handleFileChange() {
    const file = fileInput.files?.[0];
    if (!file) return;
    const drawingName = name.trim() || file.name;
    const drawing = await addDrawing(params.id, drawingName, file.name);
    await selectDrawing(drawing);
    await refreshDrawings();
    if (imageObjectUrl) URL.revokeObjectURL(imageObjectUrl);
    const url = URL.createObjectURL(file);
    imageObjectUrl = url;
    const image = new Image();
    image.onload = () => renderImage(image);
    image.src = url;
  }

  function renderImage(image: HTMLImageElement) {
    if (!canvas) return;
    const aspect = image.width / image.height;
    canvas.width = 800;
    canvas.height = 800 / aspect;
    const context = canvas.getContext('2d');
    if (!context) return;
    ctx = context;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  }

  function getPoint(e: MouseEvent) {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  async function handlePointerDown(e: MouseEvent) {
    if (!activeDrawing || !canvas) return;
    const point = getPoint(e);
    if (tool === 'pan') return;
    if (tool === 'count') {
      const countLabel = `Count ${measurements.filter((m: any) => m.type === 'count').length + 1}`;
      const id = await addMeasurement({
        drawingId: activeDrawing.id,
        projectId: params.id,
        type: 'count',
        label: countLabel,
        value: 1,
        unit: 'ea',
        meta: { x: point.x, y: point.y }
      });
      measurements = [...measurements, { id, type: 'count', label: countLabel, value: 1, unit: 'ea', meta: { x: point.x, y: point.y } }];
      return;
    }
    if (tool === 'length' || tool === 'area') {
      start = point;
      drawing = true;
      currentPath = [point];
    }
  }

  async function handlePointerMove(e: MouseEvent) {
    if (!drawing || !start || !canvas) return;
    const point = getPoint(e);
    renderCanvasBase();
    ctx.strokeStyle = '#0f62fe';
    ctx.lineWidth = 2;
    if (tool === 'length') {
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    }
    if (tool === 'area') {
      currentPath = [...currentPath, point];
      ctx.beginPath();
      ctx.moveTo(currentPath[0].x, currentPath[0].y);
      currentPath.forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = 'rgba(15,98,254,0.15)';
      ctx.fill();
    }
  }

  async function handlePointerUp(e: MouseEvent) {
    if (!drawing || !start || !activeDrawing || !canvas) return;
    const end = getPoint(e);
    if (tool === 'length') {
      const px = Math.hypot(end.x - start.x, end.y - start.y);
      const value = pxToUnit(px, { calibration: await getCalibration(activeDrawing.id), pageWidthPx: canvas.width, pageHeightPx: canvas.height });
      const label = `Length ${measurements.filter((m: any) => m.type === 'length').length + 1}`;
      const id = await addMeasurement({
        drawingId: activeDrawing.id,
        projectId: params.id,
        type: 'length',
        label,
        value: Number(formatNumber(value, 4)),
        unit: calibrationUnit,
        meta: { start, end }
      });
      measurements = [...measurements, { id, type: 'length', label, value: Number(formatNumber(value, 4)), unit: calibrationUnit, meta: { start, end } }];
    }
    if (tool === 'area') {
      const points = [...currentPath, end];
      const areaPx = polygonArea(points);
      const value = pxToUnit(areaPx, { calibration: await getCalibration(activeDrawing.id), pageWidthPx: canvas.width, pageHeightPx: canvas.height });
      const label = `Area ${measurements.filter((m: any) => m.type === 'area').length + 1}`;
      const id = await addMeasurement({
        drawingId: activeDrawing.id,
        projectId: params.id,
        type: 'area',
        label,
        value: Number(formatNumber(value, 4)),
        unit: `${calibrationUnit}²`,
        meta: { points }
      });
      measurements = [...measurements, { id, type: 'area', label, value: Number(formatNumber(value, 4)), unit: `${calibrationUnit}²`, meta: { points } }];
    }
    drawing = false;
    start = null;
    currentPath = [];
  }

  function polygonArea(points: { x: number; y: number }[]) {
    if (points.length < 3) return 0;
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i].x * points[j].y;
      area -= points[j].x * points[i].y;
    }
    return Math.abs(area / 2);
  }

  function renderCanvasBase() {
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    ctx = context;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  async function applyCalibration() {
    if (!activeDrawing) return;
    const pixelsPerMm = calibrationPx / calibrationMm;
    await setCalibration(activeDrawing.id, pixelsPerMm, calibrationUnit);
    status = 'Calibration saved.';
  }
</script>

<div class="mx-auto max-w-6xl p-6">
  <div class="flex items-center justify-between">
    <div>
      <a class="text-sm text-muted-foreground hover:underline" href="/">Projects</a>
      <h1 class="text-2xl font-semibold">{project?.name ?? 'Project'}</h1>
    </div>
  </div>
  <div class="mt-4 grid gap-4 lg:grid-cols-[1fr_320px]">
    <div class="space-y-3">
      <div class="flex flex-wrap items-center gap-2">
        <input class="w-full rounded border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary md:w-64" placeholder="Drawing name" bind:value={name} />
        <input bind:this={fileInput} onchange={handleFileChange} type="file" accept="application/pdf,image/*" class="hidden" />
        <button class="rounded border border-border px-3 py-2 text-sm" onclick={() => fileInput.click()}>Upload drawing</button>
        <select class="rounded border border-border px-3 py-2 text-sm" bind:value={tool}>
          <option value="pan">Pan</option>
          <option value="count">Count</option>
          <option value="length">Length</option>
          <option value="area">Area</option>
        </select>
      </div>
      <canvas bind:this={canvas} class="w-full rounded-xl border border-border bg-white" onmousedown={handlePointerDown} onmousemove={handlePointerMove} onmouseup={handlePointerUp}></canvas>
    </div>
    <div class="space-y-4">
      <div class="rounded-xl border border-border bg-white p-4">
        <h2 class="mb-2 font-semibold">Calibration</h2>
        <label class="block text-sm text-muted-foreground" for="px">Known length in pixels</label>
        <input id="px" class="mt-1 w-full rounded border border-border px-3 py-2 text-sm" type="number" bind:value={calibrationPx} />
        <label class="mt-3 block text-sm text-muted-foreground" for="real">Real-world length</label>
        <input id="real" class="mt-1 w-full rounded border border-border px-3 py-2 text-sm" type="number" bind:value={calibrationMm} />
        <select class="mt-3 w-full rounded border border-border px-3 py-2 text-sm" bind:value={calibrationUnit}>
          <option value="in">Inches</option>
          <option value="ft">Feet</option>
          <option value="cm">Centimeters</option>
          <option value="mm">Millimeters</option>
        </select>
        <button class="mt-3 w-full rounded bg-primary px-3 py-2 text-sm text-white" onclick={applyCalibration}>Save calibration</button>
        <p class="mt-2 text-sm text-muted-foreground">{status}</p>
      </div>
      <div class="rounded-xl border border-border bg-white p-4">
        <h2 class="mb-2 font-semibold">Takeoff</h2>
        <ul class="space-y-2 text-sm">
          {#each measurements as m}
            <li class="flex justify-between">
              <span>{m.label}</span>
              <span class="font-mono">{m.value} {m.unit}</span>
            </li>
          {/each}
        </ul>
        {#if measurements.length === 0}
          <p class="text-sm text-muted-foreground">No measurements yet.</p>
        {/if}
      </div>
    </div>
  </div>
</div>
