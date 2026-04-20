import React from 'react';
import { X, CalendarDays, Settings, UserCircle, LogOut, Flame, BookOpen, Leaf, LayoutDashboard, Sparkles } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

export function Drawer({ isOpen, onClose, onNavigate }: DrawerProps) {
  const { user, logOut } = useAuth();

  return (
    <div className={`absolute inset-0 z-50 ${isOpen ? '' : 'pointer-events-none'}`}>
      <div 
        className={`absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} 
        onClick={onClose}
      />
      
      <div className={`absolute top-0 right-0 w-72 h-full bg-[#1c1917] text-stone-300 shadow-2xl transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="p-6 pb-6 pt-16 flex items-center justify-between bg-stone-900 relative overflow-hidden">
          <div className="absolute top-[-20px] right-[-20px] opacity-10">
            <Leaf size={100} className="text-emerald-500" />
          </div>
          <span className="font-serif font-bold text-2xl text-emerald-500 relative z-10 tracking-widest">Ewé Axé</span>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-white bg-stone-800 hover:bg-stone-700 rounded-full transition-colors relative z-10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User / Profile Tap Target */}
        {user && (
          <div 
            onClick={() => { onNavigate('perfil'); onClose(); }} 
            className="p-6 bg-stone-900 border-b border-stone-800 flex items-center gap-4 cursor-pointer hover:bg-stone-800 transition-colors"
          >
            <img 
              src={user.photoURL || "https://i.pravatar.cc/150?img=11"} 
              alt="Avatar" 
              className="w-12 h-12 rounded-full object-cover border-2 border-emerald-900/50 shadow-md"
            />
            <div className="flex-1 overflow-hidden">
              <h3 className="font-bold text-white text-sm truncate">{user.displayName || 'Irmão(ã) de Santo'}</h3>
              <p className="text-xs text-emerald-500 font-medium">Visualizar Meu Perfil</p>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-600" />
          </div>
        )}

        <div className="p-4 space-y-1 flex-1 overflow-y-auto no-scrollbar">
          
          <div className="px-3 py-2 text-[10px] uppercase tracking-widest text-stone-500 font-bold mb-1 mt-2">
             Navegação da Corrente
          </div>

          <button 
            onClick={() => { onNavigate('inicio'); onClose(); }} 
            className="w-full flex items-center gap-3 p-3.5 rounded-2xl hover:bg-stone-800 text-stone-300 text-sm font-medium transition-colors group"
          >
            <LayoutDashboard className="w-5 h-5 text-emerald-500" /> Tela Inicial
          </button>
          
          <button 
            onClick={() => { onNavigate('conga'); onClose(); }} 
            className="w-full flex items-center gap-3 p-3.5 rounded-2xl hover:bg-stone-800 text-stone-300 text-sm font-medium transition-colors group"
          >
            <Flame className="w-5 h-5 text-brand-amber" /> O Congá
          </button>
          
          <button 
            onClick={() => { onNavigate('oraculo'); onClose(); }} 
            className="w-full flex items-center gap-3 p-3.5 rounded-2xl hover:bg-stone-800 text-purple-300 text-sm font-medium transition-colors group bg-purple-900/10 border border-purple-900/30"
          >
            <Sparkles className="w-5 h-5 text-purple-400 group-hover:text-purple-300" /> O Oráculo (AI)
          </button>

          <button 
            onClick={() => { onNavigate('acervo'); onClose(); }} 
            className="w-full flex items-center gap-3 p-3.5 rounded-2xl hover:bg-stone-800 text-stone-300 text-sm font-medium transition-colors group"
          >
            <BookOpen className="w-5 h-5 text-emerald-600" /> Herbanário
          </button>

          <button 
            onClick={() => { onNavigate('calendario'); onClose(); }} 
            className="w-full flex items-center gap-3 p-3.5 rounded-2xl hover:bg-stone-800 text-stone-300 text-sm font-medium transition-colors group"
          >
            <CalendarDays className="w-5 h-5 text-blue-400" /> Calendário Sagrado
          </button>

          <div className="px-3 py-2 text-[10px] uppercase tracking-widest text-stone-500 font-bold mb-1 mt-4">
             Conta
          </div>

          <button 
            onClick={() => { onNavigate('perfil'); onClose(); }} 
            className="w-full flex items-center gap-3 p-3.5 rounded-2xl hover:bg-stone-800 text-stone-400 text-sm font-medium transition-colors group"
          >
            <UserCircle className="w-5 h-5 text-stone-500 group-hover:text-stone-300" /> Meu Perfil (Zelo)
          </button>

          <button 
            onClick={() => { onNavigate('perfil'); onClose(); }} 
            className="w-full flex items-center gap-3 p-3.5 rounded-2xl hover:bg-stone-800 text-stone-400 text-sm font-medium transition-colors group"
          >
            <Settings className="w-5 h-5 text-stone-500 group-hover:text-stone-300" /> Configurações
          </button>
        </div>

        <div className="p-6 bg-stone-950 border-t border-stone-800">
          <button 
            onClick={() => { logOut(); onClose(); }} 
            className="w-full flex items-center justify-center gap-2 p-4 rounded-xl text-red-500 bg-red-950 hover:bg-red-900 border border-red-900 text-sm font-bold transition-colors shadow-sm"
          >
            <LogOut className="w-4 h-4" /> Desconectar / Sair
          </button>
        </div>
      </div>
    </div>
  );
}

const ChevronRight = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6"/>
  </svg>
)

