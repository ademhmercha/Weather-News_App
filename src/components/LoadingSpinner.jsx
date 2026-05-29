export default function LoadingSpinner({ size = 'md', label = 'Loading' }) {
  const ring = { sm: 'h-5 w-5 border-[2px]', md: 'h-8 w-8 border-[2.5px]', lg: 'h-11 w-11 border-[3px]' };
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10">
      <div className={`${ring[size]} animate-spin rounded-full border-slate-700 border-t-blue-500`} />
      {label && <p className="text-xs text-slate-500 tracking-wide">{label}</p>}
    </div>
  );
}
