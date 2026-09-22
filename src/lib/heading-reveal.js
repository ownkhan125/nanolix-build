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

function collectContentChildren(section, heading) {
  const container = section.querySelector(".content") || section;
  return Array.from(container.children).filter(
    (el) =>
      el !== heading &&
      !el.classList.contains("sr-border") &&
      !el.hasAttribute("aria-hidden")
  );
}

export function initHeadingReveal(root = document) {
  if (typeof window === "undefined") return () => {};
  ensureRegistered();

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
      const tl = gsap.timeline({ paused: true });
      tl.fromTo(
        words,
        { yPercent: 115 },
        {
          yPercent: 0,
          duration: 0.95,
          ease: "power3.out",
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

    const tl = gsap.timeline({
      paused: true,
      defaults: { ease: "power3.out" },
    });

    // 1) Border draws (0.00 → 0.55) — subtle horizontal accent above the eyebrow
    tl.fromTo(
      border,
      { scaleX: 0, opacity: 0 },
      { scaleX: 1, opacity: 1, duration: 0.55, ease: "power2.inOut" },
      0
    );

    // 2) Heading words reveal — all together as one cohesive heading (0.25 → 1.15)
    if (words.length > 0) {
      tl.fromTo(
        words,
        { yPercent: 115 },
        {
          yPercent: 0,
          duration: 0.9,
        },
        0.25
      );
    }

    // 3) Remaining content children fade + slide up (0.5 → ~1.3, staggered)
    if (children.length > 0) {
      tl.fromTo(
        children,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: { each: 0.09, from: "start" },
        },
        0.5
      );
    }

    const st = ScrollTrigger.create({
      trigger: section,
      start: "top 82%",
      end: "bottom 20%",
      onEnter: () => tl.play(),
      onEnterBack: () => tl.play(),
      onLeave: () => {},
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
