'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isWrong, setIsWrong] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const OUR_PASSWORD = "0314";

  // --- 1. 登录校验与持久化 (保持不动) ---
  useEffect(() => {
    if (localStorage.getItem('is_authed') === 'true') {
      setIsAuthed(true);
    }
  }, []);

  useEffect(() => {
    if (password.length === 4) {
      setIsVerifying(true);
      setTimeout(() => {
        if (password === OUR_PASSWORD) {
          localStorage.setItem('is_authed', 'true');
          setIsAuthed(true);
        } else {
          setIsWrong(true);
          setTimeout(() => {
            setPassword('');
            setIsWrong(false);
            setIsVerifying(false);
            inputRef.current?.focus(); 
          }, 600);
        }
      }, 500);
    }
  }, [password]);

  // --- 2. 计时器逻辑 (保持不动) ---
  const startDate = useMemo(() => new Date('2026-03-14T00:00:00'), []);
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const updateTime = () => {
      const now = Date.now();
      let diff = now - startDate.getTime();
      if (diff < 0) diff = 0;
      setTime({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff / 3600000) % 24),
        m: Math.floor((diff / 60000) % 60),
        s: Math.floor((diff / 1000) % 60),
      });
    };
    const timer = setInterval(updateTime, 1000);
    updateTime();
    return () => clearInterval(timer);
  }, [startDate]);

  return (
    <main className={`relative min-h-screen ${!isAuthed ? 'bg-white' : 'bg-[#05040a]'} flex items-center justify-center overflow-hidden font-sans transition-colors duration-700`}>
      <AnimatePresence mode="wait">
        {!isAuthed ? (
          /* ==============================
             修改后的：白底黑字登录界面
             ============================== */
          <motion.div
            key="lock"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95, filter: "blur(20px)" }}
            className="relative z-[100] flex flex-col items-center w-full max-w-sm px-6"
          >
            {/* 图标改色 */}
            <motion.div 
              animate={isWrong ? { x: [-10, 10, -10, 10, 0] } : {}}
              className="mb-10"
            >
              <Lock className={`w-8 h-8 ${isWrong ? 'text-rose-500' : 'text-black/80'}`} strokeWidth={1.5} />
            </motion.div>

            <h2 className="text-black/90 text-lg tracking-widest font-medium mb-12">
              我们的暗号
            </h2>

            {/* 改进的输入交互区域 */}
            <div className="relative mb-12 p-4 cursor-pointer" onClick={() => inputRef.current?.focus()}>
              <input
                ref={inputRef}
                type="tel" 
                maxLength={4}
                value={password}
                onChange={(e) => setPassword(e.target.value.replace(/\D/g, ''))}
                disabled={isVerifying}
                className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer"
                autoFocus
                pattern="\d*"
                inputMode="numeric"
              />
              {/* 明显的圆点显示 */}
              <div className="flex gap-8 justify-center pointer-events-none">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="relative w-5 h-5">
                    {/* 背景圈：灰色边框 */}
                    <div className={`absolute inset-0 rounded-full border-2 ${isWrong ? 'border-rose-400' : 'border-black/10'}`} />
                    {/* 填充点：黑色实心 */}
                    <motion.div
                      initial={false}
                      animate={{ 
                        scale: password.length > i ? 1 : 0, 
                        opacity: password.length > i ? 1 : 0 
                      }}
                      className="absolute inset-0 rounded-full bg-black"
                    />
                  </div>
                ))}
              </div>
            </div>

            <p className={`text-[11px] tracking-[0.4em] uppercase font-bold transition-colors ${isWrong ? 'text-rose-500' : 'text-black/40'}`}>
              {isVerifying ? "Verifying..." : isWrong ? "Wrong Access Code" : "Enter Access Code"}
            </p>
          </motion.div>

        ) : (
          /* ==============================
             浪漫首页 (完全保持原始代码)
             ============================== */
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="relative w-full min-h-screen flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#120a15] via-[#050309] to-black" />
            
            <div className="relative z-20 text-center px-6 max-w-4xl pb-24">
              
              {/* 爱心描边区域 */}
              <div className="relative inline-block px-14 py-12 mb-4">
                <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-rose-600 pointer-events-none overflow-visible">
                  <motion.path
                    d="M50 15 C 25 -10, -10 35, 50 90 C 110 35, 75 -10, 50 15 Z" 
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ delay: 1, duration: 2.5, ease: "easeInOut" }}
                  />
                </svg>

                {/* 烟花绽放 */}
                {[
                  { delay: 3.2, pos: "top-0 -left-6" },
                  { delay: 3.5, pos: "top-0 -right-6" },
                  { delay: 3.8, pos: "bottom-12 -left-6" },
                  { delay: 4.1, pos: "bottom-12 -right-6" }
                ].map((fw, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 1.2, 0], opacity: [0, 1, 0] }}
                    transition={{ delay: fw.delay, duration: 0.8 }}
                    className={`absolute ${fw.pos} w-10 h-10 pointer-events-none`}
                  >
                    <div className="relative w-full h-full">
                      {[0, 72, 144, 216, 288].map(deg => (
                        <div key={deg} className="absolute inset-0 flex items-center justify-center">
                          <div className="w-1 h-3 bg-rose-400 rounded-full blur-[1px]" style={{ transform: `rotate(${deg}deg) translateY(-12px)` }} />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}

                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 1 }}>
                  <div className="flex justify-center mb-8">
                    <div className="px-6 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-rose-200" />
                      <span className="text-rose-100 text-[11px] md:text-sm tracking-[3px] font-medium uppercase">Since 2026.03.14</span>
                    </div>
                  </div>

                  <h1 className="text-[52px] md:text-[82px] leading-tight font-light tracking-[-2px] text-white mb-2">
                    我们已经<br />
                    <span className="bg-gradient-to-r from-rose-200 via-pink-100 to-white bg-clip-text text-transparent font-medium italic drop-shadow-[0_0_15px_rgba(255,192,203,0.3)]">
                      相爱了
                    </span>
                  </h1>
                </motion.div>
              </div>

              {/* 核心修改：带分隔符的时钟计时器 */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 1 }}>
                <div className="mb-8">
                  <div className="text-[110px] md:text-[180px] leading-none font-thin text-white tracking-[-6px] drop-shadow-2xl">
                    {time.d}
                  </div>
                  <p className="text-rose-200/90 -mt-2 md:-mt-4 text-lg md:text-xl tracking-[6px] font-medium">DAYS OF LOVE</p>
                </div>

                {/* H : M : S 布局 */}
                <div className="flex justify-center items-baseline gap-4 md:gap-8 mb-16">
                  {/* 小时 */}
                  <div className="flex flex-col items-center">
                    <span className="font-mono text-white/90 text-4xl md:text-6xl w-[1.5em]">
                      {String(time.h).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] mt-3 tracking-[2px] text-white/40 uppercase">Hours</span>
                  </div>

                  {/* 分隔符 */}
                  <motion.span 
                    animate={{ opacity: [1, 0.4, 1] }} 
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="font-mono text-rose-400/60 text-3xl md:text-5xl self-center mb-6"
                  >
                    :
                  </motion.span>

                  {/* 分钟 */}
                  <div className="flex flex-col items-center">
                    <span className="font-mono text-white/90 text-4xl md:text-6xl w-[1.5em]">
                      {String(time.m).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] mt-3 tracking-[2px] text-white/40 uppercase">Minutes</span>
                  </div>

                  {/* 分隔符 */}
                  <motion.span 
                    animate={{ opacity: [1, 0.4, 1] }} 
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="font-mono text-rose-400/60 text-3xl md:text-5xl self-center mb-6"
                  >
                    :
                  </motion.span>

                  {/* 秒钟 */}
                  <div className="flex flex-col items-center">
                    <span className="font-mono text-white/90 text-4xl md:text-6xl w-[1.5em]">
                      {String(time.s).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] mt-3 tracking-[2px] text-white/40 uppercase">Seconds</span>
                  </div>
                </div>

                <Link href="/timeline">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative inline-flex items-center gap-4 bg-white/5 hover:bg-white/15 backdrop-blur-2xl border border-white/10 hover:border-rose-400/40 px-10 py-4 rounded-2xl text-white tracking-widest transition-all"
                  >
                    开启时光档案
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
                  </motion.button>
                </Link>
              </motion.div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
