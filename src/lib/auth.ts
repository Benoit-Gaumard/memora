import { supabase } from "@/lib/supabase";

export type AuthIntent = "signin" | "signup";

export async function signInWithPassword(params: {
  identifier: string;
  password: string;
}) {
  const identifier = params.identifier.trim();

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return {
      data: {
        user: {
          id: "demo-user",
          email: identifier.includes("@") ? identifier : `${identifier}@memora.local`,
          user_metadata: { username: identifier },
        },
      },
      error: null,
    };
  }

  let email = identifier;

  if (!identifier.includes("@")) {
    const { data: resolvedEmail, error: lookupError } = await supabase.rpc("get_login_email", {
      p_username: identifier,
    });

    if (lookupError || !resolvedEmail) {
      return {
        data: { user: null, session: null },
        error: { name: "AuthApiError", message: "Identifiant ou mot de passe incorrect." },
      };
    }

    email = resolvedEmail;
  }

  return supabase.auth.signInWithPassword({
    email,
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
