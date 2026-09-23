import Button from "@/components/primitives/Button";
import { Check } from "@/components/primitives/Icons";
import { CALENDLY_URL, openCalendly } from "@/lib/calendly";

export default function Hero() {
  return (
    <section
      id="top"
      style={{
        position: "relative",
        paddingTop: 120,
        paddingBottom: 60,
        overflow: "hidden",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: "50%",
          top: -100,
          transform: "translateX(-50%)",
          width: 820,
          height: 730,
          background:
            "radial-gradient(ellipse at center, rgba(255,98,31,0.25) 0%, rgba(255,98,31,0) 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        className="content"
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 18,
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 16px",
            borderRadius: 100,
            background: "#191919",
            fontSize: 16,
            color: "#a6a6a6",
            letterSpacing: "-0.01em",
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              background: "#ff621f",
              display: "inline-block",
            }}
          />
          The Nanolix Website Launch Program
        </span>

        <h1
          data-reveal-heading
          className="hero-h1"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            fontSize: "clamp(38px, 5.4vw, 68px)",
            lineHeight: 1.06,
            letterSpacing: "-0.02em",
            margin: 0,
          }}
        >
          <span className="text-metallic">A professional website,</span>{" "}
          <span style={{ color: "#ffffff", fontWeight: 500 }}>built</span>{" "}
          <br />
          <span style={{ color: "#ffffff", fontWeight: 500, whiteSpace: "nowrap" }}>for you.</span>
        </h1>

        <p
          style={{
            fontFamily: "'Onest', system-ui, sans-serif",
            fontSize: 18,
            lineHeight: 1.63,
            color: "#dcdcdc",
            margin: 0,
            maxWidth: 820,
          }}
        >
          No upfront design fee. Our team designs and builds your website page,
          helps you launch it, and gives you a clear handoff so the site is
          yours to keep.
        </p>

        <p
          style={{
            fontFamily: "'Onest', system-ui, sans-serif",
            fontSize: 18,
            lineHeight: 1.63,
            color: "#b3b3b3",
            margin: 0,
            maxWidth: 820,
          }}
        >
          The required care plan starts at{" "}
          <strong style={{ color: "#ffffff", fontWeight: 600 }}>
            $39 to $59 a month
          </strong>
          , and billing begins only after your application is accepted.
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            justifyContent: "center",
            marginTop: 12,
          }}
        >
          <Button href="#apply">Apply in 2 minutes</Button>
          <Button href={CALENDLY_URL} variant="secondary" onClick={openCalendly}>
            Book a 15-Minute Call
          </Button>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            marginTop: 10,
            color: "#9b9b9b",
            fontSize: 14,
            lineHeight: 1.275,
            maxWidth: 680,
            textAlign: "center",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              width: 22,
              height: 22,
              borderRadius: 11,
              background: "transparent",
              border: "1.5px solid #3fae7e",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Check size={12} color="#3fae7e" stroke={2.2} />
          </span>
          A real person reviews every application within 24-48hrs. No card, and
          no payment before you are accepted.
        </div>
      </div>
    </section>
  );
}
