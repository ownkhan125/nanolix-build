import Eyebrow from "@/components/primitives/Eyebrow";
import { upgradeLadder } from "@/data/content";

export default function UpgradeLadder() {
  return (
    <section style={{ paddingTop: 50, paddingBottom: 50 }}>
      <div className="content">
        <Eyebrow>Upgrade ladder</Eyebrow>
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
          If you ever want more, here are the
          <br />
          prices
        </h2>

        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.1)",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {upgradeLadder.map((r, i) => (
            <div
              key={r.title}
              className="ladder-row"
              style={{
                padding: "28px 0",
                borderBottom:
                  i < upgradeLadder.length - 1
                    ? "1px solid rgba(255,255,255,0.06)"
                    : "0",
              }}
            >
              <div>
                <h3
                  className="text-metallic"
                  style={{
                    fontSize: 20,
                    lineHeight: 1.275,
                    margin: 0,
                    fontWeight: 400,
                  }}
                >
                  {r.title}
                </h3>
                <div
                  style={{
                    color: "#fff",
                    fontFamily: "var(--font-display)",
                    fontWeight: 500,
                    fontSize: 20,
                    lineHeight: 1.2,
                    marginTop: 4,
                  }}
                >
                  {r.price}
                </div>
              </div>
              <div
                style={{
                  color: "#dcdcdc",
                  fontSize: 16,
                  alignSelf: "center",
                }}
              >
                {r.body}
              </div>
            </div>
          ))}
        </div>
        <p
          style={{
            textAlign: "center",
            color: "#dcdcdc",
            fontSize: 18,
            lineHeight: 1.275,
            letterSpacing: 0,
            marginTop: 40,
            padding: "0 24px",
          }}
        >
          If a smaller piece of work would serve you better, we will say so.
          That has cost us projects, and
          <br className="hidden-mobile" />
          {" "}we still do it.
        </p>
      </div>
    </section>
  );
}
