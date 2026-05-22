import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

export const heroMedia = {
  src: 'https://res.cloudinary.com/dwngo5vya/video/upload/v1779447540/hero_landing_d82754.mp4',
  poster:
    'https://images.pexels.com/videos/5752729/space-earth-universe-cosmos-5752729.jpeg',
  title: 'MODRN',
  titleAccent: 'Fashion',
  subtitle:
    'Contemporary style, crafted for the modern era. Premium essentials and signature materials that season.',
};

// ---- easing helpers ---------------------------------------------------------
const easeOutExpo = (x) => (x === 1 ? 1 : 1 - Math.pow(2, -10 * x));
const easeInOutCubic = (x) =>
  x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const easeOutQuint = (x) => 1 - Math.pow(1 - x, 5);
const easeInOutQuint = (x) =>
  x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2;
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

// ---- text splitting for the GSAP entrance ----------------------------------
// Each glyph becomes an inline-block so it can be individually transformed
// (the 3D flip-up). Spaces become non-breaking so word gaps survive.
const splitChars = (text, className = '') =>
  Array.from(text).map((ch, i) => (
    <span
      key={i}
      data-hero-char
      className={`inline-block ${className}`}
      style={{ willChange: 'transform, filter, opacity' }}
    >
      {ch === ' ' ? ' ' : ch}
    </span>
  ));

// Subtitle is split per word — words are cheaper to animate than chars and
// read better as a soft blurred fade-in cascade.
const splitWords = (text) =>
  text.split(' ').map((w, i) => (
    <span
      key={i}
      data-hero-word
      className="inline-block"
      style={{ willChange: 'transform, filter, opacity' }}
    >
      {w}
      {' '}
    </span>
  ));

