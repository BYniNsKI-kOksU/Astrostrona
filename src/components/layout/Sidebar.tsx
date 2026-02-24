"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { FORUM_CATEGORIES } from "@/lib/constants";
import {
  HiOutlineFire,
  HiOutlineClock,
  HiOutlineStar,
  HiOutlineBookmark,
} from "react-icons/hi2";

const sortOptions = [
  { value: "hot", label: "Popularne", icon: HiOutlineFire },
  { value: "new", label: "Najnowsze", icon: HiOutlineClock },
  { value: "top", label: "Najlepsze", icon: HiOutlineStar },
  { value: "saved", label: "Zapisane", icon: HiOutlineBookmark },
];

interface SidebarProps {
  activeCategory?: string;
  activeSort?: string;
}

export default function Sidebar({ activeCategory = "all", activeSort = "hot" }: SidebarProps) {
  const pathname = usePathname();
  const isForumPage = pathname.startsWith("/forum");

  if (!isForumPage) return null;

  return (
    <aside className="hidden lg:block w-64 shrink-0">
      <div className="sticky top-20 space-y-6">
        {/* Sortowanie */}
        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold text-night-300 uppercase tracking-wider mb-3">
            Sortuj
          </h3>
          <div className="space-y-1">
            {sortOptions.map((opt) => (
              <Link
                key={opt.value}
                href={`/forum?sort=${opt.value}${activeCategory !== "all" ? `&category=${activeCategory}` : ""}`}
                className={clsx(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                  activeSort === opt.value
                    ? "bg-cosmos-500/20 text-cosmos-300"
                    : "text-night-400 hover:text-night-200 hover:bg-night-800"
                )}
              >
                <opt.icon className="h-4 w-4" />
                {opt.label}
              </Link>
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
              <Link
                key={cat.value}
                href={`/forum?category=${cat.value}${activeSort !== "hot" ? `&sort=${activeSort}` : ""}`}
                className={clsx(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                  activeCategory === cat.value
                    ? "bg-cosmos-500/20 text-cosmos-300"
                    : "text-night-400 hover:text-night-200 hover:bg-night-800"
                )}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </Link>
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
                <Link
                  key={tag}
                  href={`/forum?tag=${encodeURIComponent(tag)}`}
                  className="tag bg-night-800 text-night-400 border-night-700 hover:bg-cosmos-500/20 hover:text-cosmos-300 hover:border-cosmos-500/30 transition-colors"
                >
                  {tag}
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
