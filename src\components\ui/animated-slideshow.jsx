import * as React from 'react';
import { MotionConfig, motion } from 'framer-motion';

/* ------------------------------------------------------------------ */
/* utils                                                              */
/* ------------------------------------------------------------------ */
function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

function splitText(text) {
  const words = text.split(' ').map((word) => word.concat(' '));
  const characters = words.map((word) => word.split('')).flat(1);
  return { words, characters };
}

/* ------------------------------------------------------------------ */
/* context                                                            */
/* ------------------------------------------------------------------ */
const LookbookSliderContext = React.createContext(undefined);

function useLookbookSliderContext() {
  const context = React.useContext(LookbookSliderContext);
  if (context === undefined) {
    throw new Error('useLookbookSliderContext must be used within a LookbookSlider');
  }
  return context;
}

export const LookbookSlider = React.forwardRef(({ children, className, ...props }, ref) => {
  const [activeSlide, setActiveSlide] = React.useState(0);
  const changeSlide = React.useCallback((index) => setActiveSlide(index), []);
  return (
    <LookbookSliderContext.Provider value={{ activeSlide, changeSlide }}>
      <div ref={ref} className={className} {...props}>
        {children}
      </div>
    </LookbookSliderContext.Provider>
  );
});
LookbookSlider.displayName = 'LookbookSlider';

/* ------------------------------------------------------------------ */
/* staggered character flip text                                      */
/* ------------------------------------------------------------------ */
export const TextStaggerHover = React.forwardRef(
  ({ text, index, className, subtitle, description, icon, ...props }, ref) => {
    const { activeSlide, changeSlide } = useLookbookSliderContext();
    const { characters } = splitText(text);
    const isActive = activeSlide === index;
    const handleMouse = () => changeSlide(index);
    return (
      <div
        ref={ref}
        className={cn('relative cursor-pointer group', className)}
        onMouseEnter={handleMouse}
        {...props}
      >
        <motion.div
          className={cn('mb-3 flex items-center', icon && 'gap-3')}
          animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0.5, x: -10 }}
          transition={{ duration: 0.4 }}
        >
          {icon && <span className="text-3xl">{icon}</span>}
          <div>
            <span
              className={cn(
                'relative inline-block origin-bottom overflow-hidden text-[clamp(2.2rem,7vw,5rem)] font-extrabold uppercase leading-[0.95] tracking-tighter',
                isActive ? 'text-white' : 'text-gray-500'
              )}
            >
              {characters.map((char, i) => (
                <span key={`${char}-${i}`} className="relative inline-block overflow-hidden">
                  <MotionConfig
                    transition={{
                      delay: i * 0.025,
                      duration: 0.3,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                  >
                    <motion.span
                      className="inline-block"
                      initial={{ y: '0%' }}
                      animate={isActive ? { y: '-110%' } : { y: '0%' }}
                    >
                      {char}
                      {char === ' ' && i < characters.length - 1 && <>&nbsp;</>}
                    </motion.span>
                    <motion.span
                      className="absolute left-0 top-0 inline-block"
                      initial={{ y: '110%' }}
                      animate={isActive ? { y: '0%' } : { y: '110%' }}
                    >
                      {char}
                    </motion.span>
                  </MotionConfig>
                </span>
              ))}
            </span>
          </div>
        </motion.div>

        {(subtitle || description) && (
          <motion.div
            className={cn('space-y-2', icon && 'ml-16')}
            animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {subtitle && (
              <p className="text-sm font-semibold uppercase tracking-widest text-transparent bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text">
                {subtitle}
              </p>
            )}
            {description && (
              <p className="text-sm leading-relaxed text-gray-300 max-w-xs">
                {description}
              </p>
            )}
          </motion.div>
        )}

        {/* Underline indicator */}
        <motion.div
          className="absolute -bottom-2 left-4 h-1 bg-gradient-to-r from-gray-400 to-white-400"
          animate={isActive ? { width: '120px', opacity: 1 } : { width: '0px', opacity: 0 }}
          transition={{ duration: 0.4 }}
        />
      </div>
    );
  }
);
TextStaggerHover.displayName = 'TextStaggerHover';

/* ------------------------------------------------------------------ */
/* image panel with clip reveal + scale parallax                      */
/* ------------------------------------------------------------------ */
const clipPathVariants = {
  visible: {
    clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
    scale: 1,
  },
  hidden: {
    clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)',
    scale: 1.15,
  },
};

