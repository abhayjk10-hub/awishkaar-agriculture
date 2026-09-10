import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

type SupabaseServerClient = ReturnType<typeof createServerClient>;

const hasValidSupabaseConfig = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return Boolean(
    url &&
      /^https?:\/\//i.test(url) &&
      !url.includes('your_supabase_project_url_here') &&
      key &&
      key.length > 20 &&
      !key.includes('your_supabase_anon_key_here')
  );
};

function createFallbackServerClient(): SupabaseServerClient {
  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
    },
  } as unknown as SupabaseServerClient;
}

export async function createClient() {
  if (!hasValidSupabaseConfig()) {
    return createFallbackServerClient();
  }

  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  );
}
