import { motion } from 'framer-motion';
import { 
  Rocket, Zap, Bookmark, Globe, 
  ArrowRight, Check, Play, 
  Briefcase, Hash, Camera, 
  Video, Layout, Cpu, Clock, 
  Sparkles, MousePointer2 
} from 'lucide-react';
import Hyperspeed from './Hyperspeed';
import TargetCursor from './TargetCursor';
import StarBorder from './StarBorder';
import GradientText from './GradientText';
import RotatingText from './RotatingText';
import PillNav from './PillNav';

const Landing = ({ onJoin }) => {
  
  // Animation Variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen font-sans selection:bg-amber-500/30 overflow-x-hidden" style={{ background: '#0C0A09', color: '#FAFAF9' }}>
      
      <TargetCursor 
        spinDuration={2}
        hideDefaultCursor={true}
        parallaxOn={true}
      />

      {/* ── Cinematic Hyperspeed Background ── */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40">
        <Hyperspeed 
          effectOptions={{
            onSpeedUp: () => { },
            onSlowDown: () => { },
            distortion: 'turbulentDistortion',
            length: 400,
            roadWidth: 10,
            islandWidth: 2,
            lanesPerRoad: 4,
            fov: 90,
            fovSpeedUp: 150,
            speedUp: 2,
            carLightsFade: 0.4,
            totalSideLightSticks: 20,
            lightPairsPerRoadWay: 40,
            shoulderLinesWidthPercentage: 0.05,
            brokenLinesWidthPercentage: 0.1,
            brokenLinesLengthPercentage: 0.5,
            lightStickWidth: [0.12, 0.5],
            lightStickHeight: [1.3, 1.7],
            movingAwaySpeed: [60, 80],
            movingCloserSpeed: [-120, -160],
            carLightsLength: [400 * 0.03, 400 * 0.2],
            carLightsRadius: [0.05, 0.14],
            carWidthPercentage: [0.3, 0.5],
            carShiftX: [-0.8, 0.8],
            carFloorSeparation: [0, 5],
            colors: {
              roadColor: 0x0c0a09,
              islandColor: 0x14110f,
              background: 0x0c0a09,
              shoulderLines: 0x292524,
              brokenLines: 0x292524,
              leftCars: [0xF59E0B, 0xD97706, 0xFBBF24],
              rightCars: [0xF59E0B, 0xFFEDD5, 0xB45309],
              sticks: 0xF59E0B,
            }
          }}
        />
        {/* Gradient overlay to fade it into the page content */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0C0A09]/80 to-[#0C0A09]" />
      </div>

      {/* ── Navbar ── */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)]">
            <Rocket className="w-5 h-5 text-black fill-current" />
          </div>
          <span className="text-xl font-bold tracking-tight font-display">Creator Core</span>
        </div>
        
        <div className="hidden md:flex items-center text-sm font-medium">
          <PillNav
            items={[
              { label: "How it works", href: "#how-it-works" },
              { label: "Features", href: "#features" },
              { label: "Pricing", href: "#pricing" }
            ]}
            baseColor="#F59E0B"
            pillColor="#0C0A09"
            hoveredPillTextColor="#000000"
            pillTextColor="#a1a1aa"
          />
        </div>

        <StarBorder 
          as="button"
          onClick={onJoin}
          color="#F59E0B"
          speed="3s"
          className="cursor-target !p-0 rounded-full bg-white text-black hover:bg-amber-500 transition-all duration-300 shadow-lg"
        >
          <div className="px-6 py-2.5 text-sm font-semibold">Get Started</div>
        </StarBorder>
      </nav>

      {/* ── 1. Hero Section ── */}
      <header className="relative z-10 pt-12 md:pt-20 pb-20 md:pb-32 px-6 md:px-8 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 md:gap-16 items-center">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-widest mb-6">
            <Sparkles className="w-3 h-3" />
            The OS for Modern Creators
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold font-display leading-[1.1] mb-8">
            Turn One Video <br />
            <span className="flex flex-col sm:flex-row items-start gap-2 md:gap-3 mt-3">
              <span>Into</span>
              <RotatingText 
                texts={['Viral Content.', 'LinkedIn Posts.', 'Twitter Threads.', 'YouTube Shorts.']}
                mainClassName="text-amber-500 font-serif italic font-normal tracking-wide md:px-2 overflow-visible"
                staggerFrom={"last"}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "-120%" }}
                staggerDuration={0.025}
                splitLevelClassName="overflow-hidden pb-1"
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
                rotationInterval={3000}
              />
            </span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-lg leading-relaxed mb-10">
            Creator Core transforms YouTube videos into high-conversion summaries, 
            viral hooks, and platform-ready content for LinkedIn and X — instantly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <StarBorder 
              as="button"
              onClick={onJoin}
              color="#F59E0B"
              speed="3s"
              className="cursor-target !p-0 rounded-2xl bg-amber-500 text-black font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_-10px_rgba(245,158,11,0.3)]"
            >
              <div className="px-8 py-4 flex items-center justify-center gap-2">
                Start Creating <ArrowRight className="w-5 h-5" />
              </div>
            </StarBorder>
            <button className="cursor-target px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-semibold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2">
              <Play className="w-5 h-5 fill-current" /> Watch Demo
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 30 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          transition={{ duration: 1, delay: 0.2 }}
          className="relative"
        >
          {/* Dashboard Preview Mockup */}
          <div className="relative rounded-3xl border border-white/10 bg-[#14110F] shadow-2xl overflow-hidden aspect-video group">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent pointer-events-none" />
            <div className="h-8 border-b border-white/10 flex items-center px-4 gap-2 bg-black/40">
              <div className="w-2 h-2 rounded-full bg-white/20" />
              <div className="w-2 h-2 rounded-full bg-white/20" />
              <div className="w-2 h-2 rounded-full bg-white/20" />
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="w-3/4 h-4 rounded-full bg-white/5" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-24 rounded-2xl bg-white/5 border border-white/5" />
                <div className="h-24 rounded-2xl bg-white/5 border border-white/5" />
              </div>
              <div className="h-32 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex items-center justify-center">
                <Zap className="w-8 h-8 text-amber-500 animate-pulse" />
              </div>
            </div>
            
            {/* Floating Elements */}
            <motion.div 
              animate={{ y: [0, -10, 0] }} 
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 w-48 p-4 rounded-2xl bg-[#1C1917] border border-white/10 shadow-2xl"
            >
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="w-4 h-4 text-sky-500" />
                <span className="text-[10px] font-bold text-zinc-500">LINKEDIN POST</span>
              </div>
              <div className="space-y-2">
                <div className="h-1.5 w-full rounded bg-white/10" />
                <div className="h-1.5 w-2/3 rounded bg-white/10" />
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 10, 0] }} 
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-8 -left-8 w-40 p-4 rounded-2xl bg-[#1C1917] border border-white/10 shadow-2xl"
            >
              <div className="flex items-center gap-2 mb-2">
                <Hash className="w-4 h-4 text-sky-400" />
                <span className="text-[10px] font-bold text-zinc-500">X THREAD</span>
              </div>
              <div className="space-y-2">
                <div className="h-1.5 w-full rounded bg-white/10" />
                <div className="h-1.5 w-full rounded bg-white/10" />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </header>

      {/* ── 2. How It Works ── */}
      <section id="how-it-works" className="py-32 px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold font-display mb-6">Built for speed.</h2>
            <p className="text-zinc-400 max-w-xl mx-auto">Three steps to turn your high-effort video into a high-reach content ecosystem.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { 
                step: '01', 
                title: 'Paste YouTube Link', 
                desc: 'Give us any URL. We handle the heavy lifting of processing high-quality transcripts.',
                icon: Layout
              },
              { 
                step: '02', 
                title: 'AI Summary Engine', 
                desc: 'Our AI generates precise summaries and extracts viral hooks to scale your content.',
                icon: Cpu
              },
              { 
                step: '03', 
                title: 'Export to Vault', 
                desc: 'Save your best generated hooks and summaries directly to your Cloud Vault.',
                icon: Globe
              }
            ].map((s, idx) => (
              <motion.div 
                key={idx} 
                whileHover={{ y: -10 }}
                className="group p-8 rounded-3xl bg-[#14110F] border border-white/5 hover:border-amber-500/30 transition-all duration-500"
              >
                <div className="text-4xl font-black text-white/5 mb-6 group-hover:text-amber-500/20 transition-colors">{s.step}</div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-6">
                  <s.icon className="w-6 h-6 text-amber-500" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{s.title}</h3>
                <p className="text-zinc-400 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Platform Output Showcase ── */}
      <section className="py-32 px-8 bg-black/40 relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
          <div className="flex-1">
            <h2 className="text-4xl md:text-6xl font-bold font-display leading-tight mb-8">
              High-conversion summaries <br />
              <span className="text-amber-500 font-serif italic font-normal tracking-wide pr-2">and Viral Hooks.</span>
            </h2>
            <p className="text-lg text-zinc-400 mb-10 max-w-md">
              We don't just transcribe. We extract the core value. Each post is optimized for maximum engagement.
            </p>
            <div className="space-y-4">
              {['High-Conversion Summaries', 'Viral Hooks Extraction', 'LinkedIn Optimized Posts', 'X (Twitter) Threads'].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 font-semibold text-zinc-300">
                  <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-black" />
                  </div>
                  {feature}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex-1 relative h-[500px] w-full max-w-lg">
            {/* Floating Glass Cards */}
            <motion.div animate={{ x: [0, 20, 0], y: [0, -20, 0] }} transition={{ duration: 6, repeat: Infinity }}
              className="absolute top-0 right-0 w-64 p-6 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-2xl"
            >
              <Briefcase className="w-6 h-6 text-sky-600 mb-4" />
              <div className="space-y-3">
                <div className="h-2 w-full rounded bg-white/10" />
                <div className="h-2 w-5/6 rounded bg-white/10" />
                <div className="h-2 w-4/6 rounded bg-white/10" />
              </div>
            </motion.div>

            <motion.div animate={{ x: [0, -20, 0], y: [0, 20, 0] }} transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
              className="absolute top-1/3 left-0 w-72 p-6 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-2xl z-20"
            >
              <Hash className="w-6 h-6 text-sky-400 mb-4" />
              <div className="space-y-3">
                <div className="h-2 w-full rounded bg-white/10" />
                <div className="h-2 w-full rounded bg-white/10" />
                <div className="h-2 w-3/4 rounded bg-white/10" />
              </div>
            </motion.div>

            <motion.div animate={{ y: [0, -30, 0] }} transition={{ duration: 7, repeat: Infinity, delay: 1 }}
              className="absolute bottom-0 right-10 w-60 p-6 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-2xl"
            >
              <Video className="w-6 h-6 text-red-500 mb-4" />
              <div className="space-y-3">
                <div className="h-2 w-full rounded bg-white/10" />
                <div className="h-2 w-2/3 rounded bg-white/10" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 4. Built for Creators ── */}
      <section className="py-32 px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold font-display mb-6">Built for <span className="text-amber-500 font-serif italic font-normal pr-1">creators.</span></h2>
            <p className="text-zinc-400">Whether you're a podcaster or a brand builder, we've got you covered.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {['Podcasters', 'Coaches', 'Agencies', 'YouTubers', 'Personal Brands'].map((c, i) => (
              <div key={i} className="px-6 py-10 rounded-3xl bg-[#14110F] border border-white/5 flex flex-col items-center justify-center text-center gap-4 hover:border-amber-500/20 transition-all cursor-default">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                  <Layout className="w-5 h-5 text-zinc-400" />
                </div>
                <span className="font-bold text-zinc-200">{c}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Before / After ── */}
      <section className="py-32 px-8 relative z-10 overflow-hidden">
        <div className="max-w-5xl mx-auto p-12 md:p-20 rounded-[40px] bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold font-display mb-8">You produce. <br /> We distribute.</h2>
              <p className="text-zinc-400 mb-8 leading-relaxed">
                Spend your time on high-leverage creative work. Let us handle the tedious task of repurposing.
              </p>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 mt-1">
                    <XCircle className="w-4 h-4 text-red-500" />
                  </div>
                  <div>
                    <p className="font-bold text-zinc-200">Before Creator Core</p>
                    <p className="text-sm text-zinc-500">3 hours writing content manually</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-1">
                    <Check className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <p className="font-bold text-zinc-200">After Creator Core</p>
                    <p className="text-sm text-zinc-500 underline decoration-amber-500/50 underline-offset-4">3 minutes with the OS</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-amber-500/20 blur-[100px] rounded-full" />
              <div className="relative p-8 rounded-3xl bg-[#1C1917]/80 backdrop-blur-xl border border-white/10 shadow-2xl text-center">
                <Clock className="w-12 h-12 text-amber-500 mx-auto mb-6" />
                <div className="text-5xl font-black text-white mb-2">98%</div>
                <div className="text-amber-500 font-bold tracking-widest uppercase text-xs">Time Saved</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Pricing Section ── */}
      <section id="pricing" className="py-32 px-8 relative z-10 text-center">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold font-display mb-6">Plans & Credits</h2>
          <p className="text-zinc-400 mb-16">One-time credits, no subscriptions.</p>
          
          <div className="max-w-6xl mx-auto grid lg:grid-cols-3 bg-[#14110F] rounded-[40px] border border-white/10 shadow-2xl overflow-hidden group">
            {/* Starter Plan */}
            <div className="p-10 text-left border-b lg:border-b-0 lg:border-r border-white/5 relative">
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">Starter</h3>
                <p className="text-zinc-500 text-sm italic">Perfect for testing the waters.</p>
              </div>
              <div className="text-5xl font-black mb-2 text-white">$5 <span className="text-sm font-normal text-zinc-500">one-time</span></div>
              <div className="text-amber-500 font-bold mb-8 flex items-center gap-2"><Zap className="w-4 h-4" /> 50 credits</div>
              <ul className="space-y-4 mb-10 text-zinc-400">
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-500" /> 50 AI generations</li>
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-500" /> All platforms</li>
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-500" /> Cloud Vault access</li>
              </ul>
              <button onClick={onJoin} className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all">Get 50 credits</button>
            </div>

            {/* Pro Plan */}
            <div className="p-10 text-left bg-gradient-to-br from-amber-500/[0.05] to-transparent relative lg:border-r border-white/5">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-amber-500 text-black text-[10px] font-black uppercase tracking-tighter rounded-b-xl">Most Popular</div>
              <div className="mb-8 mt-2">
                <h3 className="text-2xl font-bold mb-2 text-amber-500">Pro</h3>
                <p className="text-zinc-500 text-sm italic">Scale your distribution to the moon.</p>
              </div>
              <div className="text-5xl font-black mb-2 text-white">$15 <span className="text-sm font-normal text-zinc-500">one-time</span></div>
              <div className="text-amber-500 font-bold mb-8 flex items-center gap-2"><Zap className="w-4 h-4" /> 200 credits</div>
              <ul className="space-y-4 mb-10 text-zinc-200">
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-amber-500" /> 200 AI generations</li>
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-amber-500" /> All platforms</li>
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-amber-500" /> Priority generation</li>
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-amber-500" /> Brand Voice profiles</li>
              </ul>
              <button onClick={onJoin} className="cursor-target w-full py-4 rounded-2xl bg-amber-500 text-black font-bold hover:shadow-[0_0_40px_rgba(245,158,11,0.4)] transition-all">Get 200 credits</button>
            </div>

            {/* Enterprise Plan */}
            <div className="p-10 text-left relative">
              <div className="mb-8 mt-2">
                <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
                <p className="text-zinc-500 text-sm italic">For high-volume creators.</p>
              </div>
              <div className="text-5xl font-black mb-2 text-white">$40 <span className="text-sm font-normal text-zinc-500">one-time</span></div>
              <div className="text-sky-400 font-bold mb-8 flex items-center gap-2"><Zap className="w-4 h-4" /> 1000 credits</div>
              <ul className="space-y-4 mb-10 text-zinc-400">
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-sky-400" /> 1,000 AI generations</li>
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-sky-400" /> All platforms</li>
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-sky-400" /> Dedicated support</li>
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-sky-400" /> Custom integrations</li>
              </ul>
              <button onClick={onJoin} className="cursor-target w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all">Get 1000 credits</button>
            </div>
          </div>
          
          <p className="text-zinc-500 text-sm mt-8">Credits never expire. Each generation uses 1 credit.</p>
        </div>
      </section>

      {/* ── 7. Final CTA ── */}
      <section className="py-32 px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-7xl font-bold font-display leading-tight mb-10">
            Your content already exists. <br />
            <GradientText
              colors={["#F59E0B", "#FCD34D", "#F59E0B", "#FCD34D", "#F59E0B"]}
              animationSpeed={4}
              showBorder={false}
              className="font-serif italic font-normal tracking-wide"
            >
              Distribute it.
            </GradientText>
          </h2>
          <StarBorder 
            as="button"
            onClick={onJoin}
            color="#F59E0B"
            speed="3s"
            className="cursor-target !p-0 rounded-[2.5rem] bg-amber-500 text-black font-black text-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_40px_80px_-20px_rgba(245,158,11,0.4)]"
          >
            <div className="px-12 py-6">Start Free Now</div>
          </StarBorder>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-20 px-8 border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10 text-zinc-500 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Rocket className="w-4 h-4 text-amber-500" />
            </div>
            <span className="text-lg font-bold text-white font-display">Creator Core</span>
          </div>
          <div className="flex gap-10">
            <a href="#" className="hover:text-amber-500 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-amber-500 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-amber-500 transition-colors">Twitter</a>
          </div>
          <p>© 2026 Creator Core. Build for creators.</p>
        </div>
      </footer>

    </div>
  );
};

// Helper for Missing Icon
const XCircle = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
);

export default Landing;
