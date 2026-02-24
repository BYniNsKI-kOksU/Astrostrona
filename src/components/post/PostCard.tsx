"use client";

import { useState } from "react";
import Link from "next/link";
import {
  HiOutlineHeart,
  HiHeart,
  HiOutlineChatBubbleLeft,
  HiOutlineBookmark,
  HiBookmark,
  HiOutlineEllipsisHorizontal,
} from "react-icons/hi2";
import { ForumPost } from "@/types";
import { formatRelativeDate, formatNumber, getCategoryLabel, getCategoryColor } from "@/lib/utils";

interface PostCardProps {
  post: ForumPost;
}

export default function PostCard({ post }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [isSaved, setIsSaved] = useState(post.isSaved);
  const [likes, setLikes] = useState(post.likes);
  const [saves, setSaves] = useState(post.saves);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked((prev) => !prev);
    setLikes((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaved((prev) => !prev);
    setSaves((prev) => (isSaved ? prev - 1 : prev + 1));
  };

  return (
    <article className="glass-card-hover p-5">
      {/* Nagłówek */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-cosmos-500/30 flex items-center justify-center text-cosmos-300 font-bold text-sm">
            {post.authorName.charAt(0)}
          </div>
          <div>
            <Link
              href={`/profile/${post.authorId}`}
              className="text-sm font-medium text-night-200 hover:text-white transition-colors"
            >
              {post.authorName}
            </Link>
            <p className="text-xs text-night-500">{formatRelativeDate(post.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`tag text-xs border ${getCategoryColor(post.category)}`}
          >
            {getCategoryLabel(post.category)}
          </span>
          <button className="text-night-500 hover:text-night-300 transition-colors">
            <HiOutlineEllipsisHorizontal className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Tytuł i treść */}
      <Link href={`/forum/post/${post.id}`} className="block group">
        <h2 className="text-lg font-semibold text-night-100 group-hover:text-cosmos-300 transition-colors mb-2">
          {post.isPinned && <span className="text-amber-400 mr-1.5">📌</span>}
          {post.title}
        </h2>
        <p className="text-sm text-night-400 line-clamp-3 leading-relaxed">
          {post.content}
        </p>
      </Link>

      {/* Obrazki (miniatura) */}
      {post.images.length > 0 && (
        <div className="mt-3 rounded-lg overflow-hidden bg-night-800 h-48 flex items-center justify-center text-night-600">
          <span className="text-4xl">🖼️</span>
        </div>
      )}

      {/* Tagi */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {post.tags.map((tag) => (
            <Link
              key={tag}
              href={`/forum?tag=${encodeURIComponent(tag)}`}
              className="text-xs text-cosmos-400 hover:text-cosmos-300 transition-colors"
            >
              {tag}
            </Link>
          ))}
        </div>
      )}

      {/* Akcje */}
      <div className="flex items-center gap-5 mt-4 pt-3 border-t border-night-800">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-sm transition-all duration-200 ${
            isLiked ? "text-red-400 scale-110" : "text-night-400 hover:text-red-400"
          }`}
        >
          {isLiked ? (
            <HiHeart className="h-5 w-5 text-red-400 animate-[pulse_0.3s_ease-in-out]" />
          ) : (
            <HiOutlineHeart className="h-5 w-5" />
          )}
          <span>{formatNumber(likes)}</span>
        </button>

        <Link
          href={`/forum/post/${post.id}`}
          className="flex items-center gap-1.5 text-sm text-night-400 hover:text-cosmos-300 transition-colors"
        >
          <HiOutlineChatBubbleLeft className="h-5 w-5" />
          <span>{formatNumber(post.comments)}</span>
        </Link>

        <button
          onClick={handleSave}
          className={`flex items-center gap-1.5 text-sm transition-all duration-200 ml-auto ${
            isSaved ? "text-amber-400" : "text-night-400 hover:text-amber-400"
          }`}
        >
          {isSaved ? (
            <HiBookmark className="h-5 w-5 text-amber-400" />
          ) : (
            <HiOutlineBookmark className="h-5 w-5" />
          )}
          <span>{formatNumber(saves)}</span>
        </button>
      </div>
    </article>
  );
}
