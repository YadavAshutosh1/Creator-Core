const axios = require('axios');
const { YoutubeTranscript } = require('youtube-transcript');
const transcriptService = require('../services/transcript.service');

const VIDEO_ID = 'rvobcfGKsxU';
const URL = `https://youtu.be/${VIDEO_ID}`;

async function testWatchPage() {
  const res = await axios.get(`https://www.youtube.com/watch?v=${VIDEO_ID}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    timeout: 15000,
  });
  const html = res.data;
  console.log('watch page:', {
    length: html.length,
    captionTracks: html.includes('captionTracks'),
    playerResponse: html.includes('ytInitialPlayerResponse'),
  });
}

async function testLibrary() {
  const data = await YoutubeTranscript.fetchTranscript(VIDEO_ID);
  console.log('library segments:', data.length);
}

async function testService() {
  const text = await transcriptService.getYoutubeTranscript(URL);
  console.log('service words:', text.split(' ').length);
}

async function main() {
  const step = process.argv[2] || 'all';
  try {
    if (step === 'watch' || step === 'all') await testWatchPage();
    if (step === 'library' || step === 'all') await testLibrary();
    if (step === 'service' || step === 'all') await testService();
  } catch (err) {
    console.error('FAILED:', err.message);
    process.exit(1);
  }
}

main();
