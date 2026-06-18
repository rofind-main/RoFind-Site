async function sendToDiscord(payload) {
    const res = await fetch('/api/discord', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        let body;
        try {
            body = await res.json();
        } catch {
            body = await res.text();
        }
        console.error('Discord error body:', body);
        throw new Error(`Failed: ${res.status}`);
    }
    return res.status;
}

export { sendToDiscord };