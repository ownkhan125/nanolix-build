export const CALENDLY_URL = "https://calendly.com/taha-nanolixdigital/30min";

// Opens the Calendly popup. Use as onClick on any booking button.
// If the Calendly script hasn't finished loading yet, fall back to
// opening the URL in a new tab so the click is never a dead end.
export function openCalendly(e) {
  if (e && typeof e.preventDefault === "function") e.preventDefault();
  if (typeof window === "undefined") return;
  if (window.Calendly && typeof window.Calendly.initPopupWidget === "function") {
    window.Calendly.initPopupWidget({ url: CALENDLY_URL });
    return;
  }
  window.open(CALENDLY_URL, "_blank", "noopener,noreferrer");
}
