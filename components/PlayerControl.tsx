
import React from 'react';
import { PlayIcon, PauseIcon, SpinnerIcon } from './Icons';

interface PlayerControlProps {
  isLoading: boolean;
  isPlaying: boolean;
  onClick: () => void;
}

export const PlayerControl: React.FC<PlayerControlProps> = ({ isLoading, isPlaying, onClick }) => {
  return (
    <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50">
      <button
        onClick={onClick}
        disabled={isLoading}
        className="
          w-16 h-16 sm:w-20 sm:h-20 
          rounded-full 
          flex items-center justify-center 
          bg-cyan-500
          text-white
          shadow-2xl 
          transition-all duration-300 ease-in-out
          hover:bg-cyan-400
          focus:outline-none focus:ring-4 focus:ring-cyan-300/50
          disabled:bg-slate-500 disabled:cursor-not-allowed
        "
        aria-label={isPlaying ? "Pause story" : "Play story"}
      >
        {isLoading ? (
          <SpinnerIcon className="w-8 h-8 animate-spin" />
        ) : isPlaying ? (
          <PauseIcon className="w-8 h-8" />
        ) : (
          <PlayIcon className="w-8 h-8 pl-1" />
        )}
      </button>
    </div>
  );
};
