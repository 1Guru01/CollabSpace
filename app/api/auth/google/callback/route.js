import { exchangeCodeForTokens, fetchGoogleProfile } from "@/lib/oauth/google";
import { handleGoogleLogin } from "@/lib/auth/authService";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");

    if (!code) {
      return Response.json({ error: "No OAuth code provided" }, { status: 400 });
    }

    // Step 1 — exchange code for tokens
    const tokenData = await exchangeCodeForTokens(code);

    // Step 2 — get Google profile
    const profile = await fetchGoogleProfile(tokenData.access_token);

    // Step 3 — handle login (create user + session + cookies)
    const { user, cookies } = await handleGoogleLogin(profile, req);

    // Step 4 — redirect to dashboard with cookies set
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/dashboard",
        "Set-Cookie": cookies,
      },
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
