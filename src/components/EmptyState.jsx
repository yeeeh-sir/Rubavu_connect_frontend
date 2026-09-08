import { Inbox } from 'lucide-react';

export default function EmptyState({ message = 'Nothing here yet', icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <Icon className="w-12 h-12 text-slate-300 mb-3" />
      <p className="text-slate-500 font-medium">{message}</p>
    </div>
  );
}
