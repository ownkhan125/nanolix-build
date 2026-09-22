import Eyebrow from "@/components/primitives/Eyebrow";
import {
  ChartLineUpIcon,
  DollarIcon,
  ShieldIcon,
} from "@/components/primitives/Icons";
import { moneyCards } from "@/data/content";

const iconFor = (name) => {
  if (name === "chart") return <ChartLineUpIcon size={20} />;
  if (name === "dollar") return <DollarIcon size={20} />;
  return <ShieldIcon size={20} />;
};

function HeadingWithEmphasis({ heading, emphasis }) {
  if (!emphasis) return heading;
  const idx = heading.indexOf(emphasis);
  if (idx === -1) return heading;
  return (
    <>
      {heading.slice(0, idx)}
      <span style={{ color: "#ffffff", fontWeight: 600 }}>{emphasis}</span>
      {heading.slice(idx + emphasis.length)}
    </>
  );
}

export default function WhereTheMoney() {
  return (
    <section style={{ paddingTop: 50, paddingBottom: 50 }}>
      <div className="content">
        <Eyebrow>Where the money goes</Eyebrow>
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
          }}
        >
          We would rather show you our work
          <br />
          than pitch you.
        </h2>

        <div
          style={{
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          <div className="money-grid">
            {moneyCards.map((c, i) => (
              <div
                key={c.label}
                style={{
                  padding: "36px 32px",
                  borderRight:
                    i < moneyCards.length - 1
                      ? "1px solid rgba(255,255,255,0.08)"
                      : "0",
                }}
                className="money-card"
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: "#180a03",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {iconFor(c.icon)}
                </div>
                <div
                  style={{
                    color: "#7a7a7a",
                    fontSize: 14,
                    marginTop: 18,
                  }}
                >
                  {c.label}
                </div>
                <h3
                  style={{
                    fontSize: 20,
                    lineHeight: 1.35,
                    margin: "6px 0 0 0",
                    fontWeight: 400,
                    color: "#8a8a8a",
                    letterSpacing: "-0.005em",
                  }}
                >
                  <HeadingWithEmphasis heading={c.heading} emphasis={c.emphasis} />
                </h3>
                <p
                  style={{
                    color: "#dcdcdc",
                    fontSize: 16,
                    lineHeight: 1.5,
                    margin: "12px 0 0 0",
                  }}
                >
                  {c.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
