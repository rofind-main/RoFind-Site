const { BrowserWindow } = require('electron');

const {
    generateCodeVerifier,
    generateCodeChallenge,
    generateState
} = require('./pkce');

const CLIENT_ID = '8424212320330349269';
const REDIRECT_URI = 'https://ro-find.vercel.app/redirect.html';

const AUTH_URL = 'https://apis.roblox.com/oauth/v1/authorize';
const TOKEN_URL = 'https://apis.roblox.com/oauth/v1/token';
const USERINFO_URL = 'https://apis.roblox.com/oauth/v1/userinfo';

class RobloxOAuth {
    constructor() {
        this.win = null;
        this.pending = null;
    }

    start() {
        if (this.pending) return this.pending;

        const verifier = generateCodeVerifier();
        const challenge = generateCodeChallenge(verifier);
        const state = generateState();

        const authUrl =
            `${AUTH_URL}?` +
            new URLSearchParams({
                client_id: CLIENT_ID,
                redirect_uri: REDIRECT_URI,
                response_type: 'code',
                scope: 'openid profile',
                code_challenge: challenge,
                code_challenge_method: 'S256',
                state
            }).toString();

        this.pending = new Promise((resolve, reject) => {
            this.open(authUrl, verifier, state, resolve, reject);
        });

        return this.pending;
    }

    open(authUrl, verifier, expectedState, resolve, reject) {
        this.cleanup();

        this.win = new BrowserWindow({
            width: 520,
            height: 720,
            show: true,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                sandbox: true
            }
        });

        const handleUrl = async (url) => {
            try {
                if (!url) return;

                const u = new URL(url);

                const code =
                    u.searchParams.get('code') ||
                    new URLSearchParams((u.hash || '').replace('#', '')).get('code');

                const state =
                    u.searchParams.get('state') ||
                    new URLSearchParams((u.hash || '').replace('#', '')).get('state');

                if (!code) return;

                if (state !== expectedState) {
                    this.cleanup();
                    reject(new Error('Invalid OAuth state'));
                    return;
                }

                const session = await this.exchange(code, verifier);

                this.cleanup();
                resolve(session);
            } catch (err) {
                this.cleanup();
                reject(err);
            }
        };

        this.win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));

        this.win.webContents.on('will-redirect', (_, url) => handleUrl(url));
        this.win.webContents.on('did-navigate', (_, url) => handleUrl(url));

        this.win.on('closed', () => {
            this.cleanup();
            reject(new Error('OAuth window closed'));
        });

        this.win.loadURL(authUrl);
    }

    async exchange(code, verifier) {
        const body = new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: CLIENT_ID,
            code,
            redirect_uri: REDIRECT_URI,
            code_verifier: verifier
        });

        const tokenRes = await fetch(TOKEN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body
        });

        if (!tokenRes.ok) {
            throw new Error(await tokenRes.text());
        }

        const token = await tokenRes.json();

        const userRes = await fetch(USERINFO_URL, {
            headers: {
                Authorization: `Bearer ${token.access_token}`
            }
        });

        if (!userRes.ok) {
            throw new Error(await userRes.text());
        }

        const user = await userRes.json();

        return {
            accessToken: token.access_token,
            refreshToken: token.refresh_token,
            userId: user.sub,
            name: user.name
        };
    }

    cleanup() {
        if (this.win) {
            this.win.close();
            this.win = null;
        }
        this.pending = null;
    }
}

module.exports = new RobloxOAuth();