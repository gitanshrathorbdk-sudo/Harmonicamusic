'use client';

import * as React from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { Upload, Plus, Trash2, Wand2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Song } from '@/lib/types';
import { generateSongCharacteristics } from '@/app/actions';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';

const songSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  artist: z.string().min(1, 'Artist is required'),
  characteristics: z.string().optional().default(''),
  file: z
    .any()
    .refine((files) => files?.length == 1, 'File is required.'),
});

const uploadFormSchema = z.object({
  songs: z.array(songSchema).min(1),
});

type UploadMusicDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSongsAdded: (songs: Song[]) => void;
  children?: React.ReactNode;
};

export function UploadMusicDialog({ open, onOpenChange, onSongsAdded, children }: UploadMusicDialogProps) {
  const { toast } = useToast();
  const [generatingIndex, setGeneratingIndex] = React.useState<number | null>(null);

  const form = useForm<z.infer<typeof uploadFormSchema>>({
    resolver: zodResolver(uploadFormSchema),
    defaultValues: {
      songs: [{ title: '', artist: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'songs',
  });
  
  const handleGenerateCharacteristics = async (index: number) => {
    const song = form.getValues(`songs.${index}`);
    if (!song.title || !song.artist) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please provide a title and artist to generate characteristics.',
      });
      return;
    }
    setGeneratingIndex(index);
    const result = await generateSongCharacteristics({ title: song.title, artist: song.artist });
    setGeneratingIndex(null);
    if (result.success && result.data) {
      form.setValue(`songs.${index}.characteristics`, result.data.characteristics.join(', '));
      toast({
        title: 'Characteristics Generated!',
        description: 'AI has suggested some tags for your song.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: result.error,
      });
    }
  };

  function onSubmit(values: z.infer<typeof uploadFormSchema>) {
    console.log(values);
    
    const newSongs: Song[] = values.songs.map(s => ({
        title: s.title,
        artist: s.artist,
        characteristics: s.characteristics?.split(',').map(c => c.trim()).filter(Boolean) || [],
        fileUrl: URL.createObjectURL(s.file[0]),
    }));

    onSongsAdded(newSongs);

    toast({
      title: 'Music Added',
      description: `${values.songs.length} song(s) have been added to your library.`,
    });
    onOpenChange(false);
  }
  
  React.useEffect(() => {
    if (!open) {
      form.reset({
        songs: [{ title: '', artist: '' }],
      });
    }
  }, [open, form]);

  const content = (
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload From Device</DialogTitle>
          <DialogDescription>
            Add songs to your Harmonica library. AI can help you add characteristics.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4 pr-2 max-h-[50vh] overflow-y-auto">
              {fields.map((field, index) => (
                <div key={field.id} className="space-y-4 rounded-lg border p-4 relative">
                  <h4 className="font-medium text-lg">Song #{index + 1}</h4>
                   <FormField
                      control={form.control}
                      name={`songs.${index}.file`}
                      render={({ field: { onChange, value, ...rest }}) => (
                        <FormItem>
                          <FormLabel>Music File</FormLabel>
                          <FormControl>
                            <Input 
                              type="file" 
                              accept="audio/*"
                              onChange={(e) => onChange(e.target.files)}
                              {...rest}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                   <div className="grid grid-cols-2 gap-4">
                     <FormField
                        control={form.control}
                        name={`songs.${index}.title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Song Title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`songs.${index}.artist`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Artist</FormLabel>
                            <FormControl>
                              <Input placeholder="Artist Name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                   </div>
                   <FormField
                      control={form.control}
                      name={`songs.${index}.characteristics`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='flex justify-between items-center'>
                            <span>Characteristics</span>
                             <Button type="button" variant="ghost" size="sm" onClick={() => handleGenerateCharacteristics(index)} disabled={generatingIndex === index}>
                              {generatingIndex === index ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Wand2 className="mr-2 h-4 w-4" />
                              )}
                              Generate with AI
                            </Button>
                          </FormLabel>
                          <FormControl>
                            <Textarea placeholder="e.g. Upbeat, Synth, 80s" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                   {fields.length > 1 && (
                     <Button
                       type="button"
                       variant="destructive"
                       size="icon"
                       className="absolute top-2 right-2 h-7 w-7"
                       onClick={() => remove(index)}
                     >
                       <Trash2 className="h-4 w-4" />
                     </Button>
                   )}
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => append({ title: '', artist: '' })}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Another Song
            </Button>
            <DialogFooter>
              <Button type="submit">Add Music</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
  );

  if (children) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            {content}
        </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {content}
    </Dialog>
  );
}
