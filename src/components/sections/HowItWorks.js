import { useEffect, useRef } from "react";
import Eyebrow from "@/components/primitives/Eyebrow";
import { howItWorks } from "@/data/content";

export default function HowItWorks() {
  const rows = useRef([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("how-item--in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.2 }
    );
    rows.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section
      className="section-dark"
      style={{ paddingTop: 140, paddingBottom: 90 }}
    >
      <div className="content how-grid">
        <div style={{ position: "sticky", top: 90, alignSelf: "start" }}>
          <Eyebrow>The process</Eyebrow>
          <h2
          data-reveal-heading
            className="text-metallic"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontSize: 45,
              lineHeight: 1.11,
              margin: "20px 0 0 0",
              letterSpacing: "-0.01em",
            }}
          >
            How it works
          </h2>
        </div>

        <div style={{ position: "relative" }}>
          <span
            aria-hidden
            style={{
              position: "absolute",
              left: 19,
              top: 20,
              bottom: 20,
              width: 1,
              background: "linear-gradient(180deg,#ff621f 0%,#3fae7e 100%)",
            }}
          />
          {howItWorks.map((step, i) => (
            <div
              key={i}
              ref={(el) => (rows.current[i] = el)}
              className={`how-item${step.highlight ? " how-item--highlight" : ""}`}
              style={{
                position: "relative",
                paddingLeft: 70,
                paddingTop: 27,
                paddingBottom: 27,
                borderTop: "1px solid rgba(255,255,255,0.06)",
                borderBottom:
                  i === howItWorks.length - 1
                    ? "1px solid rgba(255,255,255,0.06)"
                    : "0",
              }}
            >
              <div
                className="how-num"
                style={{
                  position: "absolute",
                  left: 0,
                  top: 24,
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-display)",
                  fontWeight: 500,
                  fontSize: 16,
                }}
              >
                {i + 1}
              </div>
              <h3
                style={{
                  color: "#fff",
                  fontSize: 18,
                  fontWeight: 400,
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  color: "#dcdcdc",
                  fontSize: 14,
                  lineHeight: 1.5,
                  margin: "9px 0 0 0",
                  maxWidth: 840,
                }}
              >
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
