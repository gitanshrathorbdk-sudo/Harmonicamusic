'use client';

import { Music, Play, Upload, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import type { Song } from '@/lib/types';
import * as React from 'react';
import { UploadMusicDialog } from './upload-music-dialog';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface YourMusicProps {
  songs: Song[];
  onPlaySong: (song: Song) => void;
  onSongsAdded: (songs: Song[]) => void;
}

export function YourMusic({ songs, onPlaySong, onSongsAdded }: YourMusicProps) {
    const [isUploadDialogOpen, setUploadDialogOpen] = React.useState(false);
    
    const handleDownload = (e: React.MouseEvent, song: Song) => {
      e.stopPropagation();
      const link = document.createElement('a');
      link.href = song.fileUrl;
      // Extracting file extension or defaulting to mp3
      const fileExtension = song.fileUrl.split('.').pop()?.split('?')[0] || 'mp3';
      link.download = `${song.artist} - ${song.title}.${fileExtension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

  return (
    <section>
      <h2 className="mb-4 text-3xl font-bold tracking-tight">Your Music</h2>
      <Card>
        <CardContent className="p-0">
          {songs.length > 0 ? (
            <TooltipProvider>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-12'></TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden md:table-cell">Artist</TableHead>
                  <TableHead className="hidden lg:table-cell">Characteristics</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {songs.map((song, index) => (
                  <TableRow key={index} className="group cursor-pointer" onClick={() => onPlaySong(song)}>
                    <TableCell>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                                e.stopPropagation();
                                onPlaySong(song);
                            }}
                        >
                            <Play className="h-5 w-5 fill-current" />
                        </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Music className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{song.title}</p>
                          <p className="text-sm text-muted-foreground md:hidden">{song.artist}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{song.artist}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {song.characteristics?.map(char => <Badge key={char} variant="secondary">{char}</Badge>)}
                      </div>
                    </TableCell>
                    <TableCell>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <a
                                    href={song.fileUrl}
                                    download={`${song.artist} - ${song.title}.mp3`}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Download className="h-5 w-5" />
                                    </Button>
                                </a>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Download</p>
                            </TooltipContent>
                        </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </TooltipProvider>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
              <Music className="h-16 w-16 text-muted-foreground" />
              <h3 className="text-xl font-semibold">Your library is empty</h3>
              <p className="text-muted-foreground">Upload your first song to get started.</p>
               <UploadMusicDialog
                    open={isUploadDialogOpen}
                    onOpenChange={setUploadDialogOpen}
                    onSongsAdded={onSongsAdded}
                >
                    <Button>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Music
                    </Button>
               </UploadMusicDialog>

            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
