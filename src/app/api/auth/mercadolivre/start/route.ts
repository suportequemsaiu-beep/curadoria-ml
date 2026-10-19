import { NextResponse } from "next/server";
import { getAuthorizationUrl, generateCodeVerifier } from "@/lib/mlAuth";

// --- Link "Conectar ao Mercado Livre": manda a pessoa pro login oficial do
// Mercado Livre, que depois redireciona de volta pra /api/auth/mercadolivre/callback.
// Guarda o "code_verifier" (exigido pelo PKCE) num cookie temporário, só
// pra recuperar na volta do login.
export const dynamic = "force-dynamic";

const COOKIE_NAME = "ml_pkce_verifier";

export async function GET() {
  try {
    const verifier = generateCodeVerifier();
    const url = getAuthorizationUrl(verifier);
    const res = NextResponse.redirect(url);
    res.cookies.set(COOKIE_NAME, verifier, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 600,
      path: "/api/auth/mercadolivre",
    });
    return res;
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
