import { useRef, useState, useEffect } from "react";
import { motion } from "motion/react";
import gsap from "gsap";
import Eyebrow from "@/components/primitives/Eyebrow";
import { Check, ChevronsLR } from "@/components/primitives/Icons";

export default function BeforeAfter() {
  const [pos, setPos] = useState(50);
  const wrap = useRef(null);
  const dragging = useRef(false);
  const handle = useRef(null);

  useEffect(() => {
    const move = (e) => {
      if (!dragging.current || !wrap.current) return;
      const rect = wrap.current.getBoundingClientRect();
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      const p = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setPos(p);
    };
    const up = () => (dragging.current = false);
    window.addEventListener("mousemove", move);
    window.addEventListener("touchmove", move);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchend", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchend", up);
    };
  }, []);

  useEffect(() => {
    if (!handle.current) return;
    const tl = gsap.to(handle.current, {
      boxShadow: "0 4px 24px rgba(255,255,255,0.35)",
      duration: 1.1,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });
    return () => tl.kill();
  }, []);

  const clipAfter = `inset(0 0 0 ${pos}%)`;
  const clipBefore = `inset(0 ${100 - pos}% 0 0)`;

  return (
    <section style={{ paddingTop: 100, paddingBottom: 50 }}>
      <div className="content ba-grid">
        <div className="ba-left">
          <Eyebrow>Before / After</Eyebrow>
          <h2
          data-reveal-heading
            className="text-metallic"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontSize: "clamp(42px, 4vw, 56px)",
              lineHeight: 1.08,
              margin: "22px 0 0 0",
              letterSpacing: "-0.02em",
            }}
          >
            See the
            <br />
            difference a clear
            <br />
            website makes.
          </h2>
          <p style={{ marginTop: 22, color: "#dcdcdc", fontSize: 16, lineHeight: 1.5 }}>
            Drag to compare a rough DIY page with a
            <br className="hidden-mobile" />
            {" "}polished Nanolix-built website page.
          </p>
        </div>

        <div>
        <div
          className="ba-frame"
          style={{
            border: "1px solid #9b9b9b",
            borderRadius: 20,
            overflow: "hidden",
            background: "#0c0c0c",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 16px",
              background: "#121212",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div style={{ display: "flex", gap: 6 }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  background: "#ff5f57",
                }}
              />
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  background: "#febc2e",
                }}
              />
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  background: "#28c840",
                }}
              />
            </div>
            <div
              style={{
                flex: 1,
                background: "#1c1c1c",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 999,
                padding: "6px 14px",
                color: "#8d8d8d",
                fontSize: 13,
                textAlign: "center",
              }}
            >
              marastudio.com
            </div>
          </div>

          <div
            ref={wrap}
            className="ba-stage"
            style={{
              position: "relative",
              height: 460,
              overflow: "hidden",
              userSelect: "none",
            }}
          >
            {/* AFTER layer — fixed full-frame composition, revealed by clip */}
            <div
              className="ba-after"
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(ellipse at 30% 40%, rgba(255,98,31,0.08) 0%, rgba(255,98,31,0) 70%), #0b0b0b",
                padding: "22px 28px 28px",
                boxSizing: "border-box",
                clipPath: clipAfter,
                WebkitClipPath: clipAfter,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 16,
                  marginBottom: 26,
                }}
              >
                <span
                  style={{
                    color: "#fff",
                    fontFamily: "var(--font-display)",
                    fontWeight: 500,
                    fontSize: 14,
                    letterSpacing: "0.14em",
                    whiteSpace: "nowrap",
                  }}
                >
                  MARA STUDIO
                </span>
                <div
                  className="ba-after-nav"
                  style={{
                    display: "flex",
                    gap: 18,
                    color: "#8d8d8d",
                    fontSize: 12,
                    whiteSpace: "nowrap",
                  }}
                >
                  <span>Home</span>
                  <span>Collection</span>
                  <span>Story</span>
                  <span>Stockists</span>
                </div>
                <span
                  style={{
                    background: "linear-gradient(180deg,#ff500b,#e64a00)",
                    color: "#fff",
                    padding: "6px 14px",
                    borderRadius: 40,
                    fontSize: 12,
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                  }}
                >
                  Contact
                </span>
              </div>

              <div className="ba-after-hero" style={{ maxWidth: 520, margin: "40px auto 0", textAlign: "center" }}>
                <h3
                  style={{
                    color: "#fff",
                    fontFamily: "var(--font-display)",
                    fontWeight: 500,
                    fontSize: 28,
                    lineHeight: 1.15,
                    margin: 0,
                    letterSpacing: "-0.01em",
                  }}
                >
                  The collection, presented
                  <br />
                  properly.
                </h3>
                <p
                  style={{
                    color: "#9a9a9a",
                    fontSize: 14,
                    lineHeight: 1.5,
                    margin: "16px auto 0",
                    maxWidth: 400,
                  }}
                >
                  The lookbook lives on a feed you rent. The brand should
                  live somewhere you own.
                </p>
                <div style={{ display: "flex", justifyContent: "center", marginTop: 18 }}>
                  <button
                    type="button"
                    style={{
                      background: "linear-gradient(180deg,#ff500b,#e64a00)",
                      color: "#fff",
                      padding: "9px 22px",
                      borderRadius: 40,
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    Contact
                  </button>
                </div>
                <div
                  className="ba-after-cards"
                  style={{
                    display: "flex",
                    gap: 10,
                    marginTop: 24,
                    justifyContent: "center",
                  }}
                >
                  {[
                    "Press has\nsomewhere to\npoint.",
                    "The drop outlives\nthe feed.",
                    "Wholesale takes\nyou seriously.",
                  ].map((t, i) => (
                    <div
                      key={i}
                      style={{
                        flex: "0 0 160px",
                        width: 160,
                        background: "#191919",
                        border: "1px solid rgba(255,255,255,0.14)",
                        borderRadius: 10,
                        padding: "10px 12px",
                        display: "flex",
                        gap: 8,
                        alignItems: "flex-start",
                        textAlign: "left",
                      }}
                    >
                      <span style={{ paddingTop: 1, flexShrink: 0 }}>
                        <Check size={12} />
                      </span>
                      <span
                        style={{
                          color: "#c9c9c9",
                          fontSize: 11,
                          lineHeight: 1.35,
                          whiteSpace: "pre-line",
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {t}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* BEFORE layer — fixed full-frame composition, revealed by clip */}
            <div
              className="ba-before"
              style={{
                position: "absolute",
                inset: 0,
                background: "#f4f4f2",
                padding: "58px 24px 26px",
                boxSizing: "border-box",
                pointerEvents: "none",
                clipPath: clipBefore,
                WebkitClipPath: clipBefore,
              }}
            >
              <div style={{ maxWidth: 340, margin: "0 auto", textAlign: "center" }}>
                <div
                  style={{
                    color: "#8a8a8a",
                    fontSize: 12,
                    fontFamily: "Times New Roman, serif",
                    whiteSpace: "nowrap",
                  }}
                >
                  yourbusiness.weebly.com
                </div>
                <h3
                  style={{
                    fontFamily: "Times New Roman, serif",
                    fontWeight: 700,
                    color: "#222",
                    fontSize: 26,
                    lineHeight: 1.15,
                    letterSpacing: "0.02em",
                    margin: "58px 0 0 0",
                    whiteSpace: "nowrap",
                  }}
                >
                  WELCOME TO OUR
                  <br />
                  WEBSITE
                </h3>
                <p style={{ color: "#666", fontSize: 15, marginTop: 18 }}>
                  Site under construction. Check back soon!
                </p>
              </div>
              <div
                style={{
                  position: "absolute",
                  top: 16,
                  left: 24,
                  background: "#fff",
                  color: "#000",
                  padding: "4px 12px",
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: "0.12em",
                }}
              >
                BEFORE
              </div>
            </div>

            {/* Divider + handle */}
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: `${pos}%`,
                width: 2,
                background: "#fff",
                transform: "translateX(-1px)",
                pointerEvents: "none",
              }}
            />
            <motion.button
              ref={handle}
              type="button"
              aria-label="Drag to compare"
              onMouseDown={() => (dragging.current = true)}
              onTouchStart={() => (dragging.current = true)}
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              style={{
                position: "absolute",
                top: "50%",
                left: `${pos}%`,
                x: "-50%",
                y: "-50%",
                width: 44,
                height: 44,
                background: "#fff",
                borderRadius: 22,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "grab",
                boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
              }}
            >
              <ChevronsLR size={18} color="#0b0b0b" />
            </motion.button>
          </div>
        </div>
        <p
          style={{
            textAlign: "center",
            color: "#dcdcdc",
            fontSize: 14,
            margin: "18px 0 0 0",
          }}
        >
          Drag to compare. The right side changes with the business type you
          pick below.
        </p>
        </div>
      </div>
    </section>
  );
}
