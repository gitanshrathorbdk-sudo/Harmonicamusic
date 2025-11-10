'use client';

import * as React from 'react';
import { Header } from '@/components/header';
import { MusicControlBar } from '@/components/music-control-bar';
import { YourMusic } from '@/components/your-music';
import { DashboardStats } from '@/components/dashboard-stats';
import type { Song } from '@/lib/types';
import { UploadMusicDialog } from '@/components/upload-music-dialog';

export default function Home() {
  const [songs, setSongs] = React.useState<Song[]>([]);
  const [isUploadDialogOpen, setUploadDialogOpen] = React.useState(false);

  const handleSongsAdded = (newSongs: Song[]) => {
    setSongs(prevSongs => [...prevSongs, ...newSongs]);
  };

  return (
    <div className="flex h-svh w-full flex-col bg-background text-foreground">
      <Header onUploadClick={() => setUploadDialogOpen(true)} />
      <UploadMusicDialog
        open={isUploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onSongsAdded={handleSongsAdded}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto space-y-8 px-4 py-8 md:px-6 lg:space-y-12 lg:py-12">
          <YourMusic songs={songs} />
          <DashboardStats />
        </div>
      </main>
      <MusicControlBar />
    </div>
  );
}
