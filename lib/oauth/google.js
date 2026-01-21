import querystring from "querystring";

const GOOGLE_OAUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_PROFILE_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

// 1. Build Google OAuth URL
export function generateGoogleAuthURL() {
  const params = {
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: ["openid", "email", "profile"].join(" "),
    access_type: "offline",
    prompt: "consent",
  };

  return `${GOOGLE_OAUTH_URL}?${querystring.stringify(params)}`;
}

// 2. Exchange code → tokens
export async function exchangeCodeForTokens(code) {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to exchange code for tokens");
  }

  return response.json();
}

// 3. Fetch Google User Profile
export async function fetchGoogleProfile(accessToken) {
  const response = await fetch(
    `${GOOGLE_PROFILE_URL}?access_token=${accessToken}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch Google user profile");
  }

  return response.json();
}
