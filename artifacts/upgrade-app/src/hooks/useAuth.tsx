import { useUser, useClerk } from "@clerk/react";

export function useAuth() {
  const { user, isLoaded } = useUser();
  const clerk = useClerk();

  const signOut = async () => {
    await clerk.signOut();
  };

  return {
    user: user ?? null,
    loading: !isLoaded,
    signOut,
  };
}
