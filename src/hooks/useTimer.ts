import { useState, useEffect, useRef, useCallback } from 'react';

export function useTimer(durationSeconds: number) {
  const [secondsRemaining, setSecondsRemaining] = useState(durationSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
    clear();
  }, []);

  const reset = useCallback(() => {
    clear();
    setIsRunning(false);
    setSecondsRemaining(durationSeconds);
  }, [durationSeconds]);

  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      setSecondsRemaining((s) => {
        if (s <= 1) {
          clear();
          setIsRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return clear;
  }, [isRunning]);

  return { secondsRemaining, isRunning, start, pause, reset, isExpired: secondsRemaining === 0 };
}
