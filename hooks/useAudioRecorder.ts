'use client';

import { useState, useRef, useCallback } from 'react';

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const isRecordingRequestedRef = useRef(false);

  // Pre-warm microphone
  const prepareStream = useCallback(async () => {
    if (streamRef.current) return streamRef.current;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      return stream;
    } catch (err) {
      console.error('Error pre-warming microphone:', err);
      return null;
    }
  }, []);

  const startRecording = useCallback(async () => {
    isRecordingRequestedRef.current = true;
    setIsPreparing(true);

    try {
      const stream = await prepareStream();
      if (!stream) throw new Error('No stream available');

      // If the user released the button before the stream was ready, stop immediately
      if (!isRecordingRequestedRef.current) {
        setIsPreparing(false);
        return;
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPreparing(false);
    } catch (err) {
      console.error('Error starting recording:', err);
      isRecordingRequestedRef.current = false;
      setIsPreparing(false);
    }
  }, [prepareStream]);

  const stopRecording = useCallback(() => {
    isRecordingRequestedRef.current = false;
    setIsPreparing(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  return {
    isRecording: isRecording || isPreparing,
    audioBlob,
    startRecording,
    stopRecording,
    setAudioBlob,
    prepareStream,
  };
}
