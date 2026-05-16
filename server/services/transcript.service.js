const { YoutubeTranscript } = require('youtube-transcript');

/**
 * Transcript Service for fetching and cleaning YouTube transcripts
 */
class TranscriptService {
  /**
   * Extracts video ID from various YouTube URL formats
   */
  extractVideoId(url) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  /**
   * Fetches transcript with automatic language fallback
   */
  async getYoutubeTranscript(url) {
    try {
      const videoId = this.extractVideoId(url);
      if (!videoId) throw new Error('Invalid YouTube URL');

      let transcriptData;
      
      try {
        // Attempt 1: Fetch English
        transcriptData = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'en' });
      } catch (e) {
        console.warn('⚠️ English transcript not found, attempting fallback...');
        // Attempt 2: Fetch any available language
        transcriptData = await YoutubeTranscript.fetchTranscript(videoId);
      }

      if (!transcriptData || transcriptData.length === 0) {
        throw new Error('Transcript is empty or unavailable for this video.');
      }

      // Clean and join the transcript text
      return transcriptData
        .map(item => item.text
          .replace(/&amp;/g, '&')
          .replace(/&#39;/g, "'")
          .replace(/&quot;/g, '"')
          .replace(/\s+/g, ' ')
        )
        .join(' ')
        .trim();

    } catch (error) {
      console.error('Transcript Service Error:', error.message);
      throw new Error(error.message || 'Failed to fetch transcript');
    }
  }
}

module.exports = new TranscriptService();
