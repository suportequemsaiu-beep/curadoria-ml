import { createHash, randomBytes } from "crypto";
import { getSupabaseAdmin } from "./supabaseAdmin";

// --- Login OAuth com o Mercado Livre: desde que a API fechou a busca
// pública sem autenticação, precisamos de um token obtido com a conta da
// Janaína no Mercado Livre. O fluxo é: ela clica em "Conectar ao Mercado
// Livre" (uma vez), faz login no site do Mercado Livre, e ele redireciona
// de volta pra cá com um código que trocamos por um access_token (válido
// 6h) e um refresh_token (válido ~6 meses, usado pra renovar sozinho sem
// precisar logar de novo).
//
// A aplicação exige PKCE (obrigatório para apps novos no Mercado Livre):
// geramos um "code_verifier" aleatório, mandamos seu hash (code_challenge)
// na URL de login, guardamos o verifier num cookie temporário, e devolvemos
// ele na troca do código por token — prova que quem está trocando o código
// é a mesma pessoa que iniciou o login.

const TOKEN_URL = "https://api.mercadolibre.com/oauth/token";
// A tabela ml_oauth_token guarda no máximo uma linha (a conexão atual). Em
// vez de depender de um id fixo (cujo tipo pode variar conforme como a
// tabela foi criada no Supabase), sempre lemos/atualizamos "a única linha
// que existir", criando uma nova só se ainda não houver nenhuma.

interface StoredToken {
  id: string | number;
  access_token: string;
  refresh_token: string;
  expires_at: string;
  ml_user_id: string | null;
}

interface MlTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  user_id?: number;
  refresh_token?: string;
}

function getClientCredentials() {
  const clientId = process.env.ML_CLIENT_ID;
  const clientSecret = process.env.ML_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("ML_CLIENT_ID/ML_CLIENT_SECRET não configurados no servidor.");
  }
  return { clientId, clientSecret };
}

function getRedirectUri(): string {
  return process.env.ML_REDIRECT_URI || "https://curadoria-ml.vercel.app/api/auth/mercadolivre/callback";
}

// base64url sem padding, como o padrão PKCE (RFC 7636) exige.
function base64url(buffer: Buffer): string {
  return buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function generateCodeVerifier(): string {
  return base64url(randomBytes(32));
}

function codeChallengeFromVerifier(verifier: string): string {
  return base64url(createHash("sha256").update(verifier).digest());
}

export function getAuthorizationUrl(codeVerifier: string): string {
  const { clientId } = getClientCredentials();
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: getRedirectUri(),
    code_challenge: codeChallengeFromVerifier(codeVerifier),
    code_challenge_method: "S256",
  });
  return "https://auth.mercadolivre.com.br/authorization?" + params.toString();
}

async function saveToken(data: MlTokenResponse): Promise<void> {
  const supabase = getSupabaseAdmin();
  const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();
  const row: Record<string, unknown> = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: expiresAt,
  };
  if (data.user_id != null) row.ml_user_id = String(data.user_id);

  const { data: existing, error: selectError } = await supabase
    .from("ml_oauth_token")
    .select("id")
    .limit(1)
    .maybeSingle();
  if (selectError) {
    throw new Error("Falha ao verificar token existente do Mercado Livre: " + selectError.message);
  }

  if (existing?.id != null) {
    const { error } = await supabase.from("ml_oauth_token").update(row).eq("id", existing.id);
    if (error) throw new Error("Falha ao salvar token do Mercado Livre: " + error.message);
  } else {
    // A tabela tem uma coluna "created_at" obrigatória (NOT NULL, sem valor
    // padrão) — só precisa ser preenchida na primeira linha (inserção).
    const { error } = await supabase
      .from("ml_oauth_token")
      .insert({ ...row, created_at: new Date().toISOString() });
    if (error) throw new Error("Falha ao salvar token do Mercado Livre: " + error.message);
  }
}

export async function exchangeCodeForToken(code: string, codeVerifier: string): Promise<void> {
  const { clientId, clientSecret } = getClientCredentials();
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    client_secret: clientSecret,
    code,
    redirect_uri: getRedirectUri(),
    code_verifier: codeVerifier,
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: body.toString(),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error("Falha ao trocar código por token: HTTP " + res.status + (text ? " — " + text.slice(0, 300) : ""));
  }
  const data = (await res.json()) as MlTokenResponse;
  await saveToken(data);
}

async function refreshAccessToken(refreshTokenValue: string): Promise<MlTokenResponse> {
  const { clientId, clientSecret } = getClientCredentials();
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshTokenValue,
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: body.toString(),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      "Falha ao renovar o token do Mercado Livre (pode ser preciso reconectar): HTTP " +
        res.status +
        (text ? " — " + text.slice(0, 300) : "")
    );
  }
  return (await res.json()) as MlTokenResponse;
}

// Retorna um access_token válido, renovando sozinho quando estiver perto de
// expirar. Lança um erro com mensagem clara (mostrada na tela) quando ainda
// não houver conexão feita.
export async function getValidAccessToken(): Promise<string> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("ml_oauth_token")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) throw new Error("Falha ao ler o token do Mercado Livre: " + error.message);
  if (!data) {
    throw new Error(
      'Ainda não há conexão com o Mercado Livre. Clique em "Conectar ao Mercado Livre" na tela para autorizar.'
    );
  }

  const token = data as StoredToken;
  const expiresAt = new Date(token.expires_at).getTime();
  const fiveMinutes = 5 * 60 * 1000;

  if (Date.now() < expiresAt - fiveMinutes) {
    return token.access_token;
  }

  const refreshed = await refreshAccessToken(token.refresh_token);
  await saveToken(refreshed);
  return refreshed.access_token;
}
