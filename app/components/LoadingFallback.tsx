export default function LoadingFallback({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border border-amber-500/20 animate-pulse" />
          <div className="absolute inset-2 rounded-full border-t border-amber-500/40 animate-spin" />
          <div className="absolute inset-4 rounded-full bg-amber-500/10 animate-pulse" />
        </div>
        <p className="text-xs tracking-[0.3em] uppercase text-white/30">{label}</p>
      </div>
    </div>
  );
}
