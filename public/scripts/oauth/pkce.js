const crypto = require('crypto');

export function base64url(buffer) {
    return buffer
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

export function generateCodeVerifier() {
    return base64url(crypto.randomBytes(32));
}

export function generateCodeChallenge(verifier) {
    return base64url(crypto.createHash('sha256').update(verifier).digest());
}

export function generateState() {
    return crypto.randomUUID();
}

module.exports = {
    generateCodeVerifier,
    generateCodeChallenge,
    generateState
};