import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

if (!getApps().length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { placeId, rating } = req.body;

    if (!placeId || !rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Invalid placeId or rating' });
    }

    try {
        const docRef = db.collection('games').doc(`game_${placeId}`);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Game not found' });
        }

        await docRef.update({
            rating_total: FieldValue.increment(rating),
            rating_count: FieldValue.increment(1),
        });

        const updated = await docRef.get();
        const data = updated.data();
        const avg = data.rating_total / data.rating_count;

        await docRef.update({
            rating_avg: parseFloat(avg.toFixed(2)),
        });

        return res.status(200).json({ avg: parseFloat(avg.toFixed(2)), count: data.rating_count });
    } catch (err) {
        console.error('Rate error:', err);
        return res.status(500).json({ error: err.message });
    }
}