import { renderHook, act } from '@testing-library/react';
import { useVideoRecording } from '../hooks/useVideoRecording';

// Note: MediaRecorder is mocked in tests/setup.ts

describe('useVideoRecording', () => {
  it('starts and completes a recording, producing a download URL', async () => {
    const { result } = renderHook(() => useVideoRecording());

    const getStream = () => new MediaStream();

    act(() => {
      result.current.start({ getStream, durationSec: 0.01, bitrate: 100_000 });
    });

    // Explicitly stop to avoid timer dependence in tests
    act(() => {
      result.current.stop();
    });

    expect(result.current.isRecording).toBe(false);
    expect(result.current.downloadUrl).toMatch(/^blob:/);

    act(() => {
      result.current.clearDownload();
    });
    expect(result.current.downloadUrl).toBeNull();
  });
});
