"use client";

import { useState, useEffect } from "react";
import { Camera, Sparkles, History, Copy, Check, ChevronRight, X, Layout, Zap, Flame, Star, Settings2, Calendar as CalendarIcon, Clock, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Post {
  type: string;
  content: string;
  hashtags: string[];
}

interface GenerateResponse {
  category: string;
  inference: {
    targetAudience: string;
    style: string;
    keyBenefits: string[];
  };
  posts: Post[];
  visualIdeas: string[];
}

export default function Home() {
  const supabase = createClient();
  const pathname = usePathname();
  
  // Input states
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("Auto-detectar");
  const [price, setPrice] = useState("");
  
  // Advanced states (MVP+)
  const [tone, setTone] = useState("Atractivo y vendedor");
  const [objective, setObjective] = useState("Venta directa");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // App states
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Calendar states (MVP+)
  const [scheduledPosts, setScheduledPosts] = useState<any[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [schedulingPost, setSchedulingPost] = useState<Post | null>(null);
  const [scheduledDate, setScheduledDate] = useState("");

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: posts } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (posts) {
        const h = posts.filter(p => p.status === 'draft').slice(0, 20).map(p => ({
          productName: p.product_name,
          date: p.created_at,
          result: JSON.parse(p.content)
        }));
        setHistory(h);

        const s = posts.filter(p => p.status === 'scheduled').map(p => ({
          id: p.id,
          productName: p.product_name,
          date: p.scheduled_at,
          post: JSON.parse(p.content)
        })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setScheduledPosts(s);
      }
    }
    loadData();
  }, [supabase]);

  const handleGenerate = async () => {
    if (!productName) return;
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName, category, price, tone, objective }),
      });
      const data = await res.json();
      
      if (data.error) throw new Error(data.error);

      setResult(data);
      
      const newHistoryItem = { productName, date: new Date().toISOString(), result: data };
      setHistory([newHistoryItem, ...history.slice(0, 19)]);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('posts').insert({
          user_id: user.id,
          product_name: productName,
          category,
          price,
          tone,
          objective,
          content: JSON.stringify(data),
          status: 'draft'
        });
      }
    } catch (error) {
      console.error("Error generating content:", error);
      alert("Error al generar contenido. ¿Configuraste correctamente la API Key?");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleScheduleProcess = (post: Post) => {
    setSchedulingPost(post);
    setScheduledDate("");
  };

  const saveScheduledPost = async () => {
    if (!schedulingPost || !scheduledDate) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: newRow, error } = await supabase.from('posts').insert({
      user_id: user.id,
      product_name: productName,
      category,
      price,
      tone,
      objective,
      status: 'scheduled',
      scheduled_at: new Date(scheduledDate).toISOString(),
      content: JSON.stringify(schedulingPost)
    }).select('id').single();

    if (!error && newRow) {
      const newScheduleItem = {
        id: newRow.id,
        productName,
        date: scheduledDate,
        post: schedulingPost
      };
      const updatedSchedule = [...scheduledPosts, newScheduleItem].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      setScheduledPosts(updatedSchedule);
    }
    setSchedulingPost(null);
  };

  const removeScheduledPost = async (id: string) => {
    await supabase.from('posts').delete().eq('id', id);
    setScheduledPosts(scheduledPosts.filter(p => p.id !== id));
  };

  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-100 font-sans selection:bg-primary/30 pb-20 overflow-x-hidden">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{ x: [0, 50, 0], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] will-change-transform" 
        />
        <motion.div 
          animate={{ x: [0, -50, 0], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear", delay: 2 }}
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] will-change-transform" 
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-4 md:py-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-12 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-tr from-primary to-blue-500 rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20 ring-1 ring-white/10">
              <Camera className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 leading-none">
                IG POST GEN
              </h1>
              <span className="text-[10px] font-bold tracking-[0.2em] text-primary uppercase">Generado por Gemini AI</span>
            </div>
          </div>
          <div className="hidden md:flex flex-wrap items-center gap-3">
            <Link 
              href="/analytics"
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800 transition-all text-sm font-semibold backdrop-blur-md active:scale-95 text-slate-300"
            >
              <BarChart3 className="w-4 h-4 text-green-400" />
              Métricas
            </Link>
            <Link 
              href="/settings"
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800 transition-all text-sm font-semibold backdrop-blur-md active:scale-95 text-slate-300"
            >
              <Settings2 className="w-4 h-4 text-purple-400" />
              Marca
            </Link>
            <button 
              onClick={() => setShowCalendar(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800 transition-all text-sm font-semibold backdrop-blur-md active:scale-95 text-slate-300"
            >
              <CalendarIcon className="w-4 h-4 text-blue-400" />
              Calendario ({scheduledPosts.length})
            </button>
            <button 
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800 transition-all text-sm font-semibold backdrop-blur-md active:scale-95 text-slate-300"
            >
              <History className="w-4 h-4 text-slate-400" />
              Historial
            </button>
          </div>
        </header>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left Column: Input */}
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="space-y-8 will-change-transform"
          >
            <div className="space-y-4">
              <h2 className="text-3xl md:text-5xl font-black leading-[1.1] tracking-tight">
                Contenido que <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">vende</span> súper rápido.
              </h2>
              <p className="text-slate-400 text-base md:text-lg leading-relaxed">
                Nuestra IA analiza tu producto, define el mejor tono y genera posts listos para Instagram.
              </p>
            </div>

            <div className="p-6 md:p-8 rounded-[32px] bg-slate-900/40 border border-slate-800/50 backdrop-blur-2xl shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="space-y-6 relative">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">¿Qué quieres promocionar?</label>
                  <input 
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    type="text" 
                    placeholder="Ej: Mochila Urbana Waterproof"
                    className="w-full px-6 py-5 bg-slate-950/50 border border-slate-800 rounded-[24px] focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-lg placeholder:text-slate-700"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Categoría</label>
                    <div className="relative">
                      <select 
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-6 py-4 bg-slate-950/50 border border-slate-800 rounded-[20px] focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none cursor-pointer text-slate-200"
                      >
                        <option>Auto-detectar</option>
                        <option>Indumentaria</option>
                        <option>Calzado</option>
                        <option>Perfumería</option>
                        <option>Accesorios</option>
                      </select>
                      <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none rotate-90" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Precio (Opcional)</label>
                    <input 
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      type="text" 
                      placeholder="$ 0.00"
                      className="w-full px-6 py-4 bg-slate-950/50 border border-slate-800 rounded-[20px] focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-slate-200"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-2 text-sm font-bold text-primary/80 hover:text-primary transition-colors mb-2 px-1 active:scale-95"
                  >
                    <div className={`p-1.5 rounded-lg bg-primary/10 transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`}>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                    {showAdvanced ? 'Ocultar ajustes' : 'Personalizar Tono y Objetivo'}
                  </button>
                  
                  <AnimatePresence>
                    {showAdvanced && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden space-y-5 pt-4 pb-2"
                      >
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Tono del Contenido</label>
                          <select 
                            value={tone}
                            onChange={(e) => setTone(e.target.value)}
                            className="w-full px-6 py-4 bg-slate-900/50 border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-200 appearance-none"
                          >
                            <option>Atractivo y vendedor</option>
                            <option>Elegante y sofisticado</option>
                            <option>Juvenil y divertido</option>
                            <option>Profesional y formal</option>
                            <option>Exclusivo y misterioso</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Objetivo Estratégico</label>
                          <select 
                            value={objective}
                            onChange={(e) => setObjective(e.target.value)}
                            className="w-full px-6 py-4 bg-slate-900/50 border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-200 appearance-none"
                          >
                            <option>Venta directa</option>
                            <option>Generar interacción (Likes/Comentarios)</option>
                            <option>Posicionamiento de marca (Branding)</option>
                            <option>Llevar tráfico al sitio web</option>
                          </select>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button 
                  onClick={handleGenerate}
                  disabled={loading || !productName}
                  className="w-full py-5 bg-gradient-to-r from-primary via-blue-600 to-indigo-600 hover:brightness-110 disabled:opacity-50 text-white rounded-[24px] font-black text-lg shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 transition-all active:scale-95 touch-manipulation"
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                      <span className="animate-pulse">CREANDO MAGIA...</span>
                    </div>
                  ) : (
                    <>
                      <Sparkles className="w-6 h-6" />
                      GENERAR POSTS
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Results */}
          <div className="relative min-h-[200px] lg:min-h-[500px]">
            <AnimatePresence>
              {!result && !loading ? (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4"
                >
                  <div className="w-20 h-20 bg-slate-800/30 rounded-full flex items-center justify-center mb-4">
                    <Layout className="w-10 h-10 text-slate-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-400">Esperando tu producto...</h3>
                  <p className="text-slate-600 max-w-[280px]">Ingresa los datos a la izquierda y configuraciones avanzadas para comenzar.</p>
                </motion.div>
              ) : loading ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="h-24 bg-slate-800/20 rounded-3xl animate-pulse" />
                  <div className="h-[400px] bg-slate-800/20 rounded-3xl animate-pulse" />
                </motion.div>
              ) : result ? (
                <motion.div 
                  key="results"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="space-y-6"
                >
                  {/* Category & Inference Header */}
                  <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/50 backdrop-blur-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-black tracking-widest uppercase ring-1 ring-primary/30">
                        {result?.category}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500 block mb-1 font-bold">PÚBLICO IDEAL</span>
                        <span className="text-slate-300 font-medium">{result?.inference?.targetAudience}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block mb-1 font-bold">ESTILO VISUAL</span>
                        <span className="text-slate-300 font-medium">{result?.inference?.style}</span>
                      </div>
                    </div>
                  </div>

                  {/* Visual Ideas */}
                  <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10 backdrop-blur-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <Zap className="w-4 h-4 text-blue-400" />
                      <h4 className="text-xs font-black tracking-widest text-blue-400 uppercase">Ideas Prácticas Visuales</h4>
                    </div>
                    <ul className="space-y-2">
                      {result?.visualIdeas?.map((idea, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                          <ChevronRight className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
                          {idea}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Posts List */}
                  <div className="space-y-8 pb-12">
                    {result?.posts?.map((post, i) => (
                      <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        key={i} 
                        className="group overflow-hidden rounded-[32px] bg-slate-900/60 border border-slate-800/50 shadow-2xl"
                      >
                        {/* Mock Instagram Header */}
                        <div className="px-5 py-4 flex items-center justify-between border-b border-white/5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-indigo-600 p-[2px]">
                              <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center border-2 border-slate-950">
                                <Camera className="w-5 h-5 text-slate-300" />
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-white leading-none">Tu Marca</span>
                              <span className="text-[10px] text-slate-500 font-bold tracking-tight mt-1">{post.type} • IA Sugerido</span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <div className="w-1 h-1 rounded-full bg-slate-700" />
                            <div className="w-1 h-1 rounded-full bg-slate-700" />
                            <div className="w-1 h-1 rounded-full bg-slate-700" />
                          </div>
                        </div>

                        {/* Post Content Area */}
                        <div className="p-6 pb-4">
                          <p className="text-slate-200 whitespace-pre-wrap text-[15px] leading-relaxed mb-6 font-medium">
                            {post.content}
                          </p>
                          <div className="flex flex-wrap gap-2 mb-6">
                            {post.hashtags.map((tag, j) => (
                              <span key={j} className="text-sm font-bold text-primary hover:underline cursor-pointer">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Action Buttons (Native Style) */}
                        <div className="px-4 pb-6 grid grid-cols-2 gap-3">
                          <button 
                            onClick={() => copyToClipboard(post.content + "\n\n" + post.hashtags.join(" "), i)}
                            className="flex items-center justify-center gap-2 py-4 bg-slate-800/80 hover:bg-slate-800 text-white rounded-2xl text-[13px] font-black transition-all active:scale-95 border border-white/5"
                          >
                            {copiedIndex === i ? (
                              <>
                                <Check className="w-4 h-4 text-green-400" />
                                <span className="text-green-400">¡COPIADO!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                COPIAR TEXTO
                              </>
                            )}
                          </button>
                          <button 
                            onClick={() => handleScheduleProcess(post)}
                            className="flex items-center justify-center gap-2 py-4 bg-primary hover:brightness-110 text-white rounded-2xl text-[13px] font-black transition-all active:scale-95 shadow-lg shadow-primary/20"
                          >
                            <CalendarIcon className="w-4 h-4" />
                            PLANIFICAR
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* History Modal */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
              className="fixed inset-x-0 bottom-0 top-12 md:top-auto md:h-[85vh] bg-slate-950 rounded-t-[32px] border-t border-slate-800 z-[101] shadow-2xl flex flex-col will-change-transform"
            >
              {/* Drag Handle */}
              <div className="w-full flex justify-center pt-5 pb-2 cursor-pointer" onClick={() => setShowHistory(false)}>
                <div className="w-12 h-1.5 bg-slate-800 rounded-full" />
              </div>
              
              <div className="flex-1 overflow-y-auto px-6 lg:px-12 pb-24">
                <div className="flex justify-between items-center mb-8 pt-4">
                  <h3 className="text-2xl font-black tracking-tight">HISTORIAL</h3>
                  <button onClick={() => setShowHistory(false)} className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors active:scale-95 text-slate-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[50vh] text-slate-600 space-y-4">
                    <History className="w-16 h-16 opacity-30" />
                    <p className="font-semibold text-lg">No hay generaciones aún.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {history.map((item, i) => (
                      <button 
                        key={i} 
                        onClick={() => {
                          setResult(item.result);
                          setProductName(item.productName);
                          setShowHistory(false);
                        }}
                        className="w-full p-5 rounded-[24px] bg-slate-900/80 border border-slate-800 hover:border-primary/50 text-left transition-all group active:scale-[0.98]"
                      >
                        <span className="text-xs font-bold text-slate-500 block mb-2">{new Date(item.date).toLocaleDateString()}</span>
                        <div className="flex justify-between items-center opacity-90 group-hover:opacity-100">
                          <span className="font-bold tracking-tight text-lg text-slate-200">{item.productName}</span>
                          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-slate-400" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Calendar Modal */}
      <AnimatePresence>
        {showCalendar && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCalendar(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
              className="fixed inset-x-0 bottom-0 top-12 md:top-auto md:h-[85vh] bg-slate-950 rounded-t-[32px] border-t border-slate-800 z-[101] shadow-2xl flex flex-col will-change-transform"
            >
              {/* Drag Handle */}
              <div className="w-full flex justify-center pt-5 pb-2 cursor-pointer" onClick={() => setShowCalendar(false)}>
                <div className="w-12 h-1.5 bg-slate-800 rounded-full" />
              </div>

              <div className="flex-1 overflow-y-auto px-6 lg:px-12 pb-24">
                <div className="flex justify-between items-center mb-8 pt-4">
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="w-7 h-7 text-blue-400" />
                    <h3 className="text-2xl font-black tracking-tight">CALENDARIO</h3>
                  </div>
                  <button onClick={() => setShowCalendar(false)} className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors active:scale-95 text-slate-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {scheduledPosts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[50vh] text-slate-600 space-y-4">
                    <CalendarIcon className="w-16 h-16 opacity-30" />
                    <p className="font-semibold text-lg">No hay posts planificados.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {scheduledPosts.map((item) => (
                      <div key={item.id} className="group p-6 rounded-[24px] bg-slate-900/80 border border-slate-800 relative hover:border-slate-700 transition-colors">
                        <button 
                          onClick={() => removeScheduledPost(item.id)}
                          className="absolute top-4 right-4 p-2 bg-red-500/10 text-red-400 rounded-xl opacity-100 md:opacity-0 group-hover:opacity-100 transition-all active:scale-95"
                          title="Eliminar de calendario"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="flex items-center gap-2 text-primary font-bold text-sm mb-3">
                          <Clock className="w-5 h-5 text-blue-400" />
                          {new Date(item.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </div>
                        <h4 className="font-bold text-slate-200 text-lg mb-1 leading-snug">{item.productName}</h4>
                        <div className="text-xs text-slate-500 uppercase tracking-widest font-black mb-4">{item.post.type}</div>
                        <p className="text-[15px] text-slate-400 line-clamp-3 mb-5 leading-relaxed">{item.post.content}</p>
                        
                        <button 
                          onClick={() => copyToClipboard(item.post.content + "\n\n" + item.post.hashtags.join(" "), item.id)}
                          className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-bold transition-colors active:scale-95 text-slate-200"
                        >
                          {copiedIndex === item.id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                          Copiar para publicar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Schedule A Post Overaly Dialog */}
      <AnimatePresence>
        {schedulingPost && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-end justify-center bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
              className="bg-slate-900 border-t border-slate-800 p-8 rounded-t-[32px] w-full max-w-lg shadow-2xl pb-safe will-change-transform"
            >
              <h3 className="text-2xl font-black mb-2 text-white text-center">Planificar Post</h3>
              <p className="text-slate-400 text-[15px] mb-8 text-center px-4">Selecciona el día y horario en que publicarás este contenido.</p>
              
              <div className="mb-8">
                <input 
                  type="datetime-local" 
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-200 text-lg appearance-none"
                />
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setSchedulingPost(null)}
                  className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold transition-all text-[15px] active:scale-95"
                >
                  Cancelar
                </button>
                <button 
                  onClick={saveScheduledPost}
                  disabled={!scheduledDate}
                  className="flex-1 py-4 bg-primary focus:ring-4 focus:ring-primary/30 hover:bg-blue-600 disabled:opacity-50 text-white rounded-2xl font-bold transition-all text-[15px] shadow-lg shadow-primary/20 active:scale-95"
                >
                  Guardar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950 border-t border-slate-900/80 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] pb-5 pt-3 px-6">
        <div className="flex items-center justify-between mt-1 text-slate-500">
          <Link href="/" className="flex flex-col items-center gap-1.5 w-16 group active:scale-95 transition-all">
            <div className={`p-2 rounded-xl transition-colors ${pathname === '/' ? 'bg-primary/20 text-primary' : 'group-hover:text-slate-300'}`}>
              <Sparkles className="w-5 h-5" />
            </div>
          </Link>
          
          <button onClick={() => setShowCalendar(true)} className="flex flex-col items-center gap-1.5 w-16 group active:scale-95 transition-all">
            <div className={`p-2 rounded-xl transition-colors ${showCalendar ? 'bg-blue-500/20 text-blue-400' : 'group-hover:text-slate-300'}`}>
              <CalendarIcon className="w-5 h-5" />
            </div>
          </button>

          <button onClick={() => setShowHistory(true)} className="flex flex-col items-center gap-1.5 w-16 group active:scale-95 transition-all">
            <div className={`p-2 rounded-xl transition-colors ${showHistory ? 'bg-slate-800 text-slate-200' : 'group-hover:text-slate-300'}`}>
              <History className="w-5 h-5" />
            </div>
          </button>

          <Link href="/analytics" className="flex flex-col items-center gap-1.5 w-16 group active:scale-95 transition-all">
            <div className={`p-2 rounded-xl transition-colors ${pathname === '/analytics' ? 'bg-green-500/20 text-green-400' : 'group-hover:text-slate-300'}`}>
              <BarChart3 className="w-5 h-5" />
            </div>
          </Link>

          <Link href="/settings" className="flex flex-col items-center gap-1.5 w-16 group active:scale-95 transition-all">
            <div className={`p-2 rounded-xl transition-colors ${pathname === '/settings' ? 'bg-purple-500/20 text-purple-400' : 'group-hover:text-slate-300'}`}>
              <Settings2 className="w-5 h-5" />
            </div>
          </Link>
        </div>
      </div>

    </main>
  );
}
