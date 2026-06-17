export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) return res.status(500).json({ error: 'Webhook not configured' });

    const { title, description, fields, color } = req.body;

    const payload = {
        embeds: [{
            title: title ?? 'New Submission',
            description: description ?? '',
            color: color ?? 0x5865F2,
            fields: fields ?? [],
            timestamp: new Date().toISOString(),
        }]
    };

    try {
        const discordRes = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!discordRes.ok) throw new Error(`Discord error: ${discordRes.status}`);
        res.status(200).json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}