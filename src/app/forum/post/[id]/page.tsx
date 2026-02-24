"use client";

import { useState } from "react";
import Link from "next/link";
import { mockPosts } from "@/data";
import {
  HiOutlineArrowLeft,
  HiOutlineHeart,
  HiHeart,
  HiOutlineChatBubbleLeft,
  HiOutlineBookmark,
  HiBookmark,
  HiOutlineShare,
  HiOutlineHandThumbUp,
  HiHandThumbUp,
} from "react-icons/hi2";
import { formatRelativeDate, getCategoryLabel, getCategoryColor } from "@/lib/utils";
import { Comment } from "@/types";

// Mock komentarze
const mockComments: Comment[] = [
  {
    id: "c1",
    postId: "p1",
    authorId: "u2",
    authorName: "Anna Kosmiczna",
    authorAvatar: "/avatars/default.png",
    content: "Wow, fenomenalna robota! 12 godzin cierpliwości się opłaciło. Jakie warunki seeingu miałeś w te noce? I jak radzisz sobie z gradient removal w PixInsight?",
    createdAt: "2025-12-15T22:00:00Z",
    likes: 12,
    isLiked: false,
    replies: [
      {
        id: "c1r1",
        postId: "p1",
        authorId: "u1",
        authorName: "Marek Gwiazdowski",
        authorAvatar: "/avatars/default.png",
        content: "Dzięki! Seeing wahał się 2-3\" w najlepsze noce. Do gradientu używam ABE (Automatic Background Extractor) w PixInsight — działa rewelacyjnie na szerokie pole.",
        createdAt: "2025-12-15T22:30:00Z",
        likes: 5,
        isLiked: false,
        replies: [],
      },
    ],
  },
  {
    id: "c2",
    postId: "p1",
    authorId: "u3",
    authorName: "Michał Niebo",
    authorAvatar: "/avatars/default.png",
    content: "Zazdroszczę Bieszczad — Bortle 3 to marzenie. U mnie w Warszawie ciężko o cokolwiek poniżej 7. Świetne detale w obłokach pyłu!",
    createdAt: "2025-12-16T10:15:00Z",
    likes: 8,
    isLiked: false,
    replies: [],
  },
  {
    id: "c3",
    postId: "p2",
    authorId: "u1",
    authorName: "Marek Gwiazdowski",
    authorAvatar: "/avatars/default.png",
    content: "Na start polecam Newton 150/750 na EQ5 — to klasyk! Dobry stosunek jakości do ceny. Warto też rozważyć używany sprzęt.",
    createdAt: "2025-12-14T16:00:00Z",
    likes: 18,
    isLiked: false,
    replies: [],
  },
  {
    id: "c4",
    postId: "p2",
    authorId: "u3",
    authorName: "Michał Niebo",
    authorAvatar: "/avatars/default.png",
    content: "Za 3000 zł możesz też zerknąć na Skywatcher 130PDS + montaż HEQ5. Montaż to najważniejsza inwestycja — pamiętaj o tym!",
    createdAt: "2025-12-14T17:30:00Z",
    likes: 14,
    isLiked: false,
    replies: [],
  },
  {
    id: "c5",
    postId: "p3",
    authorId: "u2",
    authorName: "Anna Kosmiczna",
    authorAvatar: "/avatars/default.png",
    content: "Świetny poradnik! Wreszcie ktoś to przejrzyście wytłumaczył. Jaki procent stackowania ustawiasz? Sigma clip czy Kappa-Sigma?",
    createdAt: "2025-12-13T12:00:00Z",
    likes: 7,
    isLiked: false,
    replies: [],
  },
  {
    id: "c6",
    postId: "p4",
    authorId: "u2",
    authorName: "Anna Kosmiczna",
    authorAvatar: "/avatars/default.png",
    content: "Super wiadomość! Ostatnia kometa widoczna gołym okiem była Neowise w 2020. Mam nadzieję, że ta będzie jeszcze jaśniejsza!",
    createdAt: "2025-12-12T19:00:00Z",
    likes: 22,
    isLiked: false,
    replies: [],
  },
  {
    id: "c7",
    postId: "p5",
    authorId: "u1",
    authorName: "Marek Gwiazdowski",
    authorAvatar: "/avatars/default.png",
    content: "Sromowce Niżne to jedno z moich ulubionych miejsc! 80 meteorów w 3 godziny — to świetny wynik. Widziałaś też bolid o -4 mag? Niesamowite!",
    createdAt: "2025-12-14T08:00:00Z",
    likes: 9,
    isLiked: false,
    replies: [],
  },
];

