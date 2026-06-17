export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) return res.status(500).json({ error: 'Webhook not configured' });

    const { title, description, fields, color, thumbnail, placeId } = req.body;

    const baseUrl = req.headers.host.includes('localhost')
        ? 'https://ro-find.vercel.app'  // use production URL even in local dev
        : `https://${req.headers.host}`;
    const token = process.env.ADMIN_TOKEN;

    const buttons = [
        { label: '✅ Approve', url: `${baseUrl}/api/review?placeId=${placeId}&action=approve&token=${token}` },
        { label: '❌ Decline', url: `${baseUrl}/api/review?placeId=${placeId}&action=decline&token=${token}` },
        { label: '🎮 Play', url: `https://www.roblox.com/games/${placeId}` },
    ];

    const payload = {
        embeds: [{
            title: title ?? 'New Submission',
            description: description ?? '',
            color: color ?? 0x5865F2,
            fields: fields ?? [],
            thumbnail: thumbnail ? { url: thumbnail } : undefined,
            timestamp: new Date().toISOString(),
        }],
        components: [{
            type: 1,
            components: buttons.map(btn => ({
                type: 2,
                style: 5,
                label: btn.label,
                url: btn.url,
            }))
        }]
    };

    console.log('placeId:', placeId);
    console.log('buttons:', buttons);
    console.log('payload components:', JSON.stringify(payload.components));

    try {
        const discordRes = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!discordRes.ok) {
            const err = await discordRes.text();
            throw new Error(`Discord error: ${discordRes.status} - ${err}`);
        }
        res.status(200).json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}