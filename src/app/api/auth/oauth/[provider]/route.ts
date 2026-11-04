import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { getSupabaseConfig } from "@/lib/supabase/config";
import {
  OAUTH_VERIFIER_COOKIE,
  supabaseAuthRequest,
} from "@/lib/supabase/auth";

const PROVIDER_LABELS: Record<string, string> = {
  google: "Google",
  facebook: "Facebook",
};

type AuthSettings = {
  external?: Record<string, boolean>;
};

function toBase64Url(buffer: Buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function redirectWithError(origin: string, message: string) {
  const loginUrl = new URL("/auth", origin);
  loginUrl.searchParams.set("error", message);
  return NextResponse.redirect(loginUrl);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const origin = new URL(request.url).origin;
  const { provider } = await params;
  const label = Object.hasOwn(PROVIDER_LABELS, provider)
    ? PROVIDER_LABELS[provider]
    : undefined;

  if (!label) {
    return redirectWithError(origin, "Phương thức đăng nhập không hợp lệ.");
  }

  try {
    // Supabase answers /authorize with raw JSON for a disabled provider, so
    // check first and keep the user on the login page with a readable message.
    const settings = await supabaseAuthRequest<AuthSettings>("/settings");
    if (!settings.external?.[provider]) {
      return redirectWithError(
        origin,
        `Đăng nhập bằng ${label} hiện chưa được bật.`,
      );
    }

    const { url } = getSupabaseConfig();
    // PKCE: Supabase returns a one-time code to our callback, which is only
    // exchangeable together with this verifier kept in an httpOnly cookie.
    const codeVerifier = toBase64Url(randomBytes(48));
    const codeChallenge = toBase64Url(
      createHash("sha256").update(codeVerifier).digest(),
    );

    const authorizeUrl = new URL(`${url}/auth/v1/authorize`);
    authorizeUrl.searchParams.set("provider", provider);
    authorizeUrl.searchParams.set("redirect_to", `${origin}/api/auth/callback`);
    authorizeUrl.searchParams.set("code_challenge", codeChallenge);
    authorizeUrl.searchParams.set("code_challenge_method", "s256");

    const response = NextResponse.redirect(authorizeUrl);
    response.cookies.set(OAUTH_VERIFIER_COOKIE, codeVerifier, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 10,
    });
    return response;
  } catch (error) {
    return redirectWithError(
      origin,
      error instanceof Error
        ? error.message
        : `Không thể đăng nhập bằng ${label}.`,
    );
  }
}
