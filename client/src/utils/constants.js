import { Zap, Sparkles } from 'lucide-react';
import { FaLinkedinIn, FaInstagram, FaYoutube } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

export const PLATFORMS = [
  { 
    id: 'linkedin', 
    name: 'LinkedIn', 
    icon: FaLinkedinIn, 
    color: 'text-[#0A66C2]',
    activeBg: 'bg-[#0A66C2]/10 border-[#0A66C2]/30'
  },
  { 
    id: 'twitter', 
    name: 'X (Twitter)', 
    icon: FaXTwitter, 
    color: 'text-white',
    activeBg: 'bg-white/5 border-white/20'
  },
  { 
    id: 'instagram', 
    name: 'Instagram', 
    icon: FaInstagram, 
    color: 'text-[#E1306C]',
    activeBg: 'bg-[#E1306C]/10 border-[#E1306C]/30'
  },
  { 
    id: 'shorts', 
    name: 'YouTube Shorts', 
    icon: FaYoutube, 
    color: 'text-[#FF0000]',
    activeBg: 'bg-[#FF0000]/10 border-[#FF0000]/30'
  },
  { 
    id: 'hooks', 
    name: 'Viral Hooks', 
    icon: Zap, 
    color: 'text-amber-500',
    activeBg: 'bg-amber-500/10 border-amber-500/30'
  },
  { 
    id: 'custom', 
    name: 'Custom Mode', 
    icon: Sparkles, 
    color: 'text-indigo-400',
    activeBg: 'bg-indigo-400/10 border-indigo-400/30'
  },
];

export const TONES = [
  { id: 'professional', name: 'Professional', emoji: '👔' },
  { id: 'witty', name: 'Witty', emoji: '😏' },
  { id: 'educational', name: 'Educational', emoji: '📚' },
  { id: 'controversial', name: 'Controversial', emoji: '🔥' },
  { id: 'minimalist', name: 'Minimalist', emoji: '✨' },
];
