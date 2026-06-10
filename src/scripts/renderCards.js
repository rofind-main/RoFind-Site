import * as RobloxApi from "./api.js";
import * as FirebaseAPI from "./firebase.js";
import { createCard } from "./card.js";

const cardContainer = document.getElementById("card-container");
const VERIFIED_ICON = './assets/verifieduser.png';

function formatCount(n) {
    if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
    return n.toString();
}

export const renderCards = async () => {
    const placeIds = await FirebaseAPI.getGamePlaceIds();

    const skeletons = placeIds.map(() => {
        const el = document.createElement('div');
        el.classList.add('card', 'card-skeleton');
        cardContainer.appendChild(el);
        return el;
    });

    const results = await Promise.allSettled(
        placeIds.map(async (placeId) => {
            const universeId = await RobloxApi.getUniverseId(placeId);
            if (!universeId) throw new Error(`No universeId for ${placeId}`);

            const [gameData, imageUrl, firestoreData] = await Promise.all([
                RobloxApi.fetchGameDetails(universeId),
                RobloxApi.fetchThumbnail(universeId),
                FirebaseAPI.getGameDetails(placeId),
            ]);

            if (!gameData) throw new Error(`No game data for ${placeId}`);

            const author = gameData.creator?.type === "User"
                ? "@" + gameData.creator.name
                : gameData.creator?.name ?? "Unknown";

            const playCount = formatCount(gameData.visits)

            return createCard({
                name: gameData.name,
                description: gameData.description,
                placeId,
                playCount,
                imageUrl,
                author,
                rating: firestoreData?.user_rating ?? 0,
                verifiedIcon: VERIFIED_ICON,
                verified: gameData.creator?.hasVerifiedBadge ?? false,
            });
        })
    );

    results.forEach((result, i) => {
        if (result.status === 'fulfilled') {
            skeletons[i].replaceWith(result.value);
        } else {
            skeletons[i].remove();
            console.warn('[SKIP]', result.reason.message);
        }
    });
};