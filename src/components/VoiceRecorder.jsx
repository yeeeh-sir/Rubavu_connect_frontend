import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Trash2, Play, Pause, Send } from 'lucide-react';

export default function VoiceRecorder({ onSend, onCancel, disabled }) {
  const [recording, setRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = window.MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp3';
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setRecordedBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((t) => {
          if (t >= 59) {
            stopRecording();
            return t;
          }
          return t + 1;
        });
      }, 1000);
    } catch (_) {
      window.alert('Microphone access was denied. Please allow microphone access to record voice notes.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setRecording(false);
  };

  const handlePlay = () => {
    if (audioRef.current && recordedBlob) {
      audioRef.current.src = URL.createObjectURL(recordedBlob);
      audioRef.current.play();
      setPlaying(true);
    }
  };

  const handleCancel = () => {
    setRecordedBlob(null);
    setPlaying(false);
    onCancel?.();
  };

  return (
    <div className="flex items-center gap-2">
      {recording ? (
        <>
          <span className="flex items-center gap-2 text-red-500 text-sm font-medium">
            <span className="inline-block h-2.5 w-2.5 bg-red-500 rounded-full animate-pulse" />
            Recording {recordingTime}s
          </span>
          <button
            type="button"
            onClick={stopRecording}
            className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
            aria-label="Stop recording"
          >
            <Square size={18} />
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="p-2 rounded-full bg-slate-200 hover:bg-slate-300 transition-colors"
            aria-label="Cancel recording"
          >
            <Trash2 size={16} className="text-slate-600" />
          </button>
        </>
      ) : recordedBlob ? (
        <>
          <audio ref={audioRef} onEnded={() => setPlaying(false)} className="hidden" />
          <button
            type="button"
            onClick={handlePlay}
            className="p-2 rounded-full bg-primary-600 text-white hover:bg-primary-700 transition-colors"
            aria-label="Play voice note"
          >
            {playing ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <span className="text-xs text-slate-600">
            {(recordedBlob.size / 1024).toFixed(1)} KB voice note
          </span>
          <button
            type="button"
            onClick={() => onSend(recordedBlob)}
            disabled={disabled}
            className="p-2 rounded-full bg-accent-600 text-white hover:bg-accent-700 transition-colors disabled:opacity-50"
            aria-label="Send voice note"
          >
            <Send size={16} />
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="p-2 rounded-full bg-slate-200 hover:bg-slate-300 transition-colors"
            aria-label="Discard voice note"
          >
            <Trash2 size={16} className="text-slate-600" />
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={startRecording}
          disabled={disabled}
          className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
          aria-label="Record voice note"
        >
          <Mic size={18} className="text-slate-600" />
        </button>
      )}
    </div>
  );
}
