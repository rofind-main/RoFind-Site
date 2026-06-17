const crypto = require('crypto');

function base64url(buffer) {
    return buffer
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

function generateCodeVerifier() {
    return base64url(crypto.randomBytes(32));
}

function generateCodeChallenge(verifier) {
    return base64url(crypto.createHash('sha256').update(verifier).digest());
}

function generateState() {
    return crypto.randomUUID();
}

module.exports = {
    generateCodeVerifier,
    generateCodeChallenge,
    generateState
};