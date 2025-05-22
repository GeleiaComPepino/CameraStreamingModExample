const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Parse raw body data for image upload
app.post('/upload/:player', express.raw({ type: '*/*', limit: '5mb' }), (req, res) => {
    const player = req.params.player;

    if (!req.body || !Buffer.isBuffer(req.body)) {
        return res.status(400).send('Invalid image data');
    }

    const filename = path.join(uploadDir, `${player}.jpg`);
    fs.writeFileSync(filename, req.body);
    res.sendStatus(200);
});

app.use('/stream/:player', (req, res) => {
    const filepath = path.join(uploadDir, `${req.params.player}.jpg`);
    if (fs.existsSync(filepath)) {
        res.sendFile(filepath);
    } else {
        res.status(404).send('No image available.');
    }
});

app.get('/:player', (req, res) => {
    res.send(`
        <html>
        <body>
            <h1>Camera: ${req.params.player}</h1>
            <img src="/stream/${req.params.player}?t=" id="stream" width="640"/>
            <script>
                setInterval(() => {
                    document.getElementById('stream').src = "/stream/${req.params.player}?t=" + Date.now();
                }, 200);
            </script>
        </body>
        </html>
    `);
});

app.listen(port, () => {
    console.log('Listening on http://localhost:' + port);
});
