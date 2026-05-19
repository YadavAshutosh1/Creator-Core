const axios = require('axios');

async function resolveFromPage(videoId) {
  const res = await axios.get(`https://www.youtube.com/watch?v=${videoId}`, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36' },
    timeout: 15000,
    maxRedirects: 5,
  });
  const html = res.data;
  const canonical = html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([^"]+)"/);
  const ogUrl = html.match(/property="og:url" content="https:\/\/www\.youtube\.com\/watch\?v=([^"]+)"/);
  const videoDetails = html.match(/"videoId":"([^"]+)"/);
  console.log(videoId, {
    finalUrl: res.request?.res?.responseUrl || res.config.url,
    canonical: canonical?.[1],
    ogUrl: ogUrl?.[1],
    videoDetails: videoDetails?.[1],
    hasPlayability: html.includes('playabilityStatus'),
  });
}

resolveFromPage('rvobcfGKsXU');
resolveFromPage('rvobcfGKsxU');