// ---- animated geometric shapes background ----------------------------------
function ElegantShape({
  className = '',
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = 'from-white/[0.08]',
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -150, rotate: rotate - 15 }}
      animate={{ opacity: 1, y: 0, rotate }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
      className={`absolute ${className}`}
      style={{ willChange: 'transform, opacity' }}
    >
      <motion.div
        animate={{ y: [0, 15, 0] }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
        }}
        style={{ width, height, willChange: 'transform' }}
        className="relative"
      >
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-r ${gradient} to-transparent backdrop-blur-[2px] border-2 border-white/[0.15] shadow-[0_8px_32px_0_rgba(255,255,255,0.1)] after:absolute after:inset-0 after:rounded-full after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]`}
        />
      </motion.div>
    </motion.div>
  );
}

function GeometricShapes() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#030303]">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl" />
      <div className="absolute inset-0 overflow-hidden">
        <ElegantShape
          delay={0.3}
          width={600}
          height={140}
          rotate={12}
          gradient="from-indigo-500/[0.15]"
          className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]"
        />
        <ElegantShape
          delay={0.5}
          width={500}
          height={120}
          rotate={-15}
          gradient="from-rose-500/[0.15]"
          className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]"
        />
        <ElegantShape
          delay={0.4}
          width={300}
          height={80}
          rotate={-8}
          gradient="from-violet-500/[0.15]"
          className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]"
        />
        <ElegantShape
          delay={0.6}
          width={200}
          height={60}
          rotate={20}
          gradient="from-amber-500/[0.15]"
          className="right-[15%] md:right-[20%] top-[10%] md:top-[15%]"
        />
        <ElegantShape
          delay={0.7}
          width={150}
          height={40}
          rotate={-25}
          gradient="from-cyan-500/[0.15]"
          className="left-[20%] md:left-[25%] top-[5%] md:top-[10%]"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/80 pointer-events-none" />
    </div>
  );
}

/**
 * Cinematic scroll-expanding media hero.
 *
 * Behavior: the media starts small, pinned toward the bottom-right corner.
 * As the user scrolls (scroll-jacked while not fully expanded), the media
 * grows AND drifts toward the center, ending centered + large like the
 * original. Scrolling back to the very top re-triggers the contraction back
 * into the corner. Once fully expanded, Lenis resumes and the page scrolls
 * normally into the next section.
 *
 * Animation runs entirely through direct DOM mutation inside one RAF loop —
 * React only re-renders when the expanded boundary is crossed.
 */
const RunwayHero = ({
  mediaType = 'video',
  mediaSrc = heroMedia.src,
  posterSrc = heroMedia.poster,
  title = heroMedia.title,
  titleAccent = heroMedia.titleAccent,
  subtitle = heroMedia.subtitle,
  date = heroMedia.date,
  scrollToExpand = heroMedia.scrollToExpand,
}) => {
  const [mediaFullyExpanded, setMediaFullyExpanded] = useState(false);
  const [isMobileState, setIsMobileState] = useState(false);

  // spring state — refs only, no per-frame React state.
  const targetRef = useRef(0);
  const valueRef = useRef(0);
  const velocityRef = useRef(0);
  const rafIdRef = useRef(null);
  const lastTimeRef = useRef(0);

  const touchStartYRef = useRef(0);
  const lastTouchYRef = useRef(0);
  const touchVelocityRef = useRef(0);
  const expandedRef = useRef(false);
  const isMobileRef = useRef(false);
  const contractingRef = useRef(false);

  // DOM refs for direct mutation
  const mediaWrapRef = useRef(null);
  const bgLayerRef = useRef(null);
  const bgInnerRef = useRef(null);
  const vignetteRef = useRef(null);
  const dateTextRef = useRef(null);
  const hintTextRef = useRef(null);
  const heroTextRef = useRef(null);
  const introTlRef = useRef(null);

  useEffect(() => {
    expandedRef.current = mediaFullyExpanded;
  }, [mediaFullyExpanded]);

  // ---- entrance animation on page load / refresh --------------------------
  // Eye-catching headline reveal: each letter flips up in 3D out of a blur,
  // the subtitle drifts in word-by-word, and the gradient accent gets a slow
  // shimmer sweep that keeps living after the reveal. Only inner glyph/word
  // elements are animated — the container transform is owned by applyFrame
  // (scroll fade/lift), so the two never fight.
  useGSAP(
    () => {
      if (typeof window !== 'undefined' &&
          window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      const tl = gsap.timeline({ delay: 0.2 });
      introTlRef.current = tl;

      // Letters tumble up out of the floor, fading in from a blur.
      tl.from('[data-hero-char]', {
        yPercent: 130,
        opacity: 0,
        rotateX: -95,
        filter: 'blur(12px)',
        transformOrigin: '50% 100% -30px',
        duration: 1.1,
        ease: 'back.out(1.5)',
        stagger: { each: 0.04, from: 'start' },
      });

      // Gradient accent line reveals as one piece (it can't be split into
      // letters — background-clip:text needs the text directly on the element).
      const accent = heroTextRef.current?.querySelector('[data-hero-accent]');
      if (accent) {
        tl.from(
          accent,
          {
            yPercent: 110,
            opacity: 0,
            rotateX: -80,
            filter: 'blur(14px)',
            transformOrigin: '50% 100% -40px',
            duration: 1.0,
            ease: 'back.out(1.4)',
          },
          '-=0.5'
        );
      }

      // Subtitle words rise and sharpen out of a soft blur, cascading.
      if (heroTextRef.current?.querySelector('[data-hero-word]')) {
        tl.from(
          '[data-hero-word]',
          {
            yPercent: 60,
            opacity: 0,
            filter: 'blur(8px)',
            duration: 0.8,
            ease: 'power3.out',
            stagger: 0.03,
          },
          '-=0.55'
        );
      }

      // Living metallic shine — the gradient glides left-to-right across the
      // text forever. ease:'none' + a seamless palindrome gradient = perfectly
      // fluid, never-stopping motion. Slow (8s) for that calm, cinematic,
      // expensive feel — a shine passing through polished metal.
      if (accent) {
        gsap.to(accent, {
          backgroundPositionX: '200%',
          duration: 13,
          ease: 'none',
          repeat: -1,
        });
      }
    },
    { scope: heroTextRef }
  );

  // Pause Lenis while the hero owns input. Pinning page scroll to 0 before
  // stopping prevents the visible "snap" if Lenis was mid-flight.
  useEffect(() => {
    const lenis = typeof window !== 'undefined' ? window['__lenis'] : null;
    if (!lenis) return;
    if (mediaFullyExpanded) {
      lenis.start();
      // While the hero owned scroll the page was locked at the top, so neither
      // Lenis nor GSAP ScrollTrigger has measured the now-scrollable document.
      // Without a re-measure, the pinned story section leaves "dead zones"
      // where the wheel appears to do nothing (the scroll looks stuck). A
      // resize event makes BOTH engines recompute their scroll limits/pins.
      requestAnimationFrame(() => {
        lenis.resize?.();
        window.dispatchEvent(new Event('resize'));
      });
    } else {
      lenis.scrollTo(0, { immediate: true, force: true });
      lenis.stop();
    }
    return () => {
      lenis.start();
    };
  }, [mediaFullyExpanded]);

  // ---- write all visuals straight to the DOM ------------------------------
  const applyFrame = useCallback((p) => {
    const mobile = isMobileRef.current;

    const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
    const margin = mobile ? 16 : 32;

    // Fixed base box (never animate width/height — only transform).
    const baseW = mobile ? 200 : 280;
    const baseH = mobile ? 280 : 360;

    // ---- Final (fully expanded) box, CLAMPED to the viewport ----
    // This guarantees the video can never spill outside the screen: at p=1 the
    // box fits inside the viewport with a small margin, centered.
    const finalW = Math.min(vw - margin * 2, mobile ? 1000 : 1600);
    const finalH = Math.min(vh - margin * 2, mobile ? 620 : 840);

    // ---- ONE easing curve for everything ----
    // Using a single ease for scale AND position is what makes the box appear
    // to zoom out of one fixed anchor point (its bottom-right corner) instead
    // of drifting independently of its own growth.
    const e = easeInOutCubic(p);

    // Interpolate the box size from base -> final with that single ease.
    const curW = baseW + (finalW - baseW) * e;
    const curH = baseH + (finalH - baseH) * e;

    // ---- Position so the box stays glued to its anchor while it grows ----
    // We want: at p=0 the box's bottom-right corner sits near (vw-margin, vh-margin)
    // in the corner; at p=1 the box is centered. The element is anchored at
    // top:0 left:0, so a translate moves its top-left from the viewport origin.
    // We size the box directly (width/height) and only TRANSLATE it — no scale —
    // so the <video> inside keeps its true aspect ratio (object-cover) and never
    // stretches/distorts during the zoom.
    //
    // Top-left needed so the right edge sits at (vw - margin): vw - margin - curW
    // Top-left needed so the bottom edge sits at (vh - margin): vh - margin - curH
    const cornerLeft = vw - margin - curW;
    const cornerTop = vh - margin - curH;
    // Centered top-left:
    const centerLeft = (vw - curW) / 2;
    const centerTop = (vh - curH) / 2;

    // Blend top-left from corner -> center with the SAME ease, so growth and
    // travel stay in lockstep (zoom looks anchored to one point).
    const desiredLeft = cornerLeft + (centerLeft - cornerLeft) * e;
    const desiredTop = cornerTop + (centerTop - cornerTop) * e;

    // Element is anchored at top:0 left:0; translate to the desired top-left.
    const offsetX = desiredLeft;
    const offsetY = desiredTop;

    if (mediaWrapRef.current) {
      const shadowY = 12 + p * 50;
      const shadowBlur = 40 + p * 70;
      const shadowAlpha = 0.25 + p * 0.25;
      // Pure translate (no scale) + real size — video stays undistorted.
      mediaWrapRef.current.style.width = `${curW}px`;
      mediaWrapRef.current.style.height = `${curH}px`;
      mediaWrapRef.current.style.transform =
        `translate3d(${offsetX}px, ${offsetY}px, 0)`;
      mediaWrapRef.current.style.boxShadow =
        `0px ${shadowY}px ${shadowBlur}px rgba(0,0,0,${shadowAlpha})`;
    }

    // background parallax
    const bgEase = easeInOutCubic(p);
    const bgScale = 1 + bgEase * 0.14;
    const bgTranslateY = bgEase * -40;
    const bgOpacity = 1 - p * 0.85;

    if (bgLayerRef.current) {
      bgLayerRef.current.style.opacity = String(bgOpacity);
    }
    if (bgInnerRef.current) {
      bgInnerRef.current.style.transform =
        `translate3d(0, ${bgTranslateY}px, 0) scale(${bgScale})`;
    }
    if (vignetteRef.current) {
      vignetteRef.current.style.opacity = String(easeInOutCubic(p) * 0.55);
    }

    // Premium brand headline: fades and lifts away as the media takes over the
    // screen, so the type never fights the expanding video. Gone well before
    // the box reaches full size (p ~ 0.55), with a gentle parallax rise.
    if (heroTextRef.current) {
      if (contractingRef.current) {
        // Coming BACK to the hero: keep the container fully present and at rest
        // so the GSAP letter-flip (fired at beginContraction) owns the reveal
        // and is seen immediately — instead of playing invisibly behind the
        // p-driven fade while the box is still large (the "text shows late" lag).
        heroTextRef.current.style.opacity = '1';
        heroTextRef.current.style.transform = 'translate3d(0, 0, 0) scale(1)';
      } else {
        const textE = easeOutQuint(clamp(p * 1.8, 0, 1));
        heroTextRef.current.style.opacity = String(clamp(1 - p * 1.9, 0, 1));
        heroTextRef.current.style.transform =
          `translate3d(0, ${-textE * 70}px, 0) scale(${1 - textE * 0.06})`;
      }
    }

    // date + hint fade as we expand
    const hintOpacity = clamp(1 - p * 2.2, 0, 1);
    if (dateTextRef.current) {
      dateTextRef.current.style.opacity = String(clamp(1 - p * 1.6, 0, 1));
    }
    if (hintTextRef.current) {
      hintTextRef.current.style.opacity = String(hintOpacity);
    }
  }, []);

  // ---- the spring loop -----------------------------------------------------
  const startSpringLoop = useCallback(() => {
    if (rafIdRef.current !== null) return;
    lastTimeRef.current = performance.now();

    // Contraction (going back to the corner) uses a softer, slower spring so
    // the video glides home instead of snapping. Forward/expand stays snappy.
    // Both are slightly overdamped (damping > 2*sqrt(stiffness)) so the box
    // eases into place with no jitter or overshoot — the buttery feel.
    const expandSpring = { stiffness: 120, damping: 26, mass: 1 };
    // Quicker (but still overdamped/smooth) return so the box is home fast and
    // the replayed headline flip is visible while it plays — no laggy glide.
    const contractSpring = { stiffness: 95, damping: 23, mass: 1 };

    const tick = (now) => {
      let dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;
      // Clamp to ~30fps worth of time so a dropped/long frame can't make the
      // integrator jump; 8 substeps keep it stable even at high velocity.
      dt = Math.min(dt, 1 / 30);

      const target = targetRef.current;
      const { stiffness, damping, mass } = contractingRef.current
        ? contractSpring
        : expandSpring;
      const steps = 8;
      const sub = dt / steps;
      let v = valueRef.current;
      let vel = velocityRef.current;
      for (let i = 0; i < steps; i++) {
        const springForce = -stiffness * (v - target);
        const dampingForce = -damping * vel;
        const accel = (springForce + dampingForce) / mass;
        vel += accel * sub;
        v += vel * sub;
      }

      valueRef.current = clamp(v, 0, 1);
      velocityRef.current = vel;

      const settled =
        Math.abs(target - valueRef.current) < 0.0006 &&
        Math.abs(vel) < 0.0006;

      if (settled) {
        // Never let the spring rest mid-way. A partial expansion leaves Lenis
        // stopped and the whole page hard-locked (the reported "scroll stuck"
        // — only the hero animates and the wheel appears dead). Snap to the
        // nearest end, biased toward opening since the user got here scrolling
        // down, and keep animating until it commits.
        if (!expandedRef.current && target > 0 && target < 1) {
          const commit = target >= 0.4 ? 1 : 0;
          targetRef.current = commit;
          contractingRef.current = commit === 0;
          velocityRef.current = commit === 1 ? 0.5 : -0.5;
          rafIdRef.current = requestAnimationFrame(tick);
          return;
        }

        valueRef.current = target;
        velocityRef.current = 0;
        applyFrame(target);

        if (target >= 1 && !expandedRef.current) {
          setMediaFullyExpanded(true);
        } else if (target <= 0) {
          if (expandedRef.current) setMediaFullyExpanded(false);
          // Box has landed back in its corner — NOW play the headline flip so
          // the text reveals after the video reaches its position. We parked it
          // hidden (pause(0)) when contraction began; if it's still parked,
          // play it. (Can't gate on expandedRef — it flips false early in the
          // glide via setState and would be stale by the time we settle here.)
          if (introTlRef.current?.paused()) introTlRef.current.restart(false);
        }
        contractingRef.current = false; // back to snappy spring next time
        rafIdRef.current = null;
        return;
      }

      const p = valueRef.current;
      applyFrame(p);

      // Fire the headline flip a touch BEFORE the box fully settles — once it's
      // almost home (p < 0.1). The spring has a slow low-velocity tail near the
      // corner; waiting for full settle made the text feel late, so we reveal
      // as it lands. (paused() guard keeps it to a single fire per return.)
      if (contractingRef.current && p < 0.1 && introTlRef.current?.paused()) {
        introTlRef.current.restart(false);
      }

      // flip expanded state ONCE at the boundary — no per-frame setState
      if (p >= 0.992 && !expandedRef.current) {
        setMediaFullyExpanded(true);
      }

      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame(tick);
  }, [applyFrame]);

  // ---- input handlers ------------------------------------------------------
  useEffect(() => {
    const atPageTop = () => {
      const lenis = typeof window !== 'undefined' ? window['__lenis'] : null;
      const lenisY =
        lenis && typeof lenis.scroll === 'number' ? lenis.scroll : 0;
      // Trust whichever reading is LARGER. After GSAP pins change the document
      // height, Lenis' cached scroll can go stale and read ~0 while we're
      // actually mid-page. Taking the max means we only treat the page as
      // "at top" when BOTH agree — otherwise contraction could misfire
      // mid-page, hard-locking scroll (Lenis stops + wheel input is eaten).
      const y = Math.max(window.scrollY || 0, lenisY);
      // Generous tolerance — Lenis momentum can leave a few px even "at top".
      return y <= 40;
    };

    const beginContraction = () => {
      // If Lenis left us a hair below the top, pin to 0 so the hero owns input.
      const lenis = typeof window !== 'undefined' ? window['__lenis'] : null;
      if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
      setMediaFullyExpanded(false);
      // Park the headline hidden for the whole glide back. The flip is fired
      // once the box has landed in its corner (see the spring settle), so the
      // text reveals AFTER the video reaches its position — not during travel.
      introTlRef.current?.pause(0);
      // Re-grab from the CURRENT visual value (don't hard-snap to 1) so there's
      // no jump if anything was mid-flight; just aim the target back to 0.
      if (valueRef.current < 0.5) valueRef.current = 1;
      contractingRef.current = true; // use the soft/slow spring for the return
      targetRef.current = 0;
      velocityRef.current = 0;
      startSpringLoop();
    };

    // Safety net: if we're still "un-expanded" but the page is somehow scrolled
    // past the top (refresh restoring a mid-page position, a scrollbar drag, an
    // anchor jump), the hero must STOP intercepting the wheel and hand scroll
    // back to Lenis — otherwise the wheel is dead even though the page clearly
    // scrolled. Snap straight to the expanded state at the current position.
    const forceHandoff = () => {
      expandedRef.current = true;
      valueRef.current = 1;
      targetRef.current = 1;
      velocityRef.current = 0;
      applyFrame(1);
      // Resume Lenis right now — don't wait for the React re-render, or the
      // very gesture that triggered the handoff would be dropped while Lenis
      // is still stopped.
      const lenis = typeof window !== 'undefined' ? window['__lenis'] : null;
      lenis?.start();
      setMediaFullyExpanded(true);
    };

    const handleWheel = (e) => {
      // expanded + at top + scrolling up → re-grab and contract
      if (expandedRef.current && e.deltaY < 0 && atPageTop()) {
        e.preventDefault();
        beginContraction();
        return;
      }

      // un-expanded but not at the top → we lost sync; hand off, don't eat input
      if (!expandedRef.current && (window.scrollY || 0) > 4) {
        forceHandoff();
        return;
      }

      if (!expandedRef.current) {
        e.preventDefault();
        if (e.deltaY > 0) contractingRef.current = false;
        const lineHeight = 16;
        const normalized =
          e.deltaMode === 1
            ? e.deltaY * lineHeight
            : e.deltaMode === 2
            ? e.deltaY * window.innerHeight
            : e.deltaY;
        const scrollDelta = normalized * 0.0007;
        targetRef.current = clamp(targetRef.current + scrollDelta, 0, 1);
        velocityRef.current += scrollDelta * 1.6;
        startSpringLoop();
      }
    };

    const handleTouchStart = (e) => {
      touchStartYRef.current = e.touches[0].clientY;
      lastTouchYRef.current = e.touches[0].clientY;
      touchVelocityRef.current = 0;
    };

    const handleTouchMove = (e) => {
      if (!touchStartYRef.current) return;
      const touchY = e.touches[0].clientY;
      const deltaY = lastTouchYRef.current - touchY;
      touchVelocityRef.current = deltaY;
      lastTouchYRef.current = touchY;

      if (expandedRef.current && deltaY < -12 && atPageTop()) {
        e.preventDefault();
        beginContraction();
        return;
      }

      // un-expanded but already scrolled past the top → hand off, don't eat it
      if (!expandedRef.current && (window.scrollY || 0) > 4) {
        forceHandoff();
        return;
      }

      if (!expandedRef.current) {
        e.preventDefault();
        if (deltaY > 0) contractingRef.current = false;
        const scrollDelta = deltaY * 0.0036;
        targetRef.current = clamp(targetRef.current + scrollDelta, 0, 1);
        startSpringLoop();
      }
    };

    const handleTouchEnd = () => {
      if (!expandedRef.current && Math.abs(touchVelocityRef.current) > 4) {
        const flick = touchVelocityRef.current * 0.0038;
        targetRef.current = clamp(targetRef.current + flick * 3, 0, 1);
        velocityRef.current += flick;
        startSpringLoop();
      }
      touchStartYRef.current = 0;
      touchVelocityRef.current = 0;
    };

    const handleKeyDown = (e) => {
      const downKeys = ['ArrowDown', 'PageDown', ' ', 'Spacebar'];
      const upKeys = ['ArrowUp', 'PageUp'];

      // expanded + at top + pressing up → contract back to corner
      if (expandedRef.current) {
        if (upKeys.includes(e.key) && atPageTop()) {
          e.preventDefault();
          beginContraction();
        }
        return;
      }

      if (downKeys.includes(e.key)) {
        e.preventDefault();
        const delta = e.key === 'PageDown' || e.key === ' ' ? 0.18 : 0.07;
        targetRef.current = clamp(targetRef.current + delta, 0, 1);
        startSpringLoop();
      } else if (upKeys.includes(e.key)) {
        e.preventDefault();
        const delta = e.key === 'PageUp' ? 0.18 : 0.07;
        targetRef.current = clamp(targetRef.current - delta, 0, 1);
        startSpringLoop();
      }
    };

    // Catches scrollbar drags / restored scroll where no wheel event fires.
    const handleScroll = () => {
      if (!expandedRef.current && (window.scrollY || 0) > 4) forceHandoff();
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [startSpringLoop]);

  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 768;
      isMobileRef.current = mobile;
      setIsMobileState(mobile);
      applyFrame(valueRef.current);
    };
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, [applyFrame]);

  // initial paint at p=0 once refs are mounted
  useEffect(() => {
    applyFrame(0);
  }, [applyFrame]);

  const baseW = isMobileState ? 200 : 280;
  const baseH = isMobileState ? 280 : 360;

  return (
    <section className="relative w-full h-[100dvh] overflow-hidden">
      {/* ---- Background parallax layer (animated shapes) ---- */}
      <div
        ref={bgLayerRef}
        className="absolute inset-0 z-0 overflow-hidden"
        style={{ willChange: 'opacity' }}
      >
        <div
          ref={bgInnerRef}
          className="absolute inset-0 w-full h-full"
          style={{
            transform: 'translate3d(0, 0, 0) scale(1)',
            willChange: 'transform',
          }}
        >
          <GeometricShapes />
        </div>
        <div
          ref={vignetteRef}
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: 0,
            background:
              'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.85) 100%)',
            willChange: 'opacity',
          }}
        />
      </div>

      <div className="relative z-10 w-full h-full">
        {/* ---- Premium brand headline — fades + lifts away as media expands ---- */}
        <div
          ref={heroTextRef}
          className="pointer-events-none absolute inset-0 z-[5] flex flex-col items-start justify-center px-[5vw] text-left"
          style={{ willChange: 'transform, opacity' }}
        >
          <h1
            className="font-extrabold uppercase leading-[0.82] tracking-tighter text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.6)] text-[clamp(3.25rem,15vw,17rem)]"
            style={{ perspective: '900px' }}
          >
            <span className="block">{splitChars(title)}</span>
            {titleAccent && (
              <span
                data-hero-accent
                className="block bg-clip-text text-transparent"
                style={{
                  // Soft liquid-silver — a smoothly blended chrome with no
                  // harsh dark dips. The darkest tone is a gentle steel
                  // (#868c96) that melts up through silver → light silver →
                  // white, with three soft specular glints sweeping through.
                  // Modern, premium, calm. Symmetric palindrome → seamless loop.
                  backgroundImage:
                    'linear-gradient(90deg, #868c96 0%, #aab0ba 8%, #ffffff 16%, #d9dce2 24%, #969ca6 33%, #c3c8d0 42%, #ffffff 50%, #c3c8d0 58%, #969ca6 67%, #d9dce2 76%, #ffffff 84%, #aab0ba 92%, #868c96 100%)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {titleAccent}
              </span>
            )}
          </h1>

          {subtitle && (
            <p className="mt-5 sm:mt-8 max-w-[40ch] md:max-w-[52ch] text-base sm:text-lg md:text-3xl font-light leading-snug text-white/80">
              {splitWords(subtitle)}
            </p>
          )}
        </div>

        {/* ---- Expanding media — anchored at center, drifts in from corner ---- */}
        <div
          ref={mediaWrapRef}
          className="absolute top-0 left-0 rounded-2xl overflow-hidden"
          style={{
            width: `${baseW}px`,
            height: `${baseH}px`,
            maxWidth: 'none',
            maxHeight: 'none',
            transformOrigin: 'top left',
            transform: 'translate3d(0, 0, 0)',
            willChange: 'transform, width, height',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          {mediaType === 'video' ? (
            mediaSrc.includes('youtube.com') ? (
              <div className="relative w-full h-full pointer-events-none">
                <iframe
                  width="100%"
                  height="100%"
                  src={
                    mediaSrc.includes('embed')
                      ? mediaSrc +
                        (mediaSrc.includes('?') ? '&' : '?') +
                        'autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&disablekb=1&modestbranding=1'
                      : mediaSrc.replace('watch?v=', 'embed/') +
                        '?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&disablekb=1&modestbranding=1&playlist=' +
                        mediaSrc.split('v=')[1]
                  }
                  className="w-full h-full rounded-xl"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="relative w-full h-full pointer-events-none">
                <video
                  src={mediaSrc}
                  poster={posterSrc}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  className="w-full h-full object-cover rounded-xl"
                  controls={false}
                  disablePictureInPicture
                  disableRemotePlayback
                  style={{
                    transform: 'translateZ(0)',
                    backfaceVisibility: 'hidden',
                  }}
                />
              </div>
            )
          ) : (
            <img
              src={mediaSrc}
              alt={title || 'Media content'}
              className="w-full h-full object-cover rounded-xl"
            />
          )}

          <div className="absolute bottom-3 left-0 right-0 flex flex-col items-center text-center z-10 px-2">
            {date && (
              <p
                ref={dateTextRef}
                className="text-sm md:text-base text-blue-200"
                style={{ willChange: 'opacity' }}
              >
                {date}
              </p>
            )}
            {scrollToExpand && (
              <p
                ref={hintTextRef}
                className="text-blue-200 font-medium text-center text-xs md:text-sm"
                style={{ willChange: 'opacity' }}
              >
                {scrollToExpand}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RunwayHero;