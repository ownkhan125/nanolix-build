import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Eyebrow from "@/components/primitives/Eyebrow";
import { faqs } from "@/data/content";

const EASE_OUT = [0.22, 1, 0.36, 1];

function ToggleIcon({ open }) {
  return (
    <svg
      width={22}
      height={22}
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect x="0" y="10" width="22" height="2" fill="#fff" />
      <motion.rect
        x="10"
        y="0"
        width="2"
        height="22"
        fill="#fff"
        initial={false}
        animate={{ scaleY: open ? 0 : 1, opacity: open ? 0 : 1 }}
        transition={{ duration: 0.28, ease: EASE_OUT }}
        style={{ transformOrigin: "11px 11px" }}
      />
    </svg>
  );
}

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
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={i}
                animate={{
                  borderColor: isOpen ? "#3a3a3a" : "#292929",
                  backgroundColor: isOpen ? "#0c0c0c" : "#080808",
                }}
                whileHover={{ borderColor: "#3a3a3a", backgroundColor: "#0c0c0c" }}
                transition={{ duration: 0.28, ease: EASE_OUT }}
                style={{
                  background: "#080808",
                  border: "1px solid #292929",
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="faq-toggle"
                  aria-expanded={isOpen}
                >
                  <div className="faq-toggle-text">
                    <span
                      className="text-metallic faq-num"
                      style={{
                        fontSize: 20,
                        lineHeight: 1.275,
                        minWidth: 13,
                      }}
                    >
                      {i + 1}
                    </span>
                    <span
                      className="text-metallic faq-question"
                      style={{
                        fontSize: 20,
                        lineHeight: 1.275,
                        textAlign: "left",
                      }}
                    >
                      {f.q}
                    </span>
                  </div>
                  <span className="faq-toggle-icon">
                    <ToggleIcon open={isOpen} />
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && f.a ? (
                    <motion.div
                      key="answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        height: { duration: 0.36, ease: EASE_OUT },
                        opacity: { duration: 0.24, ease: EASE_OUT, delay: isOpen ? 0.06 : 0 },
                      }}
                      style={{ overflow: "hidden" }}
                    >
                      <div className="faq-answer">
                        <p className="faq-answer-text">{f.a}</p>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
