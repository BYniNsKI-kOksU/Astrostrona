import clsx from "clsx";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "cosmos" | "nebula" | "success" | "warning" | "danger";
  size?: "sm" | "md";
}

export default function Badge({ children, variant = "default", size = "sm" }: BadgeProps) {
  const variants = {
    default: "bg-night-700 text-night-300 border-night-600",
    cosmos: "bg-cosmos-500/20 text-cosmos-300 border-cosmos-500/30",
    nebula: "bg-nebula-500/20 text-nebula-300 border-nebula-500/30",
    success: "bg-green-500/20 text-green-300 border-green-500/30",
    warning: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    danger: "bg-red-500/20 text-red-300 border-red-500/30",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border font-medium",
        variants[variant],
        sizes[size]
      )}
    >
      {children}
    </span>
  );
}
