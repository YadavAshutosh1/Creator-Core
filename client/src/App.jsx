import { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Rocket, Loader2, Sparkles, Zap, Bookmark, 
  ChevronRight, AlertCircle, Download, 
  Clock, FileText, XCircle, LogOut,
  Search, Filter, Globe
} from 'lucide-react';

import { PLATFORMS, TONES } from './utils/constants';
import { calculateStats, exportToTxt } from './utils/helpers';
import authService from './services/authService';
import ContentCard from './components/ContentCard';
import VaultItem from './components/VaultItem';
import AuthOverlay from './components/AuthOverlay';
import Billing from './components/Billing';
import Landing from './components/Landing';
import SpotlightCard from './components/SpotlightCard';
import CountUp from './components/CountUp';
import ShinyText from './components/ShinyText';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// --- Framer Motion Variants ---
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
};
const stagger = {
  show: { transition: { staggerChildren: 0.07 } }
};
const slideRight = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
};

function App() {
  const [user, setUser] = useState(authService.getCurrentUser());

  const [vault, setVault] = useState([]);
  const [vaultLoading, setVaultLoading] = useState(false);
  const isAuthenticated = !!user;

  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [currentView, setCurrentView] = useState('dashboard');
  const [showAuth, setShowAuth] = useState(false);
  const [viewingLanding, setViewingLanding] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [genLoading, setGenLoading] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResults, setAiResults] = useState({});
  const [error, setError] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState(['linkedin', 'twitter']);
  const [selectedTone, setSelectedTone] = useState('professional');
  const [customInstruction, setCustomInstruction] = useState('');
  const [customBrandVoice, setCustomBrandVoice] = useState('');

  const filteredVault = vault.filter(item => {
    const matchesSearch = (item.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.generations[0]?.content || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = platformFilter === 'all' || item.generations[0]?.platform === platformFilter;
    return matchesSearch && matchesPlatform;
  });

  useEffect(() => { if (isAuthenticated) fetchVault(); }, [isAuthenticated]);

  const fetchVault = async () => {
    setVaultLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/content/vault`, { headers: authService.getAuthHeader() });
      setVault(res.data.data);
    } catch (err) { 
      console.error('Failed to fetch vault');
      if (err.response?.status === 401) handleLogout();
    }
    finally { setVaultLoading(false); }
  };

  const handleExtract = async (e) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true); setError(''); setTranscript(''); setAiResults({});
    try {
      const res = await axios.post(`${API_URL}/api/content/transcript`, { url }, { headers: authService.getAuthHeader() });
      setTranscript(res.data.transcript);
      toast.success('Transcript ready');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch transcript');
      if (err.response?.status === 401) handleLogout();
    } finally { setLoading(false); }
  };

  const handleGenerateAll = async () => {
    if (!transcript || selectedPlatforms.length === 0) return;
    setGenLoading(true); setError('');
    try {
      const res = await axios.post(`${API_URL}/api/content/generate`, {
        transcript, platforms: selectedPlatforms, tone: selectedTone,
        customInstruction: selectedPlatforms.includes('custom') ? customInstruction : '',
        customBrandVoice
      }, { headers: authService.getAuthHeader() });
      setAiResults(res.data.results);
      const updated = { ...user, credits: res.data.remainingCredits };
      setUser(updated);
      localStorage.setItem('creator-user', JSON.stringify(updated));
      toast.success('Content generated');
    } catch (err) {
      const msg = err.response?.data?.error || 'Generation failed';
      setError(msg); toast.error(msg);
    } finally { setGenLoading(false); }
  };

  const saveToVault = async (platformId, contentData) => {
    try {
      const contentText = typeof contentData === 'string' ? contentData : contentData.text;
      const res = await axios.post(`${API_URL}/api/content/save`, {
        videoUrl: url, transcript,
        title: `Repurpose for ${PLATFORMS.find(p => p.id === platformId)?.name}`,
        generations: [{ platform: platformId, content: contentText, tone: selectedTone }]
      }, { headers: authService.getAuthHeader() });
      setVault([res.data.data, ...vault]);
      toast.success('Saved to Vault');
    } catch { toast.error('Failed to save'); }
  };

  const removeFromVault = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/content/${id}`, { headers: authService.getAuthHeader() });
      setVault(v => v.filter(i => i._id !== id));
      toast('Removed from Vault', { icon: '🗑️' });
    } catch { toast.error('Failed to delete'); }
  };

  const handleLogout = () => { authService.logout(); setUser(null); setVault([]); toast('Signed out'); };
  const copyToClipboard = (text) => { navigator.clipboard.writeText(text); toast.success('Copied'); };
  const handleExport = () => { if (Object.keys(aiResults).length === 0) return; exportToTxt(aiResults, url); };
  const clearAll = () => { setUrl(''); setTranscript(''); setAiResults({}); };

  const { words, time } = calculateStats(transcript);

  const toastStyle = { background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)', fontSize: '13px', borderRadius: '8px' };

  if (!isAuthenticated || viewingLanding) {
    return (
      <>
        <Toaster position="bottom-right" toastOptions={{ style: toastStyle }} />
        {showAuth && !isAuthenticated ? (
          <AuthOverlay onAuthSuccess={(u) => { setUser(u); setViewingLanding(false); }} />
        ) : (
          <Landing onJoin={() => {
            if (isAuthenticated) setViewingLanding(false);
            else setShowAuth(true);
          }} />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row overflow-hidden font-sans" style={{ background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      <Toaster 
        position={window.innerWidth < 768 ? "bottom-center" : "bottom-right"} 
        toastOptions={{ style: toastStyle }} 
      />

      {/* ── Mobile Sidebar Overlay ── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 z-[60] lg:hidden bg-black/60 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar (Desktop & Mobile) ── */}
      <aside 
        className={`fixed inset-y-0 left-0 z-[70] lg:relative lg:flex w-72 flex-col h-screen shrink-0 transition-transform duration-300 lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--border)' }}
      >
        {/* Mobile Close Button */}
        <div className="lg:hidden absolute top-4 -right-12">
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-full bg-zinc-900 border border-zinc-800 text-white"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        {/* Vault Header */}
        <div className="px-5 pt-6 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <Bookmark className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Cloud Vault</span>
            </div>
            <button 
              onClick={() => setViewingLanding(true)}
              className="text-xs font-medium text-zinc-500 hover:text-amber-500 transition-colors flex items-center gap-1"
            >
              <Globe className="w-3.5 h-3.5" /> Home
            </button>
          </div>
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg pl-8 pr-3 py-2 text-xs focus:outline-none transition-colors placeholder:text-zinc-500"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
              <select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="w-full rounded-lg pl-8 pr-3 py-2 text-xs focus:outline-none transition-colors appearance-none cursor-pointer"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              >
                <option value="all">All Platforms</option>
                {PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Vault Items */}
        <div className="flex-1 overflow-y-auto custom-scrollbar py-3 px-3">
          {vaultLoading ? (
            <div className="flex justify-center pt-12"><Loader2 className="w-5 h-5 animate-spin text-zinc-700" /></div>
          ) : filteredVault.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center px-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <Bookmark className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              </div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>No saved content</p>
              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>Generate content and save it to your vault</p>
            </div>
          ) : (
            <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-1.5">
              {filteredVault.map(item => (
                <motion.div key={item._id} variants={fadeUp}>
                  <VaultItem
                    item={{ ...item, id: item._id, content: item.generations[0]?.content, platform: item.generations[0]?.platform }}
                    platform={PLATFORMS.find(p => p.id === item.generations[0]?.platform)}
                    onDelete={removeFromVault}
                    onCopy={copyToClipboard}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* User Footer */}
        <div className="p-4 transition-colors" style={{ borderTop: '1px solid var(--border)' }}>
          <button
            onClick={() => setCurrentView('billing')}
            style={{ backgroundColor: 'var(--accent)' }}
            className="w-full py-2 mb-3 hover:opacity-90 text-white rounded-lg transition-opacity text-xs font-medium flex items-center justify-center gap-2"
          >
            <Zap className="w-3.5 h-3.5" /> Upgrade Credits
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setCurrentView('billing')}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: 'var(--accent)' }}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}><span className="text-amber-500 font-medium">{user?.credits}</span> credits</p>
              </div>
            </div>
            <button onClick={handleLogout} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--text-muted)' }}>
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 h-screen overflow-y-auto custom-scrollbar transition-colors" style={{ background: 'var(--bg-main)' }}>
        <AnimatePresence mode="wait">
          {currentView === 'billing' ? (
            <motion.div key="billing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <Billing user={user} setUser={setUser} onBack={() => setCurrentView('dashboard')} />
            </motion.div>
          ) : (
            <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">

              {/* Page Header */}
              <motion.header variants={fadeUp} initial="hidden" animate="show" className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-zinc-800 transition-colors"
                  >
                    <Filter className="w-5 h-5 text-amber-500" />
                  </button>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--accent)' }}>
                    <Rocket className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h1 className="text-sm md:text-base font-semibold text-white leading-none">Creator Core</h1>
                    <p className="text-[10px] md:text-[11px] text-zinc-500 mt-0.5">AI Content Repurposing Engine</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={clearAll} className="p-1.5 rounded-lg transition-colors border border-transparent" style={{ color: 'var(--text-muted)' }}>
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </motion.header>

              {/* Stats Row */}
              <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { label: 'Words', value: words, icon: FileText, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                  { label: 'Read time', value: time, suffix: 'm', icon: Clock, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                  { label: 'Credits', value: user?.credits || 0, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10', onClick: () => setCurrentView('billing') },
                ].map(stat => (
                  <motion.div key={stat.label} variants={fadeUp} onClick={stat.onClick} className={stat.onClick ? 'cursor-pointer' : ''}>
                    <SpotlightCard className="rounded-xl p-4 flex items-center gap-3 border transition-colors h-full" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                      <div className={`${stat.bg} p-2 rounded-lg`}>
                        <stat.icon className={`w-4 h-4 ${stat.color}`} />
                      </div>
                      <div>
                        <p className="text-[11px] mb-0.5" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                          <CountUp from={0} to={Number(stat.value) || 0} duration={1.5} separator="," />
                          {stat.suffix || ''}
                        </p>
                      </div>
                    </SpotlightCard>
                  </motion.div>
                ))}
              </motion.div>

              {/* Main Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column */}
                <motion.div variants={slideRight} initial="hidden" animate="show" className="col-span-1 lg:col-span-4 space-y-4">

                  {/* Content Source */}
                  <SpotlightCard className="rounded-xl p-5 border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                    <p className="text-xs font-medium mb-4" style={{ color: 'var(--text-secondary)' }}>Content Source</p>
                    <form onSubmit={handleExtract} className="relative flex items-center">
                      <input
                        type="text" value={url} onChange={(e) => setUrl(e.target.value)}
                        placeholder="Enter a YouTube URL"
                        className="w-full rounded-full pl-5 pr-28 py-3 text-sm focus:outline-none transition-colors placeholder:text-zinc-600 border"
                        style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                      />
                      <button type="submit" disabled={loading || !url}
                        style={{ backgroundColor: loading || !url ? 'rgba(245, 158, 11, 0.4)' : 'var(--accent)' }}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 hover:opacity-90 disabled:cursor-not-allowed text-white font-medium px-4 py-1.5 rounded-full text-xs transition-opacity flex items-center justify-center gap-1.5">
                        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Fetch'}
                      </button>
                    </form>

                    {/* Transcript Preview — Idea 4 */}
                    <AnimatePresence>
                      {transcript && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, marginTop: 0 }}
                          animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                          exit={{ opacity: 0, height: 0, marginTop: 0 }}
                          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="rounded-lg p-3 flex items-center gap-3 border" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
                            <div className="w-7 h-7 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                              <FileText className="w-3.5 h-3.5 text-amber-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-medium text-amber-500"><ShinyText text="Transcript ready" speed={3} /></p>
                              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                                {words.toLocaleString()} words · {time} min read
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </SpotlightCard>

                  {/* Custom Platform */}
                  <AnimatePresence>
                    {selectedPlatforms.includes('custom') && (
                      <motion.div key="custom" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="rounded-xl p-5 overflow-hidden border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                        <p className="text-[11px] text-amber-500 font-medium uppercase tracking-widest mb-3 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" /> Custom Instructions
                        </p>
                        <textarea value={customInstruction} onChange={(e) => setCustomInstruction(e.target.value)}
                          placeholder="Write your custom prompt here..."
                          className="w-full h-28 rounded-lg p-3 text-xs focus:outline-none transition-colors resize-none custom-scrollbar placeholder:text-zinc-600"
                          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Brand Voice — Idea 3: Pill Tone Selector */}
                  <SpotlightCard className="rounded-xl p-5 border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                    <p className="text-xs font-medium mb-4" style={{ color: 'var(--text-secondary)' }}>Brand Voice</p>
                    <div className="mb-4">
                      <label className="text-[11px] mb-2 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                        <Sparkles className="w-3 h-3 text-amber-500" /> Custom Instructions
                      </label>
                      <textarea
                        value={customBrandVoice} onChange={(e) => setCustomBrandVoice(e.target.value)}
                        placeholder="e.g. Use Gen-Z slang, short sentences, lots of emojis..."
                        className="w-full h-20 rounded-lg p-3 text-xs focus:outline-none transition-colors resize-none custom-scrollbar placeholder:text-zinc-600"
                        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                      />
                    </div>
                    <div className="border-t pt-4" style={{ borderColor: 'var(--border)' }}>
                      <p className="text-[11px] mb-3" style={{ color: 'var(--text-muted)' }}>Tone preset</p>
                      {/* Pill-style Tone Selector */}
                      <div className="flex flex-wrap gap-2">
                        {TONES.map(t => {
                          const isActive = selectedTone === t.id && !customBrandVoice;
                          return (
                            <motion.button
                              key={t.id}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => { setSelectedTone(t.id); setCustomBrandVoice(''); }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200"
                              style={isActive
                                ? { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)', color: '#fff' }
                                : { backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }
                              }
                            >
                              <span>{t.emoji}</span>
                              <span>{t.name}</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  </SpotlightCard>
                </motion.div>

                {/* Right Column — Output */}
                <div className="col-span-1 lg:col-span-8 space-y-5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-zinc-400">Output Platforms</p>
                    <div className="flex gap-1 p-1 bg-[#111] border border-[#222] rounded-lg">
                      {PLATFORMS.map(p => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedPlatforms(prev => prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id])}
                          title={p.name}
                          className={`p-2 rounded-md transition-all duration-200 border ${
                            selectedPlatforms.includes(p.id)
                              ? `${p.activeBg} ${p.color}`
                              : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-[#1a1a1a]'
                          }`}
                        >
                          <p.icon className="w-3.5 h-3.5" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {Object.keys(aiResults).length > 0 || genLoading ? (
                      <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedPlatforms.map((pId, i) => (
                          <motion.div key={pId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
                            <ContentCard
                              platform={PLATFORMS.find(p => p.id === pId)}
                              content={aiResults[pId]}
                              isLoading={genLoading}
                              onSave={saveToVault}
                              onCopy={copyToClipboard}
                            />
                          </motion.div>
                        ))}
                      </motion.div>
                    ) : (
                      <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="border rounded-xl min-h-[420px] flex flex-col items-center justify-center p-12 text-center"
                        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                          <Sparkles className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                        </div>
                        {!transcript ? (
                          <>
                            <p className="text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Paste a YouTube URL</p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Fetch the transcript to get started</p>
                          </>
                        ) : (
                          <>
                            <p className="text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Transcript ready</p>
                            <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>Select platforms above, then generate</p>
                            <button onClick={handleGenerateAll} disabled={genLoading}
                              style={{ backgroundColor: 'var(--accent)' }}
                              className="px-5 py-2 hover:opacity-90 text-white font-medium text-sm rounded-lg transition-opacity flex items-center gap-2">
                              {genLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                              Generate Content
                            </button>
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Generate & Export buttons when results are visible */}
                  {(Object.keys(aiResults).length > 0 || genLoading) && (
                    <div className="flex items-center justify-between border-t pt-5" style={{ borderColor: 'var(--border)' }}>
                      {Object.keys(aiResults).length > 0 ? (
                        <button onClick={handleExport} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                          <Download className="w-4 h-4 text-cyan-500" /> Export All
                        </button>
                      ) : <div />}
                      
                      <button onClick={handleGenerateAll} disabled={!transcript || genLoading}
                        style={{ backgroundColor: 'var(--accent)' }}
                        className="px-5 py-2 hover:opacity-90 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-opacity flex items-center gap-2">
                        {genLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        Regenerate
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Toast */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 bg-[#1a0a0a] border border-red-500/20 rounded-xl z-50">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-xs text-red-400">{error}</p>
              <button onClick={() => setError('')} className="text-zinc-600 hover:text-zinc-400 ml-2"><XCircle className="w-4 h-4" /></button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
