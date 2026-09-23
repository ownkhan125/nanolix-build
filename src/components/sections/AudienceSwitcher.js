import { useState } from "react";
import { motion } from "motion/react";
import Eyebrow from "@/components/primitives/Eyebrow";
import { Check } from "@/components/primitives/Icons";
import { audiences, audienceProfiles } from "@/data/content";

export default function AudienceSwitcher() {
  const [active, setActive] = useState(0);
  const profile = audienceProfiles[active] ?? audienceProfiles[0];

  return (
    <section id="audience" style={{ paddingTop: 30, paddingBottom: 80 }}>
      <div className="content">
        <div style={{ maxWidth: 820 }}>
          <Eyebrow>Same offer. Shaped around your business.</Eyebrow>
          <h2
          data-reveal-heading
            className="text-metallic"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontSize: 45,
              lineHeight: 1.11,
              margin: "20px 0 0 0",
              letterSpacing: 0,
            }}
          >
            Pick the closest fit. The page will follow.
          </h2>
          <p
            style={{
              color: "#dcdcdc",
              fontSize: 16,
              lineHeight: 1.275,
              letterSpacing: 0,
              marginTop: 20,
            }}
          >
            The website standard stays the same. What changes is what your
            website needs to say, which pages it needs, and
            <br className="hidden-mobile" />
            {" "}which delivered work is closest to yours.
          </p>
        </div>

        <div className="aud-grid" style={{ marginTop: 42 }}>
          <div>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {audiences.map((a, i) => (
                <li key={a.label} style={{ position: "relative" }}>
                  <motion.button
                    type="button"
                    onClick={() => setActive(i)}
                    whileHover={
                      i === active
                        ? { scale: 1.01 }
                        : { backgroundColor: "#242424", color: "#eeeeee", borderColor: "rgba(255,255,255,0.08)" }
                    }
                    whileTap={{ scale: 0.99 }}
                    transition={{ type: "spring", stiffness: 340, damping: 26 }}
                    style={{
                      position: "relative",
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "14px 16px",
                      borderRadius: 10,
                      border: "1px solid transparent",
                      background:
                        i === active
                          ? "linear-gradient(180deg,#ff500b 0%,#e64a00 100%)"
                          : "#191919",
                      color: i === active ? "#fff" : "#a6a6a6",
                      fontSize: 15,
                      lineHeight: 1.275,
                      cursor: "pointer",
                    }}
                  >
                    {a.label}
                  </motion.button>
                </li>
              ))}
            </ul>
          </div>

          <div className="aud-right">
            <div
              style={{
                borderRight: "1px solid rgba(255,255,255,0.08)",
                paddingRight: 30,
              }}
              className="aud-content"
            >
              <h3
                className="text-metallic"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 500,
                  fontSize: 35,
                  lineHeight: 1.15,
                  margin: "0",
                }}
              >
                {profile.heading}
              </h3>
              <p
                style={{
                  color: "#dcdcdc",
                  fontSize: 16,
                  lineHeight: 1.62,
                  marginTop: 18,
                  maxWidth: 549,
                }}
              >
                {profile.body}
              </p>
              <hr
                style={{
                  border: 0,
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                  margin: "24px 0 18px",
                  maxWidth: 549,
                }}
              />
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
                {profile.bullets.map((b) => (
                  <li
                    key={b}
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "flex-start",
                      color: "#dcdcdc",
                      fontSize: 16,
                    }}
                  >
                    <span style={{ paddingTop: 2 }}>
                      <Check />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ paddingLeft: 30 }} className="aud-side">
              <div
                style={{
                  borderRight: "1px solid rgba(255,255,255,0.08)",
                  paddingRight: 0,
                  paddingBottom: 18,
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div style={{ color: "#dcdcdc", fontSize: 14 }}>
                  Closest delivered work
                </div>
                <div
                  className="text-metallic"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 500,
                    fontSize: 30,
                    lineHeight: 1.1,
                    marginTop: 6,
                  }}
                >
                  {profile.closest}
                </div>
              </div>

              <div style={{ marginTop: 20 }}>
                <div style={{ color: "#dcdcdc", fontSize: 14 }}>
                  Typical build
                </div>
                <ol
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: "12px 0 0 0",
                  }}
                >
                  {profile.typicalPages.map((p, i) => (
                    <li
                      key={p}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "11px 0",
                        borderBottom:
                          i < profile.typicalPages.length - 1
                            ? "1px solid rgba(255,255,255,0.04)"
                            : "0",
                      }}
                    >
                      <span
                        style={{
                          color: "#7a7a7a",
                          fontSize: 12,
                          minWidth: 18,
                        }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span style={{ color: "#dcdcdc", fontSize: 15 }}>
                        {p}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
