import type { TakeoffEngineOptions } from './engine';

export interface ProjectService {
	listProjects(): Promise<Project[]>;
	createProject(name: string): Promise<Project>;
}
