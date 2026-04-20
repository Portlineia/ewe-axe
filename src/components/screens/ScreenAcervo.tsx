import React, { useState, useEffect } from 'react';
import { Leaf, Search, Calendar, ChevronRight, BookOpen, Trash2, X, Edit2, Check, XCircle, CheckCircle2, Circle, ListChecks } from 'lucide-react';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../auth/AuthProvider';
import ReactMarkdown from 'react-markdown';
import { motion, useAnimation, PanInfo, AnimatePresence } from 'motion/react';

function SwipeableScanItem({ scan, onOpen, onDelete, isSelectionMode, isSelected, onToggleSelect }: { scan: any, onOpen: () => void, onDelete: () => void, isSelectionMode?: boolean, isSelected?: boolean, onToggleSelect?: () => void }) {
  const controls = useAnimation();

  const handleDragEnd = async (e: any, info: PanInfo) => {
    if (isSelectionMode) return; // Disable swipe actions when selecting
    const threshold = 80;
    
    if (info.offset.x > threshold) {
      // Swiped right -> Open details
      controls.start({ x: window.innerWidth, opacity: 0 }).then(() => {
        onOpen();
        controls.set({ x: 0, opacity: 1 });
      });
    } else if (info.offset.x < -threshold) {
      // Swiped left -> Delete
      if (confirm('Deseja remover este registro do seu acervo?')) {
        controls.start({ x: -window.innerWidth, opacity: 0 }).then(() => {
          onDelete();
        });
      } else {
        controls.start({ x: 0, opacity: 1 });
      }
    } else {
      // Snap back
      controls.start({ x: 0, opacity: 1 });
    }
  };

  return (
    <div className="relative w-full rounded-[2rem] bg-red-50 overflow-hidden shadow-sm">
      {/* Background actions */}
      {!isSelectionMode && (
        <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none">
          {/* Left side (exposed when swiping right) */}
          <div className="flex items-center text-emerald-600 font-bold gap-2">
             <BookOpen className="w-5 h-5" /> <span className="uppercase text-xs tracking-widest">Abrir</span>
          </div>
          {/* Right side (exposed when swiping left) */}
          <div className="flex items-center text-red-500 font-bold gap-2">
             <span className="uppercase text-xs tracking-widest">Excluir</span> <Trash2 className="w-5 h-5" />
          </div>
        </div>
      )}

      <motion.button
        drag={isSelectionMode ? false : "x"}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.6}
        onDragEnd={handleDragEnd}
        animate={controls}
        onClick={() => isSelectionMode ? onToggleSelect?.() : onOpen()}
        whileTap={{ scale: 0.98 }}
        className={`relative w-full z-10 p-4 rounded-[2rem] border flex items-center gap-4 text-left transition-all ${isSelectionMode && isSelected ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-stone-200 shadow-sm hover:shadow-md'}`}
      >
        <AnimatePresence>
          {isSelectionMode && (
             <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 28, opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="flex-shrink-0 flex items-center overflow-hidden">
                <div className="mr-1">
                  {isSelected ? <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-100" /> : <Circle className="w-6 h-6 text-stone-300" />}
                </div>
             </motion.div>
          )}
        </AnimatePresence>
        
        <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-inner flex-shrink-0 bg-stone-100">
          <img 
            src={scan.imageURL} 
            alt={scan.plantName} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-stone-900 leading-tight mb-1">{scan.plantName}</h3>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">
              Botânica & Sagrada
            </span>
            <span className="text-[10px] text-stone-400 font-bold flex items-center gap-1">
              <Clock className="w-2 h-2" />
              {new Date(scan.createdAt).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>
        {!isSelectionMode && <ChevronRight className="w-5 h-5 text-stone-300 transition-transform" />}
      </motion.button>
    </div>
  );
}

function ScanDetailFullScreen({ scan, onClose, onDelete, onUpdate }: { scan: any, onClose: () => void, onDelete: () => void, onUpdate: (id: string, data: any) => Promise<void> }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(scan.plantName);
  const [desc, setDesc] = useState(scan.description);

  // Sync state if scan changes while open
  useEffect(() => {
    setName(scan.plantName);
    setDesc(scan.description);
    setIsEditing(false);
  }, [scan]);

  const handleSave = async () => {
    if (!name.trim()) return;
    await onUpdate(scan.id, { plantName: name.trim(), description: desc });
    setIsEditing(false);
  };

  const handleDragEnd = (e: any, info: PanInfo) => {
    // Swipe down to close
    if (info.offset.y > 150) {
      onClose();
    }
  };

  return (
    <motion.div
       initial={{ y: '100%' }}
       animate={{ y: 0 }}
       exit={{ y: '100%' }}
       transition={{ type: 'spring', damping: 25, stiffness: 200 }}
       className="fixed inset-0 z-[100] bg-stone-50 flex flex-col overflow-hidden"
       drag="y"
       dragConstraints={{ top: 0, bottom: 0 }}
       dragElastic={{ top: 0, bottom: 0.6 }}
       onDragEnd={handleDragEnd}
    >
      {/* Header Actions */}
      <div className="flex items-center justify-between p-4 absolute top-0 w-full z-20 pointer-events-none">
         <button onClick={onClose} className="pointer-events-auto p-3 bg-stone-900/40 backdrop-blur-md rounded-full text-white hover:bg-stone-900/60 transition-colors shadow-lg shadow-black/10">
            <X className="w-5 h-5"/>
         </button>
         <div className="flex gap-3 pointer-events-auto">
           {!isEditing ? (
              <>
                 <button onClick={() => setIsEditing(true)} className="p-3 bg-white/90 backdrop-blur-md text-emerald-700 rounded-full hover:bg-white transition-colors shadow-lg shadow-black/5"><Edit2 className="w-5 h-5"/></button>
                 <button onClick={onDelete} className="p-3 bg-white/90 backdrop-blur-md text-red-600 rounded-full hover:bg-white transition-colors shadow-lg shadow-black/5"><Trash2 className="w-5 h-5"/></button>
              </>
           ) : (
              <>
                 <button onClick={() => setIsEditing(false)} className="p-3 bg-white/90 text-stone-600 rounded-full hover:bg-white transition"><XCircle className="w-5 h-5"/></button>
                 <button onClick={handleSave} className="p-3 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/30"><Check className="w-5 h-5"/></button>
              </>
           )}
         </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-safe">
         <div className="relative w-full h-[45vh] min-h-[300px]">
            <img src={scan.imageURL} alt={scan.plantName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-50 via-stone-50/20 to-transparent"></div>
         </div>

         <div className="px-6 -mt-16 relative z-10 pb-12">
            {isEditing ? (
              <div className="space-y-4 animate-in fade-in">
                 <input 
                   className="text-4xl font-serif font-bold text-stone-900 w-full bg-white border-none rounded-2xl p-4 shadow-sm focus:ring-2 focus:ring-emerald-500/20" 
                   value={name} 
                   onChange={e => setName(e.target.value)}
                   placeholder="Nome da Erva" 
                 />
                 <textarea 
                   className="w-full h-[50vh] bg-white border-none rounded-2xl p-6 font-medium text-stone-700 shadow-sm focus:ring-2 focus:ring-emerald-500/20 resize-none leading-relaxed" 
                   value={desc} 
                   onChange={e => setDesc(e.target.value)} 
                   placeholder="Escreva sobre as propriedades mágicas e botânicas..."
                 />
              </div>
            ) : (
              <div className="animate-in fade-in">
                 <h1 className="text-4xl font-serif font-bold text-stone-900 mb-2 drop-shadow-sm">{scan.plantName}</h1>
                 <p className="text-xs text-stone-500 font-bold uppercase tracking-widest flex items-center gap-2 mb-8 bg-white/50 w-max px-4 py-2 rounded-full backdrop-blur-sm border border-stone-200">
                    <Calendar className="w-3 h-3" /> Catalogado em {new Date(scan.createdAt).toLocaleDateString('pt-BR')}
                 </p>
                 <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-stone-100">
                     <div className="prose prose-stone prose-emerald max-w-none markdown-body font-sans text-stone-700 leading-relaxed">
                        <ReactMarkdown>{scan.description}</ReactMarkdown>
                     </div>
                 </div>
              </div>
            )}
         </div>
      </div>
    </motion.div>
  );
}

export function ScreenAcervo() {
  const { user } = useAuth();
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScan, setSelectedScan] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Batch delete state
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'plantScans'),
      where('userId', '==', user.uid)
    );
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      docs.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setScans(docs);
      setLoading(false);
    }, (error) => {
      console.error("Acervo Snapshot Error:", error);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedIds(new Set()); // Reset selections when toggling
  };

  const toggleSelectId = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    if (confirm(`Deseja remover permanentemente ${selectedIds.size} ${selectedIds.size === 1 ? 'erva sagrada' : 'ervas sagradas'} do seu acervo?`)) {
      try {
        const promises = Array.from(selectedIds).map(id => deleteDoc(doc(db, 'plantScans', id)));
        await Promise.all(promises);
        setIsSelectionMode(false);
        setSelectedIds(new Set());
      } catch (err) {
        console.error("Erro ao deletar do acervo", err);
      }
    }
  };

  const filteredScans = scans.filter(s => 
    s.plantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-stone-50">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className={`flex-1 flex flex-col bg-stone-50 animate-fade-in relative z-10 w-full h-full pb-32 transition-colors ${isSelectionMode ? 'bg-stone-100' : ''}`}>
      <header className={`px-6 pt-16 pb-6 bg-white border-b border-stone-200 shadow-sm transition-all ${isSelectionMode ? 'bg-emerald-50/50' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold tracking-tight text-stone-900 font-serif flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-emerald-700" /> Meu Acervo
          </h1>
          {scans.length > 0 && (
            <button 
              onClick={toggleSelectionMode}
              className={`p-2 rounded-full transition-colors ${isSelectionMode ? 'bg-stone-200 text-stone-700' : 'text-emerald-700 hover:bg-emerald-50'}`}
            >
              {isSelectionMode ? <X className="w-6 h-6" /> : <ListChecks className="w-6 h-6" />}
            </button>
          )}
        </div>
        {!isSelectionMode ? (
          <div className="relative animate-in fade-in slide-in-from-top-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Buscar ervas no meu diário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-stone-100 border-none rounded-2xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
            />
          </div>
        ) : (
          <div className="py-2 animate-in fade-in slide-in-from-bottom-2">
            <p className="text-sm font-bold text-emerald-800 tracking-wide uppercase">
              {selectedIds.size === 0 ? 'Selecione as ervas' : `${selectedIds.size} erva${selectedIds.size > 1 ? 's' : ''} selecionada${selectedIds.size > 1 ? 's' : ''}`}
            </p>
          </div>
        )}
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar p-6">
        <div className="space-y-4">
          {filteredScans.length === 0 ? (
            <div className="text-center py-20">
              <Leaf className="w-12 h-12 text-stone-200 mx-auto mb-4" />
              <p className="text-stone-400 font-medium">Nenhuma erva encontrada no seu histórico.</p>
              <p className="text-[10px] text-stone-400 mt-1 uppercase tracking-widest font-bold">Use o scanner para catalogar suas plantas</p>
            </div>
          ) : (
            filteredScans.map((scan) => (
              <SwipeableScanItem
                key={scan.id}
                scan={scan}
                isSelectionMode={isSelectionMode}
                isSelected={selectedIds.has(scan.id)}
                onToggleSelect={() => toggleSelectId(scan.id)}
                onOpen={() => setSelectedScan(scan)}
                onDelete={async () => {
                  await deleteDoc(doc(db, 'plantScans', scan.id));
                  if (selectedScan?.id === scan.id) setSelectedScan(null);
                }}
              />
            ))
          )}
        </div>
      </main>

      <AnimatePresence>
         {isSelectionMode && selectedIds.size > 0 && (
           <motion.div 
             initial={{ y: 100, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             exit={{ y: 100, opacity: 0 }}
             className="fixed bottom-[80px] left-0 right-0 p-4 z-40 flex justify-center pointer-events-none"
           >
             <div className="bg-stone-900 rounded-[2rem] p-2 flex items-center gap-2 shadow-2xl shadow-black/20 pointer-events-auto">
               <button 
                 onClick={handleBatchDelete}
                 className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-full text-sm font-bold flex items-center gap-2 transition-colors uppercase tracking-widest"
               >
                 <Trash2 className="w-4 h-4" /> Excluir {selectedIds.size}
               </button>
             </div>
           </motion.div>
         )}
      </AnimatePresence>

      <AnimatePresence>
         {selectedScan && (
           <ScanDetailFullScreen 
             scan={selectedScan} 
             onClose={() => setSelectedScan(null)}
             onDelete={async () => {
               if (confirm('Deseja remover esta erva sagrada do seu acervo?')) {
                 setSelectedScan(null);
                 await deleteDoc(doc(db, 'plantScans', selectedScan.id));
               }
             }}
             onUpdate={async (id, data) => {
               await updateDoc(doc(db, 'plantScans', id), data);
               // Optimistically update the selectedScan to view modifications immediately
               setSelectedScan({ ...selectedScan, ...data });
             }}
           />
         )}
      </AnimatePresence>
    </div>
  );
}

function Clock({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  );
}
