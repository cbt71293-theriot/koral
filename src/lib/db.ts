import Dexie from 'dexie';

export interface Note {
	id?: number;
	title: string;
	body: string;
	tags: string[];
	createdAt: number;
	updatedAt: number;
	deletedAt?: number | null;
}

export class KoralDb extends Dexie {
	notes!: Dexie.Table<Note, number>;

	constructor() {
		super('koral');
		this.version(1).stores({
			notes: '++id, title, updatedAt, createdAt, deletedAt'
		});
	}
}

export const db = new KoralDb();
