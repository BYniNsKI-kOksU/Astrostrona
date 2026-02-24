"use client";

import { useState, useMemo } from "react";
import { mockPosts } from "@/data";
import { PostList } from "@/components/post";
import { SearchBar } from "@/components/ui";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  HiOutlinePlusCircle,
  HiOutlineFire,
  HiOutlineClock,
  HiOutlineStar,
  HiOutlineBookmark,
} from "react-icons/hi2";
import clsx from "clsx";
import { FORUM_CATEGORIES } from "@/lib/constants";
import { ForumPost } from "@/types";

const sortOptions = [
  { value: "hot", label: "Popularne", icon: HiOutlineFire },
  { value: "new", label: "Najnowsze", icon: HiOutlineClock },
  { value: "top", label: "Najlepsze", icon: HiOutlineStar },
  { value: "saved", label: "Zapisane", icon: HiOutlineBookmark },
];

export default function ForumPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeSort, setActiveSort] = useState("hot");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = useMemo(() => {
    let result = [...mockPosts];

    // Filtrowanie po kategorii
    if (activeCategory !== "all") {
      result = result.filter((p) => p.category === activeCategory);
    }

    // Wyszukiwanie
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.authorName.toLowerCase().includes(q)
      );
    }

    // Sortowanie
    switch (activeSort) {
      case "new":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "top":
        result.sort((a, b) => b.likes - a.likes);
        break;
      case "hot":
        result.sort((a, b) => (b.likes + b.comments * 2) - (a.likes + a.comments * 2));
        break;
      case "saved":
        result = result.filter((p) => p.isSaved);
        break;
    }

    return result;
  }, [activeCategory, activeSort, searchQuery]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      {/* Nagłówek */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-night-100">Forum</h1>
          <p className="text-night-400 mt-1">Dyskutuj, pytaj, dziel się wiedzą</p>
        </div>
        <Link href="/forum/new" className="btn-primary flex items-center gap-2">
          <HiOutlinePlusCircle className="h-5 w-5" />
          Nowy post
        </Link>
      </div>

      {/* Wyszukiwarka */}
      <div className="mb-6">
        <SearchBar
          placeholder="Szukaj postów, tagów, użytkowników..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Treść z sidebar */}
      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-20 space-y-6">
            {/* Sortowanie */}
            <div className="glass-card p-4">
              <h3 className="text-sm font-semibold text-night-300 uppercase tracking-wider mb-3">
                Sortuj
              </h3>
              <div className="space-y-1">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setActiveSort(opt.value)}
                    className={clsx(
                      "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors w-full text-left",
                      activeSort === opt.value
                        ? "bg-cosmos-500/20 text-cosmos-300"
                        : "text-night-400 hover:text-night-200 hover:bg-night-800"
                    )}
                  >
                    <opt.icon className="h-4 w-4" />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Kategorie */}
            <div className="glass-card p-4">
              <h3 className="text-sm font-semibold text-night-300 uppercase tracking-wider mb-3">
                Kategorie
              </h3>
              <div className="space-y-1">
                {FORUM_CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setActiveCategory(cat.value)}
                    className={clsx(
                      "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors w-full text-left",
                      activeCategory === cat.value
                        ? "bg-cosmos-500/20 text-cosmos-300"
                        : "text-night-400 hover:text-night-200 hover:bg-night-800"
                    )}
                  >
                    <span>{cat.icon}</span>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Popularne tagi */}
            <div className="glass-card p-4">
              <h3 className="text-sm font-semibold text-night-300 uppercase tracking-wider mb-3">
                Popularne tagi
              </h3>
              <div className="flex flex-wrap gap-2">
                {["#deepsky", "#mgławica", "#sprzęt", "#początkujący", "#narrowband", "#kometa", "#pixinsight", "#obserwacja"].map(
                  (tag) => (
                    <button
                      key={tag}
                      onClick={() => setSearchQuery(tag)}
                      className="tag bg-night-800 text-night-400 border-night-700 hover:bg-cosmos-500/20 hover:text-cosmos-300 hover:border-cosmos-500/30 transition-colors"
                    >
                      {tag}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* Posty */}
        <div className="flex-1 min-w-0">
          {/* Info o filtrach */}
          {(activeCategory !== "all" || searchQuery) && (
            <div className="flex items-center gap-2 mb-4 text-sm text-night-400">
              <span>
                {filteredPosts.length} {filteredPosts.length === 1 ? "post" : "postów"}
              </span>
              {activeCategory !== "all" && (
                <button
                  onClick={() => setActiveCategory("all")}
                  className="tag bg-cosmos-500/10 text-cosmos-400 border-cosmos-500/20"
                >
                  ✕ {FORUM_CATEGORIES.find((c) => c.value === activeCategory)?.label}
                </button>
              )}
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="tag bg-cosmos-500/10 text-cosmos-400 border-cosmos-500/20"
                >
                  ✕ &quot;{searchQuery}&quot;
                </button>
              )}
            </div>
          )}
          <PostList posts={filteredPosts} />
        </div>
      </div>
    </div>
  );
}
