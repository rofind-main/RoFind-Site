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
                imageUrl,
                author,
                rating: firestoreData?.user_rating ?? 0,
                verifiedIcon: VERIFIED_ICON,
                playCount,
                verified: gameData.creator?.hasVerifiedBadge ?? false,
            });
        })
    );

    results.forEach((result) => {
        if (result.status === 'fulfilled') {
            cardContainer.appendChild(result.value);
        } else {
            console.warn('[SKIP]', result.reason.message);
        }
    });
};