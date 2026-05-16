const axios = require('axios');

/**
 * Transcript Service - Production-grade implementation
 * 
 * Since Render's shared IPs get blocked by YouTube's rate limiter,
 * we route requests through corsproxy.io to bypass IP-level blocking.
 * Multiple strategies are tried in sequence.
 */
class TranscriptService {
  constructor() {
    this.browserHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
    };
    // Free CORS proxies to bypass YouTube's IP-based blocking on Render
    this.proxies = [
      (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
      (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    ];
  }

  extractVideoId(url) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  /**
   * Fetches a URL, trying directly first, then through proxies
   */
  async fetchWithFallback(targetUrl, responseType = 'json') {
    const urls = [
      targetUrl,
      ...this.proxies.map(proxy => proxy(targetUrl))
    ];

    for (const url of urls) {
      try {
        const res = await axios.get(url, {
          headers: this.browserHeaders,
          timeout: 12000,
          responseType: 'text', // Always get text so we can parse manually
        });
        if (res.data && res.data.length > 10) return res.data;
      } catch (e) {
        console.warn(`⚠️ Fetch failed for: ${url.substring(0, 60)}...`, e.message);
      }
    }
    return null;
  }

  /**
   * Strategy 1: Direct timedtext JSON API (tries 4 language variants)
   */
  async tryTimedtextAPI(videoId) {
    const langs = ['en', 'en-US', 'a.en', 'en-GB'];
    for (const lang of langs) {
      try {
        const apiUrl = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${lang}&fmt=json3`;
        const rawData = await this.fetchWithFallback(apiUrl);
        if (!rawData) continue;

        // allorigins wraps content; handle both cases
        let data;
        try { data = typeof rawData === 'string' ? JSON.parse(rawData) : rawData; } 
        catch { continue; }

        if (data && data.events && data.events.length > 0) {
          const text = data.events
            .filter(e => e.segs)
            .map(e => e.segs.map(s => s.utf8 || '').join(''))
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();

          if (text.length > 50) {
            console.log(`✅ [S1] timedtext/${lang}: ${text.split(' ').length} words`);
            return text;
          }
        }
      } catch (e) {
        console.warn(`⚠️ [S1] lang ${lang} failed:`, e.message);
      }
    }
    return null;
  }

  /**
   * Strategy 2: Fetch video page, extract caption URL, download XML
   */
  async tryPageScraping(videoId) {
    const pageUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const html = await this.fetchWithFallback(pageUrl, 'text');
    if (!html) return null;

    // Try multiple regex patterns
    const patterns = [
      /"captionTracks":(\[.*?\])/,
      /captionTracks%22%3A(%5B.*?%5D)/,
    ];

    let captionTracks = null;
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) {
        try {
          const decoded = decodeURIComponent(match[1]);
          captionTracks = JSON.parse(decoded);
          if (captionTracks && captionTracks.length > 0) break;
        } catch {
          try {
            captionTracks = JSON.parse(match[1]);
            if (captionTracks && captionTracks.length > 0) break;
          } catch { continue; }
        }
      }
    }

    if (!captionTracks || captionTracks.length === 0) return null;

    const track = captionTracks.find(t =>
      t.languageCode === 'en' || t.languageCode === 'en-US'
    ) || captionTracks[0];

    const xml = await this.fetchWithFallback(track.baseUrl, 'text');
    if (!xml) return null;

    const textMatches = xml.match(/<text[^>]*>([\s\S]*?)<\/text>/g);
    if (!textMatches) return null;

    const text = textMatches
      .map(tag => tag
        .replace(/<[^>]*>/g, '')
        .replace(/&amp;/g, '&').replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>').replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"').replace(/\n/g, ' ').trim()
      )
      .filter(Boolean).join(' ');

    if (text.length > 50) {
      console.log(`✅ [S2] page scraping: ${text.split(' ').length} words`);
      return text;
    }
    return null;
  }

  /**
   * Main entry point
   */
  async getYoutubeTranscript(url) {
    const videoId = this.extractVideoId(url);
    if (!videoId) {
      throw new Error('Invalid YouTube URL. Please paste a valid youtube.com or youtu.be link.');
    }

    console.log(`🔍 Fetching transcript for: ${videoId}`);

    const strategies = [
      () => this.tryTimedtextAPI(videoId),
      () => this.tryPageScraping(videoId),
    ];

    for (const strategy of strategies) {
      try {
        const result = await strategy();
        if (result) return result;
      } catch (e) {
        console.warn('Strategy failed:', e.message);
      }
    }

    throw new Error(
      'Could not fetch transcript for this video. Please use a YouTube video that has subtitles (click "..." on the video → "Open transcript" to verify).'
    );
  }
}

module.exports = new TranscriptService();
