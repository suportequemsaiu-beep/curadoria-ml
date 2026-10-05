import { NextResponse } from "next/server";
import { getAuthorizationUrl } from "@/lib/mlAuth";

// --- Link "Conectar ao Mercado Livre": manda a pessoa pro login oficial do
// Mercado Livre, que depois redireciona de volta pra /api/auth/mercadolivre/callback.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const url = getAuthorizationUrl();
    return NextResponse.redirect(url);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
