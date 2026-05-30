import type { User } from '../types/models';

const SIZES = {
  xs: 'h-5 w-5 text-[10px]',
  sm: 'h-7 w-7 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-14 w-14 text-xl',
};

export function Avatar({
  user,
  size = 'md',
  ring = false,
}: {
  user: User;
  size?: keyof typeof SIZES;
  ring?: boolean;
}) {
  const initials = user.name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white no-select ${SIZES[size]} ${
        ring ? 'ring-2 ring-white' : ''
      }`}
      style={{ backgroundColor: user.color }}
      title={user.name}
    >
      {user.avatarImage ? (
        <img
          src={user.avatarImage}
          alt={user.name}
          className="h-full w-full rounded-full object-cover"
        />
      ) : user.avatarEmoji ? (
        <span>{user.avatarEmoji}</span>
      ) : (
        <span>{initials}</span>
      )}
    </span>
  );
}

/** Gestapelde rij avatars (overlappend) voor compacte weergave. */
export function AvatarStack({ users, size = 'xs' }: { users: User[]; size?: keyof typeof SIZES }) {
  return (
    <span className="inline-flex -space-x-1.5">
      {users.map((u) => (
        <Avatar key={u.id} user={u} size={size} ring />
      ))}
    </span>
  );
}
