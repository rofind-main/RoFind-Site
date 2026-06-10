import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import { firebaseConfig } from './config/firebaseConfig.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const toDocId = (placeId) => `game_${placeId}`;

export async function getGamePlaceIds() {
    const snapshot = await getDocs(collection(db, "games"));
    const ids = snapshot.docs.map(doc => doc.data().placeId);
    console.log("[Firebase] placeIds:", ids);
    return ids;
}
export async function getGameDetails(placeId) {
    const ref = doc(db, "games", toDocId(placeId));
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
}
