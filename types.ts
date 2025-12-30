
export interface WeatherData {
  temperature: number;
  condition: string;
  isDay: boolean;
  windSpeed: number;
}

export enum ActivityType {
  RELAXING = 'Relaxing',
  DRIVING = 'Driving',
  WALKING = 'Walking',
  WORKING = 'Working',
  PARTYING = 'Partying',
  GYM = 'Workout'
}
export type Song = {
  id?: string;
  title: string;
  artist?: string;
  vibe?: string;
  duration?: string;
  youtubeId?: string; // optional preferred id
  youtubeCandidates?: { videoId: string; title?: string; url?: string }[];
  url?: string;
};




export interface Playlist {
  name: string;
  description: string;
  songs: Song[];
  coverGradient: string;
}

export interface UserContext {
  weather: WeatherData | null;
  mood: string | null;
  activity: ActivityType;
  language: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  bio?: string;
  token?: string; // JWT token for session
}