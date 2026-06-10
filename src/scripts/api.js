const IS_VERCEL = window.location.hostname !== '127.0.0.1' && window.location.hostname !== 'localhost';
const proxy = (url) => `/api/proxy?url=${encodeURIComponent(url)}`;

export async function getUniverseId(placeId) {
    console.log(placeId)
    const res = await fetch(proxy(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`));
    const data = await res.json();
    return data.universeId;
}

export async function fetchGameDetails(universeId) {
    console.log(universeId)
    const res = await fetch(proxy(`https://games.roblox.com/v1/games?universeIds=${universeId}`));
    const data = await res.json();
    return data.data?.[0];
}

export async function fetchThumbnail(universeId) {
    console.log(universeId)
    const res = await fetch(proxy(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${universeId}&size=150x150&format=Png`));
    const data = await res.json();
    return data.data?.[0]?.imageUrl;
}