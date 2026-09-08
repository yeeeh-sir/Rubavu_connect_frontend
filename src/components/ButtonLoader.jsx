import { Loader2 } from 'lucide-react';

export default function ButtonLoader({ label = 'Please wait...' }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Loader2 size={16} className="animate-spin" />
      {label}
    </span>
  );
}
