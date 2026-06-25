// import {
//     generateCodeVerifier,
//     generateCodeChallenge,
//     generateState
// } from './pkce';

const CLIENT_ID = '8424212320330349269';
const REDIRECT_URI = 'https://ro-find.vercel.app/redirect.html';

const AUTH_URL = 'https://apis.roblox.com/oauth/v1/authorize';
const TOKEN_URL = 'https://apis.roblox.com/oauth/v1/token';
const USERINFO_URL = 'https://apis.roblox.com/oauth/v1/userinfo';

// PKCE
function randomBytes(len) {
    return crypto.getRandomValues(new Uint8Array(len));
}

function base64url(buf) {
    return btoa(String.fromCharCode(...buf))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

function generateCodeVerifier() {
    return base64url(randomBytes(32));
}

async function generateCodeChallenge(verifier) {
    const encoded = new TextEncoder().encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', encoded);
    return base64url(new Uint8Array(digest));
}

function generateState() {
    return base64url(randomBytes(16));
}


const RobloxOAuth = {
    _pending: null,

    async start() {
        if (this._pending) return this._pending;

        const verifier = generateCodeVerifier();
        const challenge = await generateCodeChallenge(verifier);
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
                state,
            });

        this._pending = this._openPopup(authUrl, verifier, state).finally(() => {
            this._pending = null;
        });

        return this._pending;
    },

    _openPopup(authUrl, verifier, expectedState) {
        return new Promise((resolve, reject) => {
            const width = 520;
            const height = 720;
            const left = Math.max(0, (screen.width - width) / 2);
            const top = Math.max(0, (screen.height - height) / 2);

            const popup = window.open(authUrl, '_blank');

            if (!popup) {
                reject(new Error('Failed to open a new tab!'));
                return;
            }

            const onMessage = async (event) => {
                if (event.origin !== 'https://ro-find.vercel.app' || event.origin !== 'https://localhost:3000') return;
                if (!event.data?.robloxOAuth) return;

                cleanup();

                const { code, state, error } = event.data.robloxOAuth;

                if (error) { reject(new Error(error)); return; }
                if (state !== expectedState) { reject(new Error('Invalid OAuth state')); return; }
                if (!code) { reject(new Error('No code returned')); return; }

                try {
                    const session = await this._exchange(code, verifier);
                    resolve(session);
                } catch (err) {
                    reject(err);
                }
            };

            const pollClosed = setInterval(() => {
                if (popup.closed) {
                    cleanup();
                    reject(new Error('OAuth popup closed'));
                }
            }, 500);

            const cleanup = () => {
                window.removeEventListener('message', onMessage);
                clearInterval(pollClosed);
                if (!popup.closed) popup.close();
            };

            window.addEventListener('message', onMessage);
        });
    },

    async _exchange(code, verifier) {
        const res = await fetch('/api/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, verifier }),
        });

        if (!res.ok) throw new Error(await res.text());

        return res.json(); // { accessToken, refreshToken, userId, name }
    },
};

export default RobloxOAuth;