import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;
function ensureRegistered() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
}

// Initialize Lenis-driven smooth scroll and keep GSAP ScrollTrigger in sync.
// - Desktop: wheel and keyboard get eased interpolation (~1.1s decay).
// - Touch: native scroll is passed through (`smoothTouch: false`) so iOS/Android
//   momentum feel is preserved.
// - Reduced-motion users get native scroll only.
export function initSmoothScroll() {
  if (typeof window === "undefined") return () => {};
  ensureRegistered();

  const prefersReducedMotion =
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return () => {};

  // Ease curve: fast start, long tail — the "premium" scroll signature.
  const lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.5,
    lerp: 0.1,
    autoResize: true,
  });

  // Drive Lenis from gsap's ticker — a single RAF loop, no drift with ScrollTrigger.
  const tick = (time) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  // Ping ScrollTrigger on every scroll event so pinned/scrubbed triggers stay accurate.
  lenis.on("scroll", ScrollTrigger.update);

  // Intercept in-page anchor clicks so nav links glide smoothly under Lenis.
  const onAnchorClick = (e) => {
    const a = e.target.closest?.('a[href^="#"]');
    if (!a) return;
    const href = a.getAttribute("href");
    if (!href || href === "#") return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    // -53 offsets the sticky header so the section top isn't tucked underneath.
    lenis.scrollTo(target, { offset: -53, duration: 1.2 });
  };
  document.addEventListener("click", onAnchorClick);

  return () => {
    document.removeEventListener("click", onAnchorClick);
    gsap.ticker.remove(tick);
    lenis.destroy();
  };
}
