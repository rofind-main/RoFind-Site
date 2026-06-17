export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) return res.status(500).json({ error: 'Webhook not configured' });

    const { title, description, fields, color, thumbnail, buttons } = req.body;

    const payload = {
        embeds: [{
            title: title ?? 'New Submission',
            description: description ?? '',
            color: color ?? 0x5865F2,
            fields: fields ?? [],
            thumbnail: thumbnail ? { url: thumbnail } : undefined,
            timestamp: new Date().toISOString(),
        }],
        components: buttons?.length ? [{
            type: 1,
            components: buttons.map(btn => ({
                type: 2,
                style: 5, // link button
                label: btn.label,
                url: btn.url,
            }))
        }] : []
    };

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