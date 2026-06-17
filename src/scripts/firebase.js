import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getFirestore, collection, updateDoc, getDocs, doc, getDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import { firebaseConfig } from './config/firebaseConfig.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const toDocId = (placeId) => `game_${placeId}`;

export async function getGamePlaceIds() {
    const snapshot = await getDocs(collection(db, "games"));
    const ids = snapshot.docs.map(doc => doc.data().placeId);
    return ids;
}
export async function getGameDetails(placeId) {
    const docId = toDocId(placeId);
    console.log('looking up doc:', docId);
    const ref = doc(db, "games", docId);
    const snap = await getDoc(ref);
    console.log('exists:', snap.exists(), snap.data());
    return snap.exists() ? snap.data() : null;
}

export async function updateGameName(placeId, name) {
    const ref = doc(db, "games", toDocId(placeId));
    await updateDoc(ref, { game_name: name });
}