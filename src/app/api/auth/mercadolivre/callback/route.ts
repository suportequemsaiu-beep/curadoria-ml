import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken } from "@/lib/mlAuth";

// --- Volta do login do Mercado Livre: troca o código recebido por um
// access_token + refresh_token e salva no Supabase. Redireciona de volta
// pra página principal com ?ml_auth=ok ou ?ml_auth=erro pra mostrar o
// resultado na tela.
export const dynamic = "force-dynamic";

const COOKIE_NAME = "ml_pkce_verifier";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const errorParam = request.nextUrl.searchParams.get("error");
  const redirectTo = new URL("/", request.url);
  const verifier = request.cookies.get(COOKIE_NAME)?.value;

  if (errorParam) {
    redirectTo.searchParams.set("ml_auth", "erro");
    redirectTo.searchParams.set("ml_auth_detail", errorParam);
    return NextResponse.redirect(redirectTo);
  }
  if (!code) {
    redirectTo.searchParams.set("ml_auth", "erro");
    redirectTo.searchParams.set("ml_auth_detail", "codigo_ausente");
    return NextResponse.redirect(redirectTo);
  }
  if (!verifier) {
    redirectTo.searchParams.set("ml_auth", "erro");
    redirectTo.searchParams.set(
      "ml_auth_detail",
      "sessao_de_login_expirada_tente_conectar_de_novo"
    );
    return NextResponse.redirect(redirectTo);
  }

  const res = NextResponse.redirect(redirectTo);
  try {
    await exchangeCodeForToken(code, verifier);
    redirectTo.searchParams.set("ml_auth", "ok");
  } catch (err) {
    redirectTo.searchParams.set("ml_auth", "erro");
    redirectTo.searchParams.set("ml_auth_detail", err instanceof Error ? err.message : String(err));
  }
  res.headers.set("Location", redirectTo.toString());
  res.cookies.delete(COOKIE_NAME);
  return res;
}
