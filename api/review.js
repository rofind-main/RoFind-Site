import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { credential } from 'firebase-admin';

if (!getApps().length) {
    initializeApp({
        credential: credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
    });
}

const db = getFirestore();
const toDocId = (placeId) => `game_${placeId}`;

export default async function handler(req, res) {
    const { placeId, token, action } = req.query;

    if (!placeId) return res.status(400).json({ error: 'Missing placeId' });
    if (!action) return res.status(400).json({ error: 'Missing action' });
    if (token !== process.env.ADMIN_SECRET) return res.status(403).json({ error: 'Forbidden' });

    try {
        if (action === 'approve') {
            await db.collection('games').doc(toDocId(placeId)).set({
                placeId,
                user_rating: 0,
            });
        } else if (action === 'decline') {
            await db.collection('submissions').doc(toDocId(placeId)).delete();
        } else {
            return res.status(400).json({ error: 'Invalid action' });
        }

        res.redirect('https://discord.com');
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}