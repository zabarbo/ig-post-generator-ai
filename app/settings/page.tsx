'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { motion } from 'framer-motion';
import { Settings, Save, ArrowLeft, Target, MessageCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    brand_name: '',
    target_audience: '',
    brand_voice_rules: '',
    forbidden_words: ''
  });

  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (data) {
          setProfile({
            brand_name: data.brand_name || '',
            target_audience: data.target_audience || '',
            brand_voice_rules: data.brand_voice_rules || '',
            forbidden_words: data.forbidden_words || ''
          });
        }
      }
      setLoading(false);
    }
    loadProfile();
  }, [supabase]);

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...profile,
          created_at: new Date().toISOString()
        });
        
      if (error) {
        alert('Error al guardar el perfil: ' + error.message);
      } else {
        alert('✅ Perfil de marca guardado exitosamente.');
      }
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-100 font-sans pb-20">
      <div className="max-w-4xl mx-auto px-6 py-8">
        
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-300" />
            </Link>
            <div>
              <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
                Contexto de Marca
              </h1>
              <p className="text-slate-400 text-sm mt-1">Configura el ADN de tu negocio para la IA.</p>
            </div>
          </div>
          
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-blue-600 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary/20"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </header>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="space-y-6"
        >
          {/* Brand Name */}
          <div className="p-8 rounded-[32px] bg-slate-900/60 border border-slate-800/50 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Nombre o Marca</h2>
            </div>
            <input 
              value={profile.brand_name}
              onChange={e => setProfile({...profile, brand_name: e.target.value})}
              placeholder="Ej: Urban Style Oficial"
              className="w-full px-6 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-200"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Target Audience */}
            <div className="p-8 rounded-[32px] bg-slate-900/60 border border-slate-800/50 backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-5 h-5 text-blue-400" />
                <h2 className="text-xl font-bold">Público Objetivo</h2>
              </div>
              <p className="text-sm text-slate-400 mb-4">¿A quién le hablas exactamente?</p>
              <textarea 
                value={profile.target_audience}
                onChange={e => setProfile({...profile, target_audience: e.target.value})}
                placeholder="Ej: Estudiantes universitarios de 18-25 años que buscan comodidad y moda streetwear..."
                className="w-full h-32 px-6 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-200 resize-none"
              />
            </div>

            {/* Voice Rules */}
            <div className="p-8 rounded-[32px] bg-slate-900/60 border border-slate-800/50 backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-4">
                <MessageCircle className="w-5 h-5 text-green-400" />
                <h2 className="text-xl font-bold">Reglas de Tono / Voz</h2>
              </div>
              <p className="text-sm text-slate-400 mb-4">Instructivos específicos de cómo debe hablar la IA.</p>
              <textarea 
                value={profile.brand_voice_rules}
                onChange={e => setProfile({...profile, brand_voice_rules: e.target.value})}
                placeholder="Ej: Usa un tono muy amigable, tutea siempre al cliente. Usa muchos emojis de fueguito 🔥 y destellos ✨."
                className="w-full h-32 px-6 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-200 resize-none"
              />
            </div>
          </div>

          {/* Forbidden Words */}
          <div className="p-8 rounded-[32px] bg-red-900/10 border border-red-500/20 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h2 className="text-xl font-bold text-red-400">Palabras Prohibidas (Blacklist)</h2>
            </div>
            <p className="text-sm text-red-400/70 mb-4">Palabras o frases que Gemini NUNCA debe incluir en tus posts.</p>
            <input 
              value={profile.forbidden_words}
              onChange={e => setProfile({...profile, forbidden_words: e.target.value})}
              placeholder="Ej: barato, liquidación, descuento, estimado cliente"
              className="w-full px-6 py-4 bg-slate-950/50 border border-red-500/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/50 text-slate-200"
            />
          </div>

        </motion.div>
      </div>
    </main>
  );
}
