import Eyebrow from "@/components/primitives/Eyebrow";
import { fitFor, notFor } from "@/data/content";

export default function FitNotFit() {
  return (
    <section style={{ paddingTop: 50, paddingBottom: 50 }}>
      <div className="content">
        <Eyebrow>Fit</Eyebrow>
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
            maxWidth: 860,
          }}
        >
          This works best when the project needs
          <br />
          clarity, not chaos.
        </h2>

        <div
          className="fit-grid"
          style={{
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          <div className="fit-col" style={{ padding: "36px 36px 60px 36px" }}>
            <h3
              style={{
                color: "#fff",
                fontSize: 20,
                fontWeight: 400,
                margin: 0,
              }}
            >
              This is for you if
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: "20px 0 0 0" }}>
              {fitFor.map((t) => (
                <li
                  key={t}
                  style={{
                    display: "flex",
                    gap: 12,
                    padding: "9px 0",
                  }}
                >
                  <span style={{ color: "#3fae7e", fontSize: 16, flexShrink: 0 }}>
                    ✦
                  </span>
                  <span style={{ color: "#dcdcdc", fontSize: 16, lineHeight: 1.5 }}>
                    {t}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div
            className="fit-col fit-col--right"
            style={{
              padding: "36px 36px 36px 36px",
              borderLeft: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <h3
              style={{
                color: "#fff",
                fontSize: 20,
                fontWeight: 400,
                margin: 0,
              }}
            >
              This is not for you if:
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: "20px 0 0 0" }}>
              {notFor.map((t) => (
                <li
                  key={t}
                  style={{
                    display: "flex",
                    gap: 12,
                    padding: "9px 0",
                  }}
                >
                  <span style={{ color: "#7a7a7a", fontSize: 16, flexShrink: 0 }}>
                    ●
                  </span>
                  <span style={{ color: "#dcdcdc", fontSize: 16, lineHeight: 1.5 }}>
                    {t}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
