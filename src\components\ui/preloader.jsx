import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LOGO_SRC = 'https://modrn-web-page-5udb.vercel.app/logo.png';

// Every heavy asset the first screen depends on. The preloader doesn't finish
// until each of these is in the browser cache, so when the curtain lifts the
// hero video + story GIFs play instantly with no pop-in. Add new hero/story
// media here to keep the "load everything first" guarantee intact.
const IMAGE_ASSETS = [
  LOGO_SRC,
  '/videos/design.gif',
  '/videos/detail.gif',
  '/videos/Fabric.gif',
  '/videos/feel.gif',
  '/videos/fit.gif',
  // Hero poster (shown before the video paints its first frame).
  'https://images.pexels.com/videos/5752729/space-earth-universe-cosmos-5752729.jpeg',
];
const VIDEO_ASSETS = ['/videos/hero_landing.mp4'];

// Don't reveal before this — a sub-second flash of a loader looks broken, not
// intentional. And never hang past the hard cap if a CDN asset stalls.
const MIN_DURATION = 1600;
const MAX_DURATION = 16000;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Resolve when the image is cached, or after a per-asset timeout so one slow /
// failed request can never wedge the whole site behind the loader.
function loadImage(src, onDone) {
  const img = new Image();
  let settled = false;
  const finish = () => {
    if (settled) return;
    settled = true;
    onDone();
  };
  img.onload = finish;
  img.onerror = finish;
  img.src = src;
  if (img.complete) finish();
  setTimeout(finish, 8000);
}

// Wait for enough of the video to play through smoothly (canplaythrough), with
// loadeddata as a softer fallback and a timeout backstop.
function loadVideo(src, onDone) {
  const video = document.createElement('video');
  let settled = false;
  const finish = () => {
    if (settled) return;
    settled = true;
    onDone();
  };
  video.preload = 'auto';
  video.muted = true;
  video.playsInline = true;
  video.oncanplaythrough = finish;
  video.onloadeddata = finish;
  video.onerror = finish;
  video.src = src;
  video.load();
  setTimeout(finish, 8000);
}

