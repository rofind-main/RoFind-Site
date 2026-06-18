// FIXME: API doesnt respond

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!serviceAccount) throw new Error('FIREBASE_SERVICE_ACCOUNT env var is not set');

    initializeApp({
        credential: cert(JSON.parse(serviceAccount))
    });
}

const db = getFirestore();
const toDocId = (placeId) => `game_${placeId}`;

export default async function handler(req, res) {
    const { placeId, token, action } = req.query;

    if (!placeId) return res.status(400).json({ error: 'Missing placeId' });
    if (!action) return res.status(400).json({ error: 'Missing action' });
    if (token !== process.env.ADMIN_TOKEN) return res.status(403).json({ error: 'Forbidden' });

    try {
        if (action === 'approve') {
            await db.collection('games').doc(toDocId(placeId)).set({
                game_name,
                placeId,
                user_rating: 0,
            });
            return res.status(200).send(`
                <html><body style="font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:#1a1a2e;">
                    <div style="text-align:center;color:white;">
                        <h1>✅ Approved</h1>
                        <p style="color:#aaa;">Game <b>${placeId}</b> has been added.</p>
                        <p style="color:#555;font-size:12px;">You can close this tab.</p>
                    </div>
                </body></html>
            `);
        } else if (action === 'decline') {
            await db.collection('games').doc(toDocId(placeId)).delete();
            return res.status(200).send(`
                <html><body style="font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:#1a1a2e;">
                    <div style="text-align:center;color:white;">
                        <h1>❌ Declined</h1>
                        <p style="color:#aaa;">Game <b>${placeId}</b> has been declined.</p>
                        <p style="color:#555;font-size:12px;">You can close this tab.</p>
                    </div>
                </body></html>
            `);
        } else {
            return res.status(400).json({ error: 'Invalid action' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}