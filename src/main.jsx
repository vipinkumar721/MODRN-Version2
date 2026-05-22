import React from 'react';
import ReactDOM from 'react-dom/client';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import 'lenis/dist/lenis.css';
import App from './App.jsx';
import './index.css';

gsap.registerPlugin(ScrollTrigger);

// The scroll-jacking hero owns the first screen. If the browser restores a
// mid-page scroll position on refresh, the hero (which starts un-expanded and
// intercepts the wheel) would eat all mouse-wheel input while you're stuck far
// down the page. Force every load to begin at the very top so the hero ↔ Lenis
// hand-off always starts from a coherent state.
if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
}

// Lenis tuned for a long, silky deceleration without the rubbery "drift"
// that comes from a too-long duration. lerp drives the per-frame smoothing
// and is the main lever for "buttery" feel.
const lenis = new Lenis({
  lerp: 0.085,
  smoothWheel: true,
  smoothTouch: false, // native touch scrolls feel better on mobile
  wheelMultiplier: 0.9,
  touchMultiplier: 1.5,
  syncTouch: false,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});

// Drive Lenis from the GSAP ticker — single RAF source, no double scheduling.
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// Whenever ScrollTrigger recomputes (e.g. a pin is created/destroyed and the
// document height changes), tell Lenis to remeasure. Without this, Lenis keeps
// a stale max-scroll/limit after pinning and the page can "stick" partway down
// — wheel input stops advancing the scroll until something forces a resize.
ScrollTrigger.addEventListener('refresh', () => lenis.resize());
ScrollTrigger.refresh();

// Keep ScrollTrigger pins aligned with the real layout after late shifts
// (fonts, images, lazy resources). Without this, pinned sections in
// story-scroll can briefly desync on first load.
if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => ScrollTrigger.refresh());
}
window.addEventListener('load', () => ScrollTrigger.refresh());

window.__lenis = lenis;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
