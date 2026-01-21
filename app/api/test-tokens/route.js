import { createAccessToken } from "@/lib/tokens/access";
import {
  createRefreshToken,
  hashRefreshToken,
  compareRefreshToken,
} from "@/lib/tokens/refresh";

export async function GET() {
  const access = createAccessToken("1234567890");
  const refresh = createRefreshToken();
  const hashed = await hashRefreshToken(refresh);
  const match = await compareRefreshToken(refresh, hashed);

  return Response.json({
    accessToken: access,
    refreshToken: refresh,
    refreshTokenHashed: hashed,
    match,
  });
}
