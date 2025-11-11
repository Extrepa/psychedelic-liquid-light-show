import { useCallback, useRef, useState } from 'react';

interface StartOptions {
  getStream: () => MediaStream;
  durationSec: number;
  bitrate: number; // bitsPerSecond
}

export function useVideoRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const start = useCallback((opts: StartOptions) => {
    if (isRecording) return;
    const { getStream, durationSec, bitrate } = opts;

    let stream: MediaStream;
    try {
      stream = getStream();
    } catch (e) {
      console.error('Failed to get canvas stream', e);
      return;
    }

    const options: MediaRecorderOptions = { mimeType: 'video/webm; codecs=vp9', bitsPerSecond: bitrate };
    try {
      mediaRecorderRef.current = new MediaRecorder(stream, options);
    } catch (e) {
      console.error('Failed to create MediaRecorder:', e);
      return;
    }

    recordedChunksRef.current = [];
    setDownloadUrl(null);

    mediaRecorderRef.current.ondataavailable = (event: BlobEvent) => {
      if (event.data && event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setIsRecording(false);
    };

    mediaRecorderRef.current.start();
    setIsRecording(true);

    window.setTimeout(() => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    }, durationSec * 1000);
  }, [isRecording]);

  const stop = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const clearDownload = useCallback(() => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
  }, [downloadUrl]);

  return {
    isRecording,
    downloadUrl,
    setDownloadUrl,
    start,
    stop,
    clearDownload,
  } as const;
}
