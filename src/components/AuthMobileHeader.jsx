import logo from '../logo.png';

export default function AuthMobileHeader({ subtitle = 'Social • Community • Relationships', message }) {
  return (
    <div className="md:hidden relative overflow-hidden bg-primary-900 text-white">
      <div className="absolute inset-0 brand-gradient opacity-90" aria-hidden="true" />
      <div
        className="absolute -top-16 -left-10 h-48 w-48 rounded-full opacity-30 blur-3xl"
        style={{ background: 'radial-gradient(circle, #18a84a 0%, transparent 70%)' }}
        aria-hidden="true"
      />
      <div className="relative z-10 px-5 pt-7 pb-8">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 p-1.5 ring-1 ring-white/20 backdrop-blur-sm">
            <img src={logo} alt="Rubavu Connect logo" className="h-full w-full object-contain" />
          </span>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight leading-none">Rubavu Connect</h1>
            <p className="mt-1 text-[11px] font-medium text-primary-100/90">{subtitle}</p>
          </div>
        </div>
        {message && (
          <p className="mt-4 text-sm text-primary-100/90 leading-relaxed">{message}</p>
        )}
      </div>
    </div>
  );
}
