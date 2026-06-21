import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    // simple token guard so random people cant run it
    if (req.headers.authorization !== `Bearer ${process.env.ADMIN_TOKEN}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const snapshot = await db.collection('games').get();
        const batch = db.batch();
        let count = 0;

        snapshot.forEach(doc => {
            const data = doc.data();

            // only add fields if they dont exist yet
            const updates = {};
            if (data.rating_total === undefined) updates.rating_total = 0;
            if (data.rating_count === undefined) updates.rating_count = 0;
            if (data.rating_avg === undefined) updates.rating_avg = 0;

            if (Object.keys(updates).length > 0) {
                batch.update(doc.ref, updates);
                count++;
            }
        });

        await batch.commit();

        return res.status(200).json({ ok: true, updated: count });
    } catch (err) {
        console.error('Migration error:', err);
        return res.status(500).json({ error: err.message });
    }
}