import React, { createRef, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

function cx(...parts) {
  return parts.filter(Boolean).join(' ');
}

/* ------------------------------------------------------------------ */
/* Section + image data                                               */
/* ------------------------------------------------------------------ */
const SECTIONS = [
  { label: 'Who we are', words: ['Define', 'Modern', 'Style'], bg: '#0a0a0a', fg: '#fff', accent: '#e8ff58',
    body: 'MODRN is a contemporary fashion brand dedicated to creating timeless, sustainable pieces. We blend minimalist aesthetics with superior craftsmanship for the modern individual.' },
  { label: 'Our collections', words: ['Fashion', 'Redefined', 'Daily'], bg: '#F5F0E8', fg: '#0a0a0a', accent: '#ff5436',
    body: "From premium essentials to signature statement pieces, every collection embodies MODRN's commitment to quality, style, and sustainability." },
  { label: 'The promise', words: ['Quality', 'Meets', 'Style'], bg: '#0a0a0a', fg: '#fff', accent: '#7c5cff',
    body: 'We promise premium materials, ethical production, and designs that transcend seasons. Fashion that matters. Clothes that last.' },
  { label: 'Sustainability', words: ['Fashion', 'For', 'Tomorrow'], bg: '#F5F0E8', fg: '#0a0a0a', accent: '#1a8cff',
    body: "We're committed to eco-friendly practices, from sourcing organic materials to responsible manufacturing. Modern fashion with a conscience." },
  { label: 'Join the movement', words: ['Be Part', 'Of', 'MODRN'], bg: '#0a0a0a', fg: '#fff', accent: '#e8ff58',
    body: "Discover curated collections that celebrate individuality. Shop MODRN and express your unique modern style today." },
];

const TRAIL_IMAGES = [
  'https://modrn.in/cdn/shop/files/6_d3dfc0d1-d138-445a-a41c-267f5b409239.png?v=1777550332&width=360',
  'https://modrn.in/cdn/shop/files/1_b315a94e-b891-47a2-a686-e8ee44883317.png?v=1777466034&width=600',
  'https://modrn.in/cdn/shop/files/burn_fuel.png?v=1777025982&width=360',
  'https://modrn.in/cdn/shop/files/LessWheels_1_blk.png?v=1777291909&width=360',
  'https://modrn.in/cdn/shop/files/1_051c49be-0143-4b7b-9077-ada954ecb1af.png?v=1777550332&width=600',
  'https://modrn.in/cdn/shop/files/WhoNeedRoads_1.png?v=1777282143&width=360',
  'https://modrn.in/cdn/shop/files/back_again.png?v=1777025982&width=360',
  'https://modrn.in/cdn/shop/files/first_I_drink_coffee.png?v=1777025982&width=360',
  'https://modrn.in/cdn/shop/files/BuiltToBurnFuel_5.png?v=1777272341&width=600',
  'https://modrn.in/cdn/shop/files/2_e2b912cb-7af2-42fc-9510-41022a9fd1f6.png?v=1777469735&width=360',
  'https://modrn.in/cdn/shop/files/WhoNeedRoads_3.png?v=1777282144&width=600',
];

/* ------------------------------------------------------------------ */
/* Image cursor trail (rotation + caption tag)                        */
/* ------------------------------------------------------------------ */
const ImageTrail = ({ items, target, maxImages = 5, distanceDivisor = 16, fade = 1300 }) => {
  const refs = useRef(items.map(() => createRef()));

  useEffect(() => {
    const el = target?.current;
    if (!el) return;
    const state = { globalIndex: 0, last: { x: 0, y: 0 }, z: 1 };

    const activate = (node, x, y) => {
      const rect = el.getBoundingClientRect();
      node.style.left = `${x - rect.left}px`;
      node.style.top = `${y - rect.top + el.scrollTop}px`;
      if (state.z > 40) state.z = 1;
      node.style.zIndex = String(state.z++);
      const tilt = (state.globalIndex % 2 === 0 ? 1 : -1) * (4 + (state.globalIndex % 5));
      node.style.setProperty('--tilt', `${tilt}deg`);
      node.dataset.status = 'active';
      clearTimeout(node._t);
      node._t = setTimeout(() => (node.dataset.status = 'inactive'), fade);
      state.last = { x, y };
    };

    const onMove = (x, y) => {
      if (Math.hypot(x - state.last.x, y - state.last.y) <= window.innerWidth / distanceDivisor) return;
      const list = refs.current;
      const lead = list[state.globalIndex % list.length]?.current;
      const tailIdx = ((state.globalIndex - maxImages) % list.length + list.length) % list.length;
      const tail = list[tailIdx]?.current;
      if (lead) activate(lead, x, y);
      if (tail) tail.dataset.status = 'inactive';
      state.globalIndex++;
    };

    const m = (e) => onMove(e.clientX, e.clientY);
    const t = (e) => { const p = e.touches[0]; if (p) onMove(p.clientX, p.clientY); };
    el.addEventListener('mousemove', m);
    el.addEventListener('touchmove', t, { passive: true });
    return () => {
      el.removeEventListener('mousemove', m);
      el.removeEventListener('touchmove', t);
    };
  }, [target, items, maxImages, distanceDivisor, fade]);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[60] overflow-hidden">
      {items.map((src, i) => (
        <figure
          key={i}
          ref={refs.current[i]}
          data-status="inactive"
          className="trail-img absolute m-0"
          style={{ width: 'clamp(7rem,12vw,11rem)', height: 'clamp(9rem,15vw,14rem)' }}
        >
          <img src={src} alt="" className="block h-full w-full rounded-[1.1rem] object-cover shadow-2xl" />
        </figure>
      ))}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Flow section                                                       */
/* ------------------------------------------------------------------ */
export const BrandStorySection = ({ data }) => (
  <section
    data-flow-section
    aria-label={data.label}
    className="relative min-h-screen w-full overflow-hidden"
  >
    <div
      data-flow-inner
      className="flow-art-container relative flex min-h-screen w-full flex-col justify-between gap-6 px-[5vw] pt-[clamp(2.5rem,8vw,5vw)] pb-[5vw] will-change-transform"
      style={{ transformOrigin: 'bottom left', backgroundColor: data.bg, color: data.fg }}
    >
      {/* grain texture */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay [background-image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%222%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>')]" />



      {/* headline */}
      <div className="relative z-[70]">
        <h2 className="text-[clamp(2.25rem,11vw,15rem)] font-extrabold uppercase leading-[0.82] tracking-tighter">
          {data.words.map((w, i) => (
            <span key={i} className="block overflow-hidden">
              <span data-flow-word className="inline-block">{w}</span>
            </span>
          ))}
        </h2>
      </div>


      {/* body */}
      <p className="relative z-[70] mt-auto max-w-[48ch] text-[clamp(1rem,2.4vw,1.9rem)] font-normal leading-relaxed" style={{ opacity: 0.9 }}>
        {data.body}
      </p>
    </div>
  </section>
);

/* ------------------------------------------------------------------ */
/* Story                                                              */
/* ------------------------------------------------------------------ */
export const BrandStory = () => (
  <BrandStoryStage aria-label="Brand story presentation">
    {SECTIONS.map((data, i) => (
      <BrandStorySection key={i} data={data} />
    ))}
  </BrandStoryStage>
);

const BrandStoryStage = ({ children, className, 'aria-label': ariaLabel = 'Story scroll' }) => {
  const containerRef = useRef(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useGSAP(
    () => {
      if (!containerRef.current || reducedMotion) return;

      const sections = Array.from(containerRef.current.querySelectorAll('[data-flow-section]'));
      if (sections.length === 0) return;

      const triggers = [];
      const allWords = [];

      sections.forEach((section, i) => {
        gsap.set(section, { zIndex: i + 1 });
        const inner = section.querySelector('.flow-art-container');
        if (!inner) return;

        // headline word reveal — words animate FROM below their mask TO their
        // resting position. fromTo guarantees they always end up visible.
        const words = section.querySelectorAll('[data-flow-word]');
        words.forEach((w) => allWords.push(w));
        const reveal = gsap.fromTo(
          words,
          { yPercent: 110 },
          {
            yPercent: 0,
            duration: 0.8,
            ease: 'power3.out',
            stagger: 0.08,
            scrollTrigger: { trigger: section, start: 'top 75%', toggleActions: 'play none none none' },
          }
        );
        if (reveal.scrollTrigger) triggers.push(reveal.scrollTrigger);

        // rotation card-flip — scrub:0.6 smooths the interpolation so the
        // transform never jumps a full frame in one tick under Lenis.
        if (i > 0) {
          gsap.set(inner, {
            rotation: 30,
            transformOrigin: 'bottom left',
            force3D: true,
            willChange: 'transform',
          });
          const tween = gsap.to(inner, {
            rotation: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'top 25%',
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          });
          if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
        }

        if (i < sections.length - 1) {
          triggers.push(
            ScrollTrigger.create({
              trigger: section,
              start: 'bottom bottom',
              end: 'bottom top',
              pin: true,
              pinSpacing: false,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            })
          );
        }
      });

      // Run refresh after the layout settles so pin offsets are correct.
      requestAnimationFrame(() => ScrollTrigger.refresh());
      return () => {
        triggers.forEach((t) => t.kill());
        // safety: ensure words are visible after teardown
        gsap.set(allWords, { yPercent: 0 });
      };
    },
    { scope: containerRef, dependencies: [React.Children.count(children), reducedMotion] }
  );

  return (
    <>
      <style>{`
        .trail-img { transform: translate(-50%,-50%) scale(0) rotate(var(--tilt,0deg)); opacity: 0; transition: transform .6s cubic-bezier(.16,1,.3,1), opacity .5s ease; }
        .trail-img[data-status="active"] { transform: translate(-50%,-50%) scale(1) rotate(var(--tilt,0deg)); opacity: 1; }
      `}</style>

      <main ref={containerRef} aria-label={ariaLabel} className={cx('relative w-full bg-black', className)}>
        {!reducedMotion && (
          <ImageTrail items={TRAIL_IMAGES} target={containerRef} maxImages={6} distanceDivisor={16} fade={1300} />
        )}
        {children}
      </main>
    </>
  );
};

export default BrandStory;