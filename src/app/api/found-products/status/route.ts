import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

// --- Rota chamada pela tela sempre que o status de um produto achado pelo
// Mercado Livre muda (Revisar/Aprovar/Descartar), para que a decisão fique
// salva no Supabase (e não só no navegador de quem revisou). Sem isso, o
// mesmo anúncio voltava a aparecer como "novo" em outro aparelho ou depois
// de limpar os dados do dispositivo.
export const dynamic = "force-dynamic";

const VALID_STATUSES = new Set(["novo", "revisar", "aprovado", "descartado"]);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const mlId = typeof body?.mlId === "string" ? body.mlId : null;
    const status = typeof body?.status === "string" ? body.status : null;

    if (!mlId || !status || !VALID_STATUSES.has(status)) {
      return NextResponse.json({ error: "Parâmetros inválidos (mlId/status)." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("found_products").update({ status }).eq("ml_id", mlId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
