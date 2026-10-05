import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { foundRowToProduct } from "@/lib/foundProducts";

// --- Rota lida pelo navegador (no carregamento da página) para trazer os
// anúncios que a busca automática já encontrou e ainda não foram revisados.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("found_products")
      .select("*")
      .eq("status", "novo")
      .order("found_at", { ascending: false })
      .limit(100);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const products = (data || []).map(foundRowToProduct);
    return NextResponse.json({ products });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
