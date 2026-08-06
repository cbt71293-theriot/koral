import { db, type Drawing, type Measurement, type Calibration } from '$lib/db';

export async function listDrawings(projectId: string): Promise<Drawing[]> {
	return db.drawings.where('projectId').equals(projectId).toArray();
}

export async function addDrawing(projectId: string, name: string, filePath: string): Promise<Drawing> {
	const drawing: Drawing = {
		id: crypto.randomUUID(),
		projectId,
		name,
		filePath,
		pageCount: 1,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	};
	await db.drawings.add(drawing);
	return drawing;
}

export async function getCalibration(drawingId: string): Promise<Calibration | undefined> {
	return db.calibrations.where('drawingId').equals(drawingId).first();
}

export async function setCalibration(
	drawingId: string,
	pixelsPerMm: number,
	unit: Calibration['unit']
) {
	const existing = await db.calibrations.where('drawingId').equals(drawingId).first();
	if (existing) {
		await db.calibrations.update(existing.id!, {
			pixelsPerMm,
			unit,
			createdAt: new Date().toISOString()
		});
		return existing;
	}
	const id = await db.calibrations.add({
		drawingId,
		pixelsPerMm,
		unit,
		createdAt: new Date().toISOString()
	});
	return { id, drawingId, pixelsPerMm, unit, createdAt: new Date().toISOString() } as Calibration;
}

export async function addMeasurement(measurement: Omit<Measurement, 'id' | 'createdAt'> & { createdAt?: string }) {
	const data: Omit<Measurement, 'id'> = {
		...measurement,
		createdAt: measurement.createdAt ?? new Date().toISOString()
	};
	return db.measurements.add(data);
}

export async function listMeasurements(drawingId: string): Promise<Measurement[]> {
	return db.measurements.where('drawingId').equals(drawingId).toArray();
}
