const ALLOWED_ORIGINS = [
    'https://ro-find.vercel.app',
    'http://localhost:3000',
];

export default function handler(req, res) {
    const origin = req.headers.origin;

    if (origin && !ALLOWED_ORIGINS.includes(origin)) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    return res.status(200).json({
        apiKey: process.env.CORE_FIREBASE_API_KEY,
        authDomain: process.env.CORE_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.CORE_FIREBASE_PROJECT_ID,
    });
}