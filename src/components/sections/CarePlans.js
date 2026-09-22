import Eyebrow from "@/components/primitives/Eyebrow";
import Button from "@/components/primitives/Button";
import { Check } from "@/components/primitives/Icons";
import { carePlans } from "@/data/content";

export default function CarePlans() {
  return (
    <section
      id="pricing"
      className="section-dark"
      style={{ paddingTop: 140, paddingBottom: 90 }}
    >
      <div
        className="content"
        style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        <Eyebrow align="center">Pricing</Eyebrow>
        <h2
          data-reveal-heading
          className="text-metallic"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontSize: 45,
            lineHeight: 1.11,
            margin: "20px 0 56px 0",
            letterSpacing: "-0.01em",
            textAlign: "center",
          }}
        >
          Care plans
        </h2>

        <div className="care-grid" style={{ width: "100%" }}>
          {carePlans.map((p) => (
            <div
              key={p.name}
              className={p.featured ? "care-card care-card--featured" : "care-card"}
              style={{
                position: "relative",
                background: "#0d0d0d",
                border: p.featured ? "2px solid #3fae7e" : "1px solid rgba(255,255,255,0.1)",
                borderRadius: 16,
                padding: p.featured ? 36 : 26,
              }}
            >
              {p.tag && (
                <span
                  style={{
                    position: "absolute",
                    top: -13,
                    left: 20,
                    background: "#3fae7e",
                    color: "#04150e",
                    padding: "4px 12px",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 600,
                    lineHeight: 1.4,
                  }}
                >
                  {p.tag}
                </span>
              )}
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
                {p.name}
              </h3>
              <p
                style={{
                  color: "#dcdcdc",
                  fontSize: 14,
                  margin: "14px 0 0 0",
                }}
              >
                {p.subtitle}
              </p>
              <div
                style={{
                  color: "#fff",
                  fontFamily: "var(--font-display)",
                  fontWeight: 500,
                  fontSize: 30,
                  margin: "14px 0 0 0",
                  lineHeight: 1.1,
                }}
              >
                {p.price}
              </div>
              {p.priceNote && (
                <div style={{ color: "#dcdcdc", fontSize: 14, marginTop: 4 }}>
                  {p.priceNote}
                </div>
              )}
              <hr
                style={{
                  border: 0,
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                  margin: "20px 0",
                }}
              />
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                {p.items.map((t) => (
                  <li
                    key={t}
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "flex-start",
                      padding: "6px 0",
                    }}
                  >
                    <span style={{ paddingTop: 3 }}>
                      <Check size={16} stroke={1.7} />
                    </span>
                    <span style={{ color: "#dcdcdc", fontSize: 15 }}>{t}</span>
                  </li>
                ))}
              </ul>
              {p.featured && (
                <div style={{ marginTop: 40 }}>
                  <Button href="#apply" style={{ width: "100%" }}>
                    Apply in 2 minutes
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
