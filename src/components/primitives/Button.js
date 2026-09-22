import { motion } from "motion/react";
import { cn } from "@/lib/cn";

const MotionA = motion.a;
const MotionButton = motion.button;

export default function Button({
  as: Tag = "a",
  variant = "primary",
  fx,
  className,
  children,
  style,
  ...rest
}) {
  const isPrimary = variant === "primary";
  const baseClass = isPrimary ? "btn-primary" : "btn-secondary";
  const effectiveFx = fx ?? (isPrimary ? "arrow-reveal" : "outline-fill");
  const merged = cn(baseClass, `btn-fx-${effectiveFx}`, className);

  if (effectiveFx === "arrow-reveal") return <ArrowReveal Tag={Tag} className={merged} style={style} {...rest}>{children}</ArrowReveal>;
  if (effectiveFx === "outline-fill") return <OutlineFill Tag={Tag} className={merged} style={style} {...rest}>{children}</OutlineFill>;

  const Comp = Tag === "button" ? "button" : "a";
  return <Comp className={merged} style={style} {...rest}>{children}</Comp>;
}

function pickMotion(Tag) {
  return Tag === "button" ? MotionButton : MotionA;
}

/* ARROW REVEAL — used by every primary button.
   Arrow sits absolute inside existing 40px right padding — text stays centered,
   no size/padding change on hover. */
function ArrowReveal({ Tag, className, style, children, ...rest }) {
  const Comp = pickMotion(Tag);
  return (
    <Comp
      className={className}
      style={style}
      initial="rest"
      animate="rest"
      whileHover="hov"
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
      {...rest}
    >
      <span className="btn-fx-inner">{children}</span>
      <motion.span
        aria-hidden
        className="btn-fx-arrow"
        variants={{ rest: { x: -6, opacity: 0 }, hov: { x: 0, opacity: 1 } }}
        transition={{ type: "spring", stiffness: 340, damping: 24 }}
      >
        →
      </motion.span>
    </Comp>
  );
}

/* OUTLINE FILL — used by every secondary button.
   Overlay scaleY from bottom inside overflow:hidden. Border-radius inherit. */
function OutlineFill({ Tag, className, style, children, ...rest }) {
  const Comp = pickMotion(Tag);
  return (
    <Comp
      className={className}
      style={style}
      initial="rest"
      animate="rest"
      whileHover="hov"
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      {...rest}
    >
      <motion.span
        aria-hidden
        className="btn-fx-outline-wipe"
        variants={{ rest: { scaleY: 0 }, hov: { scaleY: 1 } }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      />
      <span className="btn-fx-inner">{children}</span>
    </Comp>
  );
}
