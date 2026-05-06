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
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: `Server error (${response.status}). The link might be restricted or invalid.` }));
            throw new Error(errorData.error || 'Failed to extract video info');
        }

        const data = await response.json();

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

startDownloadBtn.addEventListener('click', () => {
    const url = videoUrlInput.value.trim();
    const quality = document.getElementById('quality').value;
    
    statusContainer.style.display = 'block';
    statusText.textContent = 'Initializing download...';
    progressBar.style.width = '0%';

    // We'll use a direct link or a stream. 
    // For simplicity in this demo, we'll trigger a window.location change to the download route
    const videoTitle = title.textContent;
    window.location.href = `/api/download?url=${encodeURIComponent(url)}&quality=${quality}&title=${encodeURIComponent(videoTitle)}`;
    
    // Simulate progress since we can't easily track stream progress in a simple window.location change
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 95) {
            progress = 95;
            clearInterval(interval);
        }
        progressBar.style.width = `${progress}%`;
        statusText.textContent = `Downloading... ${Math.round(progress)}%`;
    }, 500);

    // After a few seconds, reset
    setTimeout(() => {
        clearInterval(interval);
        progressBar.style.width = '100%';
        statusText.textContent = 'Download started! Check your downloads folder.';
        setTimeout(() => {
            statusContainer.style.display = 'none';
        }, 5000);
    }, 8000);
});
