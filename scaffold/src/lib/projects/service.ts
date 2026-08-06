import { db, type Project } from '$lib/db';

export async function listProjects(): Promise<Project[]> {
	return db.projects.orderBy('updatedAt').reverse().toArray();
}

export async function createProject(name: string): Promise<Project> {
	const id = crypto.randomUUID();
	const now = new Date().toISOString();
	const project: Project = { id, name, createdAt: now, updatedAt: now };
	await db.projects.add(project);
	return project;
}

export async function getProject(id: string): Promise<Project | undefined> {
	return db.projects.get(id);
}

export async function updateProject(id: string, changes: Partial<Project>) {
	await db.projects.update(id, { ...changes, updatedAt: new Date().toISOString() });
}

export async function deleteProject(id: string) {
	await db.projects.delete(id);
}
