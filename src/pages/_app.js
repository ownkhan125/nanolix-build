import "@/styles/globals.css";
import Head from "next/head";
import Script from "next/script";
import { Onest } from "next/font/google";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { initHeadingReveal } from "@/lib/heading-reveal";

const onest = Onest({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-onest",
  display: "swap",
});

export default function App({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    const cleanupRef = { current: null };
    const raf = requestAnimationFrame(() => {
      cleanupRef.current = initHeadingReveal();
    });
    return () => {
      cancelAnimationFrame(raf);
      if (cleanupRef.current) cleanupRef.current();
    };
  }, [router.asPath]);

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <link
          rel="stylesheet"
          href="https://assets.calendly.com/assets/external/widget.css"
        />
      </Head>
      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="afterInteractive"
      />
      <div className={onest.variable} style={{ fontFamily: "var(--font-onest), Onest, system-ui, sans-serif" }}>
        <Component {...pageProps} />
      </div>
    </>
  );
}
