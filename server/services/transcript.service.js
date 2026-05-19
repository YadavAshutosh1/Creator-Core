const axios = require('axios');

/**
 * Transcript Service - Custom lightweight scraper with multi-fallback proxy and embed support
 * 
 * Bypasses the fragile Innertube (youtubei.js) and youtube-transcript API blocks 
 * by scraping the YouTube watch or embed pages with custom headers and routing 
 * through public CORS proxies when blocked on shared servers (like Render).
 */
class TranscriptService {
  constructor() {
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    };

    // Free public CORS proxies that do not have their IPs blocked by YouTube
    this.proxies = [
      (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
      (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
    ];
  }

  /**
   * Extracts clean video ID from any YouTube URL
   */
  extractVideoId(url) {
    if (!url) return null;
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  /**
   * Performs an HTTP GET request trying direct route first, then fallbacks through proxies
   */
  async fetchWithFallback(targetUrl, isJson = false) {
    const urls = [
      targetUrl,
      ...this.proxies.map(proxy => proxy(targetUrl))
    ];

    let lastError = null;

    for (const url of urls) {
      try {
        console.log(`🌐 Fetching: ${url.substring(0, 100)}...`);
        const res = await axios.get(url, {
          headers: this.headers,
          timeout: 10000
        });

        let data = res.data;
        
        // Handle allorigins wrapping if it returns stringified JSON
        if (typeof data === 'string' && data.trim().startsWith('{') && isJson) {
          try {
            data = JSON.parse(data);
          } catch (e) {}
        }

        if (data) {
          return data;
        }
      } catch (err) {
        console.warn(`⚠️ Fetch failed for: ${url.substring(0, 60)}: ${err.message}`);
        lastError = err;
      }
    }

    throw new Error(lastError ? lastError.message : 'Failed to reach YouTube via any route.');
  }

  /**
   * Scrapes caption tracks list from page HTML
   */
  extractCaptionTracks(html) {
    if (!html || typeof html !== 'string') return null;

    let captionTracks = null;

    // Strategy 1: Look for captionTracks inside playerResponse JSON block
    const match1 = html.match(/"captionTracks"\s*:\s*(\[.*?\])/);
    if (match1) {
      try {
        captionTracks = JSON.parse(match1[1]);
      } catch (e) {}
    }

    // Strategy 2: Look for escaped captionTracks (inside stringified json inside script tag)
    if (!captionTracks) {
      const match2 = html.match(/\\"captionTracks\\"\s*:\s*(\[.*?\])/);
      if (match2) {
        try {
          const cleaned = match2[1].replace(/\\"/g, '"');
          captionTracks = JSON.parse(cleaned);
        } catch (e) {}
      }
    }

    // Strategy 3: Try to parse complete ytInitialPlayerResponse block
    if (!captionTracks) {
      try {
        const parts = html.split('ytInitialPlayerResponse = ');
        if (parts.length > 1) {
          const rawJson = parts[1].split('};')[0] + '}';
          const parsed = JSON.parse(rawJson);
          captionTracks = parsed.captions?.playerCaptionsTracklistRenderer?.captionTracks;
        }
      } catch (e) {}
    }

    // Strategy 4: Embed page URI-encoded metadata
    if (!captionTracks) {
      const match4 = html.match(/captionTracks=([^&"]+)/);
      if (match4) {
        try {
          const decoded = decodeURIComponent(match4[1]);
          captionTracks = JSON.parse(decoded);
        } catch (e) {}
      }
    }

    return captionTracks;
  }

  /**
   * Decodes XML elements and html entities into clean transcript string
   */
  parseXmlTranscript(xmlString) {
    if (!xmlString || typeof xmlString !== 'string') return null;

    const regex = /<text[^>]*>([\s\S]*?)<\/text>/g;
    const matches = [...xmlString.matchAll(regex)];
    if (!matches || matches.length === 0) return null;

    return matches
      .map(match => {
        let text = match[1];
        // Decode HTML entities
        text = text
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&#x2F;/g, '/')
          .replace(/&#x60;/g, '`')
          .replace(/&#x3D;/g, '=')
          .replace(/\n/g, ' ')
          .trim();
        return text;
      })
      .filter(Boolean)
      .join(' ');
  }

  /**
   * Main entry point
   */
  async getYoutubeTranscript(url) {
    const videoId = this.extractVideoId(url);
    if (!videoId) {
      throw new Error('Invalid YouTube URL. Please paste a valid youtube.com or youtu.be link.');
    }

    console.log(`🔍 Extracting transcript for Video ID: ${videoId}`);

    let html = null;
    let captionTracks = null;

    // Step 1: Try Watch Page first
    try {
      html = await this.fetchWithFallback(`https://www.youtube.com/watch?v=${videoId}`);
      captionTracks = this.extractCaptionTracks(html);
    } catch (err) {
      console.warn(`⚠️ Direct watch page fetch failed, trying embed...`);
    }

    // Step 2: Try Embed Page as fallback if watch page failed or returned no captions
    if (!captionTracks) {
      try {
        html = await this.fetchWithFallback(`https://www.youtube.com/embed/${videoId}`);
        captionTracks = this.extractCaptionTracks(html);
      } catch (err) {
        console.error(`❌ Embed page fetch failed: ${err.message}`);
      }
    }

    if (!captionTracks || captionTracks.length === 0) {
      throw new Error('Transcript is disabled or unavailable for this video. Please try a video with closed captions (subtitles) enabled on YouTube.');
    }

    // Step 3: Find the best track (English priority, then fallback to first available)
    const track = captionTracks.find(t => 
      t.languageCode === 'en' || 
      t.languageCode === 'en-US' || 
      t.languageCode === 'en-GB' ||
      t.languageCode.startsWith('en')
    ) || captionTracks[0];

    if (!track || !track.baseUrl) {
      throw new Error('Could not find caption track URL.');
    }

    console.log(`🎯 Found caption track: ${track.languageCode} (${track.name?.simpleText || 'Default'})`);

    // Step 4: Fetch raw subtitle xml
    const xmlContent = await this.fetchWithFallback(track.baseUrl);
    
    // Step 5: Parse XML to clean text transcript
    const transcript = this.parseXmlTranscript(xmlContent);

    if (!transcript || transcript.length < 50) {
      throw new Error('Transcript is empty or too short to process.');
    }

    console.log(`✅ Success! Extracted transcript: ${transcript.split(' ').length} words`);
    return transcript;
  }
}

module.exports = new TranscriptService();
