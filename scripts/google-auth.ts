/**
 * Google Calendar OAuth Setup
 * Run once to authorize NanoClaw to access your Google Calendar.
 *
 * Usage:
 *   npx tsx scripts/google-auth.ts <client-id> <client-secret>
 *
 * Saves refresh token to groups/global/google-credentials.json
 */
import http from 'http';
import { execFile } from 'child_process';
import { URL } from 'url';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CREDS_FILE = path.join(ROOT, 'groups', 'global', 'google-credentials.json');
const REDIRECT_PORT = 9876;
const REDIRECT_URI = `http://localhost:${REDIRECT_PORT}/callback`;
const SCOPES = 'https://www.googleapis.com/auth/calendar';

async function main() {
  const clientId = process.argv[2];
  const clientSecret = process.argv[3];

  if (!clientId || !clientSecret) {
    console.error('Usage: npx tsx scripts/google-auth.ts <client-id> <client-secret>');
    process.exit(1);
  }

  if (fs.existsSync(CREDS_FILE)) {
    console.log('Credentials already exist at:', CREDS_FILE);
    console.log('Delete the file and re-run to reconfigure.');
    process.exit(0);
  }

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', SCOPES);
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent');

  const code = await new Promise<string>((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url!, `http://localhost:${REDIRECT_PORT}`);
      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');

      if (error) {
        res.writeHead(400);
        res.end(`<h1>Authorization failed: ${error}</h1>`);
        server.close();
        reject(new Error(`Authorization failed: ${error}`));
        return;
      }

      if (code) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<h1>Authorized! You can close this tab.</h1>');
        server.close();
        resolve(code);
      }
    });

    server.listen(REDIRECT_PORT, () => {
      console.log('Opening browser for Google authorization...\n');
      execFile('open', [authUrl.toString()]);
    });
  });

  console.log('Exchanging code for tokens...');

  const tokenResp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  });

  const tokens = await tokenResp.json() as Record<string, string>;

  if (!tokens.refresh_token) {
    console.error('\nNo refresh token received.');
    console.error('Revoke access at https://myaccount.google.com/permissions then re-run.');
    process.exit(1);
  }

  fs.mkdirSync(path.dirname(CREDS_FILE), { recursive: true });
  fs.writeFileSync(CREDS_FILE, JSON.stringify({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: tokens.refresh_token,
  }, null, 2));

  console.log('\nCredentials saved to:', CREDS_FILE);
  console.log('Google Calendar integration is ready.');
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
