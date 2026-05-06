# 🚀 How to Deploy NexStream Online

Your video downloader is now ready for the world! Here are the best ways to deploy it online so anyone can use it.

## Option 1: Render (Easiest)
Render is a great platform for hosting Node.js apps.

1. **Push to GitHub**: Upload your project to a GitHub repository.
2. **Connect to Render**: Go to [Render.com](https://render.com), create a new **Web Service**, and connect your GitHub repo.
3. **Configuration**:
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. **Environment**: You will need to install `yt-dlp` and `ffmpeg`. The easiest way is to use the **Dockerfile** I created for you.
   - On Render, change the **Runtime** to **Docker**. It will automatically use the `Dockerfile` to set everything up.

## Option 2: Railway (Recommended)
Railway is extremely fast and handles Docker automatically.

1. Install the [Railway CLI](https://docs.railway.app/guides/cli).
2. Run `railway login`.
3. Run `railway up`. 
4. Railway will detect the `Dockerfile` and deploy the app instantly.

## Option 3: VPS (DigitalOcean, AWS, etc.)
If you have your own server:

1. Install Docker on your server.
2. Clone your repo.
3. Run: `docker build -t nexstream .`
4. Run: `docker run -p 3000:3000 nexstream`

---

### Important Notes
- **Cookies**: Many platforms (like YouTube) might block automated traffic from cloud servers. The current code is set up to handle this as gracefully as possible, but if you get "403 Forbidden" errors, you may need to provide a `cookies.txt` file to `yt-dlp`.
- **Resources**: Video processing can be intensive. Make sure your hosting plan has at least 512MB-1GB of RAM.
