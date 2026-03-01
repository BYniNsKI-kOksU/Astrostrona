"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { ForumPost, PostCategory } from "@/types";
import { mockPosts } from "@/data";

// =============================================
// Posts Context — centralny store postów
// =============================================

interface NewPostData {
  title: string;
  content: string;
  category: PostCategory;
  tags: string[];
  images: string[];
  authorId: string;
  authorName: string;
  authorAvatar: string;
}

interface PostsContextType {
  posts: ForumPost[];
  addPost: (data: NewPostData) => ForumPost;
  getPostById: (id: string) => ForumPost | undefined;
  getPostsByAuthor: (authorId: string) => ForumPost[];
  getPostsByCategory: (category: string) => ForumPost[];
}

const PostsContext = createContext<PostsContextType | null>(null);

const STORAGE_KEY = "astrofor_posts";

export function PostsProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Ładowanie z localStorage (lub mockPosts jako fallback)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: ForumPost[] = JSON.parse(stored);
        // Połącz mockPosts z zapisanymi — mockPosts jako baza, dodane posty nadpisują
        const mockIds = new Set(mockPosts.map((p) => p.id));
        const userPosts = parsed.filter((p) => !mockIds.has(p.id));
        setPosts([...mockPosts, ...userPosts]);
      } else {
        setPosts([...mockPosts]);
      }
    } catch {
      setPosts([...mockPosts]);
    }
    setIsHydrated(true);
  }, []);

  // Zapis do localStorage przy każdej zmianie (tylko user posts)
  useEffect(() => {
    if (!isHydrated) return;
    try {
      // Zapisz wszystkie posty (łącznie z mock, żeby zachować stan like/save)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    } catch {
      // localStorage pełny lub niedostępny
    }
  }, [posts, isHydrated]);

  const addPost = useCallback(
    (data: NewPostData): ForumPost => {
      const now = new Date().toISOString();
      const newPost: ForumPost = {
        id: `p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        authorId: data.authorId,
        authorName: data.authorName,
        authorAvatar: data.authorAvatar,
        title: data.title,
        content: data.content,
        category: data.category,
        tags: data.tags,
        images: data.images,
        createdAt: now,
        updatedAt: now,
        likes: 0,
        comments: 0,
        saves: 0,
        isLiked: false,
        isSaved: false,
        isPinned: false,
      };

      setPosts((prev) => [newPost, ...prev]);
      return newPost;
    },
    []
  );

  const getPostById = useCallback(
    (id: string) => posts.find((p) => p.id === id),
    [posts]
  );

  const getPostsByAuthor = useCallback(
    (authorId: string) => posts.filter((p) => p.authorId === authorId),
    [posts]
  );

  const getPostsByCategory = useCallback(
    (category: string) => posts.filter((p) => p.category === category),
    [posts]
  );

  return (
    <PostsContext.Provider
      value={{ posts, addPost, getPostById, getPostsByAuthor, getPostsByCategory }}
    >
      {children}
    </PostsContext.Provider>
  );
}

export function usePosts() {
  const ctx = useContext(PostsContext);
  if (!ctx) {
    throw new Error("usePosts musi być użyty wewnątrz PostsProvider");
  }
  return ctx;
}
