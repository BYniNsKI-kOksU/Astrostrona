import clsx from "clsx";
import { InputHTMLAttributes } from "react";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";

interface SearchBarProps extends InputHTMLAttributes<HTMLInputElement> {
  wrapperClassName?: string;
}

export default function SearchBar({ wrapperClassName, className, ...props }: SearchBarProps) {
  return (
    <div className={clsx("relative", wrapperClassName)}>
      <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-night-500" />
      <input
        type="text"
        className={clsx(
          "input-field pl-10",
          className
        )}
        {...props}
      />
    </div>
  );
}
