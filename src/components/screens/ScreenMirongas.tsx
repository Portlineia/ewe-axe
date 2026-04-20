import React, { useState, useEffect } from 'react';
import { Search, Flame, Leaf, Droplets, ChevronRight, Sparkles, Filter, FlaskConical, Wind, Share2, Send, CheckCircle2, X, Plus, TentTree, Loader2, Crown, Calendar, BellRing, Trash2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../../firebase';
import { collection, onSnapshot, doc, setDoc, getDocs, deleteDoc, addDoc, query, where, updateDoc } from 'firebase/firestore';
import { BOTANICA_ERVAS, BOTANICA_PREPAROS, Temperatura, ErvaSeed, PreparoSeed } from '../../data/botanicaAfro';
import { useAuth } from '../auth/AuthProvider';

interface Erva extends ErvaSeed {
  id: string;
  descobridorId?: string;
  descobridorNome?: string;
}

export function ScreenMirongas() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'ervas' | 'preparos'>('ervas');
  const [search, setSearch] = useState('');
  const [filterTemp, setFilterTemp] = useState<Temperatura | 'todas'>('todas');
  const [ervasBase, setErvasBase] = useState<Erva[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedErva, setSelectedErva] = useState<Erva | null>(null);
  
  // Share States
  const [sharingPrep, setSharingPrep] = useState<PreparoSeed | null>(null);
  const [hasSharedToFeed, setHasSharedToFeed] = useState(false);

  // Add Erva States
  const [isAddingErva, setIsAddingErva] = useState(false);
  const addErvaFileRef = React.useRef<HTMLInputElement>(null);
  const [newErva, setNewErva] = useState({
    nomePopular: '',
    orixasInput: '',
    indicacao: '',
    temperatura: 'morna' as Temperatura,
    descricao: '',
    imagemURL: ''
  });

  // Caboclo Consultation State
  const [isConsultingCaboclo, setIsConsultingCaboclo] = useState(false);
  const [cabocloMessage, setCabocloMessage] = useState<string | null>(null);

  const [userRecipes, setUserRecipes] = useState<any[]>([]);
  
  // Reminder States
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderRecipe, setReminderRecipe] = useState<any>(null);
  const [reminderConfig, setReminderConfig] = useState({ date: '', time: '' });

  const handleSaveReminder = async () => {
    if (!reminderRecipe || !reminderConfig.date || !reminderConfig.time) return;
    try {
       const dateObj = new Date(`${reminderConfig.date}T${reminderConfig.time}`);
       const ref = doc(db, 'userRecipes', reminderRecipe.id || reminderRecipe.titulo);
       await updateDoc(ref, {
         lembreteDate: dateObj.toISOString()
       });
       setShowReminderModal(false);
       setReminderRecipe(null);
       setReminderConfig({ date: '', time: '' });
       alert("Lembrete agendado com sucesso!");
    } catch (e) {
       console.error("Erro ao salvar lembrete", e);
    }
  };

  // Fetch das Ervas Global (Comunidade) e userRecipes
  useEffect(() => {
    const ervasRef = collection(db, 'ervas_catalogadas');

    const deduplicateAndSeed = async () => {
      try {
        const snap = await getDocs(ervasRef);
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Erva));
        
        // 1. Remove duplicates
        const seenNames = new Set<string>();
        for (const d of docs) {
          if (!d.nomePopular) continue;
          const normalized = d.nomePopular.trim().toLowerCase();
          if (seenNames.has(normalized)) {
            console.log('Removendo duplicata:', d.nomePopular, d.id);
            await deleteDoc(doc(db, 'ervas_catalogadas', d.id));
          } else {
            seenNames.add(normalized);
          }
        }

        // 2. Check for missing seeds
        const currentNames = Array.from(seenNames);
        const newErvas = BOTANICA_ERVAS.filter(e => !currentNames.includes(e.nomePopular.trim().toLowerCase()));

        if (newErvas.length > 0) {
          console.log(`Semeando ${newErvas.length} ervas ausentes...`);
          for (const erva of newErvas) {
            const safeId = erva.nomePopular.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\W+/g, '_');
            await setDoc(doc(ervasRef, safeId), { 
              ...erva,
              lastAIUpdate: new Date().toISOString(),
              descobridorId: 'system'
            });
          }
        }
      } catch (err) {
        console.error('Erro no deduplicateAndSeed:', err);
      }
    };

    // Run deduplication once on mount, then start listener
    let unsubscribeErvas: (() => void) | undefined;
    
    deduplicateAndSeed().then(() => {
      unsubscribeErvas = onSnapshot(ervasRef, (snapshot) => {
        const ervasData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Erva[];
        
        // Sort alphabetically
        setErvasBase(ervasData.sort((a,b) => (a.nomePopular || '').localeCompare(b.nomePopular || '')));
        setLoading(false);
      }, (error) => {
         console.error("Erro no onSnapshot do catálogo:", error);
         setLoading(false);
      });
    });

    // Fetch user recipes from Oraculo
    let unsubscribeRecipes: (() => void) | undefined;
    if (user) {
      const qRecipes = query(collection(db, 'userRecipes'), where('userId', '==', user.uid));
      unsubscribeRecipes = onSnapshot(qRecipes, (snapshot) => {
        const recipes = snapshot.docs.map(doc => ({
           id: doc.id,
           ...doc.data()
        }));
        setUserRecipes(recipes.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      });
    }

    return () => {
      if (unsubscribeErvas) unsubscribeErvas();
      if (unsubscribeRecipes) unsubscribeRecipes();
    };

  }, [user]);

  const filteredErvas = ervasBase.filter(e => 
    (e.nomePopular || '').toLowerCase().includes(search.toLowerCase()) && 
    (filterTemp === 'todas' || e.temperatura === filterTemp)
  );

  const getTempVisuals = (temp: Temperatura) => {
    switch (temp) {
      case 'quente': return { color: 'text-red-600', bg: 'bg-red-50 text-red-700 border-red-100', icon: Flame, label: 'Fogo/Quente' };
      case 'morna': return { color: 'text-amber-600', bg: 'bg-amber-50 text-amber-700 border-amber-100', icon: Leaf, label: 'Equilibradora' };
      case 'fria': return { color: 'text-cyan-600', bg: 'bg-cyan-50 text-cyan-700 border-cyan-100', icon: Droplets, label: 'Éter/Fria' };
      default: return { color: 'text-slate-600', bg: 'bg-slate-50 text-slate-700 border-slate-100', icon: Leaf, label: 'Desconhecida' };
    }
  };

  const handleExternalShare = async (prep: PreparoSeed) => {
    const text = `🌿 *${prep.titulo}* 🌿\n\n🔹 *Indicação:* ${prep.indicacao}\n\n🌱 *Ingredientes:* ${prep.ingredientes.join(' • ')}\n\n✨ *Preparo:* ${prep.preparo}\n\nVia App Axé - Diário de Umbanda`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: prep.titulo,
          text: text
        });
      } else {
        await navigator.clipboard.writeText(text);
        alert('Resumo copiado para a área de transferência!');
      }
    } catch (err) {
      console.log('Erro ao compartilhar', err);
    }
  };

  const handlePostToCommunity = async (prep: PreparoSeed) => {
    if (!user) {
      alert('Você precisa estar logado para publicar na comunidade.');
      return;
    }
    const content = `🌿 Compartilhando um fundamento: *${prep.titulo}*\n\n🔹 *Para que serve:* ${prep.indicacao}\n🌱 *O que vai:* ${prep.ingredientes.join(', ')}\n\n✨ *Recomendação de Preparo:* ${prep.preparo}`;
    try {
      await addDoc(collection(db, 'corrente_posts'), {
        authorId: user.uid,
        authorName: user.displayName || 'Irmão de Coruja',
        authorPhoto: user.photoURL || 'https://i.pravatar.cc/150?img=11',
        type: 'mensagem',
        content: content,
        axedBy: [],
        createdAt: new Date().toISOString()
      });
      setHasSharedToFeed(true);
      setTimeout(() => {
        setSharingPrep(null);
        setHasSharedToFeed(false);
      }, 2000);
    } catch (err) {
      console.error('Erro ao postar na comunidade', err);
      alert('Falha ao compartilhar. Tente novamente.');
    }
  };

  const handleAddErvaImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_SIZE = 600;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        setNewErva(prev => ({ ...prev, imagemURL: canvas.toDataURL('image/jpeg', 0.6) }));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleAddErva = async () => {
    if (!newErva.nomePopular.trim() || !newErva.indicacao.trim()) {
      alert('Preencha pelo menos o nome e a indicação.');
      return;
    }
    const orixasArray = newErva.orixasInput.split(',').map(o => o.trim()).filter(o => o.length > 0);
    
    // Normalize ID
    const safeId = newErva.nomePopular.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\W+/g, '_') + '_' + Date.now();
    
    try {
      await setDoc(doc(db, 'ervas_catalogadas', safeId), {
        nomePopular: newErva.nomePopular.trim(),
        orixas: orixasArray,
        indicacao: newErva.indicacao.trim(),
        temperatura: newErva.temperatura,
        descricao: newErva.descricao.trim(),
        imagemURL: newErva.imagemURL || 'https://images.unsplash.com/photo-1542385151-efd9000785a0?w=800&q=80',
        descobridorId: user?.uid || 'anon',
        descobridorNome: user?.displayName || 'Anônimo',
        createdAt: new Date().toISOString()
      });
      setIsAddingErva(false);
      setNewErva({ nomePopular: '', orixasInput: '', indicacao: '', temperatura: 'morna', descricao: '', imagemURL: '' });
    } catch (err) {
      console.error("Erro ao adicionar erva:", err);
      alert('Erro ao adicionar. Tente novamente.');
    }
  };

  const handleConsultarCaboclo = async (ervaNome: string) => {
    setIsConsultingCaboclo(true);
    setCabocloMessage(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          {
             role: 'user',
             parts: [{ text: `Assuma a persona de um sábio Caboclo (Entidade de Luz da Umbanda). Um filho de fé está te perguntando sobre os fundamentos espirituais, usos em banhos ou defumações e energias da folha: ${ervaNome}. Me dê uma resposta acolhedora de NO MÁXIMO 2 ou 3 parágrafos curtos. Não use markdown, apenas o texto natural.` }]
          }
        ]
      });
      setCabocloMessage(response.text || "O silêncio do vento também é resposta, filho. Não consegui canalizar agora.");
    } catch (err) {
      console.error(err);
      setCabocloMessage("Minha intuição falhou agora, tente de novo daqui a pouco.");
    } finally {
      setIsConsultingCaboclo(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full h-full relative z-10 bg-[#FAFAFA] animate-fade-in">
      
      {/* Premium Header */}
      <header className="px-6 pt-16 pb-6 bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-serif text-slate-900 leading-tight tracking-tight flex items-center gap-3">
             <FlaskConical className="w-8 h-8 text-emerald-600" /> 
             Mirongas & Banhos
          </h1>
          <p className="text-xs uppercase tracking-[0.2em] font-semibold text-emerald-800/60 mt-1">Sabedoria da Macaia</p>
        </div>

        {/* Tab Toggle */}
        <div className="flex mt-6 bg-slate-100/80 p-1.5 rounded-full border border-slate-200">
          <button 
            onClick={() => setActiveTab('ervas')}
            className={`flex-1 py-2.5 px-4 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${activeTab === 'ervas' ? 'bg-white text-emerald-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Catálogo
          </button>
          <button 
            onClick={() => setActiveTab('preparos')}
            className={`flex-1 py-2.5 px-4 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${activeTab === 'preparos' ? 'bg-white text-emerald-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Receituário
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar pb-36 p-5">
        
        <AnimatePresence mode="wait">
          {/* TAB 1: CATÁLOGO DE ERVAS */}
          {activeTab === 'ervas' && (
            <motion.div 
              key="ervas"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-6"
            >
              
              {/* Search, Filter & Add */}
              <div className="flex gap-2 relative">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Buscar erva..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-full py-3.5 pl-12 pr-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 shadow-sm"
                  />
                </div>
                <button 
                  onClick={() => setIsAddingErva(true)}
                  className="px-4 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-sm hover:bg-emerald-700 transition-colors font-bold text-xs uppercase tracking-wider"
                >
                  <Plus className="w-5 h-5 sm:mr-1" />
                  <span className="hidden sm:inline">Contribuir</span>
                </button>
              </div>

              {/* Herb Cards */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                   <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
                   <p className="text-sm font-bold text-slate-400">Consultando a macaia...</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredErvas.map((erva) => {
                    const temp = getTempVisuals(erva.temperatura);
                    const Icon = temp.icon;
                    return (
                      <motion.div 
                        key={erva.id}
                        onClick={() => setSelectedErva(erva)}
                        whileHover={{ scale: 1.02, y: -2 }}
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-[2rem] p-4 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex gap-4 overflow-hidden relative cursor-pointer group transition-shadow hover:shadow-xl hover:border-emerald-200"
                      >
                        {/* Ethereal Glow on Hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/0 via-emerald-50/0 to-emerald-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        <img 
                          src={erva.imagemURL || 'https://images.unsplash.com/photo-1542385151-efd9000785a0?w=800&q=80'} 
                          alt={erva.nomePopular} 
                          onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1542385151-efd9000785a0?w=800&q=80'; }}
                          referrerPolicy="no-referrer" 
                          className="w-24 h-32 rounded-2xl object-cover shadow-sm bg-slate-100 relative z-10 transition-transform duration-500 group-hover:scale-105" 
                        />
                        
                        <div className="flex-1 flex flex-col justify-center relative z-10">
                          <div className="flex items-start justify-between mb-1">
                             <div className="flex flex-col gap-1.5">
                               {erva.descobridorId && erva.descobridorId !== 'system' && (
                                  <span className="self-start bg-amber-100 text-amber-800 text-[8px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full border border-amber-200 shadow-sm flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> Descoberta Nova</span>
                               )}
                               <h3 className="font-serif text-xl text-slate-900 font-bold leading-tight">{erva.nomePopular}</h3>
                             </div>
                             <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-colors mt-1 shrink-0" />
                          </div>
                          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium mb-3">{erva.nomeCientifico}</p>
                          
                          <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <span className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${temp.bg}`}>
                              <Icon className="w-3 h-3" /> {temp.label}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed font-medium line-clamp-2">
                            <span className="font-bold text-slate-800">Regência:</span> {erva.orixas?.join(', ')}<br/>
                            {erva.uso}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                  
                  {filteredErvas.length === 0 && (
                    <div className="text-center py-10">
                       <Leaf className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                       <p className="text-slate-500 font-serif">Esta folha não consta no nosso acervo aberto.</p>
                       <p className="text-xs text-emerald-600 mt-2 font-bold cursor-pointer">Use sua Câmera para trazê-la ao aplicativo!</p>
                    </div>
                  )}
                </div>
              )}

            </motion.div>
          )}

          {/* TAB 2: RECEITUÁRIO */}
          {activeTab === 'preparos' && (
            <motion.div 
              key="preparos"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-5"
            >
              
              <div className="bg-emerald-900 text-white p-6 rounded-[2rem] relative overflow-hidden shadow-xl">
                 <div className="absolute -right-8 -top-8 opacity-20"><Sparkles size={160}/></div>
                 <h2 className="text-2xl font-serif font-bold mb-2 relative z-10">A Magia Prática</h2>
                 <p className="text-sm font-light text-emerald-100 font-serif leading-relaxed relative z-10">
                   Guia ancestral para harmonização e defesa. Lembre-se: folhas quentes do pescoço para baixo, folhas frias na coroa.
                 </p>
              </div>

              {userRecipes.length > 0 && (
                <div className="space-y-4 pt-2">
                  <h3 className="text-xl font-serif font-bold text-slate-800 ml-2 border-l-4 border-emerald-500 pl-3">Meu Acervo Pessoal (Oráculo)</h3>
                  {userRecipes.map((prep) => (
                    <div key={prep.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative">
                      <div className="absolute top-6 right-6 flex items-center gap-2">
                        <button 
                          onClick={() => { setReminderRecipe(prep); setShowReminderModal(true); }}
                          className={`p-2 rounded-full transition-colors shadow-sm ${prep.lembreteDate ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-50 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'}`}
                          title="Agendar Lembrete"
                        >
                          <Calendar className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => { setSharingPrep({...prep, tipo: 'banho'}); setHasSharedToFeed(false); }}
                          className="p-2 bg-slate-50 text-emerald-600 rounded-full hover:bg-emerald-50 transition-colors shadow-sm"
                          title="Compartilhar Receita"
                        >
                          <Share2 className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={async () => {
                             if(window.confirm("Remover esta receita do seu Acervo?")) {
                               await deleteDoc(doc(db, 'userRecipes', prep.id));
                             }
                          }}
                          className="p-2 bg-slate-50 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors shadow-sm"
                          title="Remover do Acervo"
                        >
                           <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 mb-3 pr-40">
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center gap-1">
                          <FlaskConical className="w-3 h-3" />
                          Receita do Oráculo
                        </span>
                        {prep.lembreteDate && (
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 border border-amber-100 text-amber-700 flex items-center gap-1">
                             <BellRing className="w-3 h-3" />
                             Agendado para: {new Date(prep.lembreteDate).toLocaleDateString('pt-BR')} às {new Date(prep.lembreteDate).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        )}
                      </div>
                      
                      <h3 className="font-serif text-xl font-bold text-slate-800 mb-2">{prep.titulo}</h3>
                      <p className="text-sm text-slate-500 mb-4">{prep.indicacao}</p>
                      
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Ingredientes Revelados</h4>
                        <ul className="space-y-2">
                           {prep.ingredientes?.map((ing: string, idx: number) => (
                             <li key={idx} className="text-sm font-medium text-slate-700 flex items-center gap-2.5 bg-white p-2 rounded-lg border border-slate-100">
                               <Leaf className="w-4 h-4 text-emerald-500 shrink-0" />
                               <span>{ing}</span>
                             </li>
                           ))}
                        </ul>
                      </div>

                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Conselho de Preparo</h4>
                      <p className="text-sm text-slate-600 font-serif leading-relaxed">{prep.preparo}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-4 pt-2 mt-8">
                 <h3 className="text-xl font-serif font-bold text-slate-800 ml-2 border-l-4 border-slate-300 pl-3">Magia Prática (Ancestral)</h3>
                 {BOTANICA_PREPAROS.map((prep, i) => (
                     <div key={i} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative">
                       <button 
                         onClick={() => { setSharingPrep(prep); setHasSharedToFeed(false); }}
                         className="absolute top-6 right-6 p-2 bg-slate-50 text-emerald-600 rounded-full hover:bg-emerald-50 transition-colors shadow-sm"
                         title="Compartilhar Preparo"
                       >
                         <Share2 className="w-5 h-5" />
                       </button>

                       <div className="flex items-center gap-2 mb-3 pr-10">
                       <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 ${
                         prep.tipo === 'banho' ? 'bg-cyan-50 text-cyan-700 border-cyan-100' : 
                         prep.tipo === 'defumacao' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                       }`}>
                         {prep.tipo === 'banho' ? <Droplets className="w-3 h-3" /> : prep.tipo === 'defumacao' ? <Wind className="w-3 h-3" /> : <Sparkles className="w-3 h-3"/>}
                         {prep.tipo}
                       </span>
                     </div>
                     <h3 className="font-serif text-xl font-bold text-slate-800 mb-2">{prep.titulo}</h3>
                     <p className="text-sm text-slate-500 mb-4">{prep.indicacao}</p>
                     
                     <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4">
                       <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Folhas & Ingredientes</h4>
                       <p className="text-sm font-medium text-slate-700">🌱 {prep.ingredientes.join(' • ')}</p>
                     </div>

                     <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Modo de Preparo</h4>
                     <p className="text-sm text-slate-600 font-serif leading-relaxed">{prep.preparo}</p>
                   </div>
                 ))}
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Reminder Modal Dialog */}
      <AnimatePresence>
        {showReminderModal && reminderRecipe && (
          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
             <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-sm rounded-[2.5rem] p-6 shadow-2xl relative"
             >
                <button onClick={() => { setShowReminderModal(false); setReminderRecipe(null); }} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
                  <X className="w-5 h-5" />
                </button>
                <div className="flex flex-col items-center text-center mt-2 mb-6">
                  <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-3">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-slate-900 mb-1">Agendar Banho</h3>
                  <p className="text-sm text-slate-500 font-medium line-clamp-1">{reminderRecipe.titulo}</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                     <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Data do Banho</label>
                     <input 
                       type="date"
                       className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-bold focus:outline-none focus:border-amber-500 transition-colors"
                       value={reminderConfig.date}
                       onChange={(e) => setReminderConfig({...reminderConfig, date: e.target.value})}
                     />
                  </div>
                  <div>
                     <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Horário</label>
                     <input 
                       type="time"
                       className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-bold focus:outline-none focus:border-amber-500 transition-colors"
                       value={reminderConfig.time}
                       onChange={(e) => setReminderConfig({...reminderConfig, time: e.target.value})}
                     />
                  </div>
                  <button 
                    onClick={handleSaveReminder}
                    disabled={!reminderConfig.date || !reminderConfig.time}
                    className="w-full flex items-center justify-center gap-2 p-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-2xl font-bold tracking-wide transition-colors mt-2 shadow-sm"
                  >
                    Confirmar Agenda
                  </button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal Dialog */}
      <AnimatePresence>
        {sharingPrep && (
          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
             <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-sm rounded-[2.5rem] p-6 shadow-2xl relative"
             >
                <button onClick={() => setSharingPrep(null)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
                  <X className="w-5 h-5" />
                </button>
                <div className="flex flex-col items-center text-center mt-2 mb-6">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-3">
                    <Share2 className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-slate-900 mb-1">Passar a diante</h3>
                  <p className="text-sm text-slate-500 font-medium">Compartilhar sabedoria do "{sharingPrep.titulo}"</p>
                </div>
                
                <div className="space-y-3">
                  <button 
                    onClick={() => handleExternalShare(sharingPrep)}
                    className="w-full flex items-center justify-center gap-3 p-4 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-2xl font-bold tracking-wide transition-colors border border-slate-200"
                  >
                    <Share2 className="w-5 h-5 text-emerald-600" /> Externo (WhatsApp, etc)
                  </button>
                  <button 
                    onClick={() => handlePostToCommunity(sharingPrep)}
                    disabled={hasSharedToFeed}
                    className={`w-full flex items-center justify-center gap-3 p-4 rounded-2xl font-bold tracking-wide transition-all ${hasSharedToFeed ? 'bg-emerald-600 text-white' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'}`}
                  >
                    {hasSharedToFeed ? (
                      <><CheckCircle2 className="w-5 h-5" /> Compartilhado na Corrente!</>
                    ) : (
                      <><Send className="w-5 h-5" /> Publicar na Corrente</>
                    )}
                  </button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Modal matching Scanner UI */}
      <AnimatePresence>
        {selectedErva && (
          <motion.div 
             initial={{ opacity: 0, y: '100%' }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: '100%' }}
             transition={{ type: 'spring', damping: 25, stiffness: 200 }}
             drag="y"
             dragConstraints={{ top: 0, bottom: 0 }}
             dragElastic={{ top: 0, bottom: 0.6 }}
             onDragEnd={(e, info) => { if (info.offset.y > 150) setSelectedErva(null); }}
             className="fixed inset-0 z-50 bg-stone-50 flex flex-col overflow-hidden"
          >
             <div className="flex items-center justify-between p-4 absolute top-0 w-full z-20 pointer-events-none">
                 <button onClick={() => setSelectedErva(null)} className="pointer-events-auto p-3 bg-stone-900/40 backdrop-blur-md rounded-full text-white hover:bg-stone-900/60 transition-colors shadow-lg shadow-black/10">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                 </button>
             </div>

             <div className="flex-1 overflow-y-auto pb-safe">
                 <div className="relative w-full h-[45vh] min-h-[300px]">
                    <img 
                      src={selectedErva.imagemURL || 'https://images.unsplash.com/photo-1542385151-efd9000785a0?w=800&q=80'} 
                      alt={selectedErva.nomePopular} 
                      onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1542385151-efd9000785a0?w=800&q=80'; }}
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-50 via-stone-50/20 to-transparent"></div>
                 </div>

                <div className="px-6 -mt-16 relative z-10 pb-12">
                   {selectedErva.descobridorId !== 'system' ? (
                      <span className="inline-flex mb-4 px-3 py-1 bg-amber-100 text-amber-800 text-[10px] uppercase font-bold tracking-widest rounded-full items-center gap-1"><Leaf className="w-3 h-3"/> Descoberto por {selectedErva.descobridorNome || 'Comunidade'}</span>
                   ) : (
                      <span className="inline-flex mb-4 px-3 py-1 bg-emerald-100/90 backdrop-blur-sm text-emerald-800 border border-emerald-200/50 text-[10px] uppercase font-bold tracking-widest rounded-full items-center gap-1 shadow-sm"><Leaf className="w-3 h-3"/> Conhecimento Ancestral</span>
                   )}
                   
                   <div>
                      <h2 className="text-4xl font-serif font-bold text-stone-900 drop-shadow-sm leading-none tracking-tight">{selectedErva.nomePopular}</h2>
                      <p className="text-emerald-700 uppercase tracking-widest text-xs font-bold mt-3 border-l-2 border-emerald-500 pl-2">{selectedErva.nomeCientifico}</p>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-3 my-8">
                      {/* Temperatura/Polarity Bento Box */}
                      <div className={`p-5 rounded-[2rem] border flex flex-col justify-center items-start gap-1.5 shadow-sm transition-transform hover:scale-[1.02] ${
                        selectedErva.temperatura === 'quente' ? 'bg-red-50/80 border-red-100' : 
                        selectedErva.temperatura === 'morna' ? 'bg-amber-50/80 border-amber-100' : 
                        'bg-cyan-50/80 border-cyan-100'
                      }`}>
                         <span className={`text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5 ${
                            selectedErva.temperatura === 'quente' ? 'text-red-500' : 
                            selectedErva.temperatura === 'morna' ? 'text-amber-500' : 
                            'text-cyan-500'
                         }`}>
                           {selectedErva.temperatura === 'quente' ? <Flame className="w-3.5 h-3.5"/> : selectedErva.temperatura === 'morna' ? <Wind className="w-3.5 h-3.5"/> : <Droplets className="w-3.5 h-3.5"/>}
                           Polaridade
                         </span>
                         <span className={`font-serif text-[22px] font-bold capitalize leading-none ${
                            selectedErva.temperatura === 'quente' ? 'text-red-950' : 
                            selectedErva.temperatura === 'morna' ? 'text-amber-950' : 
                            'text-cyan-950'
                         }`}>
                           {selectedErva.temperatura}
                         </span>
                      </div>

                      {/* Regência/Orixás Bento Box */}
                      <div className="bg-white p-5 rounded-[2rem] border border-stone-200 flex flex-col justify-center items-start gap-1.5 shadow-sm transition-transform hover:scale-[1.02]">
                         <span className="text-[10px] text-stone-400 uppercase font-bold tracking-widest flex items-center gap-1.5">
                           <Crown className="w-3.5 h-3.5 text-amber-500" /> Regência
                         </span>
                         <span className="font-serif text-[18px] font-bold text-stone-900 leading-tight">
                           {selectedErva.orixas?.join(', ')}
                         </span>
                      </div>
                   </div>

                   <div className="space-y-6">
                     {/* Fundamento e Uso Section */}
                     <div className="bg-white p-7 md:p-8 rounded-[2.5rem] border border-stone-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500 rounded-l-full"></div>
                        <h3 className="text-xs uppercase font-bold text-emerald-800 tracking-widest mb-4 flex items-center gap-2">
                           <Sparkles className="w-4 h-4 text-emerald-500" /> Fundamento e Uso
                        </h3>
                        <p className="text-stone-700 leading-relaxed font-serif text-[16px] xl:text-[18px]">{selectedErva.uso}</p>
                     </div>
                     
                     {/* Mironga Section */}
                     {selectedErva.descricao && (
                        <div className="bg-gradient-to-br from-stone-900 to-emerald-950 text-white p-7 md:p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden border border-emerald-900/50">
                           <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-4 -translate-y-4">
                              <Leaf size={140}/>
                           </div>
                           <h3 className="text-xs uppercase font-bold text-emerald-400 tracking-widest mb-4 relative z-10 flex items-center gap-2">
                              <FlaskConical className="w-4 h-4"/> Mironga Ancestral
                           </h3>
                           <p className="text-emerald-50/95 leading-relaxed font-serif text-[16px] xl:text-[18px] relative z-10">{selectedErva.descricao}</p>
                        </div>
                     )}
                   </div>

                   {/* AI Caboclo Consultation Box */}
                   <div className="mt-8 border-t border-stone-200 pt-8">
                     {!cabocloMessage && !isConsultingCaboclo ? (
                       <button 
                         onClick={() => handleConsultarCaboclo(selectedErva.nomePopular)}
                         className="w-full bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-600 hover:to-amber-800 text-white font-bold uppercase tracking-widest text-xs py-5 rounded-[2rem] transition-all shadow-xl shadow-amber-900/20 flex items-center justify-center gap-3 active:scale-95"
                       >
                         <TentTree className="w-5 h-5" /> Consultar Caboclo sobre a folha
                       </button>
                     ) : (
                       <div className="bg-amber-50 p-6 md:p-8 rounded-[2.5rem] border border-amber-200 shadow-inner relative">
                         <h3 className="text-xs uppercase font-bold text-amber-700 tracking-widest mb-4 flex items-center gap-2">
                           <TentTree className="w-4 h-4" /> Sabedoria do Caboclo
                         </h3>
                         {isConsultingCaboclo ? (
                           <div className="flex flex-col items-center justify-center py-6 gap-3">
                             <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
                             <p className="text-amber-800/60 font-serif italic text-sm">Ouvindo os ventos da mata...</p>
                           </div>
                         ) : (
                           <div className="text-amber-950 font-serif leading-relaxed text-[15px] italic space-y-4">
                             {cabocloMessage?.split('\n').filter(p => p.trim()).map((para, i) => (
                               <p key={i}>{para}</p>
                             ))}
                           </div>
                         )}
                       </div>
                     )}
                   </div>

                   <button 
                      onClick={() => {
                         setSearch(selectedErva.nomePopular);
                         setActiveTab('preparos');
                         setSelectedErva(null);
                         setCabocloMessage(null);
                      }}
                      className="w-full bg-white hover:bg-stone-50 text-emerald-800 border-2 border-emerald-100 font-bold uppercase tracking-widest text-xs py-5 rounded-[2rem] mt-4 transition-colors shadow-sm flex items-center justify-center gap-2"
                   >
                     <Search className="w-4 h-4" /> Buscar no Receituário
                   </button>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Erva Modal */}
      <AnimatePresence>
        {isAddingErva && (
          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          >
             <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-lg h-[90vh] flex flex-col rounded-[2.5rem] shadow-2xl relative overflow-hidden"
             >
                <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
                  <div>
                    <h2 className="text-xl font-serif font-bold text-slate-900 leading-tight">Catalogar Erva</h2>
                    <p className="text-xs uppercase tracking-wider text-emerald-600 font-bold mt-1">Conhecimento Público</p>
                  </div>
                  <button onClick={() => setIsAddingErva(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                  <div className="flex flex-col items-center justify-center gap-3 mb-2">
                     <button 
                       onClick={() => addErvaFileRef.current?.click()}
                       className={`w-28 h-28 rounded-3xl flex items-center justify-center border-2 border-dashed overflow-hidden relative transition-all ${newErva.imagemURL ? 'border-emerald-500' : 'border-slate-300 hover:border-emerald-400 bg-slate-50'}`}
                     >
                        {newErva.imagemURL ? (
                           <img src={newErva.imagemURL} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                           <div className="flex flex-col items-center text-slate-400">
                              <Plus className="w-8 h-8 mb-1" />
                              <span className="text-[10px] font-bold uppercase tracking-wider">Foto</span>
                           </div>
                        )}
                     </button>
                     <input type="file" accept="image/*" className="hidden" ref={addErvaFileRef} onChange={handleAddErvaImageChange} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 mb-2 block tracking-wider">Nome Popular</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Arruda"
                      value={newErva.nomePopular}
                      onChange={e => setNewErva({...newErva, nomePopular: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 mb-2 block tracking-wider">Orixás (separados por vírgula)</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Oxalá, Ogum"
                      value={newErva.orixasInput}
                      onChange={e => setNewErva({...newErva, orixasInput: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                       <label className="text-[10px] font-bold uppercase text-slate-400 mb-2 block tracking-wider">Temperatura Espiritual</label>
                       <select 
                         value={newErva.temperatura}
                         onChange={e => setNewErva({...newErva, temperatura: e.target.value as Temperatura})}
                         className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 font-medium"
                       >
                         <option value="quente">Adormecedora (Quente)</option>
                         <option value="morna">Equilibradora (Morna)</option>
                         <option value="fria">Despertadora (Fria)</option>
                       </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 mb-2 block tracking-wider">Para que serve? (Resumo)</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Limpeza pesada e proteção"
                      value={newErva.indicacao}
                      onChange={e => setNewErva({...newErva, indicacao: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 mb-2 block tracking-wider">Fundamento / Axé</label>
                    <textarea 
                      placeholder="Descreva os usos na Macaia, para banhos, defumações, e fundamentos..."
                      rows={4}
                      value={newErva.descricao}
                      onChange={e => setNewErva({...newErva, descricao: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 font-medium resize-none"
                    />
                  </div>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50 shrink-0">
                  <button 
                    onClick={handleAddErva}
                    className="w-full bg-emerald-600 text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    <Leaf className="w-5 h-5" />
                    Adicionar à Biblioteca
                  </button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
