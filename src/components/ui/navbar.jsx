import React, { useState, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";

const menuItems = [
  { label: "Home", href: "#home" },
  { label: "Collections", href: "#collections" },
  { label: "About", href: "#about" },
  { label: "Shop", href: "#shop" },
  { label: "Contact", href: "#contact" },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState(null);
  const lastScrollY = useRef(0);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > lastScrollY.current && latest > 120 && !isOpen) {
      setHidden(true);
    } else {
      setHidden(false);
    }
    setScrolled(latest > 20);
    lastScrollY.current = latest;
  });

  return (
    <motion.nav
      animate={{ y: hidden ? "-130%" : 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50"
    >
      {/* Top scrim — keeps the logo + links legible when the bar is transparent */}
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/70 to-transparent transition-opacity duration-500 ${
          scrolled ? "opacity-0" : "opacity-100"
        }`}
      />

      <div className="px-4 pt-4 sm:px-6 lg:px-8">
        <div
          className={`mx-auto max-w-7xl transition-all duration-500 ${
            scrolled
              ? "rounded-3xl border border-white/10 bg-black/60 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.7)] backdrop-blur-2xl"
              : "rounded-3xl border border-transparent bg-transparent"
          }`}
        >
          <div className="flex h-20 items-center justify-between px-4 sm:h-24 sm:px-8">
            {/* Logo */}
            <button
              type="button"
              aria-label="MODRN home"
              className="group flex h-16 w-16 items-center justify-center rounded-md sm:h-[88px] sm:w-[88px]"
            >
              <img
                src="https://modrn-web-page-5udb.vercel.app/logo.png"
                alt="MODRN"
                className="h-12 w-12 object-contain transition-transform duration-300 group-hover:scale-110 sm:h-[72px] sm:w-[72px]"
                draggable="false"
              />
            </button>

            {/* Desktop nav with sliding highlight */}
            <div
              className="hidden items-center gap-2 lg:flex"
              onMouseLeave={() => setHovered(null)}
            >
              {menuItems.map((item, i) => (
                <a
                  key={item.label}
                  href={item.href}
                  onMouseEnter={() => setHovered(i)}
                  className="relative rounded-full px-5 py-2.5 text-base font-medium text-white/70 transition-colors duration-300 hover:text-white"
                >
                  {hovered === i && (
                    <motion.span
                      layoutId="nav-highlight"
                      className="absolute inset-0 rounded-full bg-white/10"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </a>
              ))}
            </div>

            {/* CTA */}
            <div className="hidden lg:block">
              <a
                href="#shop"
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-white px-7 py-3 text-base font-medium text-black transition-transform duration-300 hover:scale-[1.03]"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-black/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <span className="relative">Shop Now</span>
                <svg
                  className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 12h14M13 6l6 6-6 6"
                  />
                </svg>
              </a>
            </div>

            {/* Mobile toggle */}
            <button
              className="relative flex h-12 w-12 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 lg:hidden"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              <svg
                className="h-7 w-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 7h16M4 12h16M4 17h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile menu */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="overflow-hidden border-t border-white/10 lg:hidden"
              >
                <div className="space-y-1 px-4 py-5">
                  {menuItems.map((item, i) => (
                    <motion.a
                      key={item.label}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.05 }}
                      className="flex items-center justify-between rounded-xl px-4 py-3 text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                    >
                      {item.label}
                      <svg
                        className="h-4 w-4 opacity-40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 6l6 6-6 6"
                        />
                      </svg>
                    </motion.a>
                  ))}

                  <a
                    href="#shop"
                    onClick={() => setIsOpen(false)}
                    className="mt-3 flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-black"
                  >
                    Shop Now
                    <svg
                      className="h-3.5 w-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 12h14M13 6l6 6-6 6"
                      />
                    </svg>
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
