import Dexie, { type Table } from 'dexie';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface Project {
	id: string;
	name: string;
	createdAt: string;
	updatedAt: string;
}

export interface Drawing {
	id: string;
	projectId: string;
	name: string;
	filePath: string;
	pageCount: number;
	createdAt: string;
	updatedAt: string;
}

export interface Calibration {
	id?: number;
	drawingId: string;
	pixelsPerMm: number;
	unit: 'mm' | 'cm' | 'in' | 'ft';
	createdAt: string;
}

export interface Measurement {
	id?: number;
	projectId: string;
	drawingId: string;
	type: 'count' | 'length' | 'area' | 'volume';
	label: string;
	value: number;
	unit: string;
	meta?: Record<string, unknown>;
	createdAt: string;
}

export interface TakeoffAssembly {
	id: string;
	projectId: string;
	name: string;
	formula: string;
	createdAt: string;
	updatedAt: string;
}

export interface QuoteItem {
	id?: number;
	projectId: string;
	drawingId: string;
	measurementId?: number;
	description: string;
	quantity: number;
	unit: string;
	unitPrice: number;
	markup: number;
	total: number;
	createdAt: string;
}

export interface AppSettings {
	id: 'singleton';
	theme: ThemeMode;
	defaultUnit: 'mm' | 'cm' | 'in' | 'ft';
	syncProvider: 'none' | 'onedrive' | 'dropbox';
	syncFolder: string;
}

export class KoralDb extends Dexie {
	projects!: Table<Project>;
	drawings!: Table<Drawing>;
	calibrations!: Table<Calibration>;
	measurements!: Table<Measurement>;
	takeoffAssemblies!: Table<TakeoffAssembly>;
	quoteItems!: Table<QuoteItem>;
	settings!: Table<AppSettings>;

	constructor() {
		super('koral');
		this.version(1).stores({
			projects: 'id, updatedAt',
			drawings: 'id, projectId, updatedAt',
			calibrations: '++id, drawingId',
			measurements: '++id, projectId, drawingId, createdAt',
			takeoffAssemblies: 'id, projectId, updatedAt',
			quoteItems: '++id, projectId, drawingId, createdAt'
		});
	}
}

export const db = new KoralDb();
