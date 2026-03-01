"use client";

import Link from "next/link";
import { usePosts } from "@/components/providers";
import { PostCard } from "@/components/post";

export default function SciencePage() {
  const { posts } = usePosts();
  const sciencePosts = posts.filter(
    (p) => p.category === "science" || p.category === "observation"
  );

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-night-100">🔬 Nauka</h1>
        <p className="text-night-400 mt-1">
          Artykuły naukowe, obserwacje i prace amatorskie
        </p>
      </div>

      {/* Sekcje */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { icon: "🔬", title: "Artykuły naukowe", desc: "Recenzje badań i odkryć" },
          { icon: "👁️", title: "Obserwacje", desc: "Raporty z obserwacji" },
          { icon: "📝", title: "Prace amatorskie", desc: "Publikacje społeczności" },
        ].map((sec) => (
          <div key={sec.title} className="glass-card-hover p-5 text-center cursor-pointer">
            <span className="text-3xl mb-2 block">{sec.icon}</span>
            <h3 className="font-semibold text-night-200 mb-1">{sec.title}</h3>
            <p className="text-xs text-night-500">{sec.desc}</p>
          </div>
        ))}
      </div>

      {sciencePosts.length > 0 ? (
        <div className="space-y-4">
          {sciencePosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <span className="text-4xl mb-4 block">🔬</span>
          <h3 className="text-lg font-semibold text-night-300 mb-2">Brak artykułów</h3>
          <p className="text-sm text-night-500">Wkrótce pojawią się tu artykuły naukowe.</p>
        </div>
      )}
    </div>
  );
}
