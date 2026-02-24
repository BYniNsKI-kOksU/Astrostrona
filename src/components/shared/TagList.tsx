import Link from "next/link";
import clsx from "clsx";

interface TagListProps {
  tags: string[];
  size?: "sm" | "md";
  linked?: boolean;
}

export default function TagList({ tags, size = "sm", linked = true }: TagListProps) {
  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) =>
        linked ? (
          <Link
            key={tag}
            href={`/forum?tag=${encodeURIComponent(tag)}`}
            className={clsx(
              "text-cosmos-400 hover:text-cosmos-300 transition-colors",
              sizeClasses[size]
            )}
          >
            {tag}
          </Link>
        ) : (
          <span
            key={tag}
            className={clsx("text-cosmos-400", sizeClasses[size])}
          >
            {tag}
          </span>
        )
      )}
    </div>
  );
}
