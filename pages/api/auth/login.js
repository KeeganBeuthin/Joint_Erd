// pages/api/auth/login.js
import getClient from "@/utils/oidcClient";
import { getIronSession } from "iron-session";

export default async function login(req, res) {
  const client = await getClient();
  const authorizationUrl = client.authorizationUrl({
    scope: 'openid email profile', // Define needed scopes
  });
  res.redirect(authorizationUrl);
}
