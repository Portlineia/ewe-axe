import React from 'react';
import { Sparkles, Calendar as CalendarIcon, Beaker, FlaskConical } from 'lucide-react';

export function ScreenCalendario() {
  return (
    <div className="flex-1 flex flex-col animate-fade-in w-full h-full relative z-10 bg-[#FAFAFA]">
      <header className="px-6 pt-14 pb-4 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <h1 className="text-2xl font-serif font-bold text-slate-900 flex items-center gap-2">
          <CalendarIcon className="w-6 h-6 text-amber-500" /> Calendário Sagrado
        </h1>
      </header>
      <main className="flex-1 px-6 text-slate-500 text-center flex flex-col items-center justify-center -mt-20">
        <div className="w-20 h-20 bg-white border border-slate-200 shadow-sm rounded-full flex items-center justify-center mb-6">
           <Sparkles className="w-8 h-8 text-amber-500" />
        </div>
        <p className="font-serif text-lg text-slate-800">As datas de giras, festas e fases da lua aparecerão aqui em breve.</p>
        <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-2">Sincronizando com os astros...</p>
      </main>
    </div>
  );
}

export function ScreenAlquimia() {
  return (
    <div className="flex-1 flex flex-col animate-fade-in w-full h-full relative z-10 bg-[#FAFAFA]">
      <header className="px-6 pt-16 pb-6 bg-[#FAFAFA] flex items-center justify-between border-b border-slate-200">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-serif text-slate-900 leading-tight tracking-tight flex items-center gap-3">
             <FlaskConical className="w-7 h-7 text-emerald-600" /> 
             Mirongas & Banhos
          </h1>
          <p className="text-xs uppercase tracking-widest font-semibold text-emerald-800/60 mt-1">Sabedoria da Macaia</p>
        </div>
      </header>
      <main className="flex-1 px-6 text-slate-500 text-center flex flex-col items-center justify-center -mt-20">
        <div className="w-24 h-24 bg-white border border-slate-200 shadow-xl rounded-full flex items-center justify-center mb-6 relative">
           <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-20"></div>
           <FlaskConical className="w-10 h-10 text-emerald-600 relative z-10" />
        </div>
        <h2 className="text-xl font-serif text-slate-900 mb-2">O seu Altar Botânico</h2>
        <p className="text-sm text-slate-500 font-medium max-w-[250px] mx-auto leading-relaxed">
           Receituário vivo de banhos, defumações e classificação energética das folhas.
        </p>
        <div className="mt-8 px-5 py-2.5 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] uppercase font-bold tracking-[0.2em] text-emerald-600">
           Em fase de maceração...
        </div>
      </main>
    </div>
  );
}
