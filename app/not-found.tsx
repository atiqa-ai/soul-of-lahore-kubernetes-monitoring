import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center px-6 max-w-md">
        <div className="w-20 h-20 mx-auto mb-8 rounded-full border border-amber-500/20 flex items-center justify-center">
          <svg className="w-10 h-10 text-amber-400/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white/70 mb-3 tracking-wide">
          Lost in Time
        </h1>
        <p className="text-sm text-white/40 mb-8 leading-relaxed max-w-sm mx-auto">
          This story does not exist. The streets of Lahore hold only twelve landmarks — return to find yours.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-amber-500/30 bg-amber-500/5 text-amber-400/80 text-xs tracking-[0.3em] uppercase hover:bg-amber-500/15 hover:border-amber-400/60 transition-all duration-500"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Return Home
        </Link>
      </div>
    </div>
  );
}
