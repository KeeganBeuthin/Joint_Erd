// utils/oidcClient.js
import { Issuer } from 'openid-client';

async function getClient() {
  const oidcIssuer = await Issuer.discover('http://localhost:3001/.well-known/openid-configuration');
  const client = new oidcIssuer.Client({
    client_id: 'client-id', // Replace with your client_id
    client_secret: 'client-secret', // Replace with your client_secret
    redirect_uris: ['http://localhost:3000/api/auth/callback'], // Client-side redirect URI
    response_types: ['code'],
  });

  return client;
}

export default getClient;
