import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const footerLinks = {
  Shop: [
    { label: 'New Arrivals', href: '#' },
    { label: 'Best Sellers', href: '#' },
    { label: 'Collections', href: '#' },
    { label: 'Sale', href: '#' },
  ],
  About: [
    { label: 'Our Story', href: '#' },
    { label: 'Sustainability', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Press', href: '#' },
  ],
  Support: [
    { label: 'Contact Us', href: '#' },
    { label: 'FAQ', href: '#' },
    { label: 'Shipping Info', href: '#' },
    { label: 'Returns', href: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms & Conditions', href: '#' },
    { label: 'Cookie Policy', href: '#' },
    { label: 'Accessibility', href: '#' },
  ],
};

const Icon = ({ path, viewBox = '0 0 24 24' }) => (
  <svg viewBox={viewBox} className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
    {path}
  </svg>
);

const socialLinks = [
  {
    name: 'Instagram',
    href: '#',
    icon: (
      <Icon
        path={
          <>
            <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16Zm0 1.8c-3.15 0-3.5.01-4.74.07-1.14.05-1.76.24-2.17.4-.55.21-.94.47-1.35.88-.41.41-.67.8-.88 1.35-.16.41-.35 1.03-.4 2.17-.06 1.24-.07 1.59-.07 4.74s.01 3.5.07 4.74c.05 1.14.24 1.76.4 2.17.21.55.47.94.88 1.35.41.41.8.67 1.35.88.41.16 1.03.35 2.17.4 1.24.06 1.59.07 4.74.07s3.5-.01 4.74-.07c1.14-.05 1.76-.24 2.17-.4.55-.21.94-.47 1.35-.88.41-.41.67-.8.88-1.35.16-.41.35-1.03.4-2.17.06-1.24.07-1.59.07-4.74s-.01-3.5-.07-4.74c-.05-1.14-.24-1.76-.4-2.17a3.6 3.6 0 0 0-.88-1.35 3.6 3.6 0 0 0-1.35-.88c-.41-.16-1.03-.35-2.17-.4-1.24-.06-1.59-.07-4.74-.07Zm0 3.06a4.98 4.98 0 1 1 0 9.96 4.98 4.98 0 0 1 0-9.96Zm0 1.8a3.18 3.18 0 1 0 0 6.36 3.18 3.18 0 0 0 0-6.36Zm5.18-3.2a1.16 1.16 0 1 1 0 2.32 1.16 1.16 0 0 1 0-2.32Z" />
          </>
        }
      />
    ),
  },
  {
    name: 'X',
    href: '#',
    icon: (
      <Icon
        path={
          <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.66l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23Zm-1.16 17.52h1.83L7.01 4.12H5.04l12.04 15.65Z" />
        }
      />
    ),
  },
  {
    name: 'Facebook',
    href: '#',
    icon: (
      <Icon
        path={
          <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.9 3.78-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.9h-2.34V22c4.78-.76 8.43-4.92 8.43-9.94Z" />
        }
      />
    ),
  },
  {
    name: 'TikTok',
    href: '#',
    icon: (
      <Icon
        path={
          <path d="M16.6 5.82a4.28 4.28 0 0 1-1.06-2.82h-3.1v12.2a2.59 2.59 0 0 1-2.59 2.5 2.59 2.59 0 1 1 .7-5.08V9.45a5.7 5.7 0 0 0-.7-.04 5.69 5.69 0 1 0 5.69 5.69V8.96a7.34 7.34 0 0 0 4.3 1.38v-3.1a4.3 4.3 0 0 1-3.24-1.42Z" />
        }
      />
    ),
  },
];

/**
 * Interactive canvas text built out of particles that scatter on cursor
 * proximity and ease back to form the original letters. Pure 2D canvas —
 * no extra deps.
 *
 * Motion model: each particle keeps a velocity. A spring pulls it toward
 * its home position while pointer proximity adds a repulsion impulse.
 * Velocity is damped every frame, and the whole step is scaled by the real
 * frame delta so motion stays consistent regardless of refresh rate. The
 * result is soft, weighty, buttery movement instead of hard snapping.
 *
 * Props:
 *   text             — the word to render (default "MODRN")
 *   color            — particle color as [r,g,b] (default light gray)
 *   animationForce   — how hard particles fly away from the cursor
 *   particleDensity  — sampling step; lower = more particles, heavier
 *   stiffness        — spring strength pulling particles home (0–1)
 *   damping          — velocity retention per frame (0–1, higher = floatier)
 */
const BrandSignatureText = ({
  text = 'MODRN',
  color = [200, 200, 205],
  className = '',
  animationForce = 26,
  particleDensity = 4,
  stiffness = 0.045,
  damping = 0.82,
}) => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const animationIdRef = useRef(null);
  const particlesRef = useRef([]);
  const pointerRef = useRef({});
  const hasPointerRef = useRef(false);
  const lastTimeRef = useRef(0);
  const interactionRadiusRef = useRef(120);
  const textBoxRef = useRef({ str: text });

  const [canvasSize, setCanvasSize] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  }));

  const rand = (max = 1, min = 0, dec = 0) =>
    +(min + Math.random() * (max - min)).toFixed(dec);

  class ParticleClass {
    constructor(x, y, rgb = color) {
      // home position
      this.ox = x;
      this.oy = y;
      // current position
      this.cx = x;
      this.cy = y;
      // velocity
      this.vx = 0;
      this.vy = 0;
      this.r = rand(22, 12) / 10; // 1.2 – 2.2
      // tiny per-particle variation so they don't move in lockstep
      this.k = stiffness * (0.85 + Math.random() * 0.3);
      this.f = animationForce * (0.85 + Math.random() * 0.3);
      this.rgb = rgb.map((c) =>
        Math.max(0, Math.min(255, c + rand(10, -10)))
      );
    }

    draw() {
      const ctx = ctxRef.current;
      if (!ctx) return;
      ctx.fillStyle = `rgb(${this.rgb[0]},${this.rgb[1]},${this.rgb[2]})`;
      ctx.beginPath();
      ctx.arc(this.cx, this.cy, this.r, 0, 2 * Math.PI);
      ctx.fill();
    }

    /**
     * Advance one step. `dt` is normalized to 60fps (1 = a 16.67ms frame)
     * so the spring/damping feel identical on 60Hz and 144Hz displays.
     */
    move(interactionRadius, hasPointer, dt) {
      // 1) Pointer repulsion → adds to velocity (impulse, not teleport)
      if (
        hasPointer &&
        pointerRef.current.x !== undefined &&
        pointerRef.current.y !== undefined
      ) {
        const dx = this.cx - pointerRef.current.x;
        const dy = this.cy - pointerRef.current.y;
        const dist = Math.hypot(dx, dy) || 0.0001;

        if (dist < interactionRadius) {
          // smooth falloff: strongest at center, eased to 0 at the edge
          const t = 1 - dist / interactionRadius;
          const push = t * t * this.f; // quadratic ease for a soft edge
          this.vx += (dx / dist) * push * dt;
          this.vy += (dy / dist) * push * dt;
        }
      }

      // 2) Spring back toward home → adds to velocity
      const sx = (this.ox - this.cx) * this.k;
      const sy = (this.oy - this.cy) * this.k;
      this.vx += sx * dt;
      this.vy += sy * dt;

      // 3) Damping (frame-rate independent)
      const d = Math.pow(damping, dt);
      this.vx *= d;
      this.vy *= d;

      // 4) Integrate
      this.cx += this.vx * dt;
      this.cy += this.vy * dt;

      this.draw();
    }
  }

  const dottify = () => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    const tb = textBoxRef.current;
    if (!ctx || !canvas || !tb.x || !tb.y || !tb.w || !tb.h) return;

    const data = ctx.getImageData(tb.x, tb.y, tb.w, tb.h).data;
    const pixels = [];
    for (let i = 0; i < data.length; i += 4) {
      const idx = i / 4;
      const px = idx % tb.w;
      const py = Math.floor(idx / tb.w);
      if (data[i + 3] && !(px % particleDensity) && !(py % particleDensity)) {
        pixels.push({ x: px, y: py });
      }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const next = [];
    for (let i = 0; i < pixels.length; i++) {
      const p = pixels[i];
      const existing = particlesRef.current[i];
      // Reuse particle objects across re-renders to preserve velocity/position,
      // just retarget their home — keeps motion continuous on resize.
      if (existing) {
        existing.ox = tb.x + p.x;
        existing.oy = tb.y + p.y;
        next.push(existing);
      } else {
        next.push(new ParticleClass(tb.x + p.x, tb.y + p.y));
      }
    }
    particlesRef.current = next;
  };

  const write = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    const tb = textBoxRef.current;
    tb.str = text;
    tb.h = Math.floor(canvas.width / Math.max(tb.str.length, 1));

    interactionRadiusRef.current = Math.max(25, tb.h * 0.28);

    ctx.font = `900 ${tb.h}px Verdana, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    tb.w = Math.round(ctx.measureText(tb.str).width);
    tb.x = Math.floor(0.5 * (canvas.width - tb.w));
    tb.y = Math.floor(0.5 * (canvas.height - tb.h));

    ctx.fillStyle = `rgb(${color[0]},${color[1]},${color[2]})`;
    ctx.fillText(tb.str, 0.5 * canvas.width, 0.5 * canvas.height);
    dottify();
  };

  const animate = (now) => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    // Frame delta normalized to 60fps, clamped so a tab refocus
    // doesn't cause a giant jump.
    if (!lastTimeRef.current) lastTimeRef.current = now;
    let dt = (now - lastTimeRef.current) / 16.6667;
    lastTimeRef.current = now;
    if (!Number.isFinite(dt) || dt <= 0) dt = 1;
    dt = Math.min(dt, 3);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const particles = particlesRef.current;
    for (let i = 0; i < particles.length; i++) {
      particles[i].move(interactionRadiusRef.current, hasPointerRef.current, dt);
    }
    animationIdRef.current = requestAnimationFrame(animate);
  };

  const initialize = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    write();
  };

  useEffect(() => {
    const handleResize = () => {
      setCanvasSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Bind ctx once on mount and run the loop continuously.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctxRef.current = ctx;
    initialize();
    lastTimeRef.current = 0;
    animationIdRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-render text on prop/size changes (particles are reused, so motion
  // continues smoothly rather than resetting).
  useEffect(() => {
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, color, animationForce, particleDensity, canvasSize]);

  const handlePointerMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    pointerRef.current.x = (e.clientX - rect.left) * scaleX;
    pointerRef.current.y = (e.clientY - rect.top) * scaleY;
    hasPointerRef.current = true;
  };

  const handlePointerLeave = () => {
    hasPointerRef.current = false;
    pointerRef.current.x = undefined;
    pointerRef.current.y = undefined;
  };

  const handlePointerEnter = () => {
    hasPointerRef.current = true;
  };

  return (
    <canvas
      ref={canvasRef}
      className={`h-full w-full cursor-none ${className}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerEnter={handlePointerEnter}
    />
  );
};

