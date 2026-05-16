import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Bookmark, Check } from 'lucide-react';

const ContentCard = ({ platform, content, isLoading, onSave, onCopy }) => {
  const { icon: Icon, name, color, activeBg } = platform;
  const [editedContent, setEditedContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setEditedContent(typeof content === 'object' ? content?.text : content || '');
  }, [content]);

  const handleCopy = () => {
    onCopy(editedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    onSave(platform.id, editedContent);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, borderColor: 'var(--border-hover)' }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="border rounded-xl flex flex-col h-[360px] overflow-hidden group transition-colors"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2.5">
          {/* Brand Icon with brand bg pill */}
          <div className={`p-1.5 rounded-md ${activeBg} border`}>
            <Icon className={`w-3.5 h-3.5 ${color}`} />
          </div>
          <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{name}</span>
        </div>

        {/* Action Buttons — slide in on hover */}
        <motion.div
          initial={{ opacity: 0, x: 8 }}
          whileHover={{ opacity: 1, x: 0 }}
          className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleSave}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors hover:bg-amber-500/10 hover:text-amber-500"
            style={{ color: saved ? 'var(--accent)' : 'var(--text-muted)' }}
          >
            <AnimatePresence mode="wait">
              {saved
                ? <motion.span key="saved" initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-amber-500 flex items-center gap-1"><Check className="w-3 h-3" /> Saved</motion.span>
                : <motion.span key="save" className="flex items-center gap-1"><Bookmark className="w-3 h-3" /> Save</motion.span>
              }
            </AnimatePresence>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors hover:bg-emerald-500/10 hover:text-emerald-400"
            style={{ color: copied ? '#34d399' : 'var(--text-muted)' }}
          >
            <AnimatePresence mode="wait">
              {copied
                ? <motion.span key="copied" initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-emerald-400 flex items-center gap-1"><Check className="w-3 h-3" /> Copied</motion.span>
                : <motion.span key="copy" className="flex items-center gap-1"><Copy className="w-3 h-3" /> Copy</motion.span>
              }
            </AnimatePresence>
          </motion.button>
        </motion.div>
      </div>

      {/* Card Body */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {isLoading ? (
            // Smooth animated skeleton
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 space-y-3"
            >
              {[85, 100, 70, 95, 60, 80, 55].map((w, i) => (
                <motion.div
                  key={i}
                  className="h-2.5 rounded-full"
                  style={{ width: `${w}%`, background: 'var(--border)' }}
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1, ease: 'easeInOut' }}
                />
              ))}
            </motion.div>
          ) : content ? (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full"
            >
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full h-full bg-transparent text-[13px] leading-relaxed p-4 resize-none focus:outline-none custom-scrollbar transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                spellCheck="false"
              />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-full"
            >
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Waiting...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Character count footer */}
      <AnimatePresence>
        {content && !isLoading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="px-4 py-2 border-t flex justify-between items-center shrink-0"
            style={{ borderColor: 'var(--border)' }}
          >
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{editedContent.length} chars</span>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Click to edit</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ContentCard;
