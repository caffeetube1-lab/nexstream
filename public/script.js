const videoUrlInput = document.getElementById('videoUrl');
const downloadBtn = document.getElementById('downloadBtn');
const loader = document.getElementById('loader');
const btnText = document.querySelector('.btn-text');
const infoCard = document.getElementById('infoCard');
const thumbnail = document.getElementById('thumbnail');
const title = document.getElementById('title');
const author = document.getElementById('author');
const startDownloadBtn = document.getElementById('startDownload');
const statusContainer = document.getElementById('statusContainer');
const statusText = document.getElementById('statusText');
const progressBar = document.getElementById('progressBar');

let currentVideoData = null;

downloadBtn.addEventListener('click', async () => {
    const url = videoUrlInput.value.trim();
    if (!url) {
        alert('Please paste a valid video URL');
        return;
    }

    // Reset and show loading
    downloadBtn.disabled = true;
    loader.style.display = 'block';
    btnText.textContent = 'Processing...';
    infoCard.style.display = 'none';

    try {
        const response = await fetch(`/api/info?url=${encodeURIComponent(url)}`);
        let data;

        try {
            const text = await response.text();
            data = JSON.parse(text);
        } catch (err) {
            throw new Error('The server returned an invalid response. This usually means the deployment is still starting or yt-dlp is not ready.');
        }

        if (!response.ok || data.error) {
            throw new Error(data.error || `Server error (${response.status})`);
        }

        // Store data for download
        currentVideoData = data;

        // Show info
        thumbnail.src = data.thumbnail;
        title.textContent = data.title;
        author.textContent = `By ${data.author}`;
        infoCard.style.display = 'block';

    } catch (err) {
        alert('Error: ' + err.message);
    } finally {
        downloadBtn.disabled = false;
        loader.style.display = 'none';
        btnText.textContent = 'Extract Video';
    }
});

startDownloadBtn.addEventListener('click', async () => {
    const url = videoUrlInput.value.trim();
    const quality = document.getElementById('quality').value;
    const videoTitle = title.textContent;
    const videoSize = currentVideoData ? currentVideoData.size : 0;
    
    statusContainer.style.display = 'block';
    statusText.textContent = 'Connecting to server...';
    progressBar.style.width = '0%';
    startDownloadBtn.disabled = true;

    try {
        const downloadUrl = `/api/download?url=${encodeURIComponent(url)}&quality=${quality}&title=${encodeURIComponent(videoTitle)}&size=${videoSize}`;
        const response = await fetch(downloadUrl);

        if (!response.ok) throw new Error('Download failed to start');

        const reader = response.body.getReader();
        const contentLength = +response.headers.get('Content-Length');
        
        let receivedLength = 0;
        let chunks = [];

        while(true) {
            const {done, value} = await reader.read();
            if (done) break;

            chunks.push(value);
            receivedLength += value.length;

            if (contentLength) {
                const percent = Math.round((receivedLength / contentLength) * 100);
                progressBar.style.width = `${percent}%`;
                statusText.textContent = `Downloading... ${percent}% (${(receivedLength / 1024 / 1024).toFixed(1)} MB)`;
            } else {
                statusText.textContent = `Downloading... ${(receivedLength / 1024 / 1024).toFixed(1)} MB`;
                progressBar.style.width = '50%'; // Indeterminate
            }
        }

        statusText.textContent = 'Finalizing file...';
        const blob = new Blob(chunks);
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = `${videoTitle}.${quality === 'highestaudio' ? 'mp3' : 'mp4'}`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        progressBar.style.width = '100%';
        statusText.textContent = 'Download complete!';
        
        setTimeout(() => {
            statusContainer.style.display = 'none';
            startDownloadBtn.disabled = false;
        }, 5000);

    } catch (err) {
        alert('Download error: ' + err.message);
        statusContainer.style.display = 'none';
        startDownloadBtn.disabled = false;
    }
});
