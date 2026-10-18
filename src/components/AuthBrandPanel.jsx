import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import logo from '../logo.png';

const SLIDE_INTERVAL = 5000;

export default function AuthBrandPanel({ slides, tagline = 'Social • Community • Relationships', footer }) {
  const [active, setActive] = useState(0);
  const [failedImages, setFailedImages] = useState({});
  const [paused, setPaused] = useState(false);

  const goTo = useCallback((index) => {
    setActive(((index % slides.length) + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (paused) return undefined;
    const timer = setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [paused, slides.length]);

  const markFailed = (index) => {
    setFailedImages((prev) => ({ ...prev, [index]: true }));
  };

  return (
    <div
      className="relative overflow-hidden bg-primary-900 text-white md:w-[46%] lg:w-1/2 hidden md:flex flex-col justify-between min-h-screen"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background image slides */}
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={slide.image}
            className={`absolute inset-0 transition-opacity duration-[1200ms] ease-in-out ${
              index === active ? 'opacity-100' : 'opacity-0'
            }`}
            aria-hidden={index !== active}
          >
            {!failedImages[index] ? (
              <img
                src={slide.image}
                alt=""
                className={`h-full w-full object-cover rc-slide-zoom ${
                  index === active ? 'rc-slide-zoom--animate' : ''
                }`}
                loading={index === 0 ? 'eager' : 'lazy'}
                onError={() => markFailed(index)}
              />
            ) : (
              <div className="h-full w-full brand-gradient" />
            )}
          </div>
        ))}
      </div>

      {/* Readability overlays */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(160deg, rgba(6,59,120,0.94) 0%, rgba(13,82,181,0.78) 42%, rgba(10,67,143,0.55) 100%)',
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-1/2"
        style={{
          background: 'linear-gradient(to top, rgba(4,32,66,0.92), transparent)',
        }}
      />
      <div
        className="absolute -top-24 -left-24 h-72 w-72 rounded-full opacity-30 blur-3xl"
        style={{ background: 'radial-gradient(circle, #18a84a 0%, transparent 70%)' }}
        aria-hidden="true"
      />
      <div
        className="absolute top-1/3 -right-20 h-64 w-64 rounded-full opacity-25 blur-3xl"
        style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      {/* Brand header */}
      <div className="relative z-10 px-10 pt-10 lg:px-14 lg:pt-12">
        <div className="flex items-center gap-3.5">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 p-2 ring-1 ring-white/20 backdrop-blur-sm">
            <img src={logo} alt="Rubavu Connect logo" className="h-full w-full object-contain" />
          </span>
          <div>
            <h1 className="text-2xl lg:text-[1.7rem] font-extrabold tracking-tight leading-none">
              Rubavu Connect
            </h1>
            <p className="mt-1 text-xs lg:text-sm font-medium text-primary-100/90">{tagline}</p>
          </div>
        </div>
      </div>

      {/* Slide copy */}
      <div className="relative z-10 px-10 pb-4 lg:px-14 lg:pb-6 max-w-xl">
        <div key={active} className="rc-copy">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] ring-1 ring-white/20 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-400 animate-pulse" />
            {slides[active].badge || 'Trusted community'}
          </span>
          <h2 className="text-[1.7rem] leading-tight lg:text-[2.3rem] lg:leading-[1.15] font-extrabold tracking-tight">
            {slides[active].title}
          </h2>
          <p className="mt-3.5 text-sm lg:text-base text-primary-100/95 leading-relaxed max-w-lg">
            {slides[active].description}
          </p>
        </div>

        {/* Controls: arrows + dots */}
        <div className="mt-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5" role="tablist" aria-label="Promotional slides">
            {slides.map((slide, index) => (
              <button
                key={slide.title}
                type="button"
                role="tab"
                aria-selected={index === active}
                aria-label={`Go to slide ${index + 1}`}
                onClick={() => goTo(index)}
                className={`h-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/70 focus:ring-offset-2 focus:ring-offset-primary-900 ${
                  index === active ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goTo(active - 1)}
              aria-label="Previous slide"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 backdrop-blur-sm transition hover:bg-white/20 hover:ring-white/40 focus:outline-none focus:ring-2 focus:ring-white/70"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => goTo(active + 1)}
              aria-label="Next slide"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 backdrop-blur-sm transition hover:bg-white/20 hover:ring-white/40 focus:outline-none focus:ring-2 focus:ring-white/70"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <div className="relative z-10 px-10 pb-8 lg:px-14 lg:pb-10">
        <p className="text-xs text-primary-100/70">
          {footer || <>© {new Date().getFullYear()} Rubavu Connect. Connect authentically.</>}
        </p>
      </div>
    </div>
  );
}
