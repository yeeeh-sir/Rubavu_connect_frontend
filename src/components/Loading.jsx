export default function Loading({ size = 'md', label = 'Loading...' }) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center py-10" role="status" aria-label={label}>
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-primary-600 border-t-transparent`}
      />
      {label && <p className="mt-3 text-sm text-slate-500">{label}</p>}
    </div>
  );
}
