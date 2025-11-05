
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { story, fullStoryText } from './constants';
import { Story } from './types';
import { generateSpeech } from './services/geminiService';
import { decode, decodeAudioData } from './utils/audioUtils';
import { PlayerControl } from './components/PlayerControl';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);

  const stopAudio = useCallback(() => {
    if (audioSourceRef.current) {
      audioSourceRef.current.onended = null; 
      audioSourceRef.current.stop();
      audioSourceRef.current = null;
    }
    setIsPlaying(false);
  }, []);
  
  const playAudio = useCallback((buffer: AudioBuffer) => {
    if (!audioContextRef.current) {
      // Use webkitAudioContext for Safari support
      // FIX: Cast window to any to access webkitAudioContext without TypeScript errors.
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
    }

    stopAudio();

    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    source.onended = () => {
      setIsPlaying(false);
      audioSourceRef.current = null;
    };
    source.start(0);
    audioSourceRef.current = source;
    setIsPlaying(true);
  }, [stopAudio]);

  const handleTogglePlay = useCallback(async () => {
    setError(null);
    if (isPlaying) {
      stopAudio();
    } else {
      if (audioBufferRef.current) {
        playAudio(audioBufferRef.current);
      } else {
        setIsLoading(true);
        try {
          const base64Audio = await generateSpeech(fullStoryText);
          if (!audioContextRef.current) {
              // FIX: Cast window to any to access webkitAudioContext without TypeScript errors.
              const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
              audioContextRef.current = new AudioContext({ sampleRate: 24000 });
          }
          const buffer = await decodeAudioData(decode(base64Audio), audioContextRef.current, 24000, 1);
          audioBufferRef.current = buffer;
          playAudio(buffer);
        } catch (err) {
          console.error("Failed to generate or play speech:", err);
          setError("Sorry, we couldn't play the story. Please try again later.");
        } finally {
          setIsLoading(false);
        }
      }
    }
  }, [isPlaying, playAudio, stopAudio]);

  useEffect(() => {
    return () => {
      stopAudio();
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [stopAudio]);

  const renderChapter = (chapter: { title: string; content: string }, index: number) => (
    <div key={index} className="mb-10">
      <h2 className="text-2xl md:text-3xl font-bold text-cyan-300 mb-4 pb-2 border-b-2 border-cyan-300/20">{chapter.title}</h2>
      {chapter.content.split('\n').map((paragraph, pIndex) => (
        <p key={pIndex} className="text-lg md:text-xl leading-relaxed mb-4 text-slate-200">{paragraph}</p>
      ))}
    </div>
  );

  return (
    <div className="bg-slate-900 min-h-screen text-white antialiased" dir="rtl">
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-900 to-indigo-900/30 opacity-50 z-0"></div>
        <main className="relative z-10 max-w-4xl mx-auto">
          <header className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-purple-400">
              {story.title}
            </h1>
            <p className="text-lg md:text-xl text-slate-400">{story.subtitle}</p>
          </header>

          <article>
            {story.chapters.map(renderChapter)}
            
            <div className="mt-16 pt-8 border-t-2 border-cyan-300/20">
              <h2 className="text-2xl md:text-3xl font-bold text-cyan-300 mb-4">{story.conclusion.title}</h2>
              <p className="text-lg md:text-xl italic leading-relaxed text-slate-300">{story.conclusion.content}</p>
            </div>
          </article>

          {error && (
            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-red-500/90 text-white py-2 px-4 rounded-lg shadow-lg">
              {error}
            </div>
          )}
        </main>
      </div>
      <PlayerControl 
        isLoading={isLoading}
        isPlaying={isPlaying}
        onClick={handleTogglePlay}
      />
    </div>
  );
};

export default App;