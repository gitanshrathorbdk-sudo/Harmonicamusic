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
import { Slider } from '@/components/ui/slider';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { generatePlaylist } from '@/app/actions';
import { GeneratePlaylistFromMoodOutput } from '@/ai/flows/generate-playlist-from-mood';
import { Wand2, Pencil, Loader2, ListMusic, ChevronLeft, Music } from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import type { Playlist, Song } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';

const playlistFormSchema = z.object({
  mood: z.string().min(2, {
    message: 'Mood must be at least 2 characters.',
  }),
  numberOfSongs: z.number().min(5).max(20),
});

type CreatePlaylistDialogProps = {
    onPlaylistCreated: (playlist: Playlist) => void;
    songs: Song[];
};

export function CreatePlaylistDialog({ onPlaylistCreated, songs }: CreatePlaylistDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [view, setView] = React.useState<'options' | 'ai' | 'manual'>('options');
  const [isLoading, setIsLoading] = React.useState(false);
  const [generatedPlaylist, setGeneratedPlaylist] =
    React.useState<GeneratePlaylistFromMoodOutput | null>(null);
  const [playlistName, setPlaylistName] = React.useState('');
  const [selectedSongs, setSelectedSongs] = React.useState<Set<string>>(new Set());
  const { toast } = useToast();

  const form = useForm<z.infer<typeof playlistFormSchema>>({
    resolver: zodResolver(playlistFormSchema),
    defaultValues: {
      mood: 'energetic',
      numberOfSongs: 10,
    },
  });

  async function onAiSubmit(values: z.infer<typeof playlistFormSchema>) {
    setIsLoading(true);
    setGeneratedPlaylist(null);
    const result = await generatePlaylist(values);
    setIsLoading(false);

    if (result.success && result.data) {
      setGeneratedPlaylist(result.data);
      setPlaylistName(`AI Playlist: ${values.mood}`);
      toast({
        title: 'Playlist Generated!',
        description: 'Your AI-powered playlist is ready.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: result.error,
      });
    }
  }

  const handleSavePlaylist = (type: 'ai' | 'manual') => {
    let playlist: Playlist | null = null;
    if (type === 'ai' && generatedPlaylist) {
        playlist = {
            name: playlistName || `AI Playlist: ${form.getValues('mood')}`,
            songs: generatedPlaylist.playlist,
            type: 'ai'
        };
    } else if (type === 'manual') {
        if (!playlistName) {
            toast({ variant: 'destructive', title: 'Error', description: 'Playlist name is required.' });
            return;
        }
        const songsForPlaylist = songs.filter(s => selectedSongs.has(s.fileUrl));
         if (songsForPlaylist.length === 0) {
            toast({ variant: 'destructive', title: 'Error', description: 'Select at least one song.' });
            return;
        }
        playlist = { name: playlistName, songs: songsForPlaylist, type: 'manual' };
    }

    if (playlist) {
        onPlaylistCreated(playlist);
        toast({ title: 'Playlist Saved', description: `"${playlist.name}" has been saved.` });
        handleOpenChange(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setTimeout(() => {
        setView('options');
        setGeneratedPlaylist(null);
        setPlaylistName('');
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


  const renderContent = () => {
    switch (view) {
      case 'ai':
        return (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-primary" />
                Generate Playlist with AI
              </DialogTitle>
              <DialogDescription>
                Describe the mood and let AI create a playlist for you.
              </DialogDescription>
            </DialogHeader>
            {!generatedPlaylist && (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onAiSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="mood"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mood</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Chill, Focus, Workout" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="numberOfSongs"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Songs: {field.value}</FormLabel>
                        <FormControl>
                          <Slider
                            min={5}
                            max={20}
                            step={1}
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        'Generate'
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            )}
            {generatedPlaylist && (
              <div className="space-y-4">
                <Input value={playlistName} onChange={(e) => setPlaylistName(e.target.value)} placeholder="Playlist Name" />
                <ScrollArea className="max-h-[40vh] h-full">
                 <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Artist</TableHead>
                        <TableHead>Genre</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {generatedPlaylist.playlist.map((song, index) => (
                        <TableRow key={index}>
                          <TableCell>{song.title}</TableCell>
                          <TableCell>{song.artist}</TableCell>
                          <TableCell>{song.genre}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
                <DialogFooter>
                    <Button onClick={() => handleSavePlaylist('ai')}>Save Playlist</Button>
                </DialogFooter>
              </div>
            )}
          </>
        );
      case 'manual':
        return (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Pencil className="h-5 w-5 text-primary" />
                Create a Playlist
              </DialogTitle>
              <DialogDescription>
                Select songs from your library to build a new playlist.
              </DialogDescription>
            </DialogHeader>
             <div className="space-y-2">
                <Input placeholder="Playlist Name" value={playlistName} onChange={e => setPlaylistName(e.target.value)}/>
              </div>
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
                <p className='text-center text-muted-foreground py-8'>You have no songs in your library.</p>
              )}
              </div>
            </ScrollArea>
             <DialogFooter>
                <Button onClick={() => handleSavePlaylist('manual')}>Save Playlist</Button>
            </DialogFooter>
          </>
        );
      default:
        return (
          <>
            <DialogHeader>
              <DialogTitle>Create a New Playlist</DialogTitle>
              <DialogDescription>
                How would you like to start?
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-4 py-4 md:grid-cols-2">
              <Button
                variant="outline"
                className="h-24 flex-col gap-2"
                onClick={() => setView('ai')}
              >
                <Wand2 className="h-6 w-6 text-primary" />
                <span>Generate with AI</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex-col gap-2"
                onClick={() => setView('manual')}
              >
                <Pencil className="h-6 w-6 text-primary" />
                <span>Make it Yourself</span>
              </Button>
            </div>
          </>
        );
    }
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
        {view !== 'options' && (
           <Button variant="ghost" size="sm" className="absolute left-4 top-4" onClick={() => {
             setGeneratedPlaylist(null);
             setView('options');
           }}>
             <ChevronLeft className="h-4 w-4" />
             Back
           </Button>
        )}
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
