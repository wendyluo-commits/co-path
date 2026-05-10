import { useCallback, useEffect, useRef, useState } from 'react';

import type { HandLandmarker, HandLandmarkerResult } from '@mediapipe/tasks-vision';

export type HandLandmarkerStatus = 'idle' | 'loading' | 'ready' | 'error';

const TASKS_VISION_VERSION = '0.10.34';
const WASM_BASE = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${TASKS_VISION_VERSION}/wasm`;
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

type Options = {
  numHands?: number;
  runningMode?: 'IMAGE' | 'VIDEO';
  delegate?: 'GPU' | 'CPU';
};

/**
 * 仅在客户端使用。基于 MediaPipe Hand Landmarker，供「挥手」等手势在视频帧上取手腕点（landmark 0）。
 */
export function useHandLandmarker(options: Options = {}) {
  const { numHands = 1, runningMode = 'VIDEO', delegate = 'GPU' } = options;

  const [status, setStatus] = useState<HandLandmarkerStatus>('idle');
  const [error, setError] = useState<Error | null>(null);
  const landmarkerRef = useRef<HandLandmarker | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setStatus('loading');
      setError(null);
      try {
        const { FilesetResolver, HandLandmarker: HL } = await import(
          '@mediapipe/tasks-vision'
        );
        const fileset = await FilesetResolver.forVisionTasks(WASM_BASE);
        const instance = await HL.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate },
          runningMode,
          numHands
        });
        if (cancelled) {
          instance.close();
          return;
        }
        landmarkerRef.current = instance;
        setStatus('ready');
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        if (!cancelled) {
          setError(err);
          setStatus('error');
        }
      }
    })();

    return () => {
      cancelled = true;
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
      setStatus('idle');
    };
  }, [numHands, runningMode, delegate]);

  const detectForVideo = useCallback(
    (video: HTMLVideoElement, timestampMs: number): HandLandmarkerResult | null => {
      const lm = landmarkerRef.current;
      if (!lm || status !== 'ready') return null;
      return lm.detectForVideo(video, timestampMs);
    },
    [status]
  );

  return { status, error, landmarker: landmarkerRef, detectForVideo };
}
