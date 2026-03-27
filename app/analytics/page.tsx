'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { motion } from 'framer-motion';
import { ArrowLeft, BarChart3, TrendingUp, Hash, Target, Sparkles, Zap, Star, Flame } from 'lucide-react';
import Link from 'next/link';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalGenerations: 0,
    totalPostsCreated: 0,
    scheduledCount: 0,
    byTone: {} as Record<string, number>,
    byObjective: {} as Record<string, number>,
    topCategory: ''
  });

  const supabase = createClient();

  useEffect(() => {
    async function fetchStats() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: posts } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id);

      if (posts) {
        // "drafts" represent a full generation call (which yields 3 posts internally in its JSON)
        // "scheduled" represent a single post scheduled from that array.
        const generations = posts.filter(p => p.status === 'draft');
        const scheduled = posts.filter(p => p.status === 'scheduled');
        
        let toneCounts: Record<string, number> = {};
        let objCounts: Record<string, number> = {};
        let catCounts: Record<string, number> = {};

        generations.forEach(g => {
          toneCounts[g.tone] = (toneCounts[g.tone] || 0) + 1;
          objCounts[g.objective] = (objCounts[g.objective] || 0) + 1;
          catCounts[g.category] = (catCounts[g.category] || 0) + 1;
        });

        // Find top category
        let topCat = "General";
        let maxVal = 0;
        Object.entries(catCounts).forEach(([cat, val]) => {
          if (val > maxVal) {
            maxVal = val;
            topCat = cat;
          }
        });

        setStats({
          totalGenerations: generations.length,
          totalPostsCreated: generations.length * 3, // Each gen yields 3 formats
          scheduledCount: scheduled.length,
          byTone: toneCounts,
          byObjective: objCounts,
          topCategory: topCat
        });
      }
      setLoading(false);
    }
    fetchStats();
  }, [supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-100 font-sans pb-20">
      <div className="max-w-5xl mx-auto px-6 py-8">
        
        <header className="flex items-center gap-4 mb-12">
          <Link
            href="/"
            aria-label="Volver al inicio"
            className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-300" />
          </Link>
          <div>
            <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500 flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-green-400" />
              Métricas de Generación
            </h1>
            <p className="text-slate-400 text-sm mt-1">Descubre qué estilos y objetivos estás utilizando más con la IA.</p>
          </div>
        </header>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="grid md:grid-cols-3 gap-6 mb-10"
        >
          {/* Main KPI 1 */}
          <div className="p-8 rounded-[32px] bg-slate-900/60 border border-slate-800/50 backdrop-blur-xl flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4">
              <Sparkles className="w-7 h-7 text-blue-400" />
            </div>
            <p className="text-sm font-bold text-slate-500 tracking-widest uppercase mb-1">Posts Creados</p>
            <h2 className="text-5xl font-black">{stats.totalPostsCreated}</h2>
          </div>

          {/* Main KPI 2 */}
          <div className="p-8 rounded-[32px] bg-slate-900/60 border border-slate-800/50 backdrop-blur-xl flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center mb-4">
              <TrendingUp className="w-7 h-7 text-green-400" />
            </div>
            <p className="text-sm font-bold text-slate-500 tracking-widest uppercase mb-1">Peticiones a Gemini</p>
            <h2 className="text-5xl font-black">{stats.totalGenerations}</h2>
          </div>

          {/* Main KPI 3 */}
          <div className="p-8 rounded-[32px] bg-slate-900/60 border border-slate-800/50 backdrop-blur-xl flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-4">
              <Star className="w-7 h-7 text-orange-400" />
            </div>
            <p className="text-sm font-bold text-slate-500 tracking-widest uppercase mb-1">Categoría Top</p>
            <h2 className="text-3xl font-black truncate max-w-full px-4 text-primary">{stats.topCategory || '-'}</h2>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Tones Chart */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="p-8 rounded-[32px] bg-slate-900/40 border border-slate-800/50 backdrop-blur-xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <Flame className="w-5 h-5 text-orange-500" />
              <h3 className="text-xl font-bold">Tonos más usados</h3>
            </div>
            {Object.keys(stats.byTone).length === 0 ? (
              <p className="text-slate-500 text-sm">Aún no hay datos suficientes.</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(stats.byTone).sort((a,b) => b[1] - a[1]).map(([tone, count]) => (
                  <div key={tone} className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm font-medium">{tone || 'Por defecto'}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-orange-500 rounded-full"
                          style={{ width: `${(count / stats.totalGenerations) * 100}%` }}
                        />
                      </div>
                      <span className="text-slate-400 text-sm font-bold w-6 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Objectives Chart */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="p-8 rounded-[32px] bg-slate-900/40 border border-slate-800/50 backdrop-blur-xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-bold">Objetivos de Campaña</h3>
            </div>
            {Object.keys(stats.byObjective).length === 0 ? (
              <p className="text-slate-500 text-sm">Aún no hay datos suficientes.</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(stats.byObjective).sort((a,b) => b[1] - a[1]).map(([obj, count]) => (
                  <div key={obj} className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm font-medium truncate max-w-[150px]" title={obj}>{obj || 'Por defecto'}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${(count / stats.totalGenerations) * 100}%` }}
                        />
                      </div>
                      <span className="text-slate-400 text-sm font-bold w-6 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </main>
  );
}
