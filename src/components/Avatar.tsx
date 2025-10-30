import { User } from 'lucide-react';
import { getFileUrl } from '../lib/file-url';

interface AvatarProps {
  avatarUrl: string | null | undefined;
  firstName?: string;
  lastName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({ avatarUrl, firstName, lastName, size = 'md', className = '' }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-20 h-20',
    xl: 'w-32 h-32',
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-10 h-10',
    xl: 'w-16 h-16',
  };

  const getInitials = () => {
    if (!firstName && !lastName) return null;
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return `${first}${last}`;
  };

  const initials = getInitials();

  // If there's no avatar URL, show initials or default icon
  if (!avatarUrl) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-emerald-100 flex items-center justify-center border-2 border-gray-200 ${className}`}>
        {initials ? (
          <span className="text-emerald-700 font-semibold text-sm">{initials}</span>
        ) : (
          <User className={`${iconSizeClasses[size]} text-emerald-700`} />
        )}
      </div>
    );
  }

  const imageUrl = getFileUrl(avatarUrl);

  if (!imageUrl) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-emerald-100 flex items-center justify-center border-2 border-gray-200 ${className}`}>
        {initials ? (
          <span className="text-emerald-700 font-semibold text-sm">{initials}</span>
        ) : (
          <User className={`${iconSizeClasses[size]} text-emerald-700`} />
        )}
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-emerald-100 flex items-center justify-center border-2 border-gray-200 overflow-hidden ${className}`}>
      <img
        src={imageUrl}
        alt={initials || 'Avatar'}
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
        onError={(e) => {
          // On error, hide image and show fallback
          const img = e.target as HTMLImageElement;
          const parent = img.parentElement;
          if (parent) {
            img.remove();
            if (initials) {
              parent.innerHTML = `<span class="text-emerald-700 font-semibold text-sm">${initials}</span>`;
            } else {
              parent.innerHTML = `<svg class="${iconSizeClasses[size]} text-emerald-700" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
            }
          }
        }}
      />
    </div>
  );
}
