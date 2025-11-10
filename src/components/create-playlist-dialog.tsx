'use client';

import * as React from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ListMusic, Music } from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import type { Playlist, Song } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';

const playlistFormSchema = z.object({
  playlistName: z.string().min(2, {
    message: 'Playlist name must be at least 2 characters.',
  }),
});

type CreatePlaylistDialogProps = {
    onPlaylistCreated: (playlist: Playlist) => void;
    songs: Song[];
};

export function CreatePlaylistDialog({ onPlaylistCreated, songs }: CreatePlaylistDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedSongs, setSelectedSongs] = React.useState<Set<string>>(new Set());
  const { toast } = useToast();

  const form = useForm<z.infer<typeof playlistFormSchema>>({
    resolver: zodResolver(playlistFormSchema),
    defaultValues: {
      playlistName: '',
    },
  });

  const handleSavePlaylist = (values: z.infer<typeof playlistFormSchema>) => {
    if (selectedSongs.size === 0) {
        toast({ variant: 'destructive', title: 'Error', description: 'Select at least one song.' });
        return;
    }
    const songsForPlaylist = songs.filter(s => selectedSongs.has(s.fileUrl));
    
    const playlist: Playlist = { name: values.playlistName, songs: songsForPlaylist, type: 'manual' };

    onPlaylistCreated(playlist);
    toast({ title: 'Playlist Saved', description: `"${playlist.name}" has been saved.` });
    handleOpenChange(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setTimeout(() => {
        setSelectedSongs(new Set());
        form.reset();
      }, 300);
    }
  };
  
  const handleSongSelection = (songFileUrl: string) => {
    const newSelection = new Set(selectedSongs);
    if (newSelection.has(songFileUrl)) {
        newSelection.delete(songFileUrl);
    } else {
        newSelection.add(songFileUrl);
    }
    setSelectedSongs(newSelection);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="lg" className="rounded-full font-semibold">
          <ListMusic className="mr-2 h-5 w-5" />
          Create a playlist
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Create a Playlist
          </DialogTitle>
          <DialogDescription>
            Select songs from your library to build a new playlist.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSavePlaylist)} className="space-y-4">
            <FormField
              control={form.control}
              name="playlistName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Playlist Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Awesome Playlist" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <ScrollArea className="max-h-[40vh] h-full pr-2">
              <div className='space-y-2'>
              {songs.length > 0 ? songs.map(song => (
                <div key={song.fileUrl} className="flex items-center justify-between rounded-md p-2 hover:bg-accent/50 cursor-pointer" onClick={() => handleSongSelection(song.fileUrl)}>
                    <div className="flex items-center gap-3">
                        <Music className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="font-medium">{song.title}</p>
                            <p className="text-sm text-muted-foreground">{song.artist}</p>
                        </div>
                    </div>
                    <Checkbox id={`song-${song.fileUrl}`} checked={selectedSongs.has(song.fileUrl)} onCheckedChange={() => handleSongSelection(song.fileUrl)} />
                </div>
              )) : (
                <p className='text-center text-muted-foreground py-8'>Upload songs to create a playlist.</p>
              )}
              </div>
            </ScrollArea>
             <DialogFooter>
                <Button type="submit">Save Playlist</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
