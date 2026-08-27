"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { 
  Play, Pause, RotateCcw, FastForward, Clock, 
  Calendar, Activity, Layers, Sparkles, ChevronRight, X
} from "lucide-react";
import { sfx } from "@/utils/sfxEngine";

interface TimeScrubberProps {
  timeOffsetHours: number; // 0 (Now) to -24 (24 hours ago)
  setTimeOffsetHours: (offset: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  playbackSpeed: number;
  setPlaybackSpeed: (speed: number) => void;
  totalFilteredEvents: number;
}

export default function TimeScrubber({
  timeOffsetHours,
  setTimeOffsetHours,
  isPlaying,
  setIsPlaying,
  playbackSpeed,
  setPlaybackSpeed,
  totalFilteredEvents
}: TimeScrubberProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Playback timer interval
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimeOffsetHours((prev) => {
          if (prev >= 0) {
            setIsPlaying(false);
            return 0;
          }
          // Increment forward in time by 0.2 hours * speed multiplier
          const next = prev + 0.2 * playbackSpeed;
          return next > 0 ? 0 : next;
        });
      }, 300);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, playbackSpeed, setTimeOffsetHours, setIsPlaying]);

  // Compute displayed simulated UTC time
  const simulatedTime = useMemo(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + timeOffsetHours * 60);
    return {
      utcString: d.toUTCString().replace("GMT", "UTC"),
      timeString: d.toISOString().substring(11, 19) + " UTC",
      dateString: d.toISOString().substring(0, 10),
      hoursAgo: Math.abs(Math.round(timeOffsetHours * 10) / 10)
    };
  }, [timeOffsetHours]);

  const handleResetToNow = () => {
    sfx.playClick();
    setIsPlaying(false);
    setTimeOffsetHours(0);
  };

  const handleTogglePlay = () => {
    sfx.playClick();
    if (timeOffsetHours >= 0 && !isPlaying) {
      setTimeOffsetHours(-24); // Start from 24h ago
    }
    setIsPlaying(!isPlaying);
  };

  const cycleSpeed = () => {
    sfx.playClick();
    const speeds = [1, 2, 4, 8];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIdx]);
  };

  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-3xl bg-[#02050e]/95 border border-cyan-500/80 shadow-[0_0_35px_rgba(0,243,255,0.2)] font-mono text-cyan-200 backdrop-blur-md animate-in slide-in-from-bottom-4 duration-200">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between p-2 bg-[#03091a] border-b border-cyan-900/80 text-[10px]">
        <div className="flex items-center gap-2">
          <div className={`w-5 h-5 rounded-xs flex items-center justify-center ${timeOffsetHours < 0 ? "bg-amber-950 border border-amber-400 text-amber-300 animate-pulse" : "bg-cyan-950 border border-cyan-400 text-cyan-300"}`}>
            <Clock className="w-3 h-3" />
          </div>
          <span className={`font-bold tracking-widest ${timeOffsetHours < 0 ? "text-amber-400" : "text-cyan-300"}`}>
            24-HOUR OPERATIONAL TIME MACHINE // HISTORICAL SCRUBBER
          </span>
          {timeOffsetHours < 0 ? (
            <span className="text-[8px] px-1.5 py-0.2 bg-amber-950 border border-amber-500 text-amber-300 animate-pulse font-bold">
              [ REWIND: -{simulatedTime.hoursAgo}H ]
            </span>
          ) : (
            <span className="text-[8px] px-1.5 py-0.2 bg-emerald-950 border border-emerald-500 text-emerald-300 font-bold">
              [ LIVE REAL-TIME ]
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[8px] text-cyan-600">
            TIME: <strong className="text-cyan-300">{simulatedTime.timeString}</strong>
          </span>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[8px] px-2 py-0.5 border border-cyan-900 hover:border-cyan-400 text-cyan-400 transition-colors"
          >
            {isExpanded ? "[ MINIMIZE ]" : "[ EXPAND ]"}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-3 space-y-3">
          
          {/* Slider & Marks */}
          <div className="space-y-1.5">
            <div className="relative flex items-center">
              <input 
                type="range"
                min={-24}
                max={0}
                step={0.1}
                value={timeOffsetHours}
                onChange={(e) => {
                  setTimeOffsetHours(parseFloat(e.target.value));
                }}
                className="w-full h-2 bg-[#01030a] border border-cyan-700/60 rounded-none appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
              />
            </div>

            {/* Time Ticks */}
            <div className="flex justify-between text-[7px] text-cyan-700 font-mono px-0.5">
              <span className={timeOffsetHours <= -23 ? "text-amber-400 font-bold" : ""}>-24H AGO</span>
              <span className={timeOffsetHours > -20 && timeOffsetHours <= -16 ? "text-amber-400 font-bold" : ""}>-18H</span>
              <span className={timeOffsetHours > -14 && timeOffsetHours <= -10 ? "text-amber-400 font-bold" : ""}>-12H (T-12)</span>
              <span className={timeOffsetHours > -8 && timeOffsetHours <= -4 ? "text-amber-400 font-bold" : ""}>-6H</span>
              <span className={timeOffsetHours > -2 && timeOffsetHours < 0 ? "text-amber-400 font-bold" : ""}>-1H</span>
              <span className={timeOffsetHours === 0 ? "text-emerald-400 font-bold" : ""}>NOW (LIVE)</span>
            </div>
          </div>

          {/* Control Actions & Speed Multiplier */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-cyan-950 text-[9px]">
            
            {/* Playback Controls */}
            <div className="flex items-center gap-1.5">
              <button 
                onClick={handleTogglePlay}
                className={`px-3 py-1 border font-bold tracking-widest flex items-center gap-1 transition-all cursor-pointer ${
                  isPlaying 
                    ? "border-amber-400 bg-amber-950 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]" 
                    : "border-cyan-500 bg-cyan-950 text-cyan-200 hover:bg-cyan-900 shadow-[0_0_10px_rgba(0,243,255,0.2)]"
                }`}
              >
                {isPlaying ? <Pause className="w-3 h-3 text-amber-400" /> : <Play className="w-3 h-3 text-[#00ff88]" />}
                <span>{isPlaying ? "PAUSE" : "PLAY TIMELINE"}</span>
              </button>

              <button 
                onClick={cycleSpeed}
                className="px-2 py-1 border border-cyan-900 hover:border-cyan-400 bg-black/60 text-cyan-300 font-bold flex items-center gap-1 transition-all cursor-pointer"
                title="Change Playback Speed"
              >
                <FastForward className="w-2.5 h-2.5" />
                <span>{playbackSpeed}x SPEED</span>
              </button>

              {timeOffsetHours < 0 && (
                <button 
                  onClick={handleResetToNow}
                  className="px-2.5 py-1 border border-emerald-500/70 bg-emerald-950/40 hover:bg-emerald-950 text-emerald-300 font-bold flex items-center gap-1 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>JUMP TO NOW</span>
                </button>
              )}
            </div>

            {/* Simulated Frame Status */}
            <div className="text-[8px] text-cyan-500 flex items-center gap-2">
              <span>ACTIVE ASSETS VISIBLE:</span>
              <strong className="text-cyan-300 font-bold bg-cyan-950 px-1.5 py-0.5 border border-cyan-800">
                {totalFilteredEvents} INCIDENTS
              </strong>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
