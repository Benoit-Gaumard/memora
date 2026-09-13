import { supabase } from "@/lib/supabase";

export type AuthIntent = "signin" | "signup";

export async function signInWithPassword(params: {
  username: string;
  password: string;
}) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return {
      data: {
        user: {
          id: "demo-user",
          email: `${params.username}@memora.local`,
          user_metadata: { username: params.username },
        },
      },
      error: null,
    };
  }

  const normalizedUsername = params.username.trim();

  return supabase.auth.signInWithPassword({
    email: `${normalizedUsername}@memora.local`,
    password: params.password,
  });
}

export async function createAccount(params: {
  username: string;
  password: string;
  displayName?: string;
  email?: string;
}) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return {
      data: {
        user: {
          id: `user_${Date.now()}`,
          email: params.email ?? `${params.username}@memora.local`,
          user_metadata: {
            username: params.username,
            display_name: params.displayName ?? params.username,
          },
        },
      },
      error: null,
    };
  }

  return supabase.auth.signUp({
    email: params.email ?? `${params.username}@memora.local`,
    password: params.password,
    options: {
      data: {
        username: params.username,
        display_name: params.displayName ?? params.username,
      },
    },
  });
}
