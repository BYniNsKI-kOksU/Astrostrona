"use client";

import { useState } from "react";
import Link from "next/link";
import { mockPosts, mockImages } from "@/data";
import { PostCard } from "@/components/post";
import {
  HiOutlineBookmark,
  HiOutlinePhoto,
  HiOutlineChatBubbleLeftRight,
  HiOutlineHeart,
  HiOutlineEye,
} from "react-icons/hi2";
import clsx from "clsx";

// Symulujemy zapisane posty i zdjęcia (w prawdziwej apce byłoby to z backendu)
const savedPosts = mockPosts.filter((_, i) => i < 3);
const savedImages = mockImages.filter((_, i) => i < 4);

type Tab = "posts" | "images";

export default function SavedPage() {
  const [activeTab, setActiveTab] = useState<Tab>("posts");

  const tabs = [
    {
      id: "posts" as Tab,
      label: "Posty",
      icon: HiOutlineChatBubbleLeftRight,
      count: savedPosts.length,
    },
    {
      id: "images" as Tab,
      label: "Zdjęcia",
      icon: HiOutlinePhoto,
      count: savedImages.length,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      {/* Nagłówek */}
      <div className="flex items-center gap-3 mb-6">
        <HiOutlineBookmark className="h-8 w-8 text-cosmos-400" />
        <div>
          <h1 className="font-display text-3xl font-bold text-night-100">
            Zapisane
          </h1>
          <p className="text-night-400 text-sm mt-0.5">
            Twoje zapisane posty i zdjęcia w jednym miejscu
          </p>
        </div>
      </div>

      {/* Taby */}
      <div className="flex gap-1 mb-6 border-b border-night-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px",
              activeTab === tab.id
                ? "border-cosmos-400 text-cosmos-300"
                : "border-transparent text-night-400 hover:text-night-200 hover:border-night-600"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            <span
              className={clsx(
                "text-xs px-1.5 py-0.5 rounded-full",
                activeTab === tab.id
                  ? "bg-cosmos-500/20 text-cosmos-300"
                  : "bg-night-800 text-night-500"
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Zapisane posty */}
      {activeTab === "posts" && (
        <div>
          {savedPosts.length === 0 ? (
            <div className="text-center py-16">
              <HiOutlineBookmark className="h-12 w-12 text-night-600 mx-auto mb-3" />
              <p className="text-night-400">Nie masz jeszcze zapisanych postów</p>
              <Link href="/forum" className="text-cosmos-400 hover:text-cosmos-300 text-sm mt-2 inline-block">
                Przeglądaj forum →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {savedPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Zapisane zdjęcia */}
      {activeTab === "images" && (
        <div>
          {savedImages.length === 0 ? (
            <div className="text-center py-16">
              <HiOutlinePhoto className="h-12 w-12 text-night-600 mx-auto mb-3" />
              <p className="text-night-400">Nie masz jeszcze zapisanych zdjęć</p>
              <Link href="/gallery" className="text-cosmos-400 hover:text-cosmos-300 text-sm mt-2 inline-block">
                Przeglądaj galerię →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {savedImages.map((img) => (
                <Link
                  key={img.id}
                  href={`/gallery/${img.id}`}
                  className="glass-card-hover rounded-xl overflow-hidden group"
                >
                  <div className="aspect-video bg-night-800 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-night-950/80 to-transparent z-10" />
                    <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-30 group-hover:opacity-50 transition-opacity">
                      {img.objectType === "nebula"
                        ? "💨"
                        : img.objectType === "galaxy"
                        ? "🌀"
                        : img.objectType === "planet"
                        ? "🪐"
                        : img.objectType === "star_cluster"
                        ? "✨"
                        : "🌌"}
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 z-20">
                      <h3 className="font-semibold text-night-100 text-sm truncate">
                        {img.title}
                      </h3>
                      <p className="text-xs text-night-400 mt-0.5">
                        {img.objectName} · {img.constellation}
                      </p>
                    </div>
                  </div>
                  <div className="p-3 flex items-center justify-between text-xs text-night-500">
                    <span>{img.authorName}</span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <HiOutlineHeart className="h-3.5 w-3.5" />
                        {img.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <HiOutlineEye className="h-3.5 w-3.5" />
                        {img.views}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
