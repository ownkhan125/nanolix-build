import { useState } from "react";
import { motion } from "motion/react";
import Eyebrow from "@/components/primitives/Eyebrow";
import { Plus, Minus } from "@/components/primitives/Icons";
import { faqs } from "@/data/content";

export default function FAQ() {
  const [open, setOpen] = useState(null);

  return (
    <section id="faq" style={{ paddingTop: 50, paddingBottom: 50 }}>
      <div className="content faq-grid">
        <div>
          <Eyebrow>FAQs</Eyebrow>
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
            Questions
          </h2>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {faqs.map((f, i) => (
            <motion.div
              key={i}
              whileHover={{ borderColor: "#3a3a3a", backgroundColor: "#0c0c0c" }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              style={{
                background: "#080808",
                border: "1px solid #292929",
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 0,
                  paddingLeft: 40,
                  background: "transparent",
                  color: "inherit",
                  border: 0,
                  cursor: "pointer",
                  minHeight: 80,
                }}
                aria-expanded={open === i}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 40,
                    paddingTop: 18,
                    paddingBottom: 18,
                  }}
                >
                  <span
                    className="text-metallic"
                    style={{
                      fontSize: 20,
                      lineHeight: 1.275,
                      minWidth: 13,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span
                    className="text-metallic"
                    style={{
                      fontSize: 20,
                      lineHeight: 1.275,
                      textAlign: "left",
                    }}
                  >
                    {f.q}
                  </span>
                </div>
                <span
                  style={{
                    height: 78,
                    width: 86,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(180deg,#222223,#1d1d1d)",
                    transition: "background 0.25s ease",
                  }}
                >
                  {open === i ? <Minus /> : <Plus />}
                </span>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
