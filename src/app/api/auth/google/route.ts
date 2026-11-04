import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { OAUTH_VERIFIER_COOKIE } from "@/lib/supabase/auth";

function toBase64Url(buffer: Buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;

  try {
    const { url } = getSupabaseConfig();
    // PKCE: Supabase returns a one-time code to our callback, which is only
    // exchangeable together with this verifier kept in an httpOnly cookie.
    const codeVerifier = toBase64Url(randomBytes(48));
    const codeChallenge = toBase64Url(
      createHash("sha256").update(codeVerifier).digest(),
    );

    const authorizeUrl = new URL(`${url}/auth/v1/authorize`);
    authorizeUrl.searchParams.set("provider", "google");
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
    const loginUrl = new URL("/auth", origin);
    loginUrl.searchParams.set(
      "error",
      error instanceof Error
        ? error.message
        : "Không thể đăng nhập bằng Google.",
    );
    return NextResponse.redirect(loginUrl);
  }
}
