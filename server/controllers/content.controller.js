const transcriptService = require('../services/transcript.service');
const aiService = require('../services/ai.service');
const prompts = require('../prompts/repurpose.prompt');
const Content = require('../models/Content');
const User = require('../models/User');

/**
 * Handles transcript extraction request
 */
const extractTranscript = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    console.log(`🔍 Extracting transcript for: ${url}`);
    const transcript = await transcriptService.getYoutubeTranscript(url);

    res.status(200).json({
      success: true,
      transcript,
      wordCount: transcript.split(' ').length
    });
  } catch (error) {
    // If it's a transcript error, return 400 instead of 500
    const statusCode = error.message.includes('Transcript') || error.message.includes('URL') ? 400 : 500;
    res.status(statusCode).json({ success: false, error: error.message });
  }
};

/**
 * Handles AI content generation request with Credit Deduction
 */
const generateContent = async (req, res) => {
  try {
    const { transcript, platforms, tone, customInstruction, customBrandVoice } = req.body;

    if (!transcript || !platforms || !Array.isArray(platforms)) {
      return res.status(400).json({ error: 'Missing transcript or platforms array' });
    }

    // --- Credit Check ---
    if (req.user.credits <= 0) {
      return res.status(403).json({ error: 'Insufficient credits. Please upgrade your plan.' });
    }

    console.log(`🤖 Generating parallel content for ${req.user.name}: ${platforms.join(', ')}...`);

    const generationPromises = platforms.map(async (p) => {
      let promptTemplate = '';
      switch (p) {
        case 'linkedin': promptTemplate = prompts.LINKEDIN_PROMPT; break;
        case 'twitter': promptTemplate = prompts.TWITTER_PROMPT; break;
        case 'instagram': promptTemplate = prompts.INSTAGRAM_PROMPT; break;
        case 'shorts': promptTemplate = prompts.SHORTS_PROMPT; break;
        case 'hooks': promptTemplate = prompts.HOOK_PROMPT; break;
        case 'custom': promptTemplate = prompts.CUSTOM_PROMPT(customInstruction || 'Summarize this.'); break;
        default: promptTemplate = prompts.LINKEDIN_PROMPT;
      }

      // Prioritize Custom Brand Voice over preset tones
      const toneDescription = customBrandVoice && customBrandVoice.trim() !== ''
        ? `\nCRITICAL BRAND VOICE INSTRUCTIONS: You MUST adhere to the following style: ${customBrandVoice}\n`
        : (tone && prompts.TONES[tone] ? `\nTONE & VOICE: ${prompts.TONES[tone]}\n` : '');
        
      const finalPrompt = `${promptTemplate}${toneDescription}`;
      const content = await aiService.generateContent(finalPrompt, transcript);
      
      return { platform: p, content };
    });

    const results = await Promise.allSettled(generationPromises);
    const successfulContent = {};
    let successCount = 0;

    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        successfulContent[result.value.platform] = result.value.content;
        successCount++;
      }
    });

    // --- Deduct Credits on Success ---
    if (successCount > 0) {
      await User.findByIdAndUpdate(req.user.id, { $inc: { credits: -1 } });
    }

    res.status(200).json({
      success: true,
      results: successfulContent,
      remainingCredits: req.user.credits - 1
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Persistent Vault Methods
 */
const getUserContent = async (req, res) => {
  try {
    const contents = await Content.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: contents.length, data: contents });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const saveContent = async (req, res) => {
  try {
    const { videoUrl, transcript, generations, title } = req.body;
    const content = await Content.create({
      user: req.user.id,
      videoUrl,
      title: title || 'Untitled Repurpose',
      transcript,
      generations
    });
    res.status(201).json({ success: true, data: content });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteContent = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    if (!content) return res.status(404).json({ error: 'Content not found' });
    if (content.user.toString() !== req.user.id) return res.status(401).json({ error: 'Not authorized' });

    await content.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  extractTranscript,
  generateContent,
  getUserContent,
  saveContent,
  deleteContent
};
