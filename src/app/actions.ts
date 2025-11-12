'use server';

import ytdl from 'ytdl-core';
import { Readable } from 'stream';

// Helper function to convert a stream to a Buffer
async function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

export async function getYouTubeSong(url: string) {
  try {
    if (!ytdl.validateURL(url)) {
      throw new Error('Invalid YouTube URL provided.');
    }

    const info = await ytdl.getInfo(url);
    const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');

    if (audioFormats.length === 0) {
      throw new Error('No audio-only format found for this video.');
    }
    
    // Select the best audio quality format
    const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });

    const audioStream = ytdl.downloadFromInfo(info, { format: format });
    
    const audioBuffer = await streamToBuffer(audioStream);

    return {
      title: info.videoDetails.title,
      artist: info.videoDetails.author.name,
      audioBase64: audioBuffer.toString('base64'),
    };
  } catch (error: any) {
    console.error('Server action error getting YouTube song:', error);
    // Rethrow the error with a user-friendly message so the client can catch it.
    throw new Error(error.message || 'Failed to process YouTube link on the server.');
  }
}
