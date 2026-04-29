'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MapPin, Camera, ChevronLeft, Loader2, Heart, X, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

function CreateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    title: '',
    description: '',
    location: '',
  });

  useEffect(() => {
    if (editId) {
      const fetchInitial = async () => {
        const { data } = await supabase.from('memories').select('*').eq('id', editId).single();
        if (data) {
          setFormData({
            date: data.date,
            title: data.title,
            description: data.description || '',
            location: data.location || '',
          });
          if (data.image_url) setPreviewUrl(data.image_url);
        }
      };
      fetchInitial();
    }
  }, [editId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    let finalImageUrl = previewUrl;

    if (imageFile) {
      const fileName = `${Date.now()}-${imageFile.name}`;
      const { error: upErr } = await supabase.storage.from('memories').upload(fileName, imageFile);
      if (!upErr) {
        const { data } = supabase.storage.from('memories').getPublicUrl(fileName);
        finalImageUrl = data.publicUrl;
      }
    }

    const payload = { ...formData, image_url: finalImageUrl };

    const { error } = editId 
      ? await supabase.from('memories').update(payload).eq('id', editId)
      : await supabase.from('memories').insert([payload]);

    if (!error) {
      router.push('/timeline');
      router.refresh();
    }
    setUploading(false);
  };

  return (
    <main className="min-h-screen bg-zinc-50 py-16 px-6 flex justify-center items-start">
      <div className="w-full max-w-[460px] bg-white rounded-[3rem] shadow-2xl shadow-zinc-200/50 border border-zinc-100 p-10">
        <Link href="/timeline" className="inline-flex items-center gap-2 text-zinc-300 hover:text-rose-500 mb-10 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          <span className="text-[10px] font-black tracking-widest uppercase">Go Back</span>
        </Link>

        <header className="mb-10 text-center">
          <div className="flex justify-center items-center gap-2 text-rose-500 mb-3 font-black text-[10px] tracking-[0.4em] uppercase">
            <Sparkles className="w-4 h-4" /> Archive Moment
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-zinc-900 italic uppercase">
            {editId ? 'Update Entry' : 'New Memory'}
          </h1>
        </header>

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="relative aspect-[3/4] w-full bg-zinc-50 rounded-[2rem] border-2 border-dashed border-zinc-100 overflow-hidden flex items-center justify-center group">
            {previewUrl ? (
              <>
                <img src={previewUrl} className="w-full h-full object-cover" alt="" />
                <button type="button" onClick={() => {setPreviewUrl(null); setImageFile(null);}} className="absolute top-4 right-4 p-2 bg-white/90 shadow-lg rounded-full text-zinc-400 hover:text-rose-500 transition-all"><X className="w-4 h-4" /></button>
              </>
            ) : (
              <label htmlFor="img-up" className="cursor-pointer flex flex-col items-center gap-4">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm border border-zinc-50 text-zinc-200 group-hover:text-rose-500 transition-all"><Camera className="w-5 h-5" /></div>
                <span className="text-[10px] font-black text-zinc-400 tracking-widest uppercase">Upload Photo</span>
              </label>
            )}
            <input type="file" id="img-up" className="hidden" onChange={handleImageChange} accept="image/*" />
          </div>

          <div className="space-y-8">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-zinc-300 tracking-widest uppercase">Title</label>
              <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-transparent py-2 text-xl font-bold text-zinc-900 outline-none border-b border-zinc-100 focus:border-rose-500 transition-all" placeholder="起个名字..." required />
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-300 tracking-widest uppercase">Date</label>
                <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-transparent py-2 text-sm font-bold text-zinc-600 outline-none border-b border-zinc-100 [color-scheme:light]" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-300 tracking-widest uppercase">Location</label>
                <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-transparent py-2 text-sm font-bold text-zinc-600 outline-none border-b border-zinc-100" placeholder="在哪里？" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-zinc-300 tracking-widest uppercase">Journal</label>
              <textarea rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-zinc-50/50 p-6 rounded-[2rem] text-sm text-zinc-500 outline-none resize-none border border-zinc-50 focus:bg-white focus:border-rose-100 transition-all" placeholder="此时此刻的心情..." />
            </div>
          </div>

          <button disabled={uploading} type="submit" className="w-full py-5 bg-zinc-900 text-white rounded-[2rem] font-black text-[10px] tracking-[0.5em] uppercase shadow-2xl hover:bg-rose-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {uploading ? <Loader2 className="animate-spin w-4 h-4" /> : <>{editId ? 'Refresh' : 'Commit'} Memory <Heart className="w-3 h-3" fill="currentColor" /></>}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><Loader2 className="animate-spin text-zinc-100" /></div>}>
      <CreateForm />
    </Suspense>
  );
}