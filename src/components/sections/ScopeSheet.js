import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Eyebrow from "@/components/primitives/Eyebrow";
import { Check, Dash } from "@/components/primitives/Icons";
import { includedItems, upgradeItems } from "@/data/content";

export default function ScopeSheet() {
  const sectionRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined" || !sectionRef.current) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const includedH3 = sectionRef.current.querySelector(
        ".scope-col-included > h3"
      );
      const upgradeH3 = sectionRef.current.querySelector(
        ".scope-col-upgrades > h3"
      );
      const includedLis = sectionRef.current.querySelectorAll(
        ".scope-col-included li"
      );
      const upgradeLis = sectionRef.current.querySelectorAll(
        ".scope-col-upgrades li"
      );
      const footer = sectionRef.current.querySelector("[data-scope-footer]");

      const heads = [includedH3, upgradeH3].filter(Boolean);
      const allInternal = [
        ...heads,
        ...Array.from(includedLis),
        ...Array.from(upgradeLis),
        ...(footer ? [footer] : []),
      ];
      if (allInternal.length === 0) return;

      // Hide immediately so we don't get a flash before the timeline fires.
      // We rely on gsap.context() for auto-revert on cleanup.
      gsap.set(allInternal, { opacity: 0, y: 16, force3D: true });

      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: "power3.out" },
      });

      tl.to(heads, { opacity: 1, y: 0, duration: 0.7, stagger: 0.09 }, 0)
        .to(
          includedLis,
          { opacity: 1, y: 0, duration: 0.55, stagger: 0.045 },
          0.22
        )
        .to(
          upgradeLis,
          { opacity: 1, y: 0, duration: 0.55, stagger: 0.045 },
          0.3
        );
      if (footer) {
        tl.to(footer, { opacity: 1, y: 0, duration: 0.55 }, "-=0.15");
      }

      const st = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 76%",
        end: "bottom 20%",
        onEnter: () => tl.play(),
        onEnterBack: () => tl.play(),
        onLeaveBack: () => tl.reverse(),
        invalidateOnRefresh: true,
      });

      // If we mounted with the section already in view (edge case), kick it off.
      if (st.isActive) tl.play(0);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="scope"
      style={{ paddingTop: 50, paddingBottom: 50 }}
    >
      <div className="content">
        <Eyebrow>Scope</Eyebrow>
        <h2
          data-reveal-heading
          className="text-metallic"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontSize: 45,
            lineHeight: 1.11,
            margin: "20px 0 50px 0",
            letterSpacing: "-0.01em",
          }}
        >
          What&rsquo;s included. And what&rsquo;s not
        </h2>

        <div
          style={{
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          <div className="scope-grid">
            <div className="scope-col-included">
              <h3
                className="text-metallic"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 500,
                  fontSize: 30,
                  margin: 0,
                }}
              >
                Included in your build
              </h3>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: "20px 0 0 0",
                }}
              >
                {includedItems.map((t, i) => (
                  <li
                    key={t}
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "flex-start",
                      padding: "10px 0",
                      borderBottom:
                        i < includedItems.length - 1
                          ? "1px solid rgba(255,255,255,0.06)"
                          : "0",
                    }}
                  >
                    <span style={{ paddingTop: 3 }}>
                      <Check />
                    </span>
                    <span style={{ color: "#dcdcdc", fontSize: 16 }}>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="scope-col-upgrades">
              <h3
                className="text-metallic"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 500,
                  fontSize: 30,
                  margin: 0,
                  lineHeight: 1.1,
                }}
              >
                Not included, available as
                <br />
                upgrades
              </h3>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: "20px 0 0 0",
                }}
              >
                {upgradeItems.map((t, i) => (
                  <li
                    key={t}
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "flex-start",
                      padding: "10px 0",
                      borderBottom:
                        i < upgradeItems.length - 1
                          ? "1px solid rgba(255,255,255,0.06)"
                          : "0",
                    }}
                  >
                    <span style={{ paddingTop: 3 }}>
                      <Dash />
                    </span>
                    <span style={{ color: "#dcdcdc", fontSize: 16 }}>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div
            data-scope-footer
            style={{
              background: "#0a0a0a",
              padding: "20px 32px",
              fontSize: 14,
              lineHeight: 1.35,
              color: "#b3b3b3",
              textAlign: "left",
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <strong style={{ color: "#ffffff", fontWeight: 600 }}>
              Required:
            </strong>{" "}
            the care plan, $39 to $59 a month, six month minimum.{" "}
            <strong style={{ color: "#ffffff", fontWeight: 600 }}>
              Optional, always:
            </strong>{" "}
            everything in the second column.
          </div>
        </div>
      </div>
    </section>
  );
}
