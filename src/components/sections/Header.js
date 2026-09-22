import { useState } from "react";
import { Logo } from "@/components/primitives/Icons";
import Button from "@/components/primitives/Button";
import { nav } from "@/data/content";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "saturate(180%) blur(14px)",
        WebkitBackdropFilter: "saturate(180%) blur(14px)",
        background: "rgba(10, 10, 10, 0.7)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        className="content"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 53,
        }}
      >
        <a href="#top" aria-label="Nanolix" style={{ display: "inline-flex" }}>
          <Logo width={130} height={38} />
        </a>

        <nav
          style={{ display: "flex", alignItems: "center", gap: 32 }}
          className="hidden-mobile"
        >
          {nav.map((n) => (
            <a
              key={n.href}
              href={n.href}
              style={{
                color: "#a1a1aa",
                fontSize: 16,
                letterSpacing: "-0.02em",
                transition: "color 0.15s ease",
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseOut={(e) => (e.currentTarget.style.color = "#a1a1aa")}
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="hidden-mobile">
          <Button
            href="#apply"
            className="btn-primary--sm"
            style={{ padding: "12px 34px 12px 28px" }}
          >
            Apply
          </Button>
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="only-mobile"
          style={{
            display: "none",
            width: 40,
            height: 40,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 999,
          }}
        >
          <div style={{ position: "relative", width: 18, height: 12 }}>
            <span
              style={{
                position: "absolute",
                left: 0,
                top: open ? 5 : 0,
                width: 18,
                height: 2,
                background: "#fff",
                transform: open ? "rotate(45deg)" : "none",
                transition: "all 0.2s ease",
              }}
            />
            <span
              style={{
                position: "absolute",
                left: 0,
                top: open ? 5 : 10,
                width: 18,
                height: 2,
                background: "#fff",
                transform: open ? "rotate(-45deg)" : "none",
                transition: "all 0.2s ease",
              }}
            />
          </div>
        </button>
      </div>

      {open && (
        <div
          className="only-mobile"
          style={{
            display: "none",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(10,10,10,0.95)",
          }}
        >
          <div
            className="content"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 18,
              paddingTop: 24,
              paddingBottom: 24,
            }}
          >
            {nav.map((n) => (
              <a
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                style={{ color: "#dcdcdc", fontSize: 16 }}
              >
                {n.label}
              </a>
            ))}
            <Button
              href="#apply"
              className="btn-primary--sm"
              style={{ alignSelf: "flex-start" }}
              onClick={() => setOpen(false)}
            >
              Apply
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
