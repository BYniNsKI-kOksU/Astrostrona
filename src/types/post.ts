// =============================================
// Typy postów na forum
// =============================================

export type PostCategory =
  | "astrophoto"
  | "equipment"
  | "software"
  | "general"
  | "observation"
  | "science"
  | "news"
  | "beginner";

export interface ForumPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  title: string;
  content: string;
  category: PostCategory;
  tags: string[];
  images: string[];
  createdAt: string;
  updatedAt: string;
  likes: number;
  comments: number;
  saves: number;
  isLiked: boolean;
  isSaved: boolean;
  isPinned: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
  replies: Comment[];
}
