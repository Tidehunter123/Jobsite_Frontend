'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import type { Session, SupabaseClient } from '@supabase/supabase-js';

import type { User } from '@/types/user';
import { logger } from '@/lib/default-logger';
import { createClient as createSupabaseClient } from '@/lib/supabase/client';

import type { UserContextValue } from '../types';

export const UserContext = React.createContext<UserContextValue | undefined>(undefined);

export interface UserProviderProps {
  children: React.ReactNode;
}

export function UserProvider({ children }: UserProviderProps): React.JSX.Element {
  const router = useRouter();

  const [supabaseClient] = React.useState<SupabaseClient>(createSupabaseClient());

  const [state, setState] = React.useState<{ user: User | null; error: string | null; isLoading: boolean }>({
    user: null,
    error: null,
    isLoading: true,
  });

  React.useEffect(() => {
    async function handleInitialSession(session: Session | null): Promise<void> {
      const user = session?.user;

      if (!user) {
        setState((prev) => ({ ...prev, user: null, error: null, isLoading: false }));
        return;
      }

      setState((prev) => ({
        ...prev,
        user: user
          ? ({
              id: user.id ?? undefined,
              email: user.email ?? undefined,
              name: (user.user_metadata?.display_name as string) ?? undefined,
              avatar: (user.user_metadata?.avatar_url as string) ?? undefined,
              role: user.user_metadata?.role,
              access_token: session?.access_token ?? undefined,
            } satisfies User)
          : null,
        error: null,
        isLoading: false,
      }));
    }

    async function handleSignedIn(session: Session | null): Promise<void> {
      const user = session?.user;

      if (!user) {
        setState((prev) => ({ ...prev, user: null, error: null, isLoading: false }));
        return;
      }

      // const role = await fetchUserRole(user.id);

      setState((prev) => ({
        ...prev,
        user: user
          ? ({
              id: user.id ?? undefined,
              email: user.email ?? undefined,
              name: (user.user_metadata?.full_name as string) ?? undefined,
              avatar: (user.user_metadata?.avatar_url as string) ?? undefined,
              role: user.user_metadata?.role,
              access_token: session?.access_token ?? undefined,
            } satisfies User)
          : null,
        error: null,
        isLoading: false,
      }));

      router.refresh();
    }

    function handleSignedOut(): void {
      setState((prev) => ({ ...prev, user: null, error: null, isLoading: false }));

      router.refresh();
    }

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((event, session) => {
      logger.debug('[Auth] onAuthStateChange:', event, session);

      if (event === 'INITIAL_SESSION') {
        void handleInitialSession(session);
      }

      if (event === 'SIGNED_IN') {
        void handleSignedIn(session);
      }

      if (event === 'SIGNED_OUT') {
        handleSignedOut();
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [router, supabaseClient]);

  return <UserContext.Provider value={{ ...state }}>{children}</UserContext.Provider>;
}

export const UserConsumer = UserContext.Consumer;
