import { useState } from 'react';
import { motion } from 'framer-motion';
import { Rocket, Mail, Lock, User, Loader2, ArrowRight } from 'lucide-react';
import authService from '../services/authService';
import toast from 'react-hot-toast';

const AuthOverlay = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = isLogin
        ? await authService.login({ email: formData.email, password: formData.password })
        : await authService.register(formData);
      toast.success(isLogin ? 'Welcome back' : 'Account created');
      onAuthSuccess(data.user);
    } catch (err) {
      const message = err.response?.data?.error || err.response?.data?.message || 'Authentication failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 transition-colors" style={{ background: 'var(--bg-main)' }}>
      {/* Subtle grid background */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-amber-500/10" style={{ backgroundColor: 'var(--accent)' }}>
            <Rocket className="w-5 h-5 text-black fill-current" />
          </div>
          <h1 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Creator Core</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>

        {/* Card */}
        <div className="border rounded-xl p-6" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
          <form onSubmit={handleSubmit} className="space-y-3">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="relative"
              >
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text" placeholder="Full name" required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none transition-colors placeholder:text-zinc-600 border"
                  style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </motion.div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <input
                type="email" placeholder="Email address" required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none transition-colors placeholder:text-zinc-600 border"
                style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <input
                type="password" placeholder="Password" required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none transition-colors placeholder:text-zinc-600 border"
                style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 text-white font-medium py-2.5 rounded-lg text-sm transition-opacity flex items-center justify-center gap-2 mt-1"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              {loading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <>{isLogin ? 'Sign in' : 'Create account'} <ArrowRight className="w-4 h-4" /></>
              }
            </button>
          </form>
        </div>

        {/* Toggle */}
        <p className="text-center text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button onClick={() => setIsLogin(!isLogin)} className="text-amber-500 hover:text-amber-400 transition-colors font-medium">
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default AuthOverlay;
