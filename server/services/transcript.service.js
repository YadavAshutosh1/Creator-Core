const axios = require('axios');
const { YoutubeTranscript } = require('youtube-transcript');

/**
 * Transcript Service - Production Grade Hybrid Implementation
 * 
 * Uses the proven, highly optimized 'youtube-transcript' package which uses
 * YouTube's official internal Android client API. This is extended with a custom
 * fetch wrapper that falls back to CORS proxies if YouTube rate-limits or blocks 
 * our hosting platform's (Render) shared server IPs.
 */
class TranscriptService {
  constructor() {
    // Free CORS proxies that bypass YouTube IP blocks on Render
    this.proxies = [
      (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
      (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
    ];
  }

  /**
   * Extracts clean 11-char video ID from any YouTube URL format
   */
  extractVideoId(url) {
    if (!url) return null;
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  /**
   * Custom fetch implementation that bridges node-fetch interface to Axios
   * and automatically routes requests through high-speed proxies upon direct failure.
   */
  async customFetch(url, options = {}) {
    const fetchWithProxy = async (targetUrl) => {
      return await axios({
        method: options.method || 'GET',
        url: targetUrl,
        data: options.body ? JSON.parse(options.body) : undefined,
        headers: options.headers,
        timeout: 10000
      });
    };

    // 1. Try direct fetch first
    try {
      console.log(`🌐 [Direct Fetch] ${url.substring(0, 100)}...`);
      const res = await fetchWithProxy(url);
      
      return {
        ok: true,
        status: res.status,
        json: async () => typeof res.data === 'string' ? JSON.parse(res.data) : res.data,
        text: async () => typeof res.data === 'string' ? res.data : JSON.stringify(res.data)
      };
    } catch (err) {
      console.warn(`⚠️ Direct fetch failed: ${err.message}. Trying CORS proxies...`);
    }

    // 2. Try proxy fallbacks sequentially
    for (const proxyFn of this.proxies) {
      try {
        const proxyUrl = proxyFn(url);
        console.log(`🌐 [Proxy Fetch] ${proxyUrl.substring(0, 100)}...`);
        const res = await fetchWithProxy(proxyUrl);
        
        return {
          ok: true,
          status: res.status,
          json: async () => typeof res.data === 'string' ? JSON.parse(res.data) : res.data,
          text: async () => typeof res.data === 'string' ? res.data : JSON.stringify(res.data)
        };
      } catch (err) {
        console.warn(`⚠️ Proxy failed: ${err.message}`);
      }
    }

    throw new Error('Failed to connect to YouTube API after trying direct and proxy routes.');
  }

  /**
   * Main entry point called by the Content Controller
   */
  async getYoutubeTranscript(url) {
    const videoId = this.extractVideoId(url);
    if (!videoId) {
      throw new Error('Invalid YouTube URL. Please paste a valid youtube.com or youtu.be link.');
    }

    console.log(`🔍 Extracting transcript for Video ID: ${videoId}`);

    try {
      // Fetch transcript using the custom-fetch wrapped YoutubeTranscript library
      const transcriptData = await YoutubeTranscript.fetchTranscript(videoId, {
        fetch: (fetchUrl, fetchOptions) => this.customFetch(fetchUrl, fetchOptions)
      });

      if (!transcriptData || transcriptData.length === 0) {
        throw new Error('Transcript is empty or disabled on this video.');
      }

      // Combine text segments into a single cohesive string
      const fullTranscript = transcriptData
        .map(segment => segment.text.trim())
        .filter(Boolean)
        .join(' ');

      if (fullTranscript.length < 50) {
        throw new Error('Transcript is too short to process.');
      }

      console.log(`✅ Success! Combined transcript word count: ${fullTranscript.split(' ').length}`);
      return fullTranscript;

    } catch (error) {
      console.error('❌ Transcript Fetch Error:', error.message);
      
      // Map error messages to user-friendly tips
      if (error.message.includes('Transcript is disabled') || error.message.includes('Disabled')) {
        throw new Error('Transcript is disabled on this video. Please try a video with closed captions enabled.');
      }
      if (error.message.includes('Too many requests') || error.message.includes('captcha')) {
        throw new Error('YouTube is currently rate-limiting requests. Please try again in a few minutes.');
      }
      if (error.message.includes('Impossible to retrieve')) {
        throw new Error('Could not parse YouTube video ID. Check the URL and try again.');
      }

      throw new Error(error.message || 'Could not fetch transcript for this video.');
    }
  }
}

module.exports = new TranscriptService();
