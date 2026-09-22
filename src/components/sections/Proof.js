import Eyebrow from "@/components/primitives/Eyebrow";
import { proof } from "@/data/content";

export default function Proof() {
  return (
    <section
      className="section-dark"
      style={{ paddingTop: 140, paddingBottom: 90 }}
    >
      <div
        className="content"
        style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        <Eyebrow align="center">Proof</Eyebrow>
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
            textAlign: "center",
          }}
        >
          Delivered work you can check.
        </h2>

        <div className="proof-grid" style={{ width: "100%" }}>
          {proof.map((p) => (
            <article
              key={p.n}
              className={
                p.large
                  ? "proof-card proof-card--large"
                  : p.wide
                    ? "proof-card proof-card--wide"
                    : "proof-card"
              }
              style={{
                position: "relative",
                background: "#191919",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 20,
                padding: p.large ? 26 : "60px 26px 26px 26px",
                minHeight: 195,
                display: "flex",
                flexDirection: "column",
                justifyContent: p.large ? "flex-end" : "flex-start",
                overflow: "hidden",
              }}
            >
              {p.large && (
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "radial-gradient(ellipse at 30% 30%, rgba(255,98,31,0.14) 0%, rgba(255,98,31,0) 65%)",
                    pointerEvents: "none",
                  }}
                />
              )}
              <span
                style={{
                  position: "absolute",
                  top: 26,
                  left: 26,
                  background: "#fff",
                  color: "#000",
                  padding: "3px 12px",
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 400,
                }}
              >
                {p.n}
              </span>
              <div style={{ position: "relative", zIndex: 1 }}>
                <h3
                  className="text-metallic"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 500,
                    fontSize: 30,
                    lineHeight: 1.1,
                    margin: 0,
                  }}
                >
                  {p.title}
                </h3>
                <p
                  style={{
                    color: "#dcdcdc",
                    fontSize: 14,
                    lineHeight: 1.5,
                    margin: "12px 0 0 0",
                  }}
                >
                  {p.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
