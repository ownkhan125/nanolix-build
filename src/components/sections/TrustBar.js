export default function TrustBar() {
  return (
    <section style={{ paddingTop: 50, paddingBottom: 50 }}>
      <div className="content">
        <div
          style={{
            position: "relative",
            padding: 10,
            borderRadius: 26,
            background:
              "linear-gradient(180deg,#111111 0%,#070707 55%,#0c0907 100%)",
            border: "1px solid rgba(255,255,255,0.06)",
            overflow: "hidden",
          }}
        >
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 50% 40%, rgba(255,98,31,0.09) 0%, rgba(255,98,31,0) 70%)",
              pointerEvents: "none",
            }}
          />
          <div className="trust-grid">
            <div
              style={{
                background: "#0d0d0d",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 18,
                padding: 42,
                position: "relative",
              }}
            >
              <div
                style={{
                  color: "#aaa",
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Our delivered work:
              </div>
              <div
                style={{
                  marginTop: 21,
                  fontFamily: "var(--font-display)",
                  fontSize: 42,
                  lineHeight: 1.02,
                  color: "#fff",
                }}
              >
                <div>ZAKA</div>
                <div>House Pickleball</div>
                <div>Bioflex Aesthetics</div>
                <div>NUST</div>
              </div>
              <div
                style={{
                  position: "absolute",
                  top: 42,
                  right: 42,
                  color: "#666",
                  fontFamily: "var(--font-display)",
                  fontSize: 13,
                  lineHeight: 1.2,
                  letterSpacing: "0.15em",
                  textAlign: "right",
                }}
              >
                01 /<br />WORK
              </div>
            </div>

            <div className="trust-right">
              <div
                style={{
                  background: "#0d0d0d",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 18,
                  padding: 34,
                  position: "relative",
                }}
              >
                <div
                  style={{
                    color: "#aaa",
                    fontSize: 13,
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  The process:
                </div>
                <p
                  style={{
                    marginTop: 21,
                    fontFamily: "var(--font-display)",
                    fontSize: 27,
                    lineHeight: 1.25,
                    color: "#dddddd",
                    maxWidth: 370,
                  }}
                >
                  Strategy, design, development,
                  <br />
                  revision, and launch support.
                </p>
                <div
                  style={{
                    position: "absolute",
                    top: 34,
                    right: 34,
                    color: "#666",
                    fontFamily: "var(--font-display)",
                    fontSize: 13,
                    lineHeight: 1.2,
                    letterSpacing: "0.15em",
                    textAlign: "right",
                  }}
                >
                  02 /<br />PROCESS
                </div>
              </div>

              <div
                style={{
                  background: "linear-gradient(180deg,#ff621f 0%,#d9470b 100%)",
                  border: "1px solid #ff814b",
                  borderRadius: 18,
                  padding: 34,
                  position: "relative",
                }}
              >
                <div
                  style={{
                    color: "rgba(255,255,255,0.72)",
                    fontSize: 13,
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  No upfront design fee.
                </div>
                <p
                  style={{
                    marginTop: 21,
                    fontFamily: "var(--font-display)",
                    fontSize: 25,
                    lineHeight: 1.25,
                    color: "#fff",
                  }}
                >
                  The care plan is $39 to $59 a month,
                  <br />
                  six month minimum.
                </p>
                <div
                  style={{
                    position: "absolute",
                    top: 34,
                    right: 34,
                    color: "#fff",
                    fontFamily: "var(--font-display)",
                    fontSize: 13,
                    lineHeight: 1.2,
                    letterSpacing: "0.15em",
                    textAlign: "right",
                  }}
                >
                  03 /<br />OFFER
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
