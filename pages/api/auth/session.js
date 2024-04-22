// pages/api/auth/session.js
import { getIronSession } from "iron-session";

export default async function sessionHandler(req, res) {
    const session = await getIronSession(req, res, {
        cookieName: "nextjs-oidc-app",
        password: process.env.SECRET_COOKIE_PASSWORD,
        cookieOptions: {
            secure: process.env.NODE_ENV === "production",
        },
    });

    if (session.tokenSet) {
        res.status(200).json({ isLoggedIn: true });
    } else {
        res.status(200).json({ isLoggedIn: false });
    }
}