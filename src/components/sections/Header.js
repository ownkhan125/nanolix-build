import { useEffect, useState } from "react";
import { Logo } from "@/components/primitives/Icons";
import Button from "@/components/primitives/Button";
import { nav } from "@/data/content";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);

  useEffect(() => {
    const ids = nav.map((n) => n.href.slice(1));
    const els = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    if (!els.length) return;

    // Header is 53px sticky. Activate when a section's top has crossed the header
    // and it occupies the top ~45% of the viewport. Falls out of the "active band"
    // when the next section takes over, so scroll spy stays accurate.
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (!visible.length) return;
        visible.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        setActive(`#${visible[0].target.id}`);
      },
      {
        rootMargin: "-53px 0px -55% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

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
        className="header-inner"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 64,
          gap: 32,
        }}
      >
        <a
          href="#top"
          aria-label="Nanolix"
          style={{ display: "inline-flex", flexShrink: 0 }}
        >
          <Logo width={130} height={38} />
        </a>

        <nav className="header-nav hidden-mobile">
          {nav.map((n) => {
            const isActive = active === n.href;
            return (
              <a
                key={n.href}
                href={n.href}
                aria-current={isActive ? "true" : undefined}
                style={{
                  color: isActive ? "#fff" : "#a1a1aa",
                  fontSize: 15,
                  letterSpacing: "-0.02em",
                  transition: "color 0.2s ease",
                  padding: "6px 2px",
                }}
                onMouseOver={(e) => (e.currentTarget.style.color = "#fff")}
                onMouseOut={(e) =>
                  (e.currentTarget.style.color = isActive ? "#fff" : "#a1a1aa")
                }
              >
                {n.label}
              </a>
            );
          })}
        </nav>

        <div className="hidden-mobile" style={{ flexShrink: 0 }}>
          <Button
            href="#apply"
            className="btn-primary--sm"
            style={{ padding: "10px 32px 10px 26px" }}
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
            width: 42,
            height: 42,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.02)",
            flexShrink: 0,
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
            className="header-inner"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 18,
              paddingTop: 24,
              paddingBottom: 24,
            }}
          >
            {nav.map((n) => {
              const isActive = active === n.href;
              return (
                <a
                  key={n.href}
                  href={n.href}
                  aria-current={isActive ? "true" : undefined}
                  onClick={() => setOpen(false)}
                  style={{
                    color: isActive ? "#fff" : "#dcdcdc",
                    fontSize: 16,
                    transition: "color 0.2s ease",
                  }}
                >
                  {n.label}
                </a>
              );
            })}
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
