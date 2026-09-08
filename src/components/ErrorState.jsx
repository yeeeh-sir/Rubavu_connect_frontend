import { RotateCcw } from 'lucide-react';

export default function ErrorState({ message = 'Something went wrong', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <p className="text-slate-600 font-medium mb-4">{message}</p>
      {onRetry && (
        <button className="btn-secondary" onClick={onRetry}>
          <RotateCcw size={16} />
          Retry
        </button>
      )}
    </div>
  );
}
