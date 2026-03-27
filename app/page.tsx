"use client";

import { useState, useEffect } from "react";
import { Camera, Sparkles, History, Copy, Check, ChevronRight, X, Layout, Zap, Flame, Star, Settings2, Calendar as CalendarIcon, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
    const savedHistory = localStorage.getItem("ig-post-history");
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    const savedCalendar = localStorage.getItem("ig-scheduled-posts");
    if (savedCalendar) setScheduledPosts(JSON.parse(savedCalendar));
  }, []);

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
      
      const newHistory = [
        { productName, date: new Date().toISOString(), result: data },
        ...history.slice(0, 19), // Keep last 20
      ];
      setHistory(newHistory);
      localStorage.setItem("ig-post-history", JSON.stringify(newHistory));
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

  const saveScheduledPost = () => {
    if (!schedulingPost || !scheduledDate) return;

    const newScheduleItem = {
      id: Math.random().toString(36).substring(7),
      productName,
      date: scheduledDate,
      post: schedulingPost
    };

    const updatedSchedule = [...scheduledPosts, newScheduleItem].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    setScheduledPosts(updatedSchedule);
    localStorage.setItem("ig-scheduled-posts", JSON.stringify(updatedSchedule));
    setSchedulingPost(null);
  };

  const removeScheduledPost = (id: string) => {
    const updated = scheduledPosts.filter(p => p.id !== id);
    setScheduledPosts(updated);
    localStorage.setItem("ig-scheduled-posts", JSON.stringify(updated));
  };

  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-100 font-sans selection:bg-primary/30 pb-20 overflow-x-hidden">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 15, repeat: Infinity, delay: 2 }}
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" 
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
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
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowCalendar(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800 transition-all text-sm font-semibold backdrop-blur-md"
            >
              <CalendarIcon className="w-4 h-4 text-blue-400" />
              Calendario ({scheduledPosts.length})
            </button>
            <button 
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800 transition-all text-sm font-semibold backdrop-blur-md"
            >
              <History className="w-4 h-4 text-slate-400" />
              Historial
            </button>
          </div>
        </header>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Column: Input */}
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-5xl font-black leading-[1.1] tracking-tight">
                Contenido que <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">vende</span> súper rápido.
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                Nuestra IA analiza tu producto, define el mejor tono y genera posts listos para Instagram.
              </p>
            </div>

            <div className="p-8 rounded-[32px] bg-slate-900/40 border border-slate-800/50 backdrop-blur-2xl shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="space-y-6 relative">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-1">Producto</label>
                  <input 
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    type="text" 
                    placeholder="Ej: Mochila Urbana Waterproof"
                    className="w-full px-6 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-lg placeholder:text-slate-700"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-1">Categoría</label>
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-6 py-4 bg-slate-950/50 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none cursor-pointer text-slate-200"
                    >
                      <option>Auto-detectar</option>
                      <option>Indumentaria</option>
                      <option>Calzado</option>
                      <option>Perfumería</option>
                      <option>Accesorios</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-1">Precio</label>
                    <input 
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      type="text" 
                      placeholder="$ 0.00"
                      className="w-full px-6 py-4 bg-slate-950/50 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-slate-200"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-4">
                  <button 
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-primary transition-colors mb-2"
                  >
                    <Settings2 className="w-4 h-4" />
                    Configuración Avanzada (Opcional)
                  </button>
                  
                  <AnimatePresence>
                    {showAdvanced && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden space-y-4 pt-4"
                      >
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Tono del Post</label>
                          <select 
                            value={tone}
                            onChange={(e) => setTone(e.target.value)}
                            className="w-full px-6 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-200"
                          >
                            <option>Atractivo y vendedor</option>
                            <option>Elegante y sofisticado</option>
                            <option>Juvenil y divertido</option>
                            <option>Profesional y formal</option>
                            <option>Exclusivo y misterioso</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Objetivo del Post</label>
                          <select 
                            value={objective}
                            onChange={(e) => setObjective(e.target.value)}
                            className="w-full px-6 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-200"
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
                  className="w-full py-4.5 bg-gradient-to-r from-primary to-blue-600 hover:scale-[1.02] disabled:hover:scale-100 disabled:opacity-50 text-white rounded-2xl font-black text-lg shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 transition-all group active:scale-95"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                      GENERAR CON GEMINI AI
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Results */}
          <div className="relative min-h-[500px]">
            <AnimatePresence mode="wait">
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
                        {result.category}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500 block mb-1 font-bold">PÚBLICO IDEAL</span>
                        <span className="text-slate-300 font-medium">{result.inference.targetAudience}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block mb-1 font-bold">ESTILO VISUAL</span>
                        <span className="text-slate-300 font-medium">{result.inference.style}</span>
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
                      {result.visualIdeas.map((idea, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                          <ChevronRight className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
                          {idea}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Posts List */}
                  <div className="space-y-4">
                    {result.posts.map((post, i) => (
                      <div key={i} className="group p-6 rounded-3xl bg-slate-900/40 border border-slate-800/50 hover:border-primary/30 transition-all">
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-2">
                            {post.type === "Promocional" && <Flame className="w-4 h-4 text-orange-500" />}
                            {post.type === "Aspiracional" && <Star className="w-4 h-4 text-yellow-500" />}
                            {post.type === "Urgencia" && <Zap className="w-4 h-4 text-red-500" />}
                            <h4 className="text-xs font-black tracking-widest text-slate-400 uppercase">{post.type}</h4>
                          </div>
                          
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleScheduleProcess(post)}
                              className="p-2 rounded-xl bg-slate-800/50 hover:bg-blue-600 hover:text-white transition-all text-slate-400"
                              title="Planificar en Calendario"
                            >
                              <CalendarIcon className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => copyToClipboard(post.content + "\n\n" + post.hashtags.join(" "), i)}
                              className="p-2 rounded-xl bg-slate-800/50 hover:bg-primary hover:text-white transition-all text-slate-400"
                              title="Copiar Post"
                            >
                              {copiedIndex === i ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <p className="text-slate-300 whitespace-pre-wrap text-[15px] leading-relaxed mb-4">
                          {post.content}
                        </p>
                        <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-800/50">
                          {post.hashtags.map((tag, j) => (
                            <span key={j} className="text-[11px] font-bold text-primary px-2.5 py-1 rounded-lg bg-primary/10 tracking-wide">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
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
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-slate-950 border-l border-slate-800 z-[101] shadow-2xl p-8 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black tracking-tight">HISTORIAL</h3>
                <button onClick={() => setShowHistory(false)} className="p-2 rounded-xl hover:bg-slate-800">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[60vh] text-slate-600 space-y-2">
                  <History className="w-12 h-12 opacity-20" />
                  <p>No hay generaciones aún.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((item, i) => (
                    <button 
                      key={i} 
                      onClick={() => {
                        setResult(item.result);
                        setProductName(item.productName);
                        setShowHistory(false);
                      }}
                      className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-primary/50 text-left transition-all group"
                    >
                      <span className="text-xs text-slate-500 block mb-1">{new Date(item.date).toLocaleDateString()}</span>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-200">{item.productName}</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
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
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-slate-950 border-l border-slate-800 z-[101] shadow-2xl p-8 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-blue-400" />
                  <h3 className="text-xl font-black tracking-tight">CALENDARIO</h3>
                </div>
                <button onClick={() => setShowCalendar(false)} className="p-2 rounded-xl hover:bg-slate-800">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {scheduledPosts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[60vh] text-slate-600 space-y-2">
                  <CalendarIcon className="w-12 h-12 opacity-20" />
                  <p>No hay posts planificados.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {scheduledPosts.map((item) => (
                    <div key={item.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 relative">
                      <button 
                        onClick={() => removeScheduledPost(item.id)}
                        className="absolute top-4 right-4 text-slate-500 hover:text-red-400 transition-colors"
                        title="Eliminar de calendario"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="flex items-center gap-2 text-primary font-bold text-sm mb-2">
                        <Clock className="w-4 h-4" />
                        {new Date(item.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </div>
                      <h4 className="font-bold text-slate-300 text-lg mb-1">{item.productName}</h4>
                      <div className="text-xs text-slate-500 uppercase tracking-widest font-black mb-3">{item.post.type}</div>
                      <p className="text-sm text-slate-400 line-clamp-3 mb-3">{item.post.content}</p>
                      
                      <button 
                        onClick={() => copyToClipboard(item.post.content + "\n\n" + item.post.hashtags.join(" "), item.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold transition-colors"
                      >
                        {copiedIndex === item.id ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                        Copiar para publicar
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-sm shadow-2xl"
            >
              <h3 className="text-xl font-black mb-2 text-white">Planificar Post</h3>
              <p className="text-slate-400 text-sm mb-6">Selecciona el día y horario en que publicarás este contenido.</p>
              
              <div className="space-y-4 mb-8">
                <input 
                  type="datetime-local" 
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-200"
                />
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setSchedulingPost(null)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all text-sm"
                >
                  Cancelar
                </button>
                <button 
                  onClick={saveScheduledPost}
                  disabled={!scheduledDate}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-xl font-bold transition-all text-sm shadow-lg shadow-blue-500/20"
                >
                  Guardar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}
