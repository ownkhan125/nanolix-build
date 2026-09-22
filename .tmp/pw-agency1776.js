const path = require('node:path');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto('https://www.agency1776.com/', { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(1200);

    // Look for GSAP or animation script sources
    const scripts = await page.$$eval('script[src]', els => els.map(e => e.src));
    const gsapRefs = scripts.filter(s => /gsap|scrolltrigger|splittext|lenis|locomotive/i.test(s));
    console.log('animation-script-refs:', JSON.stringify(gsapRefs, null, 2));

    // Inspect heading structure
    const headingInfo = await page.evaluate(() => {
      const hs = Array.from(document.querySelectorAll('h1, h2'));
      return hs.slice(0, 6).map(h => ({
        tag: h.tagName,
        text: (h.textContent || '').replace(/\s+/g,' ').slice(0, 80),
        innerHTMLpreview: h.innerHTML.slice(0, 260),
        classes: h.className,
      }));
    });
    console.log('headings:', JSON.stringify(headingInfo, null, 2));

    // Take screenshot at top and after scrolling
    await page.screenshot({ path: 'C:/Users/General/Documents/GitHub/Nanolix Build Landing Page/.tmp/agency1776-top.png' });
    await page.evaluate(() => window.scrollBy({ top: 1500, behavior: 'instant' }));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'C:/Users/General/Documents/GitHub/Nanolix Build Landing Page/.tmp/agency1776-scrolled.png' });
    console.log('Saved screenshots');
  } finally {
    await browser.close();
  }
})();
