const proxy = (url) => `/api/proxy?url=${encodeURIComponent(url)}`;

function cacheGet(key) {
    try {
        const item = sessionStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch { return null; }
}

function cacheSet(key, value) {
    try { sessionStorage.setItem(key, JSON.stringify(value)); }
    catch { }
}

async function fetchWithTimeout(url, timeout = 5000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (err) {
        if (err.name === 'AbortError') throw new Error(`Request timed out: ${url}`);
        throw err;
    } finally {
        clearTimeout(timer);
    }
}

const universeCache = new Map();
const gameCache = new Map();
const thumbnailCache = new Map();

export async function getUniverseId(placeId) {
    if (universeCache.has(placeId)) return universeCache.get(placeId);
    const cached = cacheGet(`universeId:${placeId}`);
    if (cached) { universeCache.set(placeId, cached); return cached; }
    const data = await fetchWithTimeout(proxy(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`), 15000);
    const universeId = data.universeId ?? null;
    if (universeId) { universeCache.set(placeId, universeId); cacheSet(`universeId:${placeId}`, universeId); }
    return universeId;
}

export async function fetchGameDetails(universeId) {
    if (gameCache.has(universeId)) return gameCache.get(universeId);
    const cached = cacheGet(`gameDetails:${universeId}`);
    if (cached) { gameCache.set(universeId, cached); return cached; }
    const data = await fetchWithTimeout(proxy(`https://games.roblox.com/v1/games?universeIds=${universeId}`), 15000);
    const game = data.data?.[0] ?? null;
    if (game) { gameCache.set(universeId, game); cacheSet(`gameDetails:${universeId}`, game); }
    return game;
}

export async function fetchThumbnail(universeId) {
    if (thumbnailCache.has(universeId)) return thumbnailCache.get(universeId);
    const cached = cacheGet(`thumbnail:${universeId}`);
    if (cached) { thumbnailCache.set(universeId, cached); return cached; }
    const data = await fetchWithTimeout(proxy(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${universeId}&size=150x150&format=Png`), 15000);
    const imageUrl = data.data?.[0]?.imageUrl ?? null;
    if (imageUrl) { thumbnailCache.set(universeId, imageUrl); cacheSet(`thumbnail:${universeId}`, imageUrl); }
    return imageUrl;
}