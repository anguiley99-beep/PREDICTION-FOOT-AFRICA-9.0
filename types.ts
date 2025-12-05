
export interface User {
  id: string;
  name: string;
  email: string;
  profilePictureUrl: string;
  country: {
    name: string;
    code: string;
  };
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  isAdmin: boolean;
  lastLogin?: string; // Date de dernière connexion pour les statistiques
}

export type PredictionValue = '1' | 'X' | '2' | '1X' | 'X2';

export interface Match {
  id: string;
  betNumber: number;
  homeTeam: {
    name: string;
    flagUrl: string;
  };
  awayTeam: {
    name: string;
    flagUrl: string;
  };
  date: string;
  competition: string;
  competitionLogoUrl?: string;
  country: string;
  result?: {
    homeScore: number;
    awayScore: number;
  };
}

export interface Prediction {
  userId: string;
  matchId: string;
  prediction: PredictionValue;
  userName?: string;
  matchBetNumber?: number;
  matchLabel?: string;
  timestamp?: string;
  points?: number; // Score stocké une fois le match terminé ou supprimé
}

export interface LeaderboardEntry {
  user: User;
  points: number;
  rank: number;
  rankChange: 'up' | 'down' | 'same';
}

export interface Rule {
  id: string;
  content: string;
}

export interface Info {
  id: string;
  text: string;
  imageUrl?: string;
  timestamp?: string;
}

export interface ForumMessage {
  id: string;
  user: User;
  message: string;
  timestamp: string;
}

export interface ContactMessage {
  id: string;
  user: User;
  message: string;
  timestamp: string;
  isFromAdmin: boolean;
}

export interface Ad {
  id: string;
  imageUrl: string;
  name: string;
  price: string;
  url: string;
}

export interface AppSettings {
    adSenseClientId: string;
    adSenseSlots: {
        home: string;
        predictions: string;
        leaderboard: string;
        rules: string;
        info: string;
        forum: string;
        contact: string;
        interstitial: string;
        about: string;
        privacy: string;
    };
}
