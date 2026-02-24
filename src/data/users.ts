import { User } from "@/types";
import { mockGamificationProfiles } from "./gamification";

export const mockUsers: User[] = [
  {
    id: "u1",
    username: "stargazer_pl",
    displayName: "Marek Gwiazdowski",
    avatar: "/avatars/default.png",
    bio: "Astrofotograf od 5 lat. Kocham głębokie niebo.",
    joinedAt: "2024-03-15",
    role: "admin",
    badges: [
      {
        id: "b1",
        name: "Założyciel",
        icon: "🌟",
        description: "Jeden z pierwszych członków",
        earnedAt: "2024-03-15",
      },
    ],
    stats: { posts: 42, photos: 128, likes: 890, comments: 256, observations: 15 },
    gamification: mockGamificationProfiles[0],
  },
  {
    id: "u2",
    username: "nebula_hunter",
    displayName: "Anna Kosmiczna",
    avatar: "/avatars/default.png",
    bio: "Poluję na mgławice z mojego balkonu w Krakowie.",
    joinedAt: "2024-06-01",
    role: "member",
    badges: [],
    stats: { posts: 18, photos: 45, likes: 320, comments: 98, observations: 5 },
    gamification: mockGamificationProfiles[1],
  },
  {
    id: "u3",
    username: "deep_sky_mike",
    displayName: "Michał Niebo",
    avatar: "/avatars/default.png",
    bio: "Newton 200/1000 + ASI294MC Pro. Ciemne niebo = szczęście.",
    joinedAt: "2024-09-10",
    role: "member",
    badges: [],
    stats: { posts: 7, photos: 22, likes: 150, comments: 44, observations: 3 },
    gamification: mockGamificationProfiles[2],
  },
];
