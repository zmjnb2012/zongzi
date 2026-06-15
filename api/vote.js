export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const GIST_ID = process.env.GIST_ID;
    const GH_TOKEN = process.env.GH_TOKEN;

    try {
        if (req.method === 'GET') {
            const gistRes = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
                headers: { 'Authorization': `token ${GH_TOKEN}`, 'User-Agent': 'zongzi' }
            });
            const gist = await gistRes.json();
            const votes = JSON.parse(gist.files['votes.json'].content || '{}');
            return res.status(200).json(votes);
        }

        if (req.method === 'POST') {
            const { flavorId } = req.body;
            if (!flavorId) return res.status(400).json({ error: 'Missing flavorId' });

            const getRes = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
                headers: { 'Authorization': `token ${GH_TOKEN}`, 'User-Agent': 'zongzi' }
            });
            const gist = await getRes.json();
            const votes = JSON.parse(gist.files['votes.json'].content || '{}');
            votes[flavorId] = (votes[flavorId] || 0) + 1;

            await fetch(`https://api.github.com/gists/${GIST_ID}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `token ${GH_TOKEN}`,
                    'Content-Type': 'application/json',
                    'User-Agent': 'zongzi'
                },
                body: JSON.stringify({
                    files: { 'votes.json': { content: JSON.stringify(votes) } }
                })
            });

            return res.status(200).json({ success: true });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}