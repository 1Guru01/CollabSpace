import { generateGoogleAuthURL } from "@/lib/oauth/google";

export async function GET() {
  const url = generateGoogleAuthURL();
  return Response.redirect(url);
}
