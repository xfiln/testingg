// api/getLeaderboard.js
const fs = require('fs');
const path = require('path');

export default function getLeaderboard(req, res) {
    const filePath = path.resolve('./leaderboard.json');
    
    if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath);
        const leaderboard = JSON.parse(data);

        // Urutkan berdasarkan skor tertinggi
        leaderboard.sort((a, b) => b.score - a.score);

        res.status(200).json(leaderboard);
    } else {
        res.status(200).json([]);
    }
}
