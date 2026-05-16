import { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Zap, CheckCircle2, Loader2, ArrowLeft, CreditCard } from 'lucide-react';
import authService from '../services/authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const PLANS = [
  {
    name: 'Starter',
    price: '$5',
    credits: 50,
    period: 'one-time',
    features: ['50 AI generations', 'All platforms', 'Cloud Vault access'],
    amount: 50,
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$15',
    credits: 200,
    period: 'one-time',
    features: ['200 AI generations', 'All platforms', 'Priority generation', 'Brand Voice profiles'],
    amount: 200,
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    name: 'Enterprise',
    price: '$40',
    credits: 1000,
    period: 'one-time',
    features: ['1,000 AI generations', 'All platforms', 'Dedicated support', 'Custom integrations'],
    amount: 1000,
    highlighted: false,
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] } })
};

const Billing = ({ user, setUser, onBack }) => {
  const [loading, setLoading] = useState(null); // store which plan is loading

  const handleAddCredits = async (amount, planName) => {
    setLoading(planName);
    try {
      const res = await axios.post(
        `${API_URL}/api/user/add-credits`,
        { amount },
        { headers: authService.getAuthHeader() }
      );
      const updatedUser = res.data.data;
      setUser(updatedUser);
      localStorage.setItem('creator-user', JSON.stringify(updatedUser));
      toast.success(`${amount} credits added`);
    } catch {
      toast.error('Failed to add credits');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-1.5 transition-colors mb-8 text-sm hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
        <ArrowLeft className="w-4 h-4" />
        Back to dashboard
      </button>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
        <h1 className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Plans & Credits</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>One-time credits, no subscriptions.</p>
      </motion.div>

      {/* Current Balance */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}
        className="rounded-xl p-5 flex items-center justify-between mb-8 border"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
        <div>
          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Current balance</p>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-500" />
            <span className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>{user?.credits}</span>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>credits</span>
          </div>
        </div>
        <div className="p-2.5 rounded-lg border" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
          <CreditCard className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
        </div>
      </motion.div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.map((plan, i) => (
          <motion.div
            key={plan.name}
            custom={i}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="relative rounded-xl p-5 flex flex-col border transition-colors"
            style={{ 
              background: plan.highlighted ? 'rgba(6, 182, 212, 0.05)' : 'var(--bg-surface)', 
              borderColor: plan.highlighted ? 'rgba(6, 182, 212, 0.4)' : 'var(--border)' 
            }}
          >
            {plan.badge && (
              <span className="absolute -top-2.5 left-4 text-[10px] font-medium px-2.5 py-0.5 rounded-full" style={{ background: 'var(--accent)', color: '#fff' }}>
                {plan.badge}
              </span>
            )}

            <div className="mb-4">
              <p className="text-xs mb-2 font-medium" style={{ color: 'var(--text-secondary)' }}>{plan.name}</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>{plan.price}</span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{plan.period}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <Zap className="w-3 h-3 text-cyan-500" />
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{plan.credits} credits</span>
              </div>
            </div>

            <ul className="space-y-2 mb-6 flex-1">
              {plan.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleAddCredits(plan.amount, plan.name)}
              disabled={!!loading}
              style={plan.highlighted 
                ? { backgroundColor: 'var(--accent)', color: '#fff', borderColor: 'var(--accent)' } 
                : { backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', borderColor: 'var(--border)' }
              }
              className="w-full py-2 rounded-lg text-sm font-medium transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border hover:opacity-90"
            >
              {loading === plan.name
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : `Get ${plan.credits} credits`
              }
            </button>
          </motion.div>
        ))}
      </div>

      {/* Note */}
      <p className="text-[11px] text-center mt-8" style={{ color: 'var(--text-muted)' }}>
        Credits never expire. Each generation uses 1 credit.
      </p>
    </div>
  );
};

export default Billing;
