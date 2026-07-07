export type DisplayUser = {
  email?: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
    display_name?: string;
    preferred_username?: string;
    user_name?: string;
    avatar_url?: string;
    picture?: string;
  };
};

export type DisplayProfile = {
  name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
};

export function getUserDisplayName(
  user: DisplayUser,
  profile?: DisplayProfile | null,
) {
  return (
    profile?.name ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.user_metadata?.display_name ||
    user.user_metadata?.preferred_username ||
    user.user_metadata?.user_name ||
    user.email?.split("@")[0] ||
    "Thành viên"
  );
}

export function getUserDisplayEmail(
  user: DisplayUser,
  profile?: DisplayProfile | null,
) {
  return profile?.email || user.email || "";
}

export function getUserAvatarUrl(
  user: DisplayUser,
  profile?: DisplayProfile | null,
) {
  return (
    profile?.avatar_url ||
    user.user_metadata?.avatar_url ||
    user.user_metadata?.picture ||
    null
  );
}
