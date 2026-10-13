import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  CloudRain,
  Radio,
  Coffee,
  Headphones,
  CheckCircle2,
  Flame,
  Award,
} from 'lucide-react';
import { studyAudio } from '../utils/audioEngine';
import { useStudy } from '../context/StudyContext';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

const MODE_DURATIONS: Record<TimerMode, number> = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export const PomodoroView: React.FC = () => {
  const { totalFocusMinutes, addFocusMinutes } = useStudy();

  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState<number>(MODE_DURATIONS.focus);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedSessions, setCompletedSessions] = useState<number>(2);

  // Audio state
  const [ambientSound, setAmbientSound] = useState<'none' | 'rain' | 'whitenoise' | 'lofi' | 'binaural'>('none');
  const [volume, setVolume] = useState<number>(0.5);

  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      if (mode === 'focus') {
        const sessionMins = Math.round(MODE_DURATIONS.focus / 60);
        addFocusMinutes(sessionMins);
        setCompletedSessions((prev) => prev + 1);
        alert('🎉 Focus block completed! Time for a well-deserved break.');
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode]);

  const handleModeChange = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(MODE_DURATIONS[newMode]);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(MODE_DURATIONS[mode]);
  };

  const handleSoundChange = (sound: 'none' | 'rain' | 'whitenoise' | 'lofi' | 'binaural') => {
    setAmbientSound(sound);
    if (sound === 'none') {
      studyAudio.stop();
    } else {
      studyAudio.play(sound, volume);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    studyAudio.setVolume(newVol);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const totalDuration = MODE_DURATIONS[mode];
  const progressPercent = ((totalDuration - timeLeft) / totalDuration) * 100;

  // SVG circle calculation
  const circleRadius = 110;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
          Focus Pomodoro & Ambient Soundscapes
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto">
          Maximize neural retention through timed deep work cycles paired with focus-enhancing synthesized audio.
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="flex items-center justify-center gap-2">
        <div className="inline-flex p-1.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
          {[
            { id: 'focus', label: 'Deep Focus (25m)' },
            { id: 'shortBreak', label: 'Short Break (5m)' },
            { id: 'longBreak', label: 'Long Break (15m)' },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => handleModeChange(m.id as TimerMode)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === m.id
                  ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Center Circular Timer */}
      <div className="flex flex-col items-center justify-center py-6">
        <div className="relative w-72 h-72 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background track */}
            <circle
              cx="144"
              cy="144"
              r={circleRadius}
              className="stroke-zinc-100 dark:stroke-zinc-800 fill-none"
              strokeWidth="10"
            />
            {/* Progress track */}
            <circle
              cx="144"
              cy="144"
              r={circleRadius}
              className="stroke-indigo-600 dark:stroke-indigo-500 fill-none transition-all duration-500 ease-linear"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>

          {/* Time text inside ring */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 font-mono">
              {formattedTime}
            </span>
            <span className="mt-1 text-xs font-semibold text-zinc-400 capitalize">
              {mode === 'focus' ? 'Focus Interval' : 'Rest & Recharge'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6 flex items-center gap-4">
          <button
            onClick={() => setIsRunning((prev) => !prev)}
            className="px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-md shadow-indigo-600/30 flex items-center gap-2 cursor-pointer transition-all"
          >
            {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
            {isRunning ? 'Pause' : 'Start Focus'}
          </button>

          <button
            onClick={handleReset}
            className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Sessions Tracker */}
        <div className="mt-6 flex items-center gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${
                i <= (completedSessions % 4 || (completedSessions > 0 ? 4 : 0))
                  ? 'bg-indigo-600'
                  : 'bg-zinc-200 dark:bg-zinc-800'
              }`}
            />
          ))}
          <span className="text-xs font-medium text-zinc-500 ml-2">
            {completedSessions} sessions logged ({totalFocusMinutes} mins)
          </span>
        </div>
      </div>

      {/* Ambient Soundscapes Synthesizer Board */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Focus Ambient Soundscape
              </h3>
              <p className="text-[11px] text-zinc-500">
                Generated locally with pure Web Audio synthesis (zero buffering/data usage)
              </p>
            </div>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-zinc-400" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-24 accent-indigo-600"
            />
            <span className="text-xs font-mono text-zinc-400 w-8">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2">
          {[
            { id: 'none', label: 'Silent', icon: <VolumeX className="w-4 h-4" /> },
            { id: 'rain', label: 'Gentle Rain', icon: <CloudRain className="w-4 h-4 text-blue-400" /> },
            { id: 'whitenoise', label: 'Brown Noise', icon: <Radio className="w-4 h-4 text-amber-400" /> },
            { id: 'lofi', label: 'Lo-Fi Drone', icon: <Coffee className="w-4 h-4 text-purple-400" /> },
            { id: 'binaural', label: '432Hz Alpha', icon: <Headphones className="w-4 h-4 text-emerald-400" /> },
          ].map((snd) => (
            <button
              key={snd.id}
              onClick={() => handleSoundChange(snd.id as any)}
              className={`p-3.5 rounded-2xl border text-center font-bold text-xs flex flex-col items-center gap-2 transition-all cursor-pointer ${
                ambientSound === snd.id
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 shadow-xs'
                  : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300'
              }`}
            >
              {snd.icon}
              <span>{snd.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