function CommentItem({ comment }: { comment: Comment }) {
  const [isLiked, setIsLiked] = useState(comment.isLiked);
  const [likes, setLikes] = useState(comment.likes);

  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-cosmos-500/30 flex items-center justify-center text-cosmos-300 font-bold text-xs shrink-0">
        {comment.authorName.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="glass-card p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-night-200">{comment.authorName}</span>
            <span className="text-xs text-night-500">{formatRelativeDate(comment.createdAt)}</span>
          </div>
          <p className="text-sm text-night-300 leading-relaxed">{comment.content}</p>
        </div>
        <div className="flex items-center gap-3 mt-1.5 ml-1">
          <button
            onClick={() => {
              setIsLiked(!isLiked);
              setLikes(isLiked ? likes - 1 : likes + 1);
            }}
            className={`flex items-center gap-1 text-xs transition-colors ${
              isLiked ? "text-cosmos-400" : "text-night-500 hover:text-cosmos-400"
            }`}
          >
            {isLiked ? <HiHandThumbUp className="h-3.5 w-3.5" /> : <HiOutlineHandThumbUp className="h-3.5 w-3.5" />}
            <span>{likes}</span>
          </button>
          <button className="text-xs text-night-500 hover:text-night-300 transition-colors">
            Odpowiedz
          </button>
        </div>
        {comment.replies.length > 0 && (
          <div className="mt-3 space-y-3 pl-2 border-l-2 border-night-700">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PostDetailPage({ params }: { params: { id: string } }) {
  const post = mockPosts.find((p) => p.id === params.id);
  const [isLiked, setIsLiked] = useState(post?.isLiked ?? false);
  const [isSaved, setIsSaved] = useState(post?.isSaved ?? false);
  const [likes, setLikes] = useState(post?.likes ?? 0);
  const [commentText, setCommentText] = useState("");
  const [showCopied, setShowCopied] = useState(false);

  const postComments = mockComments.filter((c) => c.postId === params.id);
  const totalComments = postComments.length + postComments.reduce((sum, c) => sum + c.replies.length, 0);

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <span className="text-5xl mb-4 block">🌑</span>
        <h1 className="text-2xl font-bold text-night-100 mb-2">Post nie znaleziony</h1>
        <p className="text-night-400 mb-6">Ten post nie istnieje lub został usunięty.</p>
        <Link href="/forum" className="btn-primary">Wróć do forum</Link>
      </div>
    );
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  const handleComment = () => {
    if (commentText.trim()) {
      alert(`Komentarz dodany: "${commentText}" (demo)`);
      setCommentText("");
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
      <Link
        href="/forum"
        className="inline-flex items-center gap-2 text-sm text-night-400 hover:text-night-200 transition-colors mb-6"
      >
        <HiOutlineArrowLeft className="h-4 w-4" />
        Wróć do forum
      </Link>

      <article className="glass-card p-6 md:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-cosmos-500/30 flex items-center justify-center text-cosmos-300 font-bold text-lg">
            {post.authorName.charAt(0)}
          </div>
          <div>
            <div className="font-medium text-night-200">{post.authorName}</div>
            <div className="text-sm text-night-500">{formatRelativeDate(post.createdAt)}</div>
          </div>
          <span className={`tag text-xs border ml-auto ${getCategoryColor(post.category)}`}>
            {getCategoryLabel(post.category)}
          </span>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-night-100 mb-4">{post.title}</h1>

        <div className="prose prose-invert max-w-none text-night-300 leading-relaxed mb-6">
          <p>{post.content}</p>
        </div>

        {post.images.length > 0 && (
          <div className="rounded-xl overflow-hidden bg-night-800 h-64 md:h-96 flex items-center justify-center text-night-600 mb-6">
            <span className="text-6xl">🖼️</span>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-6">
          {post.tags.map((tag) => (
            <Link
              key={tag}
              href={`/forum?tag=${encodeURIComponent(tag)}`}
              className="tag bg-cosmos-500/10 text-cosmos-400 border-cosmos-500/20 hover:bg-cosmos-500/20 transition-colors"
            >
              {tag}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-night-700">
          <button
            onClick={() => { setIsLiked(!isLiked); setLikes(isLiked ? likes - 1 : likes + 1); }}
            className={`flex items-center gap-2 transition-all duration-200 ${isLiked ? "text-red-400 scale-105" : "text-night-400 hover:text-red-400"}`}
          >
            {isLiked ? <HiHeart className="h-5 w-5" /> : <HiOutlineHeart className="h-5 w-5" />}
            <span className="text-sm">{likes}</span>
          </button>

          <span className="flex items-center gap-2 text-night-400">
            <HiOutlineChatBubbleLeft className="h-5 w-5" />
            <span className="text-sm">{totalComments}</span>
          </span>

          <button
            onClick={() => setIsSaved(!isSaved)}
            className={`flex items-center gap-2 transition-all duration-200 ${isSaved ? "text-amber-400" : "text-night-400 hover:text-amber-400"}`}
          >
            {isSaved ? <HiBookmark className="h-5 w-5" /> : <HiOutlineBookmark className="h-5 w-5" />}
            <span className="text-sm">{isSaved ? "Zapisano" : "Zapisz"}</span>
          </button>

          <div className="relative ml-auto">
            <button onClick={handleShare} className="flex items-center gap-2 text-night-400 hover:text-night-200 transition-colors">
              <HiOutlineShare className="h-5 w-5" />
              <span className="text-sm">Udostępnij</span>
            </button>
            {showCopied && (
              <span className="absolute -top-8 right-0 text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded whitespace-nowrap">
                Link skopiowany!
              </span>
            )}
          </div>
        </div>
      </article>

      <section className="mt-8">
        <h2 className="text-xl font-bold text-night-100 mb-4">Komentarze ({totalComments})</h2>

        <div className="glass-card p-4 mb-6">
          <textarea
            placeholder="Napisz komentarz..."
            className="input-field min-h-[100px] resize-y mb-3"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <div className="flex justify-between items-center">
            <p className="text-xs text-night-500">Wspieraj: **pogrubienie**, *kursywa*</p>
            <button
              onClick={handleComment}
              disabled={!commentText.trim()}
              className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Dodaj komentarz
            </button>
          </div>
        </div>

        {postComments.length > 0 ? (
          <div className="space-y-5">
            {postComments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        ) : (
          <div className="glass-card p-8 text-center text-night-500">
            <p className="text-2xl mb-2">💬</p>
            <p>Brak komentarzy.</p>
            <p className="text-sm mt-1">Bądź pierwszą osobą, która skomentuje!</p>
          </div>
        )}
      </section>
    </div>
  );
}
