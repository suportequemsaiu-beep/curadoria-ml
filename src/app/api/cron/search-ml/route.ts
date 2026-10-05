import { NextRequest, NextResponse } from "next/server";
import { runMlSearch } from "@/lib/mlSearch";

// --- Rota protegida chamada pelo GitHub Actions várias vezes ao dia para
// rodar a busca automática no Mercado Livre. Exige o header
// "Authorization: Bearer <CRON_SECRET>" com o segredo configurado no Vercel.
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "CRON_SECRET não configurado no servidor." },
      { status: 500 }
    );
  }

  const auth = request.headers.get("authorization");
  if (auth !== "Bearer " + expected) {
    return NextResponse.json({ ok: false, error: "Não autorizado." }, { status: 401 });
  }

  try {
    const summary = await runMlSearch();
    return NextResponse.json({ ok: true, summary });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
