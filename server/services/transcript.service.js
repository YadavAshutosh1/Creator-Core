const { Innertube } = require('youtubei.js');

/**
 * Transcript Service - Powered by youtubei.js (Innertube API)
 * 
 * This is the most robust way to fetch transcripts as it mimics 
 * YouTube's official internal API clients.
 */
class TranscriptService {
  constructor() {
    this.youtube = null;
  }

  async init() {
    if (!this.youtube) {
      this.youtube = await Innertube.create();
    }
  }

  extractVideoId(url) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  async getYoutubeTranscript(url) {
    const videoId = this.extractVideoId(url);
    if (!videoId) {
      throw new Error('Invalid YouTube URL. Please paste a valid youtube.com or youtu.be link.');
    }

    console.log(`🔍 Fetching transcript for: ${videoId} using youtubei.js`);

    try {
      await this.init();
      
      const info = await this.youtube.getInfo(videoId);
      const transcriptData = await info.getTranscript();

      if (!transcriptData || !transcriptData.transcript || !transcriptData.transcript.content) {
         throw new Error('No transcript available for this video.');
      }

      // transcriptData.transcript.content usually contains bodies with segments
      // We need to extract all text segments
      const segments = transcriptData.transcript.content.body.initial_segments;
      
      if (!segments || segments.length === 0) {
        throw new Error('Transcript is empty for this video.');
      }

      const transcript = segments
        .map(segment => segment.snippet.text.trim())
        .filter(Boolean)
        .join(' ');

      if (transcript.length < 50) {
         throw new Error('Transcript is too short to process.');
      }

      console.log(`✅ Transcript fetched: ${transcript.split(' ').length} words`);
      return transcript;

    } catch (error) {
      console.error('❌ youtubei.js Error:', error.message);
      
      if (error.message.includes('Transcript is disabled') || error.message.includes('No transcript available')) {
        throw new Error('Transcript is disabled on this video. Please try a video with closed captions enabled.');
      }
      
      throw new Error(`Could not fetch transcript: ${error.message}`);
    }
  }
}

module.exports = new TranscriptService();
