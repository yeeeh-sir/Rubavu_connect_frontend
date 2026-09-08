import { User } from 'lucide-react';

const DOT_SIZES = {
  xs: 'h-2 w-2',
  sm: 'h-2.5 w-2.5',
  md: 'h-3 w-3',
  lg: 'h-3.5 w-3.5',
  xl: 'h-5 w-5',
  '2xl': 'h-6 w-6',
};

export default function UserAvatar({ src, alt = 'User', size = 'md', onClick, className = '', as = 'button', online }) {
  const sizeClasses = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-14 w-14',
    xl: 'h-24 w-24',
    '2xl': 'h-32 w-32',
  };

  const content = src ? (
    <img src={src} alt={alt} className="w-full h-full object-cover" loading="lazy" />
  ) : (
    <User className="w-1/2 h-1/2 text-slate-400" />
  );

  const classes = `${sizeClasses[size]} rounded-full overflow-hidden bg-slate-200 flex items-center justify-center shrink-0 ${online ? 'relative' : ''} ${onClick ? 'hover:opacity-90 transition-opacity cursor-pointer' : 'cursor-default'} ${className}`;

  const dot = online ? (
    <span
      className={`absolute ${DOT_SIZES[size]} bottom-0 right-0 rounded-full bg-green-500 ring-2 ring-white`}
      aria-label="Online"
    />
  ) : null;

  if (as === 'span') {
    return (
      <span className={classes} aria-label={alt}>
        {content}
        {dot}
      </span>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classes} aria-label={alt}>
      {content}
      {dot}
    </button>
  );
}