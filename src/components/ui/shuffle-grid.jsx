import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

/* -------------------------------------------------------------------------- */
/*  Utility — drop your own cn() / shadcn tokens in. Self-contained here so    */
/*  the artifact runs standalone.                                              */
/* -------------------------------------------------------------------------- */
function cn(...parts) {
  return parts.filter(Boolean).join(' ');
}

const squareData = [
  {
    id: 1,
    src: 'https://modrn.in/cdn/shop/files/6_d3dfc0d1-d138-445a-a41c-267f5b409239.png?v=1777550332&width=360',
  },
  {
    id: 2,
    src: 'https://modrn.in/cdn/shop/files/1_b315a94e-b891-47a2-a686-e8ee44883317.png?v=1777466034&width=600',
  },
  {
    id: 3,
    src: 'https://modrn.in/cdn/shop/files/burn_fuel.png?v=1777025982&width=360',
  },
  {
    id: 4,
    src: 'https://modrn.in/cdn/shop/files/LessWheels_1_blk.png?v=1777291909&width=360',
  },
  {
    id: 5,
    src: 'https://modrn.in/cdn/shop/files/1_051c49be-0143-4b7b-9077-ada954ecb1af.png?v=1777550332&width=600',
  },
  {
    id: 6,
    src: 'https://modrn.in/cdn/shop/files/WhoNeedRoads_1.png?v=1777282143&width=360',
  },
  {
    id: 7,
    src: 'https://modrn.in/cdn/shop/files/back_again.png?v=1777025982&width=360',
  },
  {
    id: 8,
    src: 'https://modrn.in/cdn/shop/files/first_I_drink_coffee.png?v=1777025982&width=360',
  },
  {
    id: 9,
    src: 'https://modrn.in/cdn/shop/files/BuiltToBurnFuel_5.png?v=1777272341&width=600',
  },
  {
    id: 10,
    src: 'https://modrn.in/cdn/shop/files/2_e2b912cb-7af2-42fc-9510-41022a9fd1f6.png?v=1777469735&width=360',
  },
  {
    id: 11,
    src: 'https://modrn.in/cdn/shop/files/WhoNeedRoads_3.png?v=1777282144&width=600',
  },
  {
    id: 12,
    src: 'https://modrn.in/cdn/shop/files/6_d3dfc0d1-d138-445a-a41c-267f5b409239.png?v=1777550332&width=360',
  },
  {
    id: 13,
    src: 'https://modrn.in/cdn/shop/files/1_b315a94e-b891-47a2-a686-e8ee44883317.png?v=1777466034&width=600',
  },
  {
    id: 14,
    src: 'https://modrn.in/cdn/shop/files/burn_fuel.png?v=1777025982&width=360',
  },
  {
    id: 15,
    src: 'https://modrn.in/cdn/shop/files/LessWheels_1_blk.png?v=1777291909&width=360',
  },
  {
    id: 16,
    src: 'https://modrn.in/cdn/shop/files/BuiltToBurnFuel_5.png?v=1777272341&width=600',
  },
];

