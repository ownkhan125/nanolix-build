import { cn } from "@/lib/cn";

export default function Eyebrow({ children, align = "left", className }) {
  return (
    <span
      className={cn(
        "eyebrow",
        align === "center" && "justify-center",
        className,
      )}
    >
      {children}
    </span>
  );
}
