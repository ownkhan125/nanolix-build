import { Logo } from "@/components/primitives/Icons";
import { nav } from "@/data/content";

export default function Footer() {
  return (
    <footer
      style={{
        paddingTop: 50,
        paddingBottom: 30,
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="content">
        <Logo width={170} height={49} />

        <div className="footer-grid" style={{ marginTop: 30 }}>
          <div>
            <h3
              style={{
                color: "#fff",
                fontSize: 18,
                fontWeight: 400,
                margin: 0,
              }}
            >
              Affiliate Disclosure
            </h3>
            <p
              style={{
                color: "#dcdcdc",
                fontSize: 16,
                lineHeight: 1.62,
                marginTop: 16,
                maxWidth: 465,
              }}
            >
              In some cases, we may recommend third-party tools such as
              <br />
              hosting, domains, email, or software. If you choose to purchase
              <br />
              through our links, we may earn a referral commission at no extra
              <br />
              cost to you. We only recommend tools we believe are appropriate
              <br />
              for your project, and you are free to use your own providers if
              <br />
              they meet the project requirements.
            </p>
          </div>

          <div>
            <h3
              style={{
                color: "#fff",
                fontSize: 18,
                fontWeight: 400,
                margin: 0,
              }}
            >
              Terms Summary
            </h3>
            <p
              style={{
                color: "#dcdcdc",
                fontSize: 16,
                lineHeight: 1.62,
                marginTop: 16,
                maxWidth: 775,
              }}
            >
              Application based. One revision round. You own the site. Required
              care plan of $39 to $59 a month, six
              <br />
              month minimum, covering hosting and support. Upgrades are
              optional, never required. Cancel within the first
              <br />
              30 days and care plan payments are refunded. No guarantees of
              leads, sales, or rankings.
            </p>
          </div>
        </div>

        <div
          style={{
            marginTop: 30,
            paddingTop: 30,
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            flexWrap: "wrap",
            gap: 20,
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <p style={{ color: "#9b9b9b", fontSize: 14, margin: 0 }}>
            © Copyright 2026, Nanolix Digital All Rights Reserved
          </p>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              gap: 24,
            }}
          >
            {nav.map((n) => (
              <li key={n.href}>
                <a
                  href={n.href}
                  style={{
                    color: "#a1a1aa",
                    fontSize: 14,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