export const LookbookSliderImageWrap = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'grid overflow-hidden [&>*]:col-start-1 [&>*]:col-end-1 [&>*]:row-start-1 [&>*]:row-end-1 [&>*]:size-full',
      className
    )}
    {...props}
  />
));
LookbookSliderImageWrap.displayName = 'LookbookSliderImageWrap';

export const LookbookSliderImage = React.forwardRef(
  ({ index, imageUrl, className, ...props }, ref) => {
    const { activeSlide } = useLookbookSliderContext();
    const isActive = activeSlide === index;
    return (
      <div className="relative size-full overflow-hidden">
        <motion.img
          ref={ref}
          className={cn('inline-block size-full object-cover align-middle', className)}
          transition={{ ease: [0.33, 1, 0.68, 1], duration: 0.9 }}
          variants={clipPathVariants}
          animate={isActive ? 'visible' : 'hidden'}
          src={imageUrl}
          {...props}
        />
        {/* grain / vignette overlay for depth */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />
      </div>
    );
  }
);
LookbookSliderImage.displayName = 'LookbookSliderImage';

/* ------------------------------------------------------------------ */
/* demo                                                               */
/* ------------------------------------------------------------------ */
const DEFAULT_SLIDES = [
  {
    id: 'slide-1',
    title: 'Premium Fabric',
    imageUrl: 'https://res.cloudinary.com/dwngo5vya/image/upload/v1779447541/Fabric_fpnvds.gif',
  },
  {
    id: 'slide-2',
    title: 'Perfect Fit',
    imageUrl: 'https://res.cloudinary.com/dwngo5vya/image/upload/v1779447542/fit_o1sysh.gif',
  },
  {
    id: 'slide-3',
    title: 'Timeless Design',
    imageUrl: 'https://res.cloudinary.com/dwngo5vya/image/upload/v1779447713/design_i0jkzk.gif',
  },
  {
    id: 'slide-4',
    title: 'Luxury Feel',
    imageUrl: 'https://res.cloudinary.com/dwngo5vya/image/upload/v1779447540/feel_ojn5dn.gif',
  },
  {
    id: 'slide-5',
    title: 'Refined Details',
    imageUrl: 'https://res.cloudinary.com/dwngo5vya/image/upload/v1779447543/detail_lvhosa.gif',
  },
];

export function CollectionShowcase({ slides = DEFAULT_SLIDES }) {
  return (
    <LookbookSlider
      className="relative min-h-svh w-full overflow-hidden bg-[#0a0a0a] px-6 py-16 text-[#f5f3ec] md:px-16 md:py-24"
      style={{
        '--accent': '#e8ff58',
        '--muted': '#7a7873',
        '--rail': '#26241f',
      }}
    >
      {/* ambient background glow */}
      <div
        className="pointer-events-none absolute -left-1/4 top-0 h-[60vh] w-[60vh] rounded-full opacity-30 blur-[120px]"
        style={{ background: 'radial-gradient(circle, var(--accent), transparent 70%)' }}
      />
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:48px_48px]" />

      {/* main grid */}
      <div className="relative z-10 grid grid-cols-1 items-center gap-10 md:grid-cols-[1fr_minmax(280px,42%)] md:gap-12">
        {/* left: the words */}
        <div className="flex flex-col gap-6 md:gap-10">
          {slides.map((slide, index) => (
            <TextStaggerHover
              key={slide.id ?? slide.title}
              index={index}
              text={slide.title}
              className="transition-all"
            />
          ))}
        </div>

        {/* right: image */}
        <motion.div className="relative group">
          {/* Glow effect */}
          <motion.div
            className="absolute -inset-6 -z-10 rounded-[2.5rem] opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500"
            style={{
              background: 'radial-gradient(circle, #fff, transparent 70%)',
            }}
          />
          {/* Border glow */}
          <div className="absolute -inset-3 -z-10 rounded-[2rem] border border-[var(--rail)] group-hover:border-gray-300/80 transition-colors" />
          <LookbookSliderImageWrap className="aspect-[3/4] w-full rounded-2xl shadow-2xl group-hover:shadow-gray-300/40 transition-shadow">
            {slides.map((slide, index) => (
              <LookbookSliderImage
                key={slide.id ?? slide.title}
                index={index}
                imageUrl={slide.imageUrl}
                alt={slide.title}
                loading="eager"
                decoding="async"
              />
            ))}
          </LookbookSliderImageWrap>
        </motion.div>
      </div>
    </LookbookSlider>
  );
}

export default CollectionShowcase;