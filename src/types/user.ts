// =============================================
// Typy użytkownika
// =============================================

import { GamificationProfile } from "./gamification";

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  joinedAt: string;
  role: UserRole;
  badges: Badge[];
  stats: UserStats;
  gamification: GamificationProfile;
}

export type UserRole = "admin" | "moderator" | "member" | "newbie";

export interface UserStats {
  posts: number;
  photos: number;
  likes: number;
  comments: number;
  observations: number;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earnedAt: string;
}
