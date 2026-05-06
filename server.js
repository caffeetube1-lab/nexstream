const express = require('express');
const cors = require('cors');
const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('public'));

const YTDLP_PATH = fs.existsSync(path.join(__dirname, 'yt-dlp.exe')) 
    ? path.join(__dirname, 'yt-dlp.exe') 
    : 'yt-dlp';

// Helper to run yt-dlp with common arguments
function runYtDlp(args) {
    // Attempt to use cookies from browser to avoid bot detection if on local
    const commonArgs = process.platform === 'win32' ? ['--cookies-from-browser', 'chrome', ...args] : args;
    return spawn(YTDLP_PATH, commonArgs);
}

// Endpoint to get video info
app.get('/api/info', (req, res) => {
    const videoURL = req.query.url;
    if (!videoURL) return res.status(400).json({ error: 'URL is required' });

    // Use -j for JSON info
    const commonArgs = process.platform === 'win32' ? ['--cookies-from-browser', 'chrome'] : [];
    const process = spawn(YTDLP_PATH, [...commonArgs, '-j', videoURL]);
    let output = '';
    let errorOutput = '';

    process.stdout.on('data', (data) => output += data.toString());
    process.stderr.on('data', (data) => errorOutput += data.toString());

    process.on('error', (err) => {
        console.error('Failed to start yt-dlp:', err);
        if (!res.headersSent) {
            res.status(500).json({ error: 'System error: yt-dlp is not installed or not found on the server.' });
        }
    });

    process.on('close', (code) => {
        if (code !== 0) {
            console.error('yt-dlp error:', errorOutput);
            if (!res.headersSent) {
                return res.status(500).json({ error: 'Video extraction failed. The platform might be blocking the request or the link is invalid.' });
            }
            return;
        }
        try {
            const info = JSON.parse(output);
            res.json({
                title: info.title,
                thumbnail: info.thumbnail,
                author: info.uploader,
                duration: info.duration,
                size: info.filesize || info.filesize_approx || 0
            });
        } catch (e) {
            if (!res.headersSent) {
                res.status(500).json({ error: 'Failed to parse video info.' });
            }
        }
    });
});

app.get('/api/download', (req, res) => {
    const videoURL = req.query.url;
    const quality = req.query.quality || 'highest';

    if (!videoURL) return res.status(400).send('URL is required');

    let title = req.query.title || 'video';
    title = title.replace(/[^\w\s]/gi, '').substring(0, 100);

    const size = req.query.size;
    if (size && size > 0) {
        res.header('Content-Length', size);
    }

    let args = process.platform === 'win32' ? ['--cookies-from-browser', 'chrome'] : [];
    if (quality === 'highestaudio') {
        res.header('Content-Disposition', `attachment; filename="${title}.mp3"`);
        res.header('Content-Type', 'audio/mpeg');
        args.push('-x', '--audio-format', 'mp3', '-o', '-', videoURL);
    } else {
        res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);
        res.header('Content-Type', 'video/mp4');
        args.push('-f', 'best[ext=mp4]/best', '-o', '-', videoURL);
    }

    const downloadProcess = spawn(YTDLP_PATH, args);
    downloadProcess.stdout.pipe(res);
});

app.listen(PORT, () => {
    console.log(`NexStream Server running at http://localhost:${PORT}`);
});
