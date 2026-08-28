import React from 'react';
import { Camera, ExternalLink, Globe, Search, Plane } from 'lucide-react';
import { sfx } from '@/utils/sfxEngine';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function CameraDirectoriesModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  const directories = [
    {
      name: "Global Webcam CSE",
      desc: "Google Custom Search Engine to search webcams all over the world.",
      url: "https://cipher387.github.io/webcamcse/",
      icon: Search,
      color: "text-amber-400"
    },
    {
      name: "Skyline Webcams",
      desc: "Regional webcams for (almost) every place on earth. Live HD streams.",
      url: "https://www.skylinewebcams.com/",
      icon: Globe,
      color: "text-cyan-400"
    },
    {
      name: "Airport Webcams",
      desc: "Web cameras, live broadcasts from Airports around the world 24/7.",
      url: "https://airportwebcams.net/airport-webcams-by-country/",
      icon: Plane,
      color: "text-emerald-400"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm pointer-events-auto">
      <div className="bg-[#020205] border border-[#00ff88]/50 shadow-[0_0_30px_rgba(0,255,136,0.15)] w-full max-w-2xl flex flex-col h-[70vh] max-h-full">
        {/* Header */}
        <div className="flex justify-between items-center p-3 border-b border-[#00ff88]/30 bg-[#00ff88]/5">
          <div className="flex items-center gap-2 text-[#00ff88] font-mono tracking-widest text-sm">
            <Camera className="w-4 h-4" />
            <span>EXTERNAL CAMERA DIRECTORIES</span>
          </div>
          <button 
            onClick={() => { sfx.playClick(); onClose(); }}
            className="text-cyan-600 hover:text-[#00ff88] transition-colors"
          >
            [CLOSE]
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-4">
          <p className="text-cyan-400/80 font-mono text-xs mb-4">
            ACCESSING EXTERNAL OSINT CAMERA DATABASES. SELECT A DIRECTORY TO OPEN IN A NEW SECURE TAB.
          </p>

          <div className="grid gap-4">
            {directories.map((dir, i) => (
              <a 
                key={i}
                href={dir.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sfx.playClick()}
                className="group border border-cyan-900/40 bg-[#020817]/50 p-4 hover:border-[#00ff88]/50 hover:bg-[#00ff88]/5 transition-all flex items-start justify-between"
              >
                <div className="flex gap-4 items-start">
                  <div className={`p-2 border border-cyan-900/50 bg-black/50 ${dir.color}`}>
                    <dir.icon className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-mono font-bold text-cyan-100 group-hover:text-[#00ff88] transition-colors">
                      {dir.name}
                    </h3>
                    <p className="font-mono text-[10px] text-cyan-500 max-w-md">
                      {dir.desc}
                    </p>
                    <p className="font-mono text-[9px] text-cyan-700 mt-2 truncate">
                      {dir.url}
                    </p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-cyan-700 group-hover:text-[#00ff88] transition-colors" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