const shuffle = (array) => {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/* -------------------------------------------------------------------------- */
/*  Shuffle grid — monochrome editorial gallery                                */
/*  - layout animation handles the swap on a calm, well-damped spring          */
/*  - at rest tiles read as a desaturated, dimmed contact sheet                */
/*  - hovering one tile brings it to full colour + lift + silver ring while    */
/*    its neighbours recede — the classic premium-gallery focus effect         */
/* -------------------------------------------------------------------------- */
const ShuffleGrid = () => {
  const timeoutRef = useRef(null);
  const [squares, setSquares] = useState(() => shuffle(squareData));
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    const run = () => {
      setSquares(shuffle(squareData));
      timeoutRef.current = setTimeout(run, 3600);
    };
    timeoutRef.current = setTimeout(run, 3600);
    return () => clearTimeout(timeoutRef.current);
  }, []);

  return (
    <div className="relative">
      {/* monochrome silver halo behind the grid — depth, no colour wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-8 -z-10 rounded-[2.5rem] bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.10),transparent_60%),radial-gradient(circle_at_80%_90%,rgba(180,186,198,0.08),transparent_60%)] blur-3xl" />

      {/* thin framing border, echoing the slideshow section's monochrome rail */}
      <div className="absolute -inset-3 -z-10 rounded-[2rem] border border-white/10" />

      <div className="grid grid-cols-4 grid-rows-4 gap-2 sm:gap-3 md:gap-4 aspect-square w-full">
        {squares.map((sq) => {
          const isHovered = hovered === sq.id;
          const dimmed = hovered !== null && !isHovered;
          return (
            <motion.div
              key={sq.id}
              layout
              onHoverStart={() => setHovered(sq.id)}
              onHoverEnd={() => setHovered(null)}
              transition={{
                // calm, slightly overdamped spring → buttery swap, no jitter
                layout: { type: 'spring', stiffness: 170, damping: 26, mass: 1 },
                default: { type: 'spring', stiffness: 320, damping: 28 },
              }}
              animate={{
                scale: isHovered ? 1.06 : dimmed ? 0.985 : 1,
                opacity: dimmed ? 0.4 : 1,
                zIndex: isHovered ? 5 : 1,
              }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                'group relative h-full w-full cursor-pointer overflow-hidden rounded-2xl ring-1',
                'transition-[box-shadow,filter] duration-500 ease-out',
                isHovered
                  ? 'ring-white/40 shadow-[0_18px_50px_-12px_rgba(0,0,0,0.85)] [filter:grayscale(0)_brightness(1)]'
                  : 'ring-white/10 [filter:grayscale(0.45)_brightness(0.82)]'
              )}
              style={{
                backgroundImage: `url(${sq.src})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                willChange: 'transform, filter',
              }}
            >
              {/* soft bottom vignette grounds each tile on the dark section */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              {/* silver sheen sweeps in on hover — same chrome family as the hero */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/15 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  Animated word that swaps on a loop — keeps the headline alive              */
/* -------------------------------------------------------------------------- */
const ROTATING = ['shop new', 'express style', 'stay modern', 'be unique'];

const RotatingWord = () => {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((v) => (v + 1) % ROTATING.length), 2400);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="relative inline-block align-baseline">
      <AnimatePresence mode="wait">
        <motion.span
          key={ROTATING[idx]}
          initial={{ y: '0.5em', opacity: 0, filter: 'blur(8px)' }}
          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
          exit={{ y: '-0.5em', opacity: 0, filter: 'blur(8px)' }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          className="inline-block bg-clip-text pb-1 italic text-transparent animate-shimmer"
          style={{
            // hero's liquid-silver chrome — symmetric palindrome → seamless loop
            backgroundImage:
              'linear-gradient(90deg,#868c96 0%,#aab0ba 8%,#ffffff 16%,#d9dce2 24%,#969ca6 33%,#c3c8d0 42%,#ffffff 50%,#c3c8d0 58%,#969ca6 67%,#d9dce2 76%,#ffffff 84%,#aab0ba 92%,#868c96 100%)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {ROTATING[idx]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

export const ShopTheLook = () => {
  return (
    <section className="relative w-full overflow-hidden bg-[#030303] py-24 text-white md:py-32">
      {/* faint grid texture — same motif as the slideshow section above */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:56px_56px]" />

      {/* ambient monochrome silver glow — matches the hero / slideshow palette */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-1/4 top-0 h-[55vh] w-[55vh] rounded-full bg-white/[0.06] blur-[130px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-1/4 bottom-0 h-[55vh] w-[55vh] rounded-full bg-[#b4bac6]/[0.07] blur-[130px]"
      />

      <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 md:grid-cols-2 md:gap-10">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
        >
          <motion.h3
            variants={item}
            className="text-[clamp(2.2rem,7vw,5rem)] font-extrabold leading-[0.95] tracking-tighter text-white"
          >
            Your Next
            <br />
            <RotatingWord />
            <br />
            Piece Awaits.
          </motion.h3>

          <motion.p
            variants={item}
            className="my-7 max-w-md text-lg leading-relaxed text-white/60"
          >
            Curated collections for the modern individual. Premium quality, sustainable practices, and timeless design. Elevate your wardrobe with MODRN.
          </motion.p>

          <motion.div variants={item} className="flex flex-wrap items-center gap-3">
            <button
              className={cn(
                'group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-white px-7 py-3.5 text-sm font-medium text-black',
                'transition-transform duration-300 hover:scale-[1.03] active:scale-95'
              )}
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-black/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <span className="relative">Shop Collection</span>
              <svg
                className="relative h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotate: -3 }}
          whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        >
          <ShuffleGrid />
        </motion.div>
      </div>
    </section>
  );
};

export default ShopTheLook;