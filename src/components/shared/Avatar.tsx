interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  imageUrl?: string;
}

export default function Avatar({ name, size = "md", imageUrl }: AvatarProps) {
  const sizes = {
    sm: "w-6 h-6 text-[10px]",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-lg",
  };

  if (imageUrl) {
    return (
      <div
        className={`${sizes[size]} rounded-full bg-night-700 overflow-hidden`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className={`${sizes[size]} rounded-full bg-cosmos-500/30 flex items-center justify-center text-cosmos-300 font-bold`}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
