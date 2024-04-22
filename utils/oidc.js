// utils/oidc.js
import { UserManager, WebStorageStateStore } from "oidc-client";

const settings = {
  authority: "http://localhost:3001",
  client_id: "Erd-Application",
  client_secret: "sex",
  redirect_uri: "http://localhost:3000/callback",
  response_type: "code",
  scope: "openid profile",
  post_logout_redirect_uri: "http://localhost:3000/",
  userStore: new WebStorageStateStore({ store: window.localStorage }),
};

const userManager =
  typeof window !== "undefined" ? new UserManager(settings) : null;

export default userManager;
