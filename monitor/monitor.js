const axios = require("axios");
const { Chalk } = require("chalk");
const chalk = new Chalk();

const PLAYLIST_URL = "http://localhost:8080/hls/stream.m3u8";

let lastSegment = null;
let lastUpdateTime = null;

async function checkStream() {
    try {
        const res = await axios.get(PLAYLIST_URL, {
            timeout: 2000,
            headers: { 'Cache-Control': 'no-cache' }
        });

        const data = res.data.split("\n");
        const segments = data.filter(l => l.endsWith(".ts"));
        const newest = segments[segments.length - 1];
        const now = Date.now();

        if (!newest) {
            console.log(chalk.red(`[ERROR] Playlist has no segments.`));
            return;
        }

        // First detection
        if (!lastSegment) {
            lastSegment = newest;
            lastUpdateTime = now;
            console.log(chalk.green(`[OK] Starting monitor… Current segment: ${newest}`));
            return;
        }

        const ageSec = ((now - lastUpdateTime) / 1000).toFixed(1);

        // New segment arrived → healthy
        if (newest !== lastSegment) {
            console.log(chalk.green(`[OK] New segment: ${newest} (${ageSec}s after previous)`));
            lastSegment = newest;
            lastUpdateTime = now;
            return;
        }

        // No new segment yet
        if (ageSec >= 10) {
            console.log(chalk.red(`[ERROR] Stream frozen! No new segments for ${ageSec}s.`));
        } else if (ageSec >= 5) {
            console.log(chalk.yellow(`[WARN] Stream delayed (${ageSec}s since last update).`));
        } else {
            console.log(chalk.gray(`[INFO] Waiting… (${ageSec}s)`));
        }

    } catch (err) {
        console.log(chalk.red(`[ERROR] Cannot reach playlist: ${err.message}`));
    }
}

console.log(chalk.blue(`HLS Monitor started — checking every 2 seconds…`));
setInterval(checkStream, 2000);
