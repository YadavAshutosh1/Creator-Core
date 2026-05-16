const axios = require('axios');

/**
 * Transcript Service - Multi-strategy implementation
 * Strategy 1: YouTube timedtext direct API (most reliable)
 * Strategy 2: Page scraping with multiple regex patterns (fallback)
 */
class TranscriptService {
  extractVideoId(url) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  /**
   * Strategy 1: Direct timedtext API
   */
  async tryTimedtextAPI(videoId) {
    const langs = ['en', 'en-US', 'en-GB', 'a.en'];
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    };

    for (const lang of langs) {
      try {
        const res = await axios.get(
          `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${lang}&fmt=json3`,
          { headers, timeout: 10000 }
        );

        const data = res.data;
        if (data && data.events && data.events.length > 0) {
          const text = data.events
            .filter(e => e.segs)
            .map(e => e.segs.map(s => s.utf8 || '').join(''))
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();

          if (text.length > 50) {
            console.log(`✅ [Strategy 1] Transcript via timedtext API (${lang}): ${text.split(' ').length} words`);
            return text;
          }
        }
      } catch (e) {
        console.warn(`⚠️ Timedtext API failed for lang ${lang}:`, e.message);
      }
    }
    return null;
  }

  /**
   * Strategy 2: Page scraping with robust regex patterns
   */
  async tryPageScraping(videoId) {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    };

    const pageRes = await axios.get(
      `https://www.youtube.com/watch?v=${videoId}`,
      { headers, timeout: 15000 }
    );
    const html = pageRes.data;

    // Try multiple regex patterns for different YouTube HTML versions
    const patterns = [
      /"captionTracks":(\[.*?\])/,
      /"captions":\{"playerCaptionsTracklistRenderer":\{"captionTracks":(\[[\s\S]*?\])/,
      /captionTracks":"(\[.*?\])"/,
    ];

    let captionTracks = null;
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) {
        try {
          captionTracks = JSON.parse(match[1]);
          if (captionTracks && captionTracks.length > 0) break;
        } catch (e) {
          continue;
        }
      }
    }

    if (!captionTracks || captionTracks.length === 0) return null;

    // Prefer English, fallback to first available
    const track = captionTracks.find(t => t.languageCode === 'en' || t.languageCode === 'en-US')
      || captionTracks[0];

    const captionRes = await axios.get(track.baseUrl, { headers, timeout: 10000 });
    const xml = captionRes.data;

    const textMatches = xml.match(/<text[^>]*>([\s\S]*?)<\/text>/g);
    if (!textMatches) return null;

    const text = textMatches
      .map(tag => tag
        .replace(/<[^>]*>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/\n/g, ' ')
        .trim()
      )
      .filter(Boolean)
      .join(' ');

    if (text.length > 50) {
      console.log(`✅ [Strategy 2] Transcript via page scraping: ${text.split(' ').length} words`);
      return text;
    }
    return null;
  }

  /**
   * Main entry point - tries all strategies in order
   */
  async getYoutubeTranscript(url) {
    const videoId = this.extractVideoId(url);
    if (!videoId) {
      throw new Error('Invalid YouTube URL. Please paste a valid youtube.com or youtu.be link.');
    }

    console.log(`🔍 Fetching transcript for video: ${videoId}`);

    // Try Strategy 1 first
    try {
      const result = await this.tryTimedtextAPI(videoId);
      if (result) return result;
    } catch (e) {
      console.warn('Strategy 1 failed:', e.message);
    }

    // Try Strategy 2 as fallback
    try {
      const result = await this.tryPageScraping(videoId);
      if (result) return result;
    } catch (e) {
      console.warn('Strategy 2 failed:', e.message);
    }

    // All strategies failed
    throw new Error(
      'No transcript available for this video. To check: open the video on YouTube → click "..." → look for "Open transcript". If that option is missing, this video has no captions.'
    );
  }
}

module.exports = new TranscriptService();
