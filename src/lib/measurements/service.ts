import { db, type Measurement } from '$lib/db';

export async function listMeasurementsByProject(projectId: string): Promise<Measurement[]> {
	return db.measurements.where('projectId').equals(projectId).toArray();
}

export async function addMeasurement(projectId: string, data: Omit<Measurement, 'id' | 'projectId' | 'createdAt'>) {
	return db.measurements.add({
		...data,
		projectId,
		createdAt: new Date().toISOString()
	});
}
