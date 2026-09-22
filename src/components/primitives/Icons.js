export function Check({ size = 18, color = "#3fae7e", stroke = 1.8 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M3 9.5l4 4L15 5"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Dash({ size = 18, color = "#7a7a7a", stroke = 1.5 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M4 9h10"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Plus({ size = 22, color = "#fff" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect x="0" y="10" width="22" height="2" fill={color} />
      <rect x="10" y="0" width="2" height="22" fill={color} />
    </svg>
  );
}

export function Minus({ size = 22, color = "#fff" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect x="0" y="10" width="22" height="2" fill={color} />
    </svg>
  );
}

export function ChevronsLR({ size = 18, color = "#0b0b0b" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M7 5l-4 4 4 4"
        stroke={color}
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11 5l4 4-4 4"
        stroke={color}
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChartLineUpIcon({ size = 22, color = "#ff621f" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M3 3v15a1 1 0 0 0 1 1h16"
        stroke={color}
        strokeWidth="1.8333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 14l3.5-4 3 3L19 7"
        stroke={color}
        strokeWidth="1.8333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DollarIcon({ size = 22, color = "#ff621f" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M11 2v18"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M15.5 6.5c-.7-1.5-2.4-2.5-4.5-2.5-2.76 0-5 1.57-5 3.5S8.24 11 11 11s5 1.57 5 3.5-2.24 3.5-5 3.5c-2.1 0-3.8-1-4.5-2.5"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LayersIcon({ size = 22, color = "#ff621f" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M11 2 2 7l9 5 9-5-9-5Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M2 12l9 5 9-5"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M2 17l9 5 9-5"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ShieldIcon({ size = 22, color = "#ff621f" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M11 2 3 5v6c0 5 3.4 8.4 8 9 4.6-.6 8-4 8-9V5l-8-3Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CalendarIcon({ size = 30, color = "#ff621f" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 30 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect
        x="4"
        y="6"
        width="22"
        height="20"
        rx="2"
        stroke={color}
        strokeWidth="2.125"
      />
      <path
        d="M4 11h22"
        stroke={color}
        strokeWidth="2.125"
        strokeLinecap="round"
      />
      <path
        d="M10 3v5"
        stroke={color}
        strokeWidth="2.125"
        strokeLinecap="round"
      />
      <path
        d="M20 3v5"
        stroke={color}
        strokeWidth="2.125"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({ width = 170, height = 49, className }) {
  return (
    <img
      src="/figma/logo.svg"
      width={width}
      height={height}
      alt="Nanolix Digital"
      className={className}
      style={{ display: "block" }}
    />
  );
}
