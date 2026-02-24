// api/saveScore.js
const fs = require('fs');
const path = require('path');

export default function saveScore(req, res) {
    if (req.method === 'POST') {
        const filePath = path.resolve('./leaderboard.json');
        const { name, score } = req.body;

        let leaderboard = [];

        // Baca leaderboard JSON
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath);
            leaderboard = JSON.parse(data);
        }

        // Cari pengguna berdasarkan nama
        const userIndex = leaderboard.findIndex(user => user.name === name);
        if (userIndex > -1) {
            // Jika pengguna sudah ada, update skornya
            leaderboard[userIndex].score += score;
        } else {
            // Jika pengguna belum ada, tambahkan ke leaderboard
            leaderboard.push({ name, score });
        }

        // Simpan kembali leaderboard ke file JSON
        fs.writeFileSync(filePath, JSON.stringify(leaderboard, null, 2));

        res.status(200).json({ message: 'Skor berhasil disimpan!' });
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
