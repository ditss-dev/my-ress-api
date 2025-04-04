const express = require("express");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello! Welcome to My Ress API");
});

app.get("/api/tiktok", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ status: false, message: "Missing url parameter!" });

  try {
    const response = await fetch(url, {
      headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    });

    const html = await response.text();
    const $ = cheerio.load(html);
    const script = $('script[id="__NEXT_DATA__"]').html();
    const json = JSON.parse(script);
    const videoData = json.props.pageProps.itemInfo.itemStruct;

    res.json({
      status: true,
      video_url: videoData.video.downloadAddr,
      author: videoData.author.nickname,
      desc: videoData.desc,
      music: videoData.music.playUrl,
      thumbnail: videoData.video.cover,
    });

  } catch (err) {
    res.status(500).json({ status: false, message: "Scraping failed!", error: err.message });
  }
});

module.exports = app;

// Untuk Vercel
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}
