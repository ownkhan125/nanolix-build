import Button from "@/components/primitives/Button";
import { CALENDLY_URL, openCalendly } from "@/lib/calendly";

export default function CTA() {
  return (
    <section
      id="cta"
      style={{
        position: "relative",
        paddingTop: 74,
        paddingBottom: 32,
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(255,98,31,0.14) 0%, rgba(255,98,31,0) 75%)",
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
          gap: 20,
          padding: "43px 0 44px",
        }}
      >
        <h2
          data-reveal-heading
          className="text-metallic"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontSize: 45,
            lineHeight: 1.11,
            margin: 0,
            letterSpacing: "-0.01em",
            maxWidth: 640,
          }}
        >
          A professional website, built
          <br />
          for you.
        </h2>
        <p
          style={{
            color: "#dcdcdc",
            fontSize: 16,
            lineHeight: 1.275,
            margin: 0,
            maxWidth: 680,
          }}
        >
          A real person reviews every application within 24-48hrs. No card, and
          no payment before
          <br className="hidden-mobile" />
          {" "}you are accepted.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 4 }}>
          <Button href="#apply">
            Apply in 2 minutes
          </Button>
          <Button href={CALENDLY_URL} variant="secondary" onClick={openCalendly}>
            Book a 15-Minute Call
          </Button>
        </div>
      </div>
    </section>
  );
}
