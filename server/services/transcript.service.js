const axios = require('axios');
const { YoutubeTranscript } = require('youtube-transcript');

const WATCH_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const ANDROID_USER_AGENT =
  'com.google.android.youtube/20.10.38 (Linux; U; Android 14)';
const INNERTUBE_API_URL = 'https://www.youtube.com/youtubei/v1/player?prettyPrint=false';

/**
 * Transcript Service — hybrid fetch with production fallbacks.
 *
 * Strategy 1: youtube-transcript (InnerTube Android client + HTML fallback)
 * Strategy 2: Watch-page scrape + timedtext XML (GET-only proxies — works on Render)
 */
class TranscriptService {
  constructor() {
  this.requestHeaders = {
      'User-Agent': WATCH_USER_AGENT,
      'Accept-Language': 'en-US,en;q=0.9',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    };

    // GET-friendly proxies (Render blocks direct YouTube; POST proxies often fail)
    this.getProxies = [
      (url) => url,
      (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
      (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    ];

    // InnerTube POST must be direct — public POST proxies return 403/HTML errors
    this.innertubeClients = [
      {
        clientName: 'ANDROID',
        clientVersion: '20.10.38',
        userAgent: ANDROID_USER_AGENT,
      },
      {
        clientName: 'IOS',
        clientVersion: '20.10.4',
        userAgent:
          'com.google.ios.youtube/20.10.4 (iPhone14,3; U; CPU iOS 15_6 like Mac OS X)',
      },
    ];
  }

  extractVideoId(url) {
    if (!url) return null;
    const regex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  /**
   * Fetch adapter for youtube-transcript (mimics fetch Response)
   */
  async customFetch(url, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    const isPost = method === 'POST';

    // POST (InnerTube): direct only — proxies break signed API calls
    if (isPost) {
      const res = await axios({
        method: 'POST',
        url,
        data: options.body
          ? typeof options.body === 'string'
            ? JSON.parse(options.body)
            : options.body
          : undefined,
        headers: options.headers,
        timeout: 20000,
        validateStatus: (status) => status < 500,
      });

      if (res.status >= 400) {
        throw new Error(`InnerTube HTTP ${res.status}`);
      }

      const body = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
      return {
        ok: true,
        status: res.status,
        json: async () => (typeof res.data === 'object' ? res.data : JSON.parse(body)),
        text: async () => body,
      };
    }

    // GET (watch page, timedtext XML): direct then GET proxies
    let lastError = null;
    for (const toProxyUrl of this.getProxies) {
      const targetUrl = toProxyUrl(url);
      try {
        const label = targetUrl === url ? 'Direct' : 'Proxy';
        console.log(`🌐 [${label} GET] ${url.substring(0, 90)}...`);

        const res = await axios.get(targetUrl, {
          headers: options.headers || this.requestHeaders,
          timeout: 25000,
          validateStatus: (status) => status < 500,
        });

        if (res.status >= 400 || res.data == null) {
          lastError = new Error(`HTTP ${res.status}`);
          continue;
        }

        const body = typeof res.data === 'string' ? res.data : String(res.data);
        if (body.includes('Sorry...') || body.includes('class="g-recaptcha"')) {
          lastError = new Error('YouTube blocked the request');
          continue;
        }

        return {
          ok: true,
          status: res.status,
          json: async () => JSON.parse(body),
          text: async () => body,
        };
      } catch (err) {
        lastError = err;
        console.warn(`⚠️ GET fetch failed: ${err.message}`);
      }
    }

    throw new Error(
      lastError?.message || 'Failed to connect to YouTube after trying direct and proxy routes.'
    );
  }

  pickCaptionTrack(captionTracks) {
    if (!captionTracks?.length) return null;

    return (
      captionTracks.find(
        (t) =>
          t.languageCode === 'en' ||
          t.languageCode === 'en-US' ||
          t.languageCode === 'en-GB' ||
          t.languageCode?.startsWith('en')
      ) || captionTracks[0]
    );
  }

  decodeXmlEntities(text) {
    return text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#x2F;/g, '/')
      .replace(/\n/g, ' ')
      .trim();
  }

  parseTranscriptXml(xmlString) {
    if (!xmlString || typeof xmlString !== 'string') return null;

    // srv3: <p t="ms" d="ms"><s>word</s></p>
    const srv3Regex = /<p\s+t="(\d+)"\s+d="(\d+)"[^>]*>([\s\S]*?)<\/p>/g;
    const srv3Parts = [];
    let match;

    while ((match = srv3Regex.exec(xmlString)) !== null) {
      const inner = match[3];
      let text = '';
      const sRegex = /<s[^>]*>([^<]*)<\/s>/g;
      let sMatch;
      while ((sMatch = sRegex.exec(inner)) !== null) {
        text += sMatch[1];
      }
      if (!text) text = inner.replace(/<[^>]+>/g, '');
      text = this.decodeXmlEntities(text);
      if (text) srv3Parts.push(text);
    }

    if (srv3Parts.length > 0) return srv3Parts.join(' ');

    // Classic: <text start="..." dur="...">content</text>
    const classicRegex = /<text[^>]*>([\s\S]*?)<\/text>/g;
    const classicParts = [...xmlString.matchAll(classicRegex)]
      .map((m) => this.decodeXmlEntities(m[1]))
      .filter(Boolean);

    return classicParts.length > 0 ? classicParts.join(' ') : null;
  }

  segmentsToText(transcriptData) {
    return transcriptData
      .map((segment) => segment.text.trim())
      .filter(Boolean)
      .join(' ');
  }

  /**
   * Strategy 1 — youtube-transcript package
   */
  async fetchViaLibrary(videoId) {
    const transcriptData = await YoutubeTranscript.fetchTranscript(videoId, {
      fetch: (fetchUrl, fetchOptions) => this.customFetch(fetchUrl, fetchOptions),
    });

    if (!transcriptData?.length) {
      throw new Error('Transcript is empty.');
    }

    return this.segmentsToText(transcriptData);
  }

  /**
   * Strategy 2 — InnerTube direct POST + proxied timedtext GET
   * (watch-page caption URLs are often unsigned; InnerTube URLs work)
   */
  async fetchViaInnertube(videoId) {
    console.log(`🔄 Fallback: InnerTube API for ${videoId}`);

    let captionTracks = null;
    let lastError = null;

    for (const client of this.innertubeClients) {
      try {
        const res = await axios.post(
          INNERTUBE_API_URL,
          {
            context: {
              client: {
                clientName: client.clientName,
                clientVersion: client.clientVersion,
              },
            },
            videoId,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': client.userAgent,
            },
            timeout: 20000,
          }
        );

        captionTracks =
          res.data?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

        if (captionTracks?.length) {
          console.log(`✅ InnerTube ${client.clientName} returned ${captionTracks.length} track(s)`);
          break;
        }
      } catch (err) {
        lastError = err;
        console.warn(`⚠️ InnerTube ${client.clientName} failed: ${err.message}`);
      }
    }

    if (!captionTracks?.length) {
      throw lastError || new Error('No caption tracks from YouTube InnerTube API.');
    }

    const track = this.pickCaptionTrack(captionTracks);
    if (!track?.baseUrl) {
      throw new Error('Could not resolve caption track URL.');
    }

    const captionUrl = new URL(track.baseUrl);
    if (!captionUrl.hostname.endsWith('.youtube.com')) {
      throw new Error('Invalid caption URL from YouTube.');
    }

    console.log(
      `🎯 Caption track: ${track.languageCode} (${track.name?.simpleText || 'default'})`
    );

    const res = await this.customFetch(track.baseUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36',
      },
    });

    const xml = await res.text();
    const transcript = this.parseTranscriptXml(xml);

    if (!transcript || transcript.length < 50) {
      throw new Error('Transcript is empty or too short to process.');
    }

    return transcript;
  }

