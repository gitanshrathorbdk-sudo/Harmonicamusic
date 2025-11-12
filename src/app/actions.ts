'use server';

import ytdl from 'ytdl-core';

export async function getYouTubeSong(url: string) {
  try {
    if (!ytdl.validateURL(url)) {
      throw new Error('Invalid YouTube URL');
    }

    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title;
    const artist = info.videoDetails.author.name;

    const audioFormat = ytdl.chooseFormat(info.formats, { 
      quality: 'highestaudio',
      filter: 'audioonly' 
    });

    if (!audioFormat) {
      throw new Error('No audio format found for this video.');
    }
    
    // This is a more complex operation involving streams.
    // We'll download the audio into a buffer.
    const response = await fetch(audioFormat.url);
    if (!response.ok) {
        throw new Error(`Failed to fetch audio stream: ${response.statusText}`);
    }
    const audioBuffer = await response.arrayBuffer();
    
    const audioBase64 = Buffer.from(audioBuffer).toString('base64');
    const mimeType = audioFormat.mimeType?.split(';')[0] || 'audio/mp4';

    return {
      success: true,
      title,
      artist,
      audioBase64,
      mimeType
    };
  } catch (error: any) {
    console.error('Error fetching YouTube song:', error);
    return {
      success: false,
      error: error.message || 'An unknown error occurred',
    };
  }
}
