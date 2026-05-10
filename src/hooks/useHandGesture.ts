'use client';

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type RefObject
} from 'react';

import type { HandLandmarker } from '@mediapipe/tasks-vision';

export type DetectedGesture = 'swipe' | 'hold' | 'pinch' | null;

export type HandLandmarkPoint = { x: number; y: number; z: number };

interface UseHandGestureOptions {
  enabled: boolean;
  onSwipe?: () => void;
  onHold?: () => void;
  onPinch?: () => void;
  /** 每帧回调（用于把食指尖映射到画布等）；不受 cooldown 影响 */
  onHandFrame?: (payload: {
    hasHand: boolean;
    landmarks: HandLandmarkPoint[] | null;
  }) => void;
  holdDuration?: number;
  swipeThreshold?: number;
  /** 拇指尖(4)与食指尖(8)归一化距离小于此值视为「捏合」 */
  pinchCloseThreshold?: number;
  /** 保持捏合达到该时长后触发 onPinch（与 pinchProgress 满圈一致） */
  pinchHoldDuration?: number;
  cooldown?: number;
  /** 摄像头约束；抽牌画布映射建议更高分辨率 */
  videoConstraints?: MediaTrackConstraints;
}

export interface HandGestureState {
  videoRef: RefObject<HTMLVideoElement | null>;
  isLoading: boolean;
  isReady: boolean;
  error: string | null;
  isHandVisible: boolean;
  holdProgress: number;
  isPinching: boolean;
  pinchProgress: number;
}

const dist2D = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.hypot(a.x - b.x, a.y - b.y);

const THUMB_TIP = 4;
const INDEX_TIP = 8;

/** 与 `package.json` 中 @mediapipe/tasks-vision 版本一致 */
const WASM_BASE =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.34/wasm';
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

const DEFAULT_VIDEO: MediaTrackConstraints = {
  width: { ideal: 640 },
  height: { ideal: 480 },
  facingMode: 'user'
};

