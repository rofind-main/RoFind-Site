import https from 'https'

function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        const request = https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch (e) { reject(e); }
            });
        });
        request.on('error', reject);
        request.setTimeout(10000, () => {
            request.destroy();
            reject(new Error('Upstream request timed out'));
        });
    });
}

export default async function handler(req, res) {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'Missing url' });

    try {
        const data = await fetchUrl(decodeURIComponent(url));
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.json(data);
    } catch (err) {
        console.error('Proxy error:', err);
        res.status(500).json({ error: err.message });
    }
}