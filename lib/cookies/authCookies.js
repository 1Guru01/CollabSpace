export function createAuthCookies(accessToken, refreshToken) {
  return [
    `access_token=${accessToken}; HttpOnly; Path=/; Max-Age=900; SameSite=Lax; Secure`,
    `refresh_token=${refreshToken}; HttpOnly; Path=/; Max-Age=2592000; SameSite=Strict; Secure`,
  ];
}

export function clearAuthCookies() {
  return [
    `access_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax; Secure`,
    `refresh_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict; Secure`,
  ];
}
