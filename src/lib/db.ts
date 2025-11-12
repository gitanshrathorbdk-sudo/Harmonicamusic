import Dexie, { type Table } from 'dexie';
import type { Song } from './types';

// We are augmenting the Song type from lib/types to remove properties that
// are not stored in the database, like the temporary fileUrl.
export type SongDB = Omit<Song, 'fileUrl'>;

export class HarmonicaDB extends Dexie {
  // 'songs' is the name of our table.
  songs!: Table<SongDB>; 

  constructor() {
    super('harmonicaDB');
    this.version(1).stores({
      // The '++id' defines an auto-incrementing primary key.
      // The other properties are indexed to allow for fast queries.
      songs: '++id, title, artist',
    });
  }
}

export const db = new HarmonicaDB();
