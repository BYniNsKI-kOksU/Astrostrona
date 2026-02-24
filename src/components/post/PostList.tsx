import { ForumPost } from "@/types";
import PostCard from "./PostCard";

interface PostListProps {
  posts: ForumPost[];
}

export default function PostList({ posts }: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <span className="text-4xl mb-4 block">🌌</span>
        <h3 className="text-lg font-semibold text-night-300 mb-2">
          Brak postów
        </h3>
        <p className="text-sm text-night-500">
          Nie znaleziono postów dla wybranych kryteriów. Spróbuj zmienić filtry
          lub bądź pierwszą osobą, która doda post!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
