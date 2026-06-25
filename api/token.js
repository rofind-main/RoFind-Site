const CLIENT_ID = process.env.OAUTH_CLIENT_ID;
const CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET; // only needed if your app is "confidential"
const REDIRECT_URI = 'https://ro-find.vercel.app/redirect.html';
const TOKEN_URL = 'https://apis.roblox.com/oauth/v1/token';
const USERINFO_URL = 'https://apis.roblox.com/oauth/v1/userinfo';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { code, verifier } = req.body ?? {};

    if (!code || !verifier) {
        return res.status(400).json({ error: 'Missing code or verifier' });
    }

    const body = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        code,
        redirect_uri: REDIRECT_URI,
        code_verifier: verifier,
        // (CLIENT_SECRET ? { client_secret: CLIENT_SECRET } : {}),
    });

    const tokenRes = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
    });

    if (!tokenRes.ok) {
        const text = await tokenRes.text();
        return res.status(tokenRes.status).json({ error: text });
    }

    const token = await tokenRes.json();

    const userRes = await fetch(USERINFO_URL, {
        headers: { Authorization: `Bearer ${token.access_token}` },
    });

    if (!userRes.ok) {
        const text = await userRes.text();
        return res.status(userRes.status).json({ error: text });
    }

    const user = await userRes.json();

    return res.status(200).json({
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
        userId: user.sub,
        name: user.name,
    });
}