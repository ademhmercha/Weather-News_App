export default function LoadingSpinner({ size = 'md', label = 'Loading…' }) {
  const sizes = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' };
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div
        className={`${sizes[size]} animate-spin rounded-full border-4 border-blue-500/30 border-t-blue-500`}
      />
      {label && <p className="text-sm text-gray-400">{label}</p>}
    </div>
  );
}
