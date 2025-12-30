import React, { useEffect, useRef, useState } from "react";
import { Song } from "../types";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Heart,
  ExternalLink,
  Maximize2,
  Minimize2,
} from "lucide-react";

interface MusicPlayerProps {
  currentSong: Song | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  currentSong,
  isPlaying,
  onPlayPause,
  onNext,
  onPrev,
}) => {
  const playerRef = useRef<any>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [showVideo, setShowVideo] = useState(true);
  
  // Track fallback state to prevent infinite error loops
  const [isFallback, setIsFallback] = useState(false);

  // Unlock audio on first click
  useEffect(() => {
    const unlock = () => {
      if (playerRef.current && playerRef.current.unMute) {
        playerRef.current.unMute();
        playerRef.current.setVolume(100);
      }
      window.removeEventListener("click", unlock);
    };
    window.addEventListener("click", unlock);
  }, []);

  // Monitor volume to ensure it doesn't stay muted
  useEffect(() => {
    if (!isPlaying || !isPlayerReady) return;
    
    const volumeInterval = setInterval(() => {
      if (playerRef.current && typeof playerRef.current.isMuted === 'function') {
        if (playerRef.current.isMuted()) {
          console.log("Forcing unmute");
          playerRef.current.unMute();
        }
        if (playerRef.current.getVolume() < 100) {
          playerRef.current.setVolume(100);
        }
      }
    }, 1000);
    
    return () => clearInterval(volumeInterval);
  }, [isPlaying, isPlayerReady]);

  // Load YouTube API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);

      window.onYouTubeIframeAPIReady = () => initializePlayer();
    } else {
      initializePlayer();
    }
  }, []);

  const initializePlayer = () => {
    if (playerRef.current) return;

    playerRef.current = new window.YT.Player("youtube-player", {
      width: "100%",
      height: "100%",
      playerVars: {
        autoplay: 1,
        mute: 0,
        playsinline: 1,
        controls: 1,
        modestbranding: 1,
        iv_load_policy: 3,
        origin: window.location.origin,
      },
      events: {
        onReady: onPlayerReady,
        onError: onPlayerError,
        onStateChange: onPlayerStateChange,
      },
    });
  };

  const onPlayerReady = (e: any) => {
    setIsPlayerReady(true);
    e.target.unMute();
    e.target.setVolume(100);
    if (currentSong) {
      loadCurrentSong();
    }
  };

  const loadCurrentSong = () => {
    if (!currentSong || !playerRef.current) return;

    // Reset fallback state for the new song
    setIsFallback(false);

    // If we have a specific ID, try that first
    if (currentSong.youtubeId) {
      loadVideo(currentSong.youtubeId);
    } else {
      // If no ID, go straight to fallback search
      playFallbackSearch();
    }
  };

  const loadVideo = (videoId: string) => {
    try {
      playerRef.current.loadVideoById(videoId);
      // Small timeout to ensure volume is up after load
      setTimeout(() => {
        try {
          playerRef.current.unMute();
          playerRef.current.setVolume(100);
          if (isPlaying) playerRef.current.playVideo();
        } catch {}
      }, 300);
    } catch (err) {
      console.warn("Immediate player load error:", err);
      // Don't skip immediately, try fallback
      playFallbackSearch();
    }
  };

  const playFallbackSearch = () => {
    if (!currentSong) return;
    
    console.log(`Attempting fallback search for: ${currentSong.title}`);
    setIsFallback(true);
    
    // Construct a query that prefers official audio or lyric videos which are often embeddable
    const query = `${currentSong.title} ${currentSong.artist} official audio`;
    
    try {
      playerRef.current.loadPlaylist({
        list: query,
        listType: "search",
        index: 0,
        startSeconds: 0
      });
      // Ensure volume is up
      setTimeout(() => {
         try {
           playerRef.current.unMute();
           playerRef.current.setVolume(100);
         } catch(e) {}
      }, 500);
    } catch (e) {
      console.warn("Fallback search failed:", e);
      onNext(); // Only skip if even fallback fails
    }
  };

  const onPlayerError = (event: any) => {
    const code = event?.data;
    console.warn("YouTube Error Code:", code);

    // If we are already in fallback mode and it fails, we must skip to prevent dead silence
    if (isFallback) {
      console.warn("Fallback failed. Skipping song.");
      onNext();
      return;
    }

    // Error 100: Not found
    // Error 101/150: Not allowed to play in embedded player
    // In these cases, try the fallback search
    if (code === 100 || code === 101 || code === 150) {
      playFallbackSearch();
    } else {
      // For other errors, also try fallback as a safety net
      playFallbackSearch();
    }
  };

  const onPlayerStateChange = (event: any) => {
    // Ensure sound is on when playing starts
    if (event.data === window.YT.PlayerState.PLAYING) {
      try {
        playerRef.current.unMute();
        playerRef.current.setVolume(100);
      } catch {}
    }

    // When video ends, go to next song
    if (event.data === window.YT.PlayerState.ENDED) {
      // If we were using search playlist, the player might try to play the 2nd search result.
      // We want to force our app's next song instead.
      onNext();
    }
  };

  // Watch for song changes
  useEffect(() => {
    if (isPlayerReady && currentSong) {
      loadCurrentSong();
    }
  }, [currentSong, isPlayerReady]);

  // Watch for Play/Pause toggle
  useEffect(() => {
    if (!playerRef.current || !isPlayerReady) return;

    if (isPlaying) {
      try {
        playerRef.current.playVideo();
      } catch {}
    } else {
      try {
        playerRef.current.pauseVideo();
      } catch {}
    }
  }, [isPlaying]);

  if (!currentSong) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700 pb-6 z-40">
      <div className="max-w-3xl mx-auto flex flex-col gap-2 p-3">
        
        <div className="flex items-center gap-4">
          
          <div className={`relative bg-black rounded-lg overflow-hidden transition-all duration-300 
            ${showVideo ? "w-32 h-20" : "w-0 h-0 opacity-0"}`}>
            <div id="youtube-player" className="w-full h-full"></div>
            {/* Blocker to prevent clicking youtube implementation details if needed */}
            <div className="absolute inset-0 bg-transparent" onClick={() => setShowVideo(!showVideo)}></div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-white font-bold truncate cursor-pointer hover:text-cyan-400" onClick={() => setShowVideo(!showVideo)}>
                {currentSong.title}
              </h4>
              <button
                className="text-slate-500 hover:text-cyan-400"
                onClick={() => setShowVideo(!showVideo)}
              >
                {showVideo ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
            </div>
            <p className="text-slate-400 text-xs truncate">
              {currentSong.artist} • {currentSong.vibe}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={onPrev} className="text-slate-400 hover:text-white transition-colors">
              <SkipBack size={22} />
            </button>

            <button
              onClick={onPlayPause}
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-900 shadow-lg hover:scale-105 transition-transform"
            >
              {isPlaying ? (
                <Pause size={24} />
              ) : (
                <Play size={24} className="ml-1" />
              )}
            </button>

            <button onClick={onNext} className="text-slate-400 hover:text-white transition-colors">
              <SkipForward size={22} />
            </button>
          </div>

          <div className="hidden md:flex gap-3">
            {currentSong.url && (
              <a
                href={currentSong.url}
                target="_blank"
                rel="noreferrer"
                className="text-slate-500 hover:text-red-500 transition-colors"
                title="Open in YouTube"
              >
                <ExternalLink size={20} />
              </a>
            )}
            <button className="text-slate-500 hover:text-pink-500 transition-colors">
              <Heart size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
