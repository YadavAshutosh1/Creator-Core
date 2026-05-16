const axios = require('axios');

/**
 * Transcript Service - Custom implementation with browser-like headers
 * to bypass IP-based blocking on production servers (e.g. Render free tier).
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
   * Fetches transcript using direct YouTube innertube API
   * This bypasses the IP blocks that affect the youtube-transcript package
   */
  async getYoutubeTranscript(url) {
    const videoId = this.extractVideoId(url);
    if (!videoId) throw new Error('Invalid YouTube URL. Please paste a valid youtube.com or youtu.be link.');

    // Step 1: Fetch the video page to get the innertube API key and caption info
    const browserHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    };

    let pageHtml;
    try {
      const pageRes = await axios.get(`https://www.youtube.com/watch?v=${videoId}`, {
        headers: browserHeaders,
        timeout: 15000,
      });
      pageHtml = pageRes.data;
    } catch (err) {
      throw new Error('Could not reach YouTube. Please check your internet connection and try again.');
    }

    // Step 2: Extract the innertube API key from the page
    const apiKeyMatch = pageHtml.match(/"INNERTUBE_API_KEY":"([^"]+)"/);
    const apiKey = apiKeyMatch ? apiKeyMatch[1] : 'AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8';

    // Step 3: Extract caption tracks from the page HTML
    const captionsMatch = pageHtml.match(/"captions":\{"playerCaptionsTracklistRenderer":\{"captionTracks":(\[.*?\])/);
    if (!captionsMatch) {
      throw new Error('No transcript available for this video. Try a video that shows "Open transcript" on YouTube.');
    }

    let captionTracks;
    try {
      captionTracks = JSON.parse(captionsMatch[1]);
    } catch {
      throw new Error('Could not parse transcript data from YouTube.');
    }

    if (!captionTracks || captionTracks.length === 0) {
      throw new Error('This video has no captions. Try a video with subtitles or closed captions enabled.');
    }

    // Step 4: Prefer English track, fallback to first available
    const track = captionTracks.find(t => t.languageCode === 'en' || t.languageCode === 'en-US')
      || captionTracks[0];

    const captionUrl = track.baseUrl;

    // Step 5: Fetch the actual transcript XML
    let transcriptXml;
    try {
      const captionRes = await axios.get(captionUrl, { headers: browserHeaders, timeout: 10000 });
      transcriptXml = captionRes.data;
    } catch {
      throw new Error('Could not download the transcript data. Please try again.');
    }

    // Step 6: Parse the XML and extract clean text
    const textMatches = transcriptXml.match(/<text[^>]*>([\s\S]*?)<\/text>/g);
    if (!textMatches || textMatches.length === 0) {
      throw new Error('Transcript data was empty. Please try a different video.');
    }

    const transcript = textMatches
      .map(tag => {
        return tag
          .replace(/<[^>]*>/g, '') // Remove XML tags
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&#39;/g, "'")
          .replace(/&quot;/g, '"')
          .replace(/\n/g, ' ')
          .trim();
      })
      .filter(Boolean)
      .join(' ');

    if (!transcript) {
      throw new Error('Transcript was empty after parsing. Please try a different video.');
    }

    console.log(`✅ Transcript fetched for ${videoId}: ${transcript.split(' ').length} words`);
    return transcript;
  }
}

module.exports = new TranscriptService();
