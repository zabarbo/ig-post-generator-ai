import { createClient } from '@/utils/supabase/server';
import Dashboard from './components/Dashboard';
import { redirect } from 'next/navigation';
import { Database } from 'lucide-react';

export default async function Page() {
  const isSupabaseConfigured = 
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'tu-project-url-aqui' && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'tu-anon-key-aqui';

  if (!isSupabaseConfigured) {
    return (
      <main className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col items-center justify-center p-8">
        <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center space-y-6">
          <Database className="w-16 h-16 text-blue-500 mx-auto opacity-50 mb-4" />
          <h1 className="text-3xl font-black">Falta configurar Supabase</h1>
          <p className="text-slate-400">
            Para activar las capacidades PRO SaaS (Cuentas de usuario, Contexto de Marca, y Base de Datos), ingresa tus credenciales en el archivo <code className="text-primary bg-primary/10 px-2 py-1 rounded">.env.local</code>.
          </p>
          <div className="bg-slate-950 p-6 rounded-2xl text-left border border-slate-800 space-y-4">
            <p className="text-sm font-bold text-slate-300">Una vez obtengas las keys en Supabase.com, edita estas líneas:</p>
            <code className="text-sm text-blue-400 block break-all leading-loose">
              NEXT_PUBLIC_SUPABASE_URL="..."<br/>
              NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
            </code>
          </div>
          <p className="text-sm text-slate-500 mt-4">Recuerda correr la estructura SQL enviada en <code className="text-slate-400">supabase_schema.sql</code> en el dashboard de Supabase.</p>
        </div>
      </main>
    );
  }

  // If Supabase is configured, check Auth
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  return <Dashboard />;
}
