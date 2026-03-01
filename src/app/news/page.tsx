"use client";

import Link from "next/link";
import { usePosts } from "@/components/providers";
import { PostCard } from "@/components/post";

export default function NewsPage() {
  const { getPostsByCategory } = usePosts();
  const newsPosts = getPostsByCategory("news");

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-night-100">📰 Newsy</h1>
        <p className="text-night-400 mt-1">
          Najnowsze wiadomości ze świata astronomii
        </p>
      </div>

      {newsPosts.length > 0 ? (
        <div className="space-y-4">
          {newsPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <span className="text-4xl mb-4 block">📰</span>
          <h3 className="text-lg font-semibold text-night-300 mb-2">Brak newsów</h3>
          <p className="text-sm text-night-500">Wkrótce pojawią się tu newsy astronomiczne.</p>
        </div>
      )}
    </div>
  );
}
