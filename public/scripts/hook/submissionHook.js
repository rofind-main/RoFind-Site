// TODO: Discord webhook for submissions

// This is made for simpler submission review.

require('dotenv').config();

async function sendToDiscord(payload) {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`Discord webhook failed: ${res.status}`);
    return res.status;
}

module.exports = { sendToDiscord };
