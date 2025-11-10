
export type Song = {
  title: string;
  artist: string;
  fileUrl: string;
  characteristics?: string[];
};

export type Playlist = {
  name: string;
  songs: (Song | { title: string, artist: string, genre: string, mood: string, characteristics?: string[] })[];
  type: 'ai' | 'manual';
};