export function useHandGesture({
  enabled,
  onSwipe,
  onHold,
  onPinch,
  onHandFrame,
  holdDuration = 1200,
  swipeThreshold = 0.1,
  pinchCloseThreshold = 0.12,
  pinchHoldDuration = 600,
  cooldown = 1500,
  videoConstraints = DEFAULT_VIDEO
}: UseHandGestureOptions): HandGestureState {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHandVisible, setIsHandVisible] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isPinching, setIsPinching] = useState(false);
  const [pinchProgress, setPinchProgress] = useState(0);

  const lastWristX = useRef<number | null>(null);
  const holdStartTime = useRef<number | null>(null);
  const pinchStartTime = useRef<number | null>(null);
  const lockPinchUntilOpen = useRef(false);
  const lastGestureAt = useRef(0);
  const rafRef = useRef<number | null>(null);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const onSwipeRef = useRef(onSwipe);
  const onHoldRef = useRef(onHold);
  const onPinchRef = useRef(onPinch);
  const onHandFrameRef = useRef(onHandFrame);
  useEffect(() => {
    onSwipeRef.current = onSwipe;
  }, [onSwipe]);
  useEffect(() => {
    onHoldRef.current = onHold;
  }, [onHold]);
  useEffect(() => {
    onPinchRef.current = onPinch;
  }, [onPinch]);
  useEffect(() => {
    onHandFrameRef.current = onHandFrame;
  }, [onHandFrame]);

  const fire = useCallback(
    (cb?: () => void): boolean => {
      const now = Date.now();
      if (now - lastGestureAt.current < cooldown) return false;
      lastGestureAt.current = now;
      cb?.();
      return true;
    },
    [cooldown]
  );

  const isOpenHand = (lm: Array<{ x: number; y: number }>) => {
    const tips = [8, 12, 16, 20];
    const pips = [6, 10, 14, 18];
    let open = 0;
    for (let i = 0; i < tips.length; i++) {
      if (lm[tips[i]]!.y < lm[pips[i]]!.y) open++;
    }
    return open >= 3;
  };

  useEffect(() => {
    if (!enabled) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      landmarkerRef.current = null;
      setIsReady(false);
      setIsLoading(false);
      setIsHandVisible(false);
      setHoldProgress(0);
      setIsPinching(false);
      setPinchProgress(0);
      lastWristX.current = null;
      holdStartTime.current = null;
      pinchStartTime.current = null;
      lockPinchUntilOpen.current = false;
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    const setup = async () => {
      try {
        const { HandLandmarker, FilesetResolver } = await import(
          '@mediapipe/tasks-vision'
        );

        if (cancelled) return;

        const vision = await FilesetResolver.forVisionTasks(WASM_BASE);

        if (cancelled) return;

        const handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: MODEL_URL,
            delegate: 'GPU'
          },
          runningMode: 'VIDEO',
          numHands: 1,
          minHandDetectionConfidence: 0.6,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        if (cancelled) {
          handLandmarker.close();
          return;
        }

        landmarkerRef.current = handLandmarker;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: false
        });

        if (cancelled) {
          stream.getTracks().forEach(t => t.stop());
          handLandmarker.close();
          return;
        }

        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) {
          stream.getTracks().forEach(t => t.stop());
          handLandmarker.close();
          if (!cancelled) setError('视频元素未就绪，请重试');
          setIsLoading(false);
          return;
        }
        video.srcObject = stream;
        await video.play();

        if (cancelled) return;

        setIsLoading(false);
        setIsReady(true);

        const detect = () => {
          if (cancelled || !landmarkerRef.current) return;

          const results = landmarkerRef.current.detectForVideo(
            video,
            performance.now()
          );

          const hasHand = results.landmarks.length > 0;
          setIsHandVisible(hasHand);

          if (!hasHand) {
            onHandFrameRef.current?.({ hasHand: false, landmarks: null });
            lastWristX.current = null;
            holdStartTime.current = null;
            pinchStartTime.current = null;
            lockPinchUntilOpen.current = false;
            setHoldProgress(0);
            setIsPinching(false);
            setPinchProgress(0);
            rafRef.current = requestAnimationFrame(detect);
            return;
          }

          const lm = results.landmarks[0]!;
          const lmPoints: HandLandmarkPoint[] = lm.map(p => ({
            x: p.x,
            y: p.y,
            z: p.z ?? 0
          }));
          onHandFrameRef.current?.({ hasHand: true, landmarks: lmPoints });
          const tipT = lm[THUMB_TIP]!;
          const tipI = lm[INDEX_TIP]!;
          const dPinch = dist2D(tipT, tipI);
          const pinched = dPinch < pinchCloseThreshold;

          if (pinched) {
            setIsPinching(true);
            lastWristX.current = null;
            holdStartTime.current = null;
            setHoldProgress(0);

            if (lockPinchUntilOpen.current) {
              setPinchProgress(0);
              rafRef.current = requestAnimationFrame(detect);
              return;
            }

            const now = performance.now();
            if (pinchStartTime.current === null) {
              pinchStartTime.current = now;
            }
            const progress = Math.min(
              (now - pinchStartTime.current) / pinchHoldDuration,
              1
            );
            setPinchProgress(progress);

            if (progress >= 1) {
              if (onPinchRef.current && fire(onPinchRef.current)) {
                lockPinchUntilOpen.current = true;
              }
              pinchStartTime.current = null;
              setPinchProgress(0);
            }
            rafRef.current = requestAnimationFrame(detect);
            return;
          }

          // 未捏合：允许下一次捏合
          lockPinchUntilOpen.current = false;
          pinchStartTime.current = null;
          setIsPinching(false);
          setPinchProgress(0);

          const wrist = lm[0]!;

          if (lastWristX.current !== null) {
            const dx = Math.abs(wrist.x - lastWristX.current);
            if (dx > swipeThreshold) {
              if (fire(onSwipeRef.current)) {
                lastWristX.current = wrist.x;
                holdStartTime.current = null;
                setHoldProgress(0);
                rafRef.current = requestAnimationFrame(detect);
                return;
              }
            }
          }
          lastWristX.current = wrist.x;

          if (isOpenHand(lm)) {
            if (holdStartTime.current === null) {
              holdStartTime.current = performance.now();
            }
            const progress = Math.min(
              (performance.now() - holdStartTime.current) / holdDuration,
              1
            );
            setHoldProgress(progress);
            if (progress >= 1) {
              holdStartTime.current = null;
              setHoldProgress(0);
              fire(onHoldRef.current);
            }
          } else {
            holdStartTime.current = null;
            setHoldProgress(0);
          }

          rafRef.current = requestAnimationFrame(detect);
        };

        rafRef.current = requestAnimationFrame(detect);
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : String(err);
        if (/permission|notallowed/i.test(msg)) {
          setError('请允许摄像头权限后重试 📷');
        } else if (/notfound|devicenotfound/i.test(msg)) {
          setError('未检测到摄像头设备');
        } else {
          setError('手势初始化失败，请刷新重试');
        }
        setIsLoading(false);
      }
    };

    setup();

    return () => {
      cancelled = true;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      try {
        landmarkerRef.current?.close();
      } catch {
        /* ignore */
      }
      landmarkerRef.current = null;
    };
  }, [
    enabled,
    fire,
    holdDuration,
    swipeThreshold,
    pinchCloseThreshold,
    pinchHoldDuration,
    videoConstraints
  ]);

  return {
    videoRef,
    isLoading,
    isReady,
    error,
    isHandVisible,
    holdProgress,
    isPinching,
    pinchProgress
  };
}
