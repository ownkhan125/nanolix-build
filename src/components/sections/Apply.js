import { useEffect, useRef, useState } from "react";
import Eyebrow from "@/components/primitives/Eyebrow";
import Button from "@/components/primitives/Button";
import { CalendarIcon } from "@/components/primitives/Icons";
import { CALENDLY_URL, openCalendly } from "@/lib/calendly";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INITIAL_FORM = {
  business: "",
  email: "",
  description: "",
  city: "",
  role: "",
  currentSite: "",
  assets: "",
  goal: "",
  timeline: "",
};

export default function Apply() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(INITIAL_FORM);
  const [showError, setShowError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const calendarRef = useRef(null);

  const update = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));

  const isStep1Valid = form.business.trim().length > 0 && EMAIL_RE.test(form.email.trim());

  const handleContinue = (e) => {
    e.preventDefault();
    if (!isStep1Valid) {
      setShowError(true);
      return;
    }
    setShowError(false);
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const r = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.error || "Submission failed. Please try again.");
      }
      setStep(3);
    } catch (err) {
      setSubmitError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Behaviour: submitting Step 2 loads the calendar beside the form.
  useEffect(() => {
    if (step !== 3) return;
    if (typeof window === "undefined" || !calendarRef.current) return;
    const el = calendarRef.current;
    const mount = () => {
      if (window.Calendly?.initInlineWidget) {
        el.innerHTML = "";
        window.Calendly.initInlineWidget({
          url: CALENDLY_URL,
          parentElement: el,
        });
      }
    };
    if (window.Calendly?.initInlineWidget) {
      mount();
    } else {
      // Widget script may still be loading (afterInteractive). Retry briefly.
      const iv = setInterval(() => {
        if (window.Calendly?.initInlineWidget) {
          clearInterval(iv);
          mount();
        }
      }, 200);
      return () => clearInterval(iv);
    }
  }, [step]);

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
            onSubmit={step === 1 ? handleContinue : handleSubmit}
            noValidate
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
              <ProgressBar filled={step >= 1} />
              <ProgressBar filled={step >= 2} />
              <ProgressBar filled={step >= 3} />
            </div>

            {step === 1 && (
              <>
                <StepHeader
                  title="Step 1: The quick part"
                  subtext="Three fields. About sixty seconds."
                />

                <FormField
                  label="Business name and website if you have one"
                  placeholder="Business name and website if you have one"
                  value={form.business}
                  onChange={update("business")}
                />
                <FormField
                  label="Best email for our reply"
                  placeholder="Best email for our reply"
                  type="email"
                  value={form.email}
                  onChange={update("email")}
                />
                <FormField
                  label="What does your business do, in one sentence?"
                  placeholder="What does your business do, in one sentence?"
                  textarea
                  value={form.description}
                  onChange={update("description")}
                />

                {showError && !isStep1Valid && (
                  <p
                    role="alert"
                    style={{
                      color: "#ff8a5c",
                      fontSize: 14,
                      lineHeight: 1.45,
                      margin: 0,
                    }}
                  >
                    Please add your business name and a working email so we can
                    reply.
                  </p>
                )}

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
              </>
            )}

            {step === 2 && (
              <>
                <StepHeader
                  title="Step 2: The details"
                  subtext="This is what we review for fit."
                />

                <FormField
                  label="City and country"
                  placeholder="City and country"
                  value={form.city}
                  onChange={update("city")}
                />
                <FormField
                  label="Your role"
                  placeholder="Your role"
                  value={form.role}
                  onChange={update("role")}
                />
                <FormField
                  label="Do you have a website now and what is wrong with it?"
                  placeholder="Do you have a website now and what is wrong with it?"
                  textarea
                  value={form.currentSite}
                  onChange={update("currentSite")}
                />
                <FormField
                  label="Do you have a logo, photos, and basic content ready?"
                  placeholder="Do you have a logo, photos, and basic content ready?"
                  textarea
                  value={form.assets}
                  onChange={update("assets")}
                />
                <FormField
                  label="The number one thing you want the site to do"
                  placeholder="The number one thing you want the site to do"
                  value={form.goal}
                  onChange={update("goal")}
                />
                <FormField
                  label="How soon do you need to launch?"
                  placeholder="How soon do you need to launch?"
                  value={form.timeline}
                  onChange={update("timeline")}
                />

                {submitError && (
                  <p
                    role="alert"
                    style={{
                      color: "#ff8a5c",
                      fontSize: 14,
                      lineHeight: 1.45,
                      margin: 0,
                    }}
                  >
                    {submitError}
                  </p>
                )}

                <Button
                  type="submit"
                  as="button"
                  disabled={submitting}
                  style={{
                    width: "100%",
                    opacity: submitting ? 0.7 : 1,
                    cursor: submitting ? "wait" : "pointer",
                  }}
                >
                  {submitting ? "Submitting…" : "Submit my application"}
                </Button>

                <p
                  style={{
                    textAlign: "center",
                    color: "#dcdcdc",
                    fontSize: 14,
                    margin: 0,
                  }}
                >
                  Spots are limited and reviewed individually. Quality over
                  quantity.
                </p>

                <button
                  type="button"
                  onClick={handleBack}
                  style={{
                    alignSelf: "center",
                    color: "#ff621f",
                    fontSize: 14,
                    textDecoration: "underline",
                    textUnderlineOffset: 2,
                    background: "transparent",
                    border: 0,
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  Back to the quick part
                </button>
              </>
            )}

            {step === 3 && (
              <div style={{ paddingTop: 6, paddingBottom: 6 }}>
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
                  Application received
                </h3>
                <p
                  style={{
                    color: "#dcdcdc",
                    fontSize: 16,
                    lineHeight: 1.62,
                    marginTop: 14,
                    marginBottom: 0,
                  }}
                >
                  We review each business for fit and reply with next steps,
                  usually within a couple of days. If you want to talk sooner,
                  book a 15-minute call using the calendar beside this while
                  your application is in review.
                </p>
              </div>
            )}
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

            {step === 3 ? (
              <div
                ref={calendarRef}
                className="apply-calendar-embed"
                style={{
                  background: "#ffffff",
                  border: "1px solid #3a3a3a",
                  borderRadius: 16,
                  height: 700,
                  minWidth: 320,
                  overflow: "hidden",
                }}
              />
            ) : (
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
                <Button href={CALENDLY_URL} onClick={openCalendly}>
                  Show available times
                </Button>
              </div>
            )}
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

function ProgressBar({ filled }) {
  return (
    <span
      style={{
        flex: 1,
        height: 6,
        borderRadius: 999,
        background: filled
          ? "linear-gradient(90deg,#ff500b,#e64a00)"
          : "#1f1f1f",
        transition: "background 0.4s ease",
      }}
    />
  );
}

function StepHeader({ title, subtext }) {
  return (
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
        {title}
      </h3>
      <p style={{ color: "#dcdcdc", fontSize: 14, marginTop: 8 }}>{subtext}</p>
    </div>
  );
}

function FormField({
  label,
  placeholder,
  type = "text",
  textarea = false,
  value,
  onChange,
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <span style={{ color: "#b3b3b3", fontSize: 14 }}>{label}</span>
      {textarea ? (
        <textarea
          placeholder={placeholder}
          rows={3}
          value={value}
          onChange={onChange}
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
          value={value}
          onChange={onChange}
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