  mapError(error) {
    const msg = error?.message || '';

    if (msg.includes('Transcript is disabled') || msg.includes('Disabled')) {
      return 'No captions are available for this video. Try a video with subtitles/CC enabled on YouTube.';
    }
    if (msg.includes('Too many requests') || msg.includes('rate-limit') || msg.includes('captcha')) {
      return 'YouTube is rate-limiting requests. Please wait a few minutes and try again.';
    }
    if (msg.includes('No captions found') || msg.includes('not available')) {
      return msg;
    }
    if (msg.includes('Invalid YouTube URL')) {
      return msg;
    }
    if (msg.includes('Failed to connect') || msg.includes('Could not load video page')) {
      return 'Could not reach YouTube from the server. Please try again in a moment.';
    }

    return msg || 'Could not fetch transcript for this video.';
  }

  async getYoutubeTranscript(url) {
    const videoId = this.extractVideoId(url);
    if (!videoId) {
      throw new Error('Invalid YouTube URL. Please paste a valid youtube.com or youtu.be link.');
    }

    console.log(`🔍 Extracting transcript for Video ID: ${videoId}`);

    const strategies = [
      { name: 'library', fn: () => this.fetchViaLibrary(videoId) },
      { name: 'innertube', fn: () => this.fetchViaInnertube(videoId) },
    ];

    let lastError = null;

    for (const strategy of strategies) {
      try {
        const transcript = await strategy.fn();
        console.log(
          `✅ Success via ${strategy.name}! Word count: ${transcript.split(' ').length}`
        );
        return transcript;
      } catch (error) {
        lastError = error;
        console.error(`❌ Strategy "${strategy.name}" failed:`, error.message);
      }
    }

    throw new Error(this.mapError(lastError));
  }
}

module.exports = new TranscriptService();