export default function Preloader({ onReveal }) {
  // 'loading' → counting up while assets cache.
  // 'revealing' → assets ready, curtain animating away (app already mounting).
  // 'done' → unmounted.
  const [phase, setPhase] = useState('loading');
  const [display, setDisplay] = useState(0); // smoothed 0–100 shown to the user

  const targetRef = useRef(0); // real progress, driven by asset completions
  const displayRef = useRef(0);
  const startRef = useRef(Date.now());
  const revealedRef = useRef(false);

  // Fire the reveal exactly once: mount the app underneath, then play the
  // curtain so the hero's own entrance animation runs as it lifts.
  const triggerReveal = useCallback(() => {
    if (revealedRef.current) return;
    revealedRef.current = true;
    onReveal?.();
    setPhase('revealing');
  }, [onReveal]);

  // ---- kick off the real asset loading ----
  useEffect(() => {
    const total = IMAGE_ASSETS.length + VIDEO_ASSETS.length + 1; // +1 = fonts
    let loaded = 0;
    const bump = () => {
      loaded += 1;
      targetRef.current = Math.min(1, loaded / total);
    };

    IMAGE_ASSETS.forEach((src) => loadImage(src, bump));
    VIDEO_ASSETS.forEach((src) => loadVideo(src, bump));

    if (document.fonts?.ready) {
      document.fonts.ready.then(bump).catch(bump);
    } else {
      bump();
    }

    // Absolute backstop — reveal no matter what after MAX_DURATION.
    const hardCap = setTimeout(() => {
      targetRef.current = 1;
    }, MAX_DURATION);
    return () => clearTimeout(hardCap);
  }, []);

  // ---- smoothly ease the displayed counter toward real progress ----
  useEffect(() => {
    let raf;
    const tick = () => {
      const target = targetRef.current * 100;
      // Ease toward the real value so the number always glides, never jumps.
      displayRef.current += (target - displayRef.current) * 0.08;

      const elapsed = Date.now() - startRef.current;
      const ready = target >= 100 && elapsed >= MIN_DURATION;

      // Hold just shy of 100 until everything is genuinely ready, then let it
      // land on 100 and reveal — so "100%" always means "actually loaded".
      if (ready && displayRef.current > 99.3) {
        displayRef.current = 100;
        setDisplay(100);
        triggerReveal();
        return;
      }
      const shown = ready
        ? displayRef.current
        : Math.min(displayRef.current, 99);
      setDisplay(shown);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [triggerReveal]);

  // Lock the page while the curtain is up so stray wheel/touch input never
  // reaches the hero mounting behind it.
  useEffect(() => {
    if (phase === 'done') return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [phase]);

  const reduced = prefersReducedMotion();
  const pct = Math.round(display);

  return (
    <AnimatePresence onExitComplete={() => setPhase('done')}>
      {phase !== 'done' && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#050505]"
          initial={false}
          // Curtain lifts away on reveal.
          animate={phase === 'revealing' ? 'exit' : 'enter'}
          variants={{
            enter: { y: 0 },
            exit: {
              y: '-100%',
              transition: reduced
                ? { duration: 0.01 }
                : { duration: 1, ease: [0.76, 0, 0.24, 1], delay: 0.35 },
            },
          }}
          style={{ willChange: 'transform' }}
        >
          {/* soft ambient glow behind the mark */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 h-[60vh] w-[60vh] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-[120px]"
            style={{
              background:
                'radial-gradient(circle, rgba(120,130,150,0.18), transparent 70%)',
            }}
          />

          {/* logo + wordmark — fade/lift out just before the curtain moves */}
          <motion.div
            className="relative z-10 flex flex-col items-center"
            animate={
              phase === 'revealing' && !reduced
                ? { opacity: 0, y: -24, filter: 'blur(6px)' }
                : { opacity: 1, y: 0, filter: 'blur(0px)' }
            }
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.img
              src={LOGO_SRC}
              alt="MODRN"
              draggable="false"
              className="h-24 w-24 select-none object-contain md:h-28 md:w-28"
              initial={reduced ? false : { opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              style={{
                filter: 'drop-shadow(0 8px 40px rgba(255,255,255,0.12))',
              }}
            />
            {/* breathing pulse ring under the logo */}
            {!reduced && (
              <motion.span
                className="absolute top-0 h-24 w-24 rounded-full border border-white/10 md:h-28 md:w-28"
                animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
                transition={{
                  duration: 2.6,
                  ease: 'easeInOut',
                  repeat: Infinity,
                }}
              />
            )}

            <motion.span
              className="mt-7 bg-clip-text text-sm font-light uppercase tracking-[0.55em] text-transparent"
              style={{
                backgroundImage:
                  'linear-gradient(90deg,#868c96,#ffffff,#969ca6,#ffffff,#868c96)',
                backgroundSize: '200% auto',
                paddingLeft: '0.55em',
              }}
              animate={reduced ? {} : { backgroundPositionX: ['0%', '200%'] }}
              transition={{ duration: 6, ease: 'linear', repeat: Infinity }}
            >
              MODRN
            </motion.span>
          </motion.div>

          {/* progress track + counter pinned to the bottom */}
          <motion.div
            className="absolute inset-x-0 bottom-0 z-10 px-[6vw] pb-10"
            animate={
              phase === 'revealing' && !reduced ? { opacity: 0 } : { opacity: 1 }
            }
            transition={{ duration: 0.4 }}
          >
            <div className="mx-auto flex w-full max-w-5xl items-end justify-between">
              <span className="text-xs font-light uppercase tracking-[0.3em] text-white/40">
                Loading
              </span>
              <span className="font-light tabular-nums text-white/80 text-2xl md:text-3xl">
                {String(pct).padStart(3, '0')}
                <span className="text-white/30">%</span>
              </span>
            </div>
            <div className="relative mx-auto mt-4 h-px w-full max-w-5xl overflow-hidden bg-white/10">
              <motion.div
                className="absolute inset-y-0 left-0 bg-white/80"
                style={{ width: `${pct}%` }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
