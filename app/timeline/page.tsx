'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MapPin, Plus, Loader2, Trash2, Edit3, RotateCcw, Archive } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // 1. 引入路由
import { supabase } from '@/lib/supabase';

type Memory = {
  id: string;
  date: string;
  title: string;
  description: string | null;
  image_url: string | null;
  location: string | null;
  is_deleted: boolean;
  deleted_at: string | null;
};

export default function TimelinePage() {
  const router = useRouter(); // 2. 初始化路由
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTrash, setShowTrash] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false); // 3. 增加登录状态控制

  // 4. 核心拦截逻辑：组件加载时检查密码
  useEffect(() => {
    const auth = localStorage.getItem('is_authed');
    if (auth !== 'true') {
      router.push('/login'); // 没对上暗号，踢回登录页
    } else {
      setIsAuthed(true); // 暗号正确，允许渲染页面
      fetchMemories();
    }
  }, [showTrash, router]);

  const fetchMemories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .eq('is_deleted', showTrash)
      .order('date', { ascending: false });

    if (!error) setMemories(data || []);
    setLoading(false);
  };

  // 5. 如果还没验证通过，返回空或加载动画，防止内容闪现
  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-zinc-100" />
      </div>
    );
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要将这段记忆移入回收站吗？')) return;
    const { error } = await supabase
      .from('memories')
      .update({ is_deleted: true, deleted_at: new Date().toISOString() })
      .eq('id', id);
    
    if (!error) {
      setMemories(prev => prev.filter(m => m.id !== id));
    } else {
      alert('删除失败: ' + error.message);
    }
  };

  const handleRestore = async (id: string) => {
    const { error } = await supabase
      .from('memories')
      .update({ is_deleted: false, deleted_at: null })
      .eq('id', id);
    if (!error) fetchMemories();
  };

  return (
    <main className="min-h-screen bg-white text-zinc-900 pb-32">
      <div className="max-w-4xl mx-auto pt-20 px-6">
        <header className="flex flex-col md:flex-row justify-between items-center md:items-end mb-24 gap-8">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
              <Heart className="w-8 h-8 text-rose-500" fill="currentColor" />
              <h1 className="text-4xl font-black text-zinc-900 tracking-tighter uppercase italic leading-none">Timeline</h1>
            </div>
            <button onClick={() => setShowTrash(!showTrash)} className="text-[10px] font-black text-zinc-400 hover:text-rose-500 tracking-widest uppercase transition-colors">
              {showTrash ? '← Back to Journal' : 'Recently Deleted'}
            </button>
          </div>
          <Link href="/timeline/create" className="px-10 py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-rose-500 transition-all uppercase tracking-widest text-[10px] shadow-2xl shadow-zinc-200">
            Add Memory
          </Link>
        </header>

        {loading ? (
          <div className="flex justify-center py-40"><Loader2 className="animate-spin w-8 h-8 text-zinc-100" /></div>
        ) : memories.length === 0 ? (
          <div className="text-center py-40 border-2 border-dashed border-zinc-100 rounded-[3rem] text-zinc-300 font-bold uppercase tracking-widest text-[10px]">No memories here</div>
        ) : (
          <div className="space-y-32 relative">
            <div className="absolute left-[40px] md:left-[110px] top-4 bottom-0 w-px bg-zinc-50" />
            <AnimatePresence mode='popLayout'>
              {memories.map((m) => (
                <motion.div key={m.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative grid grid-cols-[80px_1fr] md:grid-cols-[220px_1fr] gap-4 md:gap-12 group">
                  <div className="text-right pt-2 pr-4 md:pr-0">
                    <span className="text-[10px] font-black text-zinc-200 block mb-1 tracking-tighter">{m.date.split('-')[0]}</span>
                    <span className="text-3xl md:text-5xl font-black text-zinc-100 italic leading-none">{m.date.split('-').slice(1).join('.')}</span>
                  </div>

                  <div className="relative">
                    <div className="absolute left-[-45px] md:left-[-115px] top-4 w-3 h-3 rounded-full bg-white border-2 border-zinc-100 group-hover:border-rose-500 z-10 transition-all" />
                    <div className="space-y-6">
                      <div className="absolute right-0 top-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-all z-20">
                        {showTrash ? (
                          <button onClick={() => handleRestore(m.id)} className="p-2 text-green-500 bg-white shadow-xl rounded-full border border-zinc-50 hover:scale-110"><RotateCcw className="w-4 h-4" /></button>
                        ) : (
                          <>
                            <Link href={`/timeline/create?edit=${m.id}`} className="p-2 text-zinc-400 hover:text-zinc-900 bg-white shadow-xl rounded-full border border-zinc-50 hover:scale-110"><Edit3 className="w-4 h-4" /></Link>
                            <button onClick={() => handleDelete(m.id)} className="p-2 text-zinc-400 hover:text-rose-500 bg-white shadow-xl rounded-full border border-zinc-50 hover:scale-110"><Trash2 className="w-4 h-4" /></button>
                          </>
                        )}
                      </div>

                      {m.image_url && (
                        <div className="relative aspect-[16/10] rounded-[2.5rem] overflow-hidden border border-zinc-50 shadow-2xl shadow-zinc-200/50 bg-zinc-50">
                          <img src={m.image_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                        </div>
                      )}

                      <div className="px-2">
                        <h3 className="text-2xl font-black text-zinc-900 tracking-tighter mb-2 group-hover:text-rose-500 transition-colors uppercase italic">{m.title}</h3>
                        {m.location && <span className="inline-flex items-center gap-1 text-[10px] font-black text-zinc-400 tracking-widest mb-4"><MapPin className="w-3 h-3 text-rose-500" /> {m.location}</span>}
                        <p className="text-zinc-400 text-sm md:text-base leading-relaxed max-w-xl font-medium">{m.description}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </main>
  );
}