"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createWorker, Worker } from "tesseract.js";

interface OCRProgress {
  status: string;
  progress: number;
}

export const useOCRWorker = () => {
  const workerRef = useRef<Worker | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<OCRProgress>({
    status: "",
    progress: 0,
  });
  const [error, setError] = useState<string | null>(null);

  // Lazy initialize worker on first use
  const initWorker = useCallback(async () => {
    if (workerRef.current) return;

    try {
      setIsLoading(true);
      setError(null);
      const worker = await createWorker("eng");
      workerRef.current = worker;
      setIsInitialized(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to initialized OCR";
      setError(message);
      setIsLoading(false);
    }
  }, []);

  // Recognize text from image
  const recognize = useCallback(
    async (imagePath: string) => {
      if (!workerRef.current) {
        await initWorker();
      }

      if (!workerRef.current) {
        setError("OCR Worker not initilized");
        return null;
      }

      try {
        setIsLoading(true);
        setError(null);
        setProgress({ status: "Starting recognition...", progress: 0 });

        const result = await workerRef.current.recognize(imagePath);
        setProgress({ status: "Complete", progress: 1 });
        setIsLoading(false);

        return result.data.text;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Recognition failed";
        setError(message);
        setIsLoading(false);
      }
    },
    [initWorker],
  );

  // cleanup worker on unmount
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  return {
    recognize,
    isLoading,
    isInitialized,
    progress,
    error,
    initWorker,
  };
};
