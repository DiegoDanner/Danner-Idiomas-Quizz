import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient => {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      // Return a dummy client or throw a more descriptive error
      // Throwing is better as it alerts the user to the missing configuration
      throw new Error(
        'Supabase configuration is missing. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables.'
      );
    }
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseClient;
};

// Export a proxy that lazily initializes the client when any property is accessed.
// This prevents the app from crashing at module load time if the environment variables are missing.
export const supabase = new Proxy({} as SupabaseClient, {
  get: (target, prop) => {
    // Handle JSON.stringify() calls
    if (prop === 'toJSON') return () => ({});
    // Handle other common symbols
    if (typeof prop === 'symbol') return (target as any)[prop];

    const client = getSupabase();
    const value = (client as any)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  }
});
