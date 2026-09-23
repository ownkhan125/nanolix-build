import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;
function ensureRegistered() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
}

function splitHeadingIntoWords(root) {
  const wrap = (node) => {
    const children = Array.from(node.childNodes);
    for (const child of children) {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent;
        if (!text || !text.trim()) continue;
        const parts = text.split(/(\s+)/);
        const frag = document.createDocumentFragment();
        for (const part of parts) {
          if (!part) continue;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(part));
          } else {
            const mask = document.createElement("span");
            mask.className = "mr-mask";
            mask.setAttribute("aria-hidden", "false");
            const inner = document.createElement("span");
            inner.className = "mr-inner";
            inner.textContent = part;
            mask.appendChild(inner);
            frag.appendChild(mask);
          }
        }
        child.parentNode.replaceChild(frag, child);
      } else if (
        child.nodeType === Node.ELEMENT_NODE &&
        child.tagName !== "BR" &&
        !child.classList?.contains("mr-mask")
      ) {
        wrap(child);
      }
    }
  };
  wrap(root);
}

function injectBorder(section) {
  if (section.dataset.srBorderInjected === "true") {
    return section.querySelector(".sr-border");
  }
  const border = document.createElement("span");
  border.className = "sr-border";
  border.setAttribute("aria-hidden", "true");
  section.insertBefore(border, section.firstChild);
  section.dataset.srBorderInjected = "true";
  return border;
}

// Selectors for grid containers whose *children* should stagger individually
// rather than the whole grid animating as one block. Keeps card/tile reveals
// feeling considered instead of "everything fades at once".
const STAGGER_GRID_SELECTOR = [
  ".care-grid",
  ".money-grid",
  ".proof-grid",
  ".fit-grid",
  ".scope-grid",
  ".how-grid",
  ".faq-grid",
  ".trust-grid",
  ".footer-grid",
  ".apply-grid",
  ".aud-right",
].join(", ");

function collectContentChildren(section, heading) {
  const container = section.querySelector(".content") || section;
  const topLevel = Array.from(container.children).filter(
    (el) =>
      el !== heading &&
      !el.classList.contains("sr-border") &&
      !el.hasAttribute("aria-hidden")
  );
  // Flatten grid containers: instead of animating the whole grid as one node,
  // animate each direct grid item so cards ripple in with a tight stagger.
  const flat = [];
  for (const el of topLevel) {
    // A top-level child may itself be a grid, OR contain a grid (e.g. a wrapper div).
    let gridHost = el.matches?.(STAGGER_GRID_SELECTOR) ? el : el.querySelector?.(STAGGER_GRID_SELECTOR);
    if (gridHost && gridHost.children.length > 1) {
      // If the grid is nested inside a wrapper, we still want the wrapper's
      // preceding siblings visible — so we push the wrapper too, but pass the
      // grid children through as the animatable set.
      if (gridHost !== el) flat.push(el);
      for (const gc of gridHost.children) flat.push(gc);
    } else {
      flat.push(el);
    }
  }
  return flat;
}

export function initHeadingReveal(root = document) {
  if (typeof window === "undefined") return () => {};
  ensureRegistered();

  const prefersReducedMotion =
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const sections = Array.from(root.querySelectorAll("main > section"));
  const triggers = [];

  for (const section of sections) {
    if (section.dataset.revealApplied === "true") continue;

    // Wrap heading words (if any)
    const heading = section.querySelector("[data-reveal-heading]");
    if (heading && heading.dataset.revealApplied !== "true") {
      splitHeadingIntoWords(heading);
      heading.dataset.revealApplied = "true";
    }
    const words = heading ? heading.querySelectorAll(".mr-inner") : [];

    // The hero (#top) is above the fold — we only do a word reveal for its
    // heading, no border draw or children stagger, to avoid a flash on load.
    const isHero = section.id === "top";

    if (isHero) {
      section.dataset.revealApplied = "true";
      if (words.length === 0) continue;
      if (prefersReducedMotion) {
        gsap.set(words, { yPercent: 0 });
        continue;
      }
      const tl = gsap.timeline({ paused: true });
      tl.fromTo(
        words,
        { yPercent: 118 },
        {
          yPercent: 0,
          duration: 1.05,
          ease: "expo.out",
          stagger: 0.02,
        }
      );
      const st = ScrollTrigger.create({
        trigger: heading,
        start: "top 88%",
        end: "bottom 20%",
        onEnter: () => tl.play(),
        onEnterBack: () => tl.play(),
        onLeaveBack: () => tl.reverse(),
      });
      triggers.push({ tl, st });
      continue;
    }

    // Non-hero sections: full choreography — border draws first, then heading
    // words reveal, then non-heading children fade+slide up.
    const border = injectBorder(section);
    const children = collectContentChildren(section, heading);

    if (prefersReducedMotion) {
      section.dataset.revealApplied = "true";
      gsap.set(border, { scaleX: 1, opacity: 1 });
      if (words.length) gsap.set(words, { yPercent: 0 });
      if (children.length) gsap.set(children, { opacity: 1, y: 0 });
      continue;
    }

    const tl = gsap.timeline({ paused: true });

    // 1) Border draws — quick, confident line, sets the entrance tone (0.00 → 0.65)
    tl.fromTo(
      border,
      { scaleX: 0, opacity: 0 },
      { scaleX: 1, opacity: 1, duration: 0.65, ease: "power3.out" },
      0
    );

    // 2) Heading words rise from behind their masks — long tail expo.out reads
    //    as intentional and premium, tiny stagger keeps them cohesive (0.18 → 1.3)
    if (words.length > 0) {
      tl.fromTo(
        words,
        { yPercent: 118 },
        {
          yPercent: 0,
          duration: 1.1,
          ease: "expo.out",
          stagger: 0.025,
        },
        0.18
      );
    }

    // 3) Content children — cards/grids stagger individually where possible.
    //    Slightly lifted (y:22) with a soft power3 curve. Tight stagger keeps
    //    the wave short so the whole section settles quickly.
    if (children.length > 0) {
      tl.fromTo(
        children,
        { opacity: 0, y: 22 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          ease: "power3.out",
          stagger: { each: 0.07, from: "start" },
        },
        0.45
      );
    }

    const st = ScrollTrigger.create({
      trigger: section,
      start: "top 82%",
      end: "bottom 20%",
      onEnter: () => tl.play(),
      onEnterBack: () => tl.play(),
      onLeaveBack: () => tl.reverse(),
      invalidateOnRefresh: true,
    });

    section.dataset.revealApplied = "true";
    triggers.push({ tl, st });
  }

  // Refresh once so ScrollTrigger picks up final layout heights.
  ScrollTrigger.refresh();

  // Sections already inside the viewport at load need to play now — ScrollTrigger
  // won't fire onEnter for triggers that were already past their start.
  for (const { tl, st } of triggers) {
    if (st && st.isActive) tl.play(0);
  }

  return () => {
    for (const { tl, st } of triggers) {
      if (st) st.kill();
      if (tl) tl.kill();
    }
  };
}
