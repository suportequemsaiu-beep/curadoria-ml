import { createClient, SupabaseClient } from "@supabase/supabase-js";

// --- Cliente Supabase usado apenas no servidor (rotas de API e Server
// Actions). Usa a secret key, que tem acesso total ao banco e nunca deve
// chegar ao navegador — por isso este arquivo não tem "use client" e não
// deve ser importado por nenhum componente de cliente.

let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase não configurado: defina SUPABASE_URL e SUPABASE_SECRET_KEY nas variáveis de ambiente do Vercel."
    );
  }

  cached = createClient(url, key, {
    auth: { persistSession: false },
  });
  return cached;
}
