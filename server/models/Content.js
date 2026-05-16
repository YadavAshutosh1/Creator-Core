const mongoose = require('mongoose');

const ContentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  videoUrl: {
    type: String,
    required: [true, 'Original video URL is required'],
  },
  title: {
    type: String,
    trim: true,
    default: 'Untitled Content'
  },
  transcript: {
    type: String,
    required: true,
  },
  generations: [
    {
      platform: {
        type: String,
        required: true,
      },
      content: {
        type: String,
        required: true,
      },
      imageUrl: {
        type: String, // Will store the generated image URL
      },
      tone: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }
  ],
  isFavorite: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Content', ContentSchema);
