import React, { useState } from 'react';
import { Home, Globe, Leaf, Flame, BookOpen, FlaskConical, Camera, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getOrixaDoDia } from '../../utils/umbandaHelpers';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onScannerOpen: () => void;
}

export function BottomNav({ activeTab, onTabChange, onScannerOpen }: BottomNavProps) {
  const [isFabOpen, setIsFabOpen] = useState(false);

  const toggleFab = () => setIsFabOpen(!isFabOpen);
  const orixa = getOrixaDoDia();

  return (
    <>
      {/* Soft gradient fade from the bottom so the feed fades out nicely behind the pill */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-stone-100 via-stone-100/60 to-transparent pointer-events-none z-20"></div>

      {/* Menu do FAB Botânico Flutuante */}
      <AnimatePresence>
        {isFabOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute bottom-[90px] left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-3 w-64"
          >
            <button
              onClick={() => {
                onTabChange('alquimia');
                toggleFab();
              }}
              className="flex items-center gap-3 bg-white/95 backdrop-blur-3xl text-stone-700 px-5 py-3.5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white font-medium text-[15px] hover:bg-white active:scale-95 transition-all w-full justify-center"
            >
              <FlaskConical className="w-5 h-5 text-emerald-600" /> Mirongas & Banhos
            </button>
            <button
              onClick={() => {
                onScannerOpen();
                toggleFab();
              }}
              className="flex items-center gap-3 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-[0_8px_30px_rgba(5,150,105,0.3)] border border-emerald-500 font-medium text-[15px] hover:shadow-[0_8px_40px_rgba(5,150,105,0.4)] hover:bg-emerald-700 active:scale-95 transition-all w-full justify-center"
            >
              <Camera className="w-5 h-5" /> Decifrar Natureza
            </button>
            <div className={`w-0 h-0 border-l-[12px] border-r-[12px] border-t-[14px] border-transparent -mt-2 drop-shadow-sm ${isFabOpen ? 'border-t-emerald-600' : ''}`} style={{ borderTopColor: isFabOpen ? '' : undefined }}></div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="absolute bottom-5 left-4 right-4 z-30 flex justify-center">
        {/* Floating Pill Background */}
        <div className="bg-white/90 backdrop-blur-3xl rounded-[2rem] p-1.5 flex justify-between items-center shadow-[0_20px_40px_-5px_rgba(0,0,0,0.1)] border border-white/60 relative w-full max-w-sm mx-auto">
          
          {/* 1. INÍCIO */}
          <button
            onClick={() => onTabChange('inicio')}
            className="relative flex-1 flex flex-col items-center justify-center h-[52px] rounded-[1.5rem] w-full group active:scale-90 transition-transform"
          >
            {activeTab === 'inicio' && <motion.div layoutId="nav-pill" className="absolute inset-0 bg-stone-100 rounded-[1.5rem]" transition={{ type: "spring", stiffness: 300, damping: 25 }} />}
            <span className="relative z-10 flex flex-col items-center justify-center w-full h-full">
              <Home className={`w-5 h-5 transition-colors ${activeTab === 'inicio' ? 'text-emerald-800' : 'text-stone-400 group-hover:text-stone-700'}`} strokeWidth={activeTab === 'inicio' ? 2.5 : 2} />
              {activeTab === 'inicio' && <div className="w-1 h-1 rounded-full bg-emerald-600 mt-1 absolute bottom-1"></div>}
            </span>
          </button>

          {/* 2. COMUNIDADE */}
          <button
            onClick={() => onTabChange('comunidade')}
            className="relative flex-1 flex flex-col items-center justify-center h-[52px] rounded-[1.5rem] w-full group active:scale-90 transition-transform"
          >
            {activeTab === 'comunidade' && <motion.div layoutId="nav-pill" className="absolute inset-0 bg-stone-100 rounded-[1.5rem]" transition={{ type: "spring", stiffness: 300, damping: 25 }} />}
            <span className="relative z-10 flex flex-col items-center justify-center w-full h-full">
               <Globe className={`w-5 h-5 transition-colors ${activeTab === 'comunidade' ? 'text-emerald-800' : 'text-stone-400 group-hover:text-stone-700'}`} strokeWidth={activeTab === 'comunidade' ? 2.5 : 2} />
               {activeTab === 'comunidade' && <div className="w-1 h-1 rounded-full bg-emerald-600 mt-1 absolute bottom-1"></div>}
            </span>
          </button>

          {/* 3. FAB CENTRAL */}
          <div className="relative mx-1.5 shrink-0 px-1 flex items-center justify-center h-[52px]">
            <div className="absolute inset-x-2 -inset-y-4 rounded-full blur-[10px] opacity-40 pointer-events-none" style={{ background: 'inherit' }} />
            <motion.button
              onClick={toggleFab}
              whileTap={{ scale: 0.9 }}
              className={`relative w-14 h-14 -mt-6 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.15)] border-[4px] border-white flex items-center justify-center transition-colors duration-300 z-50 overflow-hidden ${isFabOpen ? 'bg-emerald-600' : `${orixa.bgGrad}`}`}
            >
              {/* Blur Overlay specific for depth */}
              {!isFabOpen && <div className="absolute inset-0 bg-black/10 mix-blend-overlay backdrop-blur-[2px]"></div>}
              
              <Leaf className={`w-5 h-5 transition-transform duration-500 relative z-10 ${orixa.textDark ? 'text-slate-800' : 'text-white/90'} drop-shadow-sm ${isFabOpen ? 'rotate-90 scale-0 opacity-0' : 'scale-100 opacity-100'}`} />
              <Plus className={`w-6 h-6 text-white absolute inset-0 m-auto transition-transform duration-500 z-10 ${isFabOpen ? 'rotate-45 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}`} />
            </motion.button>
          </div>

          {/* 4. CONGÁ */}
          <button
            onClick={() => onTabChange('conga')}
            className="relative flex-1 flex flex-col items-center justify-center h-[52px] rounded-[1.5rem] w-full group active:scale-90 transition-transform"
          >
            {activeTab === 'conga' && <motion.div layoutId="nav-pill" className="absolute inset-0 bg-stone-100 rounded-[1.5rem]" transition={{ type: "spring", stiffness: 300, damping: 25 }} />}
            <span className="relative z-10 flex flex-col items-center justify-center w-full h-full">
              <Flame className={`w-5 h-5 transition-colors ${activeTab === 'conga' ? 'text-emerald-800' : 'text-stone-400 group-hover:text-stone-700'}`} strokeWidth={activeTab === 'conga' ? 2.5 : 2} />
              {activeTab === 'conga' && <div className="w-1 h-1 rounded-full bg-emerald-600 mt-1 absolute bottom-1"></div>}
            </span>
          </button>

          {/* 5. ACERVO */}
          <button
            onClick={() => onTabChange('acervo')}
            className="relative flex-1 flex flex-col items-center justify-center h-[52px] rounded-[1.5rem] w-full group active:scale-90 transition-transform"
          >
            {activeTab === 'acervo' && <motion.div layoutId="nav-pill" className="absolute inset-0 bg-stone-100 rounded-[1.5rem]" transition={{ type: "spring", stiffness: 300, damping: 25 }} />}
            <span className="relative z-10 flex flex-col items-center justify-center w-full h-full">
              <BookOpen className={`w-5 h-5 transition-colors ${activeTab === 'acervo' ? 'text-emerald-800' : 'text-stone-400 group-hover:text-stone-700'}`} strokeWidth={activeTab === 'acervo' ? 2.5 : 2} />
              {activeTab === 'acervo' && <div className="w-1 h-1 rounded-full bg-emerald-600 mt-1 absolute bottom-1"></div>}
            </span>
          </button>

        </div>
      </nav>
    </>
  );
}
