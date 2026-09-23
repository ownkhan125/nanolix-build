import Eyebrow from "@/components/primitives/Eyebrow";
import Button from "@/components/primitives/Button";
import { CalendarIcon } from "@/components/primitives/Icons";
import { CALENDLY_URL, openCalendly } from "@/lib/calendly";

export default function Apply() {
  return (
    <section id="apply" style={{ paddingTop: 50, paddingBottom: 50 }}>
      <div className="content">
        <Eyebrow>Apply</Eyebrow>
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
            maxWidth: 780,
          }}
        >
          Apply for the Nanolix Free Website
          <br />
          Program
        </h2>

        <div className="apply-grid">
          <form
            onSubmit={(e) => e.preventDefault()}
            style={{
              background: "#0b0b0b",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 20,
              padding: 38,
              display: "flex",
              flexDirection: "column",
              gap: 26,
            }}
          >
            <div style={{ display: "flex", gap: 10 }}>
              <span
                style={{
                  flex: 1,
                  height: 6,
                  borderRadius: 999,
                  background: "linear-gradient(90deg,#ff500b,#e64a00)",
                }}
              />
              <span
                style={{
                  flex: 1,
                  height: 6,
                  borderRadius: 999,
                  background: "#1f1f1f",
                }}
              />
              <span
                style={{
                  flex: 1,
                  height: 6,
                  borderRadius: 999,
                  background: "#1f1f1f",
                }}
              />
            </div>

            <div>
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
                Step 1: The quick part
              </h3>
              <p style={{ color: "#dcdcdc", fontSize: 14, marginTop: 8 }}>
                Three fields. About sixty seconds.
              </p>
            </div>

            <FormField
              label="Business name and website if you have one"
              placeholder="Business name and website if you have one"
            />
            <FormField
              label="Best email for our reply"
              placeholder="Best email for our reply"
              type="email"
            />
            <FormField
              label="What does your business do, in one sentence?"
              placeholder="What does your business do, in one sentence?"
              textarea
            />

            <Button type="submit" as="button" style={{ width: "100%" }}>
              Continue, one minute left
            </Button>

            <p
              style={{
                textAlign: "center",
                color: "#dcdcdc",
                fontSize: 14,
                margin: 0,
              }}
            >
              No payment is required at any step.
            </p>
          </form>

          <aside
            style={{
              background: "#191919",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 20,
              padding: 32,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <Eyebrow>Booking</Eyebrow>
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
              Free 15-minute call
            </h3>
            <p style={{ color: "#dcdcdc", fontSize: 16, lineHeight: 1.62 }}>
              We look at your current site, or wherever your presence lives
              now, you leave with the clearest next step, and we tell you
              honestly whether this is a fit. Anyone can book; build spots are
              confirmed after review.
            </p>

            <div
              style={{
                background: "#0b0b0b",
                border: "1px solid #3a3a3a",
                borderRadius: 16,
                padding: "34px 24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 14,
              }}
            >
              <CalendarIcon />
              <p
                style={{
                  color: "#dcdcdc",
                  fontSize: 16,
                  textAlign: "center",
                  margin: 0,
                  lineHeight: 1.275,
                }}
              >
                Prefer to talk first? Load the calendar and pick a
                <br />
                time.
              </p>
              <Button href={CALENDLY_URL} onClick={openCalendly}>Show available times</Button>
            </div>
            <p
              style={{
                textAlign: "center",
                color: "#dcdcdc",
                fontSize: 14,
                margin: 0,
              }}
            >
              Calendar not loading?{" "}
              <a
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#ff621f",
                  textDecoration: "underline",
                  textUnderlineOffset: 2,
                }}
              >
                Open it in a new tab.
              </a>
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}

function FormField({ label, placeholder, type = "text", textarea = false }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <span style={{ color: "#b3b3b3", fontSize: 14 }}>{label}</span>
      {textarea ? (
        <textarea
          placeholder={placeholder}
          rows={3}
          style={{
            background: "#0e0e0e",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12,
            padding: "13px 16px",
            color: "#dcdcdc",
            fontSize: 15,
            fontFamily: "inherit",
            resize: "vertical",
          }}
        />
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          style={{
            background: "#0e0e0e",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12,
            padding: "13px 16px",
            color: "#dcdcdc",
            fontSize: 15,
            fontFamily: "inherit",
          }}
        />
      )}
    </label>
  );
}