export const Footer = ({ text = 'MODRN' }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="relative h-[100dvh] min-h-[36rem] w-full overflow-hidden bg-[#0a0a0a] text-[#f5f3ec]"
      aria-label="Brand finale"
    >
      {/* Interactive particle wordmark fills the whole stage */}
      <div className="absolute inset-0">
        <BrandSignatureText text={text} />
      </div>

      {/* Editorial wordmark watermark */}
      <div className="pointer-events-none relative z-0 -mt-2 select-none overflow-hidden">
        <p className="bg-gradient-to-b pt-24 from-white/[0.06] to-transparent bg-clip-text text-center text-[20vw] font-bold leading-[0.8] tracking-tighter text-transparent">
          MODRN
        </p>
      </div>

      {/* Footer content — social + copyright pinned to the bottom */}
      <div className="absolute inset-x-0 bottom-0 z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="flex flex-col items-center justify-between gap-6 py-10 md:flex-row"
        >
          <div className="flex items-center gap-3">
            {socialLinks.map((social) => (
              <motion.a
                key={social.name}
                href={social.href}
                aria-label={social.name}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.94 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/60 transition-colors hover:border-white/30 hover:text-white"
              >
                <span className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500/20 via-violet-500/20 to-rose-500/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <span className="relative">{social.icon}</span>
              </motion.a>
            ))}
          </div>

          <div className="text-center text-xs text-white/40 md:text-right">
            <p>&copy; {currentYear} MODRN Fashion. All rights reserved.</p>
            <p className="mt-1 text-white/30">
              Crafted with passion. Designed with purpose. Built to last.
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export { BrandSignatureText };
export default Footer;
