import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';

const VaultItem = ({ item, platform, onDelete, onCopy }) => {
  if (!platform) return null;
  const { icon: Icon, color } = platform;
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const date = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : '';

  const handleCopy = (e) => {
    e.stopPropagation();
    onCopy(item.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(item.id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      onClick={() => setExpanded(!expanded)}
      style={{ backgroundColor: 'var(--bg-elevated)' }}
      className="border rounded-lg cursor-pointer group transition-colors hover:border-[var(--border-hover)]"
      style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
    >
      {/* Header — always visible */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Icon className={`w-3 h-3 shrink-0 ${color}`} />
          <span className="text-[11px] font-medium truncate" style={{ color: 'var(--text-secondary)' }}>
            {item.content?.slice(0, 40) || 'No content'}…
          </span>
        </div>
        <div className="flex items-center gap-1 ml-2 shrink-0">
          {date && <span className="text-[10px] mr-1" style={{ color: 'var(--text-muted)' }}>{date}</span>}
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
          </motion.div>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 border-t" style={{ borderColor: 'var(--border)' }}>
              <p className="text-[12px] leading-relaxed mt-3 whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                {item.content}
              </p>
              <div className="flex items-center justify-between mt-3 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  {item.content?.length || 0} chars
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors hover:text-red-400"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all"
                    style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-hover)' }}
                  >
                    <AnimatePresence mode="wait">
                      {copied
                        ? <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1 text-emerald-400">
                            <Check className="w-3 h-3" /> Copied!
                          </motion.span>
                        : <motion.span key="copy" className="flex items-center gap-1">
                            <Copy className="w-3 h-3" /> Copy
                          </motion.span>
                      }
                    </AnimatePresence>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default VaultItem;
