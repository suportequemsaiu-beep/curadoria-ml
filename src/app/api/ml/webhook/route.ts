import { NextRequest, NextResponse } from "next/server";

// --- Endereço de notificações exigido pelo cadastro da aplicação no
// Mercado Livre. Por enquanto só confirma o recebimento (o Mercado Livre
// exige resposta rápida com 200), sem processar nada — a busca automática
// (src/lib/mlSearch.ts) já cobre o que precisamos sem depender disso.
// Dá pra usar isso no futuro se quisermos reagir a eventos em tempo real.
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    await request.json().catch(() => null);
  } catch {
    // ignora corpo malformado
  }
  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
