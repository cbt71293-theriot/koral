import { db, type Measurement, type AppSettings } from '$lib/db';

const defaultSettings: AppSettings = {
	id: 'singleton',
	theme: 'system',
	defaultUnit: 'in',
	syncProvider: 'none',
	syncFolder: ''
};

export async function getSettings(): Promise<AppSettings> {
	const existing = await db.settings.get('singleton');
	if (existing) return existing;
	await db.settings.add(defaultSettings);
	return defaultSettings;
}

export async function saveSettings(settings: Partial<AppSettings>) {
	const current = await getSettings();
	const next = { ...current, ...settings };
	await db.settings.put(next);
	return next;
}

export async function exportTakeoffCSV(projectId: string) {
	const measurements = await db.measurements.where('projectId').equals(projectId).toArray();
	const header = 'id,type,label,value,unit,drawingId,createdAt\n';
	const rows = measurements.map((m: Measurement) => [
		m.id,
		m.type,
		m.label,
		m.value,
		m.unit,
		m.drawingId,
		m.createdAt
	].join(','));
	return header + rows.join('\n');
}

export async function importTakeoffCSV(projectId: string, csvText: string) {
	const lines = csvText.split('\n').filter(Boolean);
	const rows = lines.slice(1);
	for (const row of rows) {
		const [id, type, label, value, unit, drawingId, createdAt] = row.split(',');
		await db.measurements.add({
			id: Number(id),
			projectId,
			drawingId,
			type: type as Measurement['type'],
			label,
			value: Number(value),
			unit,
			createdAt: createdAt ?? new Date().toISOString()
		});
	}
}
