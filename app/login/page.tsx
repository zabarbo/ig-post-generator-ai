import { login, signup } from './actions'
import { Camera, Mail, Lock } from 'lucide-react'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message: string }
}) {
  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col items-center justify-center p-6 selection:bg-primary/30 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-tr from-primary to-blue-500 rounded-[20px] flex items-center justify-center shadow-xl shadow-primary/20 ring-1 ring-white/10 mx-auto mb-6">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-2">Bienvenido de nuevo</h1>
          <p className="text-slate-400">Inicia sesión o crea una cuenta para guardar tus posts en la nube.</p>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/50 backdrop-blur-2xl rounded-[32px] p-8 shadow-2xl">
          <form className="flex-1 flex flex-col w-full justify-center gap-6 text-foreground">
            {searchParams?.message && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center font-bold rounded-xl mb-2">
                {searchParams.message}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <input
                  className="w-full pl-12 pr-6 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-200"
                  name="email"
                  placeholder="tu@correo.com"
                  required
                />
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1" htmlFor="password">
                Contraseña
              </label>
              <div className="relative">
                <input
                  className="w-full pl-12 pr-6 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-200"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  required
                />
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
              </div>
            </div>

            <div className="pt-2 gap-3 flex flex-col">
              <button
                formAction={login}
                className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black shadow-lg shadow-primary/25 transition-all active:scale-[0.98]"
              >
                Iniciar Sesión
              </button>
              <button
                formAction={signup}
                className="w-full py-4 bg-slate-800/50 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-2xl font-bold transition-all active:scale-[0.98]"
              >
                Crear Cuenta
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
