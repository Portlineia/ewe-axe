import React, { useState, useEffect } from 'react';
import { Swords, Moon, Sparkles, Quote, Flame, AlertCircle, CheckCircle2, Leaf, MessageCircle, Sun, Cloud, Droplets, ChevronRight, CalendarDays, Compass } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { GoogleGenAI } from '@google/genai';
import { getOrixaDoDia } from '../../utils/umbandaHelpers';
import { motion } from 'motion/react';

export function ScreenInicio({ onOpenDrawer, onNavigate }: { onOpenDrawer: () => void, onNavigate: (t: string) => void }) {
  const { user } = useAuth();
  const firstName = user?.displayName?.split(' ')[0] || 'Filho(a)';
  
  const [assentamentos, setAssentamentos] = useState<any[]>(() => {
    const cached = localStorage.getItem('cache_inicio_assentamentos');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) { return []; }
    }
    return [];
  });
  const [completedPreceitos, setCompletedPreceitos] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(`preceitos_${new Date().toDateString()}`);
    if (saved) setCompletedPreceitos(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (assentamentos.length > 0) {
      localStorage.setItem('cache_inicio_assentamentos', JSON.stringify(assentamentos));
    }
  }, [assentamentos]);

  const togglePreceito = (id: string) => {
    const newOnes = completedPreceitos.includes(id) 
      ? completedPreceitos.filter(x => x !== id)
      : [...completedPreceitos, id];
    setCompletedPreceitos(newOnes);
    localStorage.setItem(`preceitos_${new Date().toDateString()}`, JSON.stringify(newOnes));
    if (navigator.vibrate) navigator.vibrate(50);
  };

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'assentamentos'), where('userId', '==', user.uid));
    const unsub = onSnapshot(q, (snap) => {
      setAssentamentos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => {
      console.error("Erro no onSnapshot do inicio:", error);
    });
    return unsub;
  }, [user]);

  const getWeekday = () => {
    const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    return days[new Date().getDay()];
  };

  const getFaseDaLua = () => {
    const getJulianDate = (date: Date) => (date.getTime() / 86400000) - (date.getTimezoneOffset()/1440) + 2440587.5;
    const jd = getJulianDate(new Date());
    const age = (jd - 2451550.1) % 29.530588853;
    if(age < 1.845) return 'Nova';
    if(age < 5.536) return 'Crescente Côncava';
    if(age < 9.228) return 'Crescente';
    if(age < 12.919) return 'Crescente Convexa';
    if(age < 16.610) return 'Cheia';
    if(age < 20.302) return 'Minguante Convexa';
    if(age < 23.993) return 'Minguante';
    return 'Nova';
  };

  const getMonth = () => {
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return months[new Date().getMonth()];
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) return 'Bom dia';
    if (h >= 12 && h < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const getStatusLabel = (a: any) => {
    const now = new Date().getTime();
    let isUrgent = false;
    let isAttention = false;

    if (!a.velaExpiresAt) {
      isUrgent = true;
    } else {
      const vExpires = new Date(a.velaExpiresAt).getTime();
      const vHoursLeft = (vExpires - now) / (1000 * 60 * 60);
      if (vHoursLeft < 0) isUrgent = true;
      else if (vHoursLeft < 24) isAttention = true;
    }

    (a.agrados || []).forEach((ag: any) => {
      const agExpires = new Date(ag.expiresAt).getTime();
      if (agExpires < now) isUrgent = true;
    });

    if (isUrgent) return 'Urgente';
    if (isAttention) return 'Atenção';
    return 'OK';
  };

  let urgentCount = 0;
  let attentionCount = 0;
  assentamentos.forEach(a => {
    const label = getStatusLabel(a);
    if (label === 'Urgente') urgentCount++;
    else if (label === 'Atenção') attentionCount++;
  });

  const totalAtivos = assentamentos.length;
  const orixa = getOrixaDoDia();
  const IconRegencia = orixa.icon;

  const preceitos = [
    { id: '1', label: `Saudar ${orixa.nome.split(' e ')[0]}`, icon: Sun, desc: 'Tome um minuto em silêncio para pedir bênçãos à coroa do dia.' },
    { id: '2', label: 'Zelar pelas chamas', icon: Flame, alert: urgentCount > 0, desc: urgentCount > 0 ? 'Firmezas exigem sua atenção.' : 'Confira a luz de seus altares.' },
    { id: '3', label: 'Harmonização', icon: Leaf, desc: 'A água que lava renova a paz. Pratique a claridade na mente hoje.' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        staggerChildren: 0.15,
        delayChildren: 0.05
      } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: "spring", 
        stiffness: 90, 
        damping: 15,
        mass: 1
      } 
    }
  };

  return (
    <div className="flex-1 bg-[#F4F4F5] overflow-y-auto no-scrollbar pb-40 w-full h-full">
      {/* Dynamic Header */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="pt-16 px-6 pb-4 bg-[#F4F4F5] flex items-start justify-between relative z-20"
      >
        <div className="relative z-10 flex flex-col gap-1">
          <motion.div variants={itemVariants} className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">
            <CalendarDays className="w-3.5 h-3.5 text-stone-400" />
            <span>{getWeekday()}, {new Date().getDate()} de {getMonth()}</span>
          </motion.div>
          <motion.h1 variants={itemVariants} className="text-[2.5rem] font-serif text-slate-900 leading-[1.1] tracking-tight">
            {getGreeting()}, <br className="hidden" /><span className="text-emerald-900">{firstName}.</span>
          </motion.h1>
        </div>

        <motion.button variants={itemVariants} onClick={onOpenDrawer} className="relative z-10 flex-shrink-0 group">
          <div className="absolute inset-0 bg-emerald-500 rounded-full blur-[12px] opacity-20 group-hover:opacity-40 animate-pulse transition-opacity duration-700"></div>
          <img
            src={user?.photoURL || "https://i.pravatar.cc/150?img=11"}
            alt="Perfil"
            className="w-14 h-14 rounded-full border-2 border-white shadow-lg object-cover relative z-10 transition-transform duration-500 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
        </motion.button>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="px-5 py-4 flex flex-col gap-5"
      >
        
        {/* BENTO GRID: ROW 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Clima Espiritual do Dia (Orixá & Lua) - Expanded to fix text truncation */}
            <motion.div variants={itemVariants} className={`relative p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden flex flex-col justify-between group transition-all duration-500 ${orixa.bgGrad}`}>
               <div className="absolute top-0 right-0 p-4 opacity-20 transform group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                 <IconRegencia size={140} className={orixa.textDark ? 'text-slate-800' : 'text-white'} />
               </div>
               
               <div className="relative z-10 flex flex-col h-full gap-4">
                 <div className="flex items-center justify-between">
                     <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-sm border ${orixa.textDark ? 'bg-white/40 border-slate-900/10 text-slate-800' : 'bg-black/20 border-white/10 text-white'}`}>
                        <Compass className="w-3.5 h-3.5" />
                        Regência de {orixa.nome}
                     </span>
                     <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white/20 backdrop-blur-md shadow-sm border border-white/20 ${orixa.textDark ? 'text-slate-800' : 'text-white'}`}>
                        <Moon className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Lua</span> {getFaseDaLua()}
                     </div>
                 </div>

                 {/* No longer truncated line-clamp-2 */}
                 <div className="mt-auto">
                     <p className={`text-[15px] sm:text-[16px] font-serif leading-relaxed italic ${orixa.textDark ? 'text-slate-800/90' : 'text-white/90'}`}>
                       "{orixa.frase}"
                     </p>
                 </div>
               </div>
            </motion.div>

            {/* O Oráculo (AI Quick Access) */}
            <motion.div variants={itemVariants} onClick={() => onNavigate('oraculo')} className="relative p-7 bg-white rounded-[2rem] border border-stone-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden group transition-all duration-300 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] cursor-pointer flex flex-col">
                <div className="absolute -top-10 -right-10 opacity-[0.03] pointer-events-none group-hover:rotate-12 group-hover:scale-125 transition-all duration-1000">
                    <Cloud size={200} className="text-purple-600" />
                </div>
                
                <div className="flex justify-between items-center mb-4 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-sm">
                     <Sparkles className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-purple-700 bg-purple-100 px-3 py-1.5 rounded-full shadow-sm">AI Oráculo</span>
                </div>
                
                <div className="flex flex-col relative z-10 flex-1 justify-end">
                  <h3 className="text-2xl font-serif font-bold text-stone-900 mb-2">Consulta Guiada</h3>
                  <p className="text-stone-500 text-sm font-medium mb-5 leading-relaxed">
                    Pergunte, receba conselhos banhos e orientações diretas das entidades.
                  </p>
                  
                  <div className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-3 px-4 text-xs font-bold text-stone-500 flex justify-between items-center group-hover:bg-purple-50 group-hover:border-purple-200 transition-colors">
                    <span className="flex items-center gap-2"><MessageCircle className="w-4 h-4"/> Perguntar ao Oráculo...</span>
                    <ChevronRight className="w-4 h-4 text-purple-600" />
                  </div>
                </div>
            </motion.div>
        </div>

        {/* BENTO GRID: ROW 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Resumo do Congá (Zelo Widget) */}
            <motion.div variants={itemVariants} className="bg-white rounded-[2rem] p-6 border border-stone-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                   Equilíbrio do Congá
                </h3>
                <button onClick={() => onNavigate('conga')} className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200 transition-colors">
                   <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col gap-3 flex-1 justify-center">
                {totalAtivos === 0 ? (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 mx-auto bg-stone-50 rounded-full flex items-center justify-center mb-2">
                       <Flame className="w-5 h-5 text-stone-300" />
                    </div>
                    <p className="text-stone-400 text-sm font-serif italic mb-3">Nenhum assentamento.</p>
                    <button onClick={() => onNavigate('conga')} className="text-xs uppercase tracking-wider font-bold text-emerald-700 bg-emerald-50 px-4 py-2 rounded-full hover:bg-emerald-100 transition-colors">Erguer Altar</button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between bg-stone-50 p-4 rounded-2xl border border-stone-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center">
                           <Flame className="w-4 h-4 text-amber-500" />
                        </div>
                        <span className="text-sm font-bold text-stone-700">Firmezas</span>
                      </div>
                      <span className="font-serif text-2xl text-stone-900">{totalAtivos}</span>
                    </div>

                    {(urgentCount > 0 || attentionCount > 0) ? (
                      <div className="flex items-center justify-between bg-red-50 p-4 rounded-2xl border border-red-100 shadow-sm relative overflow-hidden group cursor-pointer" onClick={() => onNavigate('conga')}>
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-400"></div>
                        <div className="flex items-center gap-3 pl-1">
                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                             <AlertCircle className="w-4 h-4 text-red-500" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-red-900">Atenção</span>
                            <span className="text-[10px] uppercase tracking-wider text-red-600 font-bold">{urgentCount} Urgente {attentionCount > 0 && `• ${attentionCount} Breve`}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                       <div className="flex items-center gap-3 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 shadow-sm">
                          <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center">
                             <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          </div>
                          <span className="text-sm font-bold text-emerald-900">Tudo em Harmonia</span>
                        </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>

            {/* Preceitos Minilist Widget */}
            <motion.div variants={itemVariants} className="bg-white rounded-[2rem] p-6 border border-stone-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative">
               <div className="flex items-center justify-between mb-5">
                 <h3 className="text-xs font-bold text-stone-800 uppercase tracking-widest flex items-center gap-2">
                    Preceitos do Dia
                 </h3>
                 <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">{completedPreceitos.length}/{preceitos.length}</span>
               </div>
               
               <div className="space-y-3">
                 {preceitos.map(item => {
                   const isDone = completedPreceitos.includes(item.id);
                   const Ico = item.icon;
                   return (
                     <div
                       key={item.id}
                       onClick={() => togglePreceito(item.id)}
                       className={`flex items-center gap-3 p-3 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden relative ${isDone ? 'bg-stone-50 border-stone-100' : 'bg-white border-stone-200 hover:border-stone-300'}`}
                     >
                       <button className={`w-7 h-7 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors relative z-10 ${isDone ? 'bg-emerald-500 border-emerald-500 text-white' : item.alert ? 'border-red-400 bg-red-50 text-red-500' : 'border-stone-200 bg-stone-50 text-stone-400'}`}>
                         {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Ico className="w-3.5 h-3.5" />}
                       </button>
                       <div className="flex-1 min-w-0 pr-1">
                         <h4 className={`text-sm font-bold truncate ${isDone ? 'text-stone-400 line-through' : 'text-stone-800'}`}>{item.label}</h4>
                       </div>
                     </div>
                   );
                 })}
               </div>
            </motion.div>
        </div>

      </motion.div>
    </div>
  );
}
