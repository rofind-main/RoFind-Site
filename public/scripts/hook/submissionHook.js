// public/scripts/hook/submissionHook.js

async function sendToDiscord(payload) {
    const res = await fetch('/api/discord', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`Failed: ${res.status}`);
    return res.status;
}

export { sendToDiscord };