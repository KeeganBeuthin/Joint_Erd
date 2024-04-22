// pages/api/auth/callback.js
import getClient from "@/utils/oidcClient";
import { getIronSession } from "iron-session";

export default async function callbackHandler(req, res) {
  const client = await getClient();
  const params = client.callbackParams(req);
  const tokenSet = await client.callback('http://localhost:3000/api/auth/callback', params);

  // Using getIronSession to manually handle session saving
  const session = await getIronSession(req, res, {
    cookieName: "nextjs-oidc-app",
    password: process.env.SECRET_COOKIE_PASSWORD,
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
    },
  });

  session.tokenSet = tokenSet; // Save the tokens in the session
  await session.save(); // Save the session with the new state

  res.redirect('/app/erd'); // Redirect to a protected route
}
