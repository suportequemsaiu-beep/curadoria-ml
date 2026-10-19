import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

// --- Diz pra interface se já existe uma conexão salva com o Mercado Livre,
// sem nunca expor o token em si.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("ml_oauth_token")
      .select("ml_user_id, updated_at")
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ connected: false, error: error.message });
    }
    return NextResponse.json({ connected: !!data, mlUserId: data?.ml_user_id || null });
  } catch (err) {
    return NextResponse.json({
      connected: false,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
