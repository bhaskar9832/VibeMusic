
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ActivityType, Playlist, UserContext, WeatherData, AuthUser } from './types';
import { fetchWeather } from './services/weatherService';
import { generatePlaylist } from './services/geminiService';
import { activityDetector } from './services/activityService';
import { MoodScanner } from './components/MoodScanner';
import { SplashScreen } from './components/SplashScreen';
import { ProfileModal } from './components/ProfileModal';
import { Camera, MapPin, Activity, Music2, RefreshCw, Sun, PlayCircle, Settings, Globe, LogOut, User as UserIcon, ExternalLink } from 'lucide-react';

const UPDATE_INTERVAL_MS = 120000; // 2 minutes

const LANGUAGES = [
  'English', 'Spanish', 'Hindi', 'K-Pop', 'Japanese', 'French', 'Punjabi', 'German', 'Portuguese', 'Instrumental'
];

// View State: 'loading' is no longer needed as we default to splash
type AppView = 'splash' | 'app';

const DEFAULT_USER: AuthUser = {
  id: 'guest',
  name: 'Vibe User',
  email: '',
  photoUrl: undefined,
  bio: 'Ready to vibe.',
  token: 'guest'
};

export default function App() {
  // App View State
  const [view, setView] = useState<AppView>('splash');
  const [user, setUser] = useState<AuthUser>(DEFAULT_USER);

  // UI State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isScanningMood, setIsScanningMood] = useState(false);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [generatingPlaylist, setGeneratingPlaylist] = useState(false);
  
  // Context State
  const [context, setContext] = useState<UserContext>({
    weather: null,
    mood: null,
    activity: ActivityType.RELAXING,
    language: 'English',
  });
  
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [autoDetectActivity, setAutoDetectActivity] = useState(true);
  
  // Refs
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- Startup Flow ---

  useEffect(() => {
    // Load persisted user profile if available
    const savedProfile = localStorage.getItem('vibe_user_profile');
    if (savedProfile) {
      try {
        setUser(JSON.parse(savedProfile));
      } catch (e) {
        console.warn("Failed to load saved profile", e);
      }
    }
  }, []);

  const handleSplashFinish = () => {
    setView('app');
    refreshContext();
  };

  const handleUpdateUser = (updatedUser: AuthUser) => {
    setUser(updatedUser);
    // Persist to local storage
    localStorage.setItem('vibe_user_profile', JSON.stringify(updatedUser));
  };

  // --- Context Logic ---

  const refreshContext = useCallback(async () => {
    setLoadingWeather(true);

    const handleFallbackWeather = async () => {
      try {
        console.log("Using fallback location (London) for weather.");
        const w = await fetchWeather(51.5074, -0.1278);
        setContext(prev => ({ ...prev, weather: w }));
      } catch (e) {
        console.warn("Fallback weather fetch failed", e);
      } finally {
        setLoadingWeather(false);
      }
    };
    
    // 1. Weather & Geo-speed
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, speed } = position.coords;
          
          // Fetch Weather
          const weather = await fetchWeather(latitude, longitude);
          
          // Detect Activity (if auto)
          let newActivity = context.activity;
          if (autoDetectActivity) {
            // Speed is in m/s. Convert to km/h. 
            const speedKmh = (speed || 0) * 3.6; 
            newActivity = activityDetector.detect(speedKmh);
          }

          setContext(prev => ({ 
            ...prev, 
            weather, 
            activity: autoDetectActivity ? newActivity : prev.activity 
          }));
          
          setLoadingWeather(false);
        },
        (error) => {
          let msg = error.message;
          if (error.code === error.PERMISSION_DENIED) msg = "User denied location access.";
          else if (error.code === error.TIMEOUT) msg = "Location request timed out.";
          console.warn(`Geolocation skipped: ${msg}`);
          handleFallbackWeather();
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      handleFallbackWeather();
    }
  }, [context.activity, autoDetectActivity]);

  // Poll only when in 'app' view
  useEffect(() => {
    if (view === 'app') {
      intervalRef.current = setInterval(() => {
        console.log("Polling context update...");
        refreshContext();
      }, UPDATE_INTERVAL_MS);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [view, refreshContext]);

  // --- Handlers ---

  const handleMoodDetected = (mood: string) => {
    setContext(prev => ({ ...prev, mood }));
  };

  const handleGeneratePlaylist = async () => {
    setGeneratingPlaylist(true);
    const newPlaylist = await generatePlaylist(context);
    setPlaylist(newPlaylist);
    setGeneratingPlaylist(false);
  };

  const handleActivityChange = (type: ActivityType) => {
    setContext(prev => ({ ...prev, activity: type }));
    setAutoDetectActivity(false); 
  };

  const handleLanguageChange = (lang: string) => {
    setContext(prev => ({ ...prev, language: lang }));
  };

  const toggleAutoDetect = async () => {
    if (!autoDetectActivity) {
      await activityDetector.requestPermission();
      setAutoDetectActivity(true);
      refreshContext();
    } else {
      setAutoDetectActivity(false);
    }
  };

  const openInYoutube = (url?: string) => {
    if (url) window.open(url, '_blank');
  };

  const playFullMix = () => {
    if (!playlist || !playlist.songs.length) return;
    
    const ids = playlist.songs.map(s => s.youtubeId).filter(Boolean);
    if (ids.length > 0) {
      // Create an anonymous playlist of these videos
      const playlistUrl = `https://www.youtube.com/watch_videos?video_ids=${ids.join(',')}`;
      window.open(playlistUrl, '_blank');
    } else {
      // Fallback: just open the first song if no IDs
      openInYoutube(playlist.songs[0].url);
    }
  };

  // --- Render Views ---

  if (view === 'splash') {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  // --- Main App View ---
  return (
    <div className="min-h-screen bg-slate-950 text-white pb-10 font-sans selection:bg-cyan-500 selection:text-white">
      {/* Header */}
      <header className="p-6 flex justify-between items-center bg-gradient-to-b from-slate-900 to-slate-950 sticky top-0 z-30 backdrop-blur-md bg-opacity-80">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Music2 size={18} className="text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">VibeMusic</h1>
        </div>
        <div className="flex items-center gap-3">
            <button 
                onClick={toggleAutoDetect}
                className={`p-2 rounded-full border transition-colors ${autoDetectActivity ? 'border-cyan-500 text-cyan-500 bg-cyan-500/10' : 'border-slate-700 text-slate-500 hover:text-white'}`}
                title="Auto-detect Activity"
            >
                <Settings size={18} />
            </button>
            
            {/* User Profile Trigger */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
               <button 
                onClick={() => setShowProfileModal(true)}
                className="group relative"
               >
                 {user?.photoUrl ? (
                   <img 
                    src={user.photoUrl} 
                    alt="User" 
                    className="w-9 h-9 rounded-full border border-slate-600 group-hover:border-cyan-400 transition-colors object-cover" 
                   />
                 ) : (
                    <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 group-hover:border-cyan-400">
                      <span className="text-sm font-bold text-cyan-400">{user?.name?.[0] || 'U'}</span>
                    </div>
                 )}
                 {/* Online Indicator */}
                 <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-slate-950 rounded-full"></span>
               </button>
            </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 md:max-w-2xl">
        
        {/* Welcome Msg */}
        <div className="mb-8 animate-fade-in">
           <h2 className="text-2xl font-semibold text-white">
             Hi, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">{user?.name?.split(' ')[0]}</span>
           </h2>
           <p className="text-slate-400 text-sm mt-1">{user?.bio || "Let's find the right sound for right now."}</p>
        </div>

        {/* Context Dashboard */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          
          {/* Weather Card */}
          <div className="col-span-1 bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between h-36 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
               {context.weather ? <Sun size={48} /> : <RefreshCw size={48} />}
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1">
                <MapPin size={10} /> Location
              </p>
              {loadingWeather ? (
                <div className="space-y-2">
                   <div className="animate-pulse h-6 w-16 bg-slate-800 rounded"></div>
                   <div className="animate-pulse h-4 w-24 bg-slate-800 rounded"></div>
                </div>
              ) : (
                <>
                  <h3 className="text-3xl font-bold text-white tracking-tight">{Math.round(context.weather?.temperature || 0)}°</h3>
                  <p className="text-sm text-slate-300 truncate font-medium">{context.weather?.condition || "Unavailable"}</p>
                </>
              )}
            </div>
            <div className="flex gap-2 mt-auto">
               <span className="text-xs px-2 py-1 bg-slate-800/80 rounded-lg text-cyan-400 font-mono">
                 {context.weather?.windSpeed || 0} km/h
               </span>
            </div>
          </div>

          {/* Mood Card */}
          <button 
            onClick={() => setIsScanningMood(true)}
            className="col-span-1 bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between h-36 relative overflow-hidden hover:bg-slate-800/50 hover:border-cyan-500/30 transition-all group text-left"
          >
             <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 group-hover:text-cyan-400 transition-all">
              <Camera size={48} />
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1">
                <Camera size={10} /> Your Mood
              </p>
              <h3 className={`text-2xl font-bold ${context.mood ? 'text-cyan-400' : 'text-slate-500'}`}>
                {context.mood || "Scan"}
              </h3>
              {!context.mood && <p className="text-xs text-slate-500 mt-1">Tap to detect</p>}
            </div>
            <div className="mt-auto">
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full bg-cyan-500 transition-all duration-500 ${context.mood ? 'w-full' : 'w-0'}`}></div>
                </div>
            </div>
          </button>
        </div>

        {/* Activity Selector */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                <Activity size={12} /> Current Activity
            </p>
            {autoDetectActivity && (
                <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full animate-pulse border border-cyan-500/20">
                    AUTO
                </span>
            )}
          </div>
          <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
            {Object.values(ActivityType).map((activity) => (
              <button
                key={activity}
                onClick={() => handleActivityChange(activity)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  context.activity === activity 
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20 scale-105' 
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {activity}
              </button>
            ))}
          </div>
        </div>

        {/* Language Selector */}
        <div className="mb-10">
           <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-1">
                <Globe size={12} /> Music Language
           </p>
           <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  context.language === lang 
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' 
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGeneratePlaylist}
          disabled={generatingPlaylist}
          className="w-full py-5 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 rounded-2xl font-bold text-lg text-white shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mb-10 border border-white/10"
        >
          {generatingPlaylist ? (
            <>
              <RefreshCw className="animate-spin" size={24} />
              Curating Vibe...
            </>
          ) : (
            <>
              <Music2 size={24} />
              Generate Vibe Mix
            </>
          )}
        </button>

        {/* Playlist Display */}
        {playlist && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 pb-8">
            <div 
              className="rounded-3xl p-8 mb-6 relative overflow-hidden shadow-2xl group"
              style={{ background: playlist.coverGradient }}
            >
              {/* Overlay for readability */}
              <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"></div>
              
              <div className="relative z-10">
                <h2 className="text-2xl md:text-3xl font-bold mb-2 text-white shadow-sm">{playlist.name}</h2>
                <p className="text-white/90 text-sm md:text-base max-w-[90%] font-medium leading-relaxed opacity-90 mb-6">{playlist.description}</p>
                
                <div className="flex flex-wrap items-center gap-3">
                    <button 
                        onClick={playFullMix}
                        className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full font-bold hover:bg-gray-100 hover:scale-105 transition-all shadow-lg"
                    >
                        <PlayCircle fill="currentColor" size={20} />
                        Play Full Mix on YouTube
                    </button>

                    {context.language && context.language !== 'English' && (
                        <span className="inline-block text-xs bg-black/40 px-3 py-2 rounded-full text-white border border-white/20 backdrop-blur-md">
                            {context.language}
                        </span>
                    )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {playlist.songs.map((song, index) => (
                <div 
                  key={index}
                  onClick={() => openInYoutube(song.url)}
                  className="flex items-center gap-4 p-3 rounded-xl transition-all cursor-pointer group bg-slate-900/30 hover:bg-slate-800 border border-transparent hover:border-slate-700"
                >
                  <div className="w-8 flex justify-center text-slate-500 font-mono text-sm group-hover:text-cyan-400">
                    {index + 1}
                  </div>

                  <div className="flex-1 min-w-0 pr-4">
                    <h3 className="font-semibold truncate text-base text-slate-200 group-hover:text-white">
                      {song.title}
                    </h3>
                    <p className="text-sm text-slate-500 truncate flex items-center gap-2 group-hover:text-slate-400">
                      {song.artist} <span className="w-1 h-1 rounded-full bg-slate-600"></span> {song.vibe}
                    </p>
                  </div>
                  
                  {/* External Link Icon */}
                  <div className="text-slate-600 group-hover:text-white transition-colors">
                     <ExternalLink size={20} />
                  </div>
                </div>
              ))}
            </div>
            
            <p className="text-center text-slate-600 text-xs mt-8">
                Songs are played directly on YouTube.
            </p>
          </div>
        )}

      </main>

      {/* Overlays */}
      {isScanningMood && (
        <MoodScanner 
          onMoodDetected={handleMoodDetected} 
          onClose={() => setIsScanningMood(false)} 
        />
      )}

      {showProfileModal && user && (
        <ProfileModal 
          user={user}
          onClose={() => setShowProfileModal(false)}
          onUpdate={handleUpdateUser}
        />
      )}
    </div>
  );
}
