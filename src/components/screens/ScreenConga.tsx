import React, { useState, useEffect, useRef } from 'react';
import { 
  Flame, 
  Droplet, 
  Flower2, 
  CircleDashed, 
  Plus, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  User, 
  ChevronRight,
  Shield,
  Wind,
  Waves,
  Coffee,
  Heart,
  Baby,
  Sparkles,
  Share2,
  Wine,
  Apple,
  Camera,
  Upload,
  Pencil,
  Trash2,
  X,
  Save,
  MoreVertical,
  Images,
  Leaf,
  BellRing,
  Settings
} from 'lucide-react';
import { db, storage } from '../../firebase';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  where, 
  updateDoc, 
  doc, 
  deleteDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../auth/AuthProvider';

const LINHAS = [
  { 
    id: 'exu', 
    name: 'Exú', 
    color: 'bg-red-950', 
    icon: Shield, 
    theme: 'text-red-600', 
    saudacao: 'Laroyê!',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop' // Crossroads/Mystical
  },
  { 
    id: 'pombagira', 
    name: 'Pombagira', 
    color: 'bg-rose-950', 
    icon: Heart, 
    theme: 'text-rose-500', 
    saudacao: 'Laroyê!',
    imageUrl: 'https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=800&auto=format&fit=crop' // Roses/Dark Red
  },
  { 
    id: 'caboclo', 
    name: 'Caboclo', 
    color: 'bg-emerald-950', 
    icon: Wind, 
    theme: 'text-emerald-500', 
    saudacao: 'Okê Caboclo!',
    imageUrl: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=800&auto=format&fit=crop' // Deep forest
  },
  { 
    id: 'pretovelho', 
    name: 'Preto Velho', 
    color: 'bg-stone-950', 
    icon: Coffee, 
    theme: 'text-stone-400', 
    saudacao: 'Adorei as Almas!',
    imageUrl: 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?q=80&w=800&auto=format&fit=crop' // Smoke/Peaceful
  },
  { 
    id: 'baiano', 
    name: 'Baiano', 
    color: 'bg-amber-950', 
    icon: Wind, 
    theme: 'text-amber-500', 
    saudacao: 'É da Bahia!',
    imageUrl: 'https://images.unsplash.com/photo-1590001158193-790130ae8ccf?q=80&w=800&auto=format&fit=crop'
  },
  { 
    id: 'marinheiro', 
    name: 'Marinheiro', 
    color: 'bg-blue-950', 
    icon: Waves, 
    theme: 'text-blue-500', 
    saudacao: 'Salve a Marinha!',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop'
  },
  { 
    id: 'ere', 
    name: 'Erê', 
    color: 'bg-pink-950', 
    icon: Baby, 
    theme: 'text-pink-400', 
    saudacao: 'Oni Ibeijada!',
    imageUrl: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=80&w=800&auto=format&fit=crop'
  },
  { 
    id: 'oxala', 
    name: 'Linha de Oxalá', 
    color: 'bg-stone-100', 
    icon: Sparkles, 
    theme: 'text-stone-400', 
    saudacao: 'Epa Babá!',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop'
  }
];

export function ScreenConga({ onNavigate }: { onNavigate: (t: string) => void }) {
  const { user } = useAuth();
  const [selectedLinha, setSelectedLinha] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [assentamentos, setAssentamentos] = useState<any[]>(() => {
    const cached = localStorage.getItem('cache_conga_assentamentos');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  const [isAdding, setIsAdding] = useState(false);
  const [newEntity, setNewEntity] = useState({ nome: '', linha: 'caboclo' });
  const [selectedForFirmeza, setSelectedForFirmeza] = useState<any>(null);
  const [selectedForOferenda, setSelectedForOferenda] = useState<any>(null);
  const [editingEntity, setEditingEntity] = useState<any>(null);
  const [uploadingImageId, setUploadingImageId] = useState<string | null>(null);
  const [swipedCardId, setSwipedCardId] = useState<string | null>(null);
  const [entityToDelete, setEntityToDelete] = useState<any>(null);
  const [selectedForGaleria, setSelectedForGaleria] = useState<any>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const touchStartX = React.useRef(0);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const galleryInputRef = React.useRef<HTMLInputElement>(null);
  const cameraInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (assentamentos.length > 0) {
      localStorage.setItem('cache_conga_assentamentos', JSON.stringify(assentamentos));
      if(loading) setLoading(false);
    }
  }, [assentamentos]);

  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  const handleTouchStart = (e: React.TouchEvent) => { 
    touchStartX.current = e.touches[0].clientX; 
  };
  
  const handleTouchEnd = (e: React.TouchEvent, id: string) => {
    const touchEndX = e.changedTouches[0].clientX;
    if (touchStartX.current - touchEndX > 40) setSwipedCardId(id);
    if (touchEndX - touchStartX.current > 40) setSwipedCardId(null);
  };

  const compressImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.5));
      };
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingImageId || !user) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64Str = reader.result as string;
        const compressed = await compressImage(base64Str);
        
        // Convert base64 Data URL to Blob
        const response = await fetch(compressed);
        const blob = await response.blob();
        
        // Upload to Firebase Storage
        const fileExt = file.name.split('.').pop() || 'jpg';
        const storageRef = ref(storage, `users/${user.uid}/conga/${uploadingImageId}_${Date.now()}.${fileExt}`);
        await uploadBytes(storageRef, blob);
        const downloadUrl = await getDownloadURL(storageRef);
        
        const docRef = doc(db, 'assentamentos', uploadingImageId);
        await updateDoc(docRef, { 
          fotoUrl: downloadUrl,
          updatedAt: new Date().toISOString()
        });
        setUploadingImageId(null);
      } catch (err) {
        console.error("Erro no upload da imagem", err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGalleryImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedForGaleria || !user) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64Str = reader.result as string;
        const compressed = await compressImage(base64Str);
        
        // Convert to Blob
        const response = await fetch(compressed);
        const blob = await response.blob();

        // Upload to Storage
        const fileExt = file.name.split('.').pop() || 'jpg';
        const storageRef = ref(storage, `users/${user.uid}/conga_gallery/${selectedForGaleria.id}_${Date.now()}.${fileExt}`);
        await uploadBytes(storageRef, blob);
        const downloadUrl = await getDownloadURL(storageRef);
        
        const docRef = doc(db, 'assentamentos', selectedForGaleria.id);
        const currentGallery = selectedForGaleria.galeria || [];
        const newGallery = [...currentGallery, { url: downloadUrl, descricao: '' }];
        
        await updateDoc(docRef, { 
          galeria: newGallery,
          updatedAt: new Date().toISOString()
        });
        
        // Update local state to reflect immediately
        setSelectedForGaleria({ ...selectedForGaleria, galeria: newGallery });
      } catch (err) {
        console.error("Erro na galeria", err);
      }
    };
    reader.readAsDataURL(file);
  };

  const updateGalleryDescription = async (index: number, desc: string) => {
    if (!selectedForGaleria) return;
    try {
      const currentGallery = [...(selectedForGaleria.galeria || [])];
      const item = currentGallery[index];
      
      if (typeof item === 'string') {
        currentGallery[index] = { url: item, descricao: desc };
      } else {
        currentGallery[index] = { ...item, descricao: desc };
      }

      setSelectedForGaleria({ ...selectedForGaleria, galeria: currentGallery });

      const ref = doc(db, 'assentamentos', selectedForGaleria.id);
      await updateDoc(ref, { 
        galeria: currentGallery,
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      console.error("Erro ao atualizar a descrição", e);
    }
  };

  const confirmDelete = async () => {
    if (!entityToDelete) return;
    try {
      await deleteDoc(doc(db, 'assentamentos', entityToDelete.id));
      setEntityToDelete(null);
      setSwipedCardId(null);
      setToastMsg("Assentamento retirado.");
    } catch (e) {
      console.error("Erro ao excluir", e);
    }
  };

  const handleUpdateEntity = async () => {
    if (!editingEntity || !editingEntity.nome) return;
    try {
      const ref = doc(db, 'assentamentos', editingEntity.id);
      await updateDoc(ref, {
        nome: editingEntity.nome,
        linha: editingEntity.linha,
        updatedAt: new Date().toISOString()
      });
      setEditingEntity(null);
    } catch (e) {
      console.error("Erro ao atualizar", e);
    }
  };

  const VELAS = [
    { id: 'palito', name: 'Vela Palito', days: 1, label: '1 dia' },
    { id: '3dias', name: 'Vela de 3 Dias', days: 3, label: '3 dias' },
    { id: '7dias', name: 'Vela de 7 Dias', days: 7, label: '7 dias' },
  ];

  const OFERENDA_TYPES = [
    { id: 'agua', name: 'Água Sagrada (Firmeza)', icon: Droplet, days: 3 },
    { id: 'cafe', name: 'Café Preto (Amargo/Doce)', icon: Coffee, days: 2 },
    { id: 'marafo', name: 'Marafo / Cachaça', icon: Wine, days: 7 },
    { id: 'vinho', name: 'Vinho Tinto', icon: Wine, days: 3 },
    { id: 'cerveja', name: 'Cerveja (Clara/Escura)', icon: Wine, days: 2 },
    { id: 'flor', name: 'Flores Brancas', icon: Flower2, days: 5 },
    { id: 'flor_vermelha', name: 'Rosas Vermelhas', icon: Flower2, days: 5 },
    { id: 'fruta_doce', name: 'Frutas Doces', icon: Apple, days: 4 },
    { id: 'fruta_citrica', name: 'Frutas Cítricas / Ácidas', icon: Apple, days: 4 },
    { id: 'fumo_charuto', name: 'Charuto', icon: Wind, days: 7 },
    { id: 'fumo_cigarro', name: 'Cigarrilha / Cigarro', icon: Wind, days: 5 },
    { id: 'fumo_cachimbo', name: 'Fumo de Corda (Cachimbo)', icon: Wind, days: 10 },
    { id: 'incenso', name: 'Incenso / Defumação', icon: Flame, days: 1 },
    { id: 'ervas', name: 'Banho de Ervas', icon: Leaf, days: 7 },
    { id: 'comida_doce', name: 'Doces / Cocada / Bolo', icon: Heart, days: 3 },
    { id: 'comida_salgada', name: 'Comida Seca (Padê/Pipoca)', icon: Shield, days: 3 },
  ];

  const [alertConfig, setAlertConfig] = useState(() => {
    const saved = localStorage.getItem('conga_alert_config');
    return saved ? JSON.parse(saved) : { enabled: true, vibrate: true, preExpiryHours: 24 };
  });
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [activeAlerts, setActiveAlerts] = useState<string[]>([]);
  const lastVibratedRef = useRef<number>(0);

  useEffect(() => {
    localStorage.setItem('conga_alert_config', JSON.stringify(alertConfig));
  }, [alertConfig]);

  useEffect(() => {
     if (!alertConfig.enabled || assentamentos.length === 0) {
        setActiveAlerts([]);
        return;
     }

     const checkAlerts = () => {
        const now = new Date().getTime();
        let newAlerts: string[] = [];
        const msThreshold = alertConfig.preExpiryHours * 60 * 60 * 1000;
        
        assentamentos.forEach(a => {
            // Check vela
            if (a.velaExpiresAt) {
               const timeDiff = new Date(a.velaExpiresAt).getTime() - now;
               if (timeDiff > 0 && timeDiff <= msThreshold) {
                  newAlerts.push(`Vela de ${a.nome} próxima do fim!`);
               } else if (timeDiff <= 0 && timeDiff > -86400000) { // recently expired
                  newAlerts.push(`A Vela de ${a.nome} precisa ser renovada!`);
               }
            }

            // Check oferendas
            (a.agrados || []).forEach((ag: any) => {
               const timeDiff = new Date(ag.expiresAt).getTime() - now;
               if (timeDiff > 0 && timeDiff <= msThreshold) {
                  newAlerts.push(`A oferenda (${ag.name}) de ${a.nome} precisa de zelo em breve.`);
               } else if (timeDiff <= 0 && timeDiff > -86400000) {
                  newAlerts.push(`A oferenda (${ag.name}) de ${a.nome} expirou.`);
               }
            });
        });

        const uniqueAlerts = Array.from(new Set(newAlerts));
        
        setActiveAlerts(prev => {
          // Check if there are completely new alerts that we didn't have before
          const foundNew = uniqueAlerts.some(na => !prev.includes(na));
          
          // Vibrate if configured, supported, and we found new alerts
          if (foundNew && alertConfig.vibrate && navigator.vibrate) {
              const timeSinceLastVibe = now - lastVibratedRef.current;
              if (timeSinceLastVibe > 60000) {
                try {
                  navigator.vibrate([200, 100, 200]);
                } catch(e) {}
                lastVibratedRef.current = now;
              }
          }

          // Return exact same reference if array hasn't logically changed to prevent re-renders
          if (prev.length === uniqueAlerts.length && prev.every(v => uniqueAlerts.includes(v))) {
             return prev;
          }
          return uniqueAlerts;
        });
     };

     checkAlerts();
     const interval = setInterval(checkAlerts, 30000); // Check every 30 secs
     
     return () => clearInterval(interval);
  }, [assentamentos, alertConfig]);


  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'assentamentos'), where('userId', '==', user.uid));
    const unsub = onSnapshot(q, (snap) => {
      setAssentamentos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (error) => {
      console.error("Firestore error in ScreenConga:", error);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const handleAdd = async () => {
    if (!user || !newEntity.nome) return;
    try {
      await addDoc(collection(db, 'assentamentos'), {
        userId: user.uid,
        nome: newEntity.nome,
        linha: newEntity.linha,
        agrados: [], // keeping field name for DB compatibility, mapping to 'Oferendas' in UI
        velaExpiresAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setIsAdding(false);
      setNewEntity({ nome: '', linha: 'caboclo' });
    } catch (e) {
      console.error("Error adding assentamento", e);
    }
  };

  const renovarVela = async (id: string, days: number) => {
    const ref = doc(db, 'assentamentos', id);
    const expires = new Date();
    expires.setDate(expires.getDate() + days);
    await updateDoc(ref, { 
      velaExpiresAt: expires.toISOString(),
      updatedAt: new Date().toISOString()
    });
    setSelectedForFirmeza(null);
  };

  const addOferenda = async (id: string, type: any) => {
    const current = assentamentos.find(a => a.id === id);
    const agrados = [...(current?.agrados || [])];
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + type.days);

    const newOferenda = {
      type: type.id,
      name: type.name,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString()
    };

    // Remove existing of same type or just push
    const filtered = agrados.filter(ag => ag.type !== type.id);
    filtered.push(newOferenda);

    const ref = doc(db, 'assentamentos', id);
    await updateDoc(ref, { 
      agrados: filtered,
      updatedAt: new Date().toISOString()
    });
    setSelectedForOferenda(null);
  };

  const partilharAxe = async (a: any) => {
    if (!user) return;
    const linha = LINHAS.find(l => l.id === a.linha);
    const msg = `O Congá vibra em alegria! Firmada a energia de ${a.nome} (${linha?.saudacao}). Que o Axé desta firmeza alcance a todos! ✨🕯️`;
    
    try {
      await addDoc(collection(db, 'corrente_posts'), {
        authorId: user.uid,
        authorName: user.displayName || 'Filho de Fé',
        authorPhoto: user.photoURL || 'https://i.pravatar.cc/150?img=11',
        content: msg,
        type: 'conga', // Fix the type to match schema 'conga' instead of 'firmeza'
        createdAt: new Date().toISOString(),
        axedBy: []
      });
      setToastMsg('Axé partilhado na corrente!');
    } catch (e) {
      console.error("Erro ao partilhar Axé", e);
    }
  };

  const getStatus = (a: any) => {
    const now = new Date().getTime();
    let isUrgent = false;
    let isAttention = false;

    // Candle Check
    if (!a.velaExpiresAt) {
      isUrgent = true;
    } else {
      const vExpires = new Date(a.velaExpiresAt).getTime();
      const vHoursLeft = (vExpires - now) / (1000 * 60 * 60);
      if (vHoursLeft < 0) isUrgent = true;
      else if (vHoursLeft < 24) isAttention = true;
    }

    // Oferendas Check (Zelo)
    (a.agrados || []).forEach((ag: any) => {
      const agExpires = new Date(ag.expiresAt).getTime();
      if (agExpires < now) isUrgent = true;
    });

    if (isUrgent) return { label: 'Urgente', color: 'text-red-500', bg: 'bg-red-50', icon: AlertCircle };
    if (isAttention) return { label: 'Atenção', color: 'text-amber-500', bg: 'bg-amber-50', icon: AlertCircle };
    return { label: 'Em dia', color: 'text-emerald-500', bg: 'bg-emerald-50', icon: CheckCircle2 };
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center animate-fade-in z-10 relative">
        <div className="animate-pulse-slow w-12 h-12 border-4 border-stone-200 border-t-amber-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const urgentCount = assentamentos.filter(a => getStatus(a).label === 'Urgente').length;
  const attentionCount = assentamentos.filter(a => getStatus(a).label === 'Atenção').length;
  const okCount = assentamentos.filter(a => getStatus(a).label === 'Em dia').length;

  const filteredAssentamentos = selectedLinha 
    ? assentamentos.filter(a => a.linha === selectedLinha)
    : assentamentos;

  return (
    <div className="flex-1 flex flex-col animate-fade-in w-full h-full bg-stone-50 pt-16 px-6 pb-[140px] overflow-y-auto no-scrollbar relative">
      
      <header className="mb-6 mt-4 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-stone-900 font-serif mb-2">Zelar pelo Congá</h1>
          <p className="text-sm text-stone-500">Fundamentos e cuidados com seus assentamentos.</p>
        </div>
        <button 
          onClick={() => setShowAlertModal(true)}
          className="p-2 sm:p-3 bg-stone-200/50 hover:bg-stone-200 text-stone-700 rounded-full transition-colors relative"
        >
          <BellRing className="w-5 h-5 sm:w-6 sm:h-6" />
          {activeAlerts.length > 0 && (
            <span className="absolute 0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
          )}
        </button>
      </header>

      {/* Active Alerts Banner */}
      {activeAlerts.length > 0 && (
        <div className="mb-8 flex flex-col gap-2">
          {activeAlerts.map((alert, i) => (
            <div key={i} className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-sm font-medium text-red-900 leading-tight">{alert}</p>
              <button 
                 onClick={() => setActiveAlerts(prev => prev.filter((_, idx) => idx !== i))}
                 className="p-2 ml-auto text-red-400 hover:text-red-700 bg-red-100/50 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Status Pills */}
      <div className="flex gap-3 mb-8 overflow-x-auto no-scrollbar py-2 -mx-6 px-6">
        <div className="flex-shrink-0 bg-white border border-stone-200 rounded-2xl px-4 py-3 flex items-center gap-2 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          <span className="text-xs font-bold text-stone-600 uppercase tracking-tight">{urgentCount} Urgentes</span>
        </div>
        <div className="flex-shrink-0 bg-white border border-stone-200 rounded-2xl px-4 py-3 flex items-center gap-2 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
          <span className="text-xs font-bold text-stone-600 uppercase tracking-tight">{attentionCount} Atenção</span>
        </div>
        <div className="flex-shrink-0 bg-white border border-stone-200 rounded-2xl px-4 py-3 flex items-center gap-2 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-xs font-bold text-stone-600 uppercase tracking-tight">{okCount} OK</span>
        </div>
      </div>

      {/* Filter by Linha */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 py-2 -mx-6 px-6">
        <button 
          onClick={() => setSelectedLinha(null)}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all border ${!selectedLinha ? 'bg-stone-900 border-stone-900 text-white shadow-md' : 'bg-white border-stone-200 text-stone-600 hover:border-stone-400'}`}
        >
          Todos
        </button>
        {LINHAS.map(l => (
          <button 
            key={l.id}
            onClick={() => setSelectedLinha(l.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all border ${selectedLinha === l.id ? 'bg-stone-900 border-stone-900 text-white shadow-md' : 'bg-white border-stone-200 text-stone-600 hover:border-stone-400'}`}
          >
            {l.name}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredAssentamentos.map(a => {
          const status = getStatus(a);
          const linha = LINHAS.find(l => l.id === a.linha) || LINHAS[0];
          const Icon = linha.icon;
          const currentAgrados = a.agrados || [];

          return (
            <div key={a.id} className="relative mb-4 group rounded-3xl overflow-hidden bg-stone-100/80">
              {/* Actions Background for Swipe */}
              <div className="absolute inset-y-0 right-0 w-32 flex flex-col sm:flex-row items-center justify-center p-3 gap-3">
                <button 
                  onClick={() => {
                    setEditingEntity({ id: a.id, nome: a.nome, linha: a.linha });
                    setSwipedCardId(null);
                  }} 
                  className="w-10 h-10 bg-white text-stone-500 rounded-full flex items-center justify-center hover:bg-stone-200 hover:text-stone-700 shadow-sm"
                  title="Editar"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setEntityToDelete(a)} 
                  className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 shadow-sm"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Foreground Card */}
              <div 
                onTouchStart={handleTouchStart}
                onTouchEnd={(e) => handleTouchEnd(e, a.id)}
                className={`bg-white rounded-3xl border border-stone-200 shadow-sm relative transition-transform duration-300 ease-out z-10 h-full overflow-hidden ${swipedCardId === a.id ? '-translate-x-32 sm:-translate-x-28' : 'translate-x-0'}`}
              >
                {/* Background Linha Image Overlay - STRENGTHENED */}
                <div className="absolute top-0 right-0 w-44 h-44 -mr-12 -mt-12 opacity-[0.12] group-hover:opacity-[0.18] transition-opacity duration-700 pointer-events-none rotate-12">
                     <img src={linha.imageUrl} alt="" className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
                </div>

                <div className="p-4 sm:p-5 flex items-start gap-4 relative z-10 w-full">
                  <div className="relative shrink-0">
                    <div 
                      className={`w-16 sm:w-20 h-16 sm:h-20 rounded-2xl ${linha.color} flex items-center justify-center shadow-md group-hover:scale-105 transition-all duration-500 overflow-hidden relative border-2 ${a.fotoUrl ? 'border-emerald-500/30' : 'border-white/10'}`}
                    >
                      <img 
                        src={a.fotoUrl || linha.imageUrl} 
                        alt={a.nome} 
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${a.fotoUrl ? 'opacity-100' : 'opacity-40 mix-blend-overlay'}`} 
                        referrerPolicy="no-referrer" 
                      />
                      {!a.fotoUrl && (
                        <Icon className={`w-8 sm:w-10 h-8 sm:h-10 relative z-10 ${linha.id === 'oxala' ? 'text-stone-400' : 'text-white/90'} drop-shadow-md`} />
                      )}
                      
                      <button 
                        onClick={() => {
                          setUploadingImageId(a.id);
                          fileInputRef.current?.click();
                        }}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all duration-300 z-20 backdrop-blur-[2px]"
                        title="Alterar Imagem"
                      >
                        <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-white mb-1" />
                        <span className="hidden sm:block text-[8px] font-bold text-white uppercase tracking-tighter">Trocar Foto</span>
                      </button>
                      
                      {uploadingImageId === a.id && (
                        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-30">
                          <div className="w-5 h-5 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-1"></div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0 pr-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-1">
                      <div className="flex items-center gap-2">
                         <h3 className="font-bold text-stone-900 truncate text-base sm:text-lg">{a.nome}</h3>
                         {/* Subtle Status Dot next to name */}
                         <div className={`w-2 h-2 rounded-full ${status.label === 'Urgente' ? 'bg-red-500 animate-pulse' : status.label === 'Atenção' ? 'bg-amber-500' : 'bg-emerald-500'}`} title={status.label}></div>
                      </div>
                    </div>
                    <p className="text-[10px] sm:text-xs text-stone-400 font-medium mb-3 truncate">{linha.name} • {linha.saudacao}</p>
                    
                    {/* Progress bars and status */}
                    <div className="flex flex-col gap-2 mt-2">
                       {/* Vela Progress Bar */}
                       {a.velaExpiresAt && (
                         <div className="flex flex-col gap-1">
                           <div className="flex items-center justify-between text-[9px] uppercase tracking-wider font-bold text-stone-500">
                              <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-amber-500"/> Luz e Firmeza</span>
                              <span className={new Date(a.velaExpiresAt).getTime() < new Date().getTime() ? 'text-red-500' : 'text-stone-400'}>
                                 {new Date(a.velaExpiresAt).getTime() < new Date().getTime() ? 'Apagada' : 'Acesa'}
                              </span>
                           </div>
                           <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-1000 ${
                                  new Date(a.velaExpiresAt).getTime() < new Date().getTime() ? 'w-0 bg-red-500' : 
                                  ((new Date(a.velaExpiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60)) < 24 ? 'bg-amber-500 w-[15%]' : 'bg-amber-400 w-full'
                                }`}
                              ></div>
                           </div>
                         </div>
                       )}

                       {/* Oferendas indicators */}
                       {currentAgrados.length > 0 && (
                         <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-1">
                           {currentAgrados.map((ag: any, idx: number) => {
                             const type = OFERENDA_TYPES.find(t => t.id === ag.type);
                             const isExpired = new Date(ag.expiresAt).getTime() < new Date().getTime();
                             
                             const hoursLeft = Math.ceil((new Date(ag.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60));
                             const timeLeftFormatted = isExpired ? '0h' : (hoursLeft >= 24 ? `${Math.floor(hoursLeft/24)}d` : `${hoursLeft}h`);

                             if (!type) return null;
                             const AgrIcon = type.icon;
                             return (
                               <div key={idx} className={`p-1 sm:p-1.5 rounded-lg border flex items-center gap-1 sm:gap-1.5 transition-colors ${isExpired ? 'bg-red-50/80 border-red-200 text-red-600 shadow-sm' : 'bg-stone-50/80 border-stone-200 text-stone-600'}`}>
                                 <AgrIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                                 <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-tighter truncate max-w-[150px]">
                                   {isExpired ? 'Renovar' : type.name}
                                 </span>
                                 {!isExpired && (
                                   <span className="text-[7px] sm:text-[8px] font-bold opacity-60 ml-0.5 whitespace-nowrap">• {timeLeftFormatted}</span>
                                 )}
                               </div>
                             );
                           })}
                         </div>
                       )}

                       {/* Galeria Mini Carousel */}
                       {a.galeria && a.galeria.length > 0 && (
                         <div className="mt-3 w-full flex gap-2 overflow-x-auto no-scrollbar snap-x pb-1">
                           {a.galeria.map((img: any, idx: number) => {
                             const isString = typeof img === 'string';
                             const url = isString ? img : img.url;
                             const desc = isString ? '' : (img.descricao || '');
                             return (
                               <div key={idx} className="w-14 h-14 shrink-0 rounded-lg overflow-hidden relative snap-start group/mini shadow-sm border border-stone-200">
                                 <img src={url} alt={`Galeria ${idx}`} className="w-full h-full object-cover" />
                                 {desc && (
                                   <div className="absolute inset-x-0 outline-none bottom-0 bg-stone-900/60 backdrop-blur-sm text-center">
                                      <p className="text-[6px] text-white font-bold uppercase truncate px-1">{desc}</p>
                                   </div>
                                 )}
                               </div>
                             );
                           })}
                         </div>
                       )}
                    </div>
                  </div>
                  
                  {/* Desktop / Manual Swipe Toggle */}
                  <div className="absolute top-3 right-2 z-20">
                     <button 
                       onClick={() => setSwipedCardId(swipedCardId === a.id ? null : a.id)} 
                       className="p-2 text-stone-300 hover:text-stone-600 rounded-full hover:bg-stone-100 transition-colors"
                     >
                        <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
                     </button>
                  </div>
                </div>

                <div className="px-4 sm:px-5 py-3 sm:py-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 w-full justify-between sm:justify-start sm:gap-3 flex-wrap">
                    <button 
                      onClick={() => setSelectedForFirmeza(a)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors shadow-sm"
                    >
                      <Flame className="w-4 h-4" />
                      <span className="text-[9px] font-bold uppercase tracking-wide">Firmeza</span>
                    </button>
                    <button 
                      onClick={() => setSelectedForOferenda(a)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors shadow-sm"
                    >
                      <Coffee className="w-4 h-4" />
                      <span className="text-[9px] font-bold uppercase tracking-wide">Zeladoria</span>
                    </button>
                    <div className="flex gap-2 shrink-0">
                       <button 
                         onClick={() => setSelectedForGaleria(a)}
                         className="flex-shrink-0 p-2 rounded-xl bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-800 border border-stone-200 transition-colors shadow-sm flex items-center justify-center"
                         title="Galeria Visual"
                       >
                         <Images className="w-4 h-4" />
                       </button>
                       <button 
                         onClick={() => partilharAxe(a)}
                         className="flex-shrink-0 p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-sm flex items-center justify-center"
                         title="Compartilhar Axé na Corrente"
                       >
                         <Share2 className="w-4 h-4" />
                       </button>
                    </div>
                  </div>
                  
                  <div className="hidden sm:flex items-center gap-1 text-[9px] sm:text-[10px] text-stone-400 font-bold uppercase">
                    <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    {a.velaExpiresAt ? `Luz: ${Math.max(0, Math.floor((new Date(a.velaExpiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))}d` : 'Sem luz'}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {isAdding ? (
          <div className="bg-white rounded-3xl p-6 border-2 border-dashed border-stone-200 animate-in zoom-in-95">
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wide mb-4">Assentar Guia/Entidade</h3>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Nome da Entidade"
                value={newEntity.nome}
                onChange={e => setNewEntity({...newEntity, nome: e.target.value})}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 font-medium"
              />
              <select 
                value={newEntity.linha}
                onChange={e => setNewEntity({...newEntity, linha: e.target.value})}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-medium"
              >
                {LINHAS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={handleAdd}
                  className="flex-1 bg-stone-900 text-white p-3 rounded-xl font-bold text-sm hover:bg-stone-800"
                >
                  Assentar
                </button>
                <button 
                  onClick={() => setIsAdding(false)}
                  className="flex-1 bg-stone-100 text-stone-500 p-3 rounded-xl font-bold text-sm shadow-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setIsAdding(true)}
            className="w-full p-6 border-2 border-dashed border-stone-200 rounded-3xl flex flex-col items-center justify-center gap-2 text-stone-400 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center group-hover:bg-emerald-100 group-hover:scale-110 transition-all">
              <Plus className="w-6 h-6" />
            </div>
            <span className="font-bold text-sm tracking-wide">Assentar Nova Entidade</span>
          </button>
        )}
      </div>

      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleImageChange} 
      />

      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={galleryInputRef} 
        onChange={handleGalleryImageChange} 
      />

      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={cameraInputRef} 
        capture="environment"
        onChange={handleGalleryImageChange} 
      />

      {/* Edit Entity Modal */}
      {editingEntity && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 animate-in fade-in">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setEditingEntity(null)} />
          <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom-5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-serif font-bold text-stone-900">Editar Assentamento</h2>
              <button onClick={() => setEditingEntity(null)} className="p-2 bg-stone-50 rounded-full text-stone-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-stone-400 mb-2 block tracking-wider">Nome do Guia</label>
                <input 
                  type="text" 
                  value={editingEntity.nome}
                  onChange={e => setEditingEntity({...editingEntity, nome: e.target.value})}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-stone-400 mb-2 block tracking-wider">Linha Espiritual</label>
                <select 
                  value={editingEntity.linha}
                  onChange={e => setEditingEntity({...editingEntity, linha: e.target.value})}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-medium"
                >
                  {LINHAS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              
              <button 
                onClick={handleUpdateEntity}
                className="w-full bg-stone-900 text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-stone-800 transition-colors mt-4"
              >
                <Save className="w-4 h-4" />
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Firmeza Modal */}
      {selectedForFirmeza && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 animate-in fade-in">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setSelectedForFirmeza(null)} />
          <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom-5">
            <h2 className="text-xl font-serif font-bold text-stone-900 mb-2">Firmeza: {selectedForFirmeza.nome}</h2>
            <p className="text-xs text-stone-500 mb-6">Escolha o tempo de luz para esta entidade.</p>
            <div className="space-y-3">
              {VELAS.map(v => (
                <button 
                  key={v.id}
                  onClick={() => renovarVela(selectedForFirmeza.id, v.days)}
                  className="w-full p-4 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-between hover:bg-amber-50 hover:border-amber-200 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Flame className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-stone-700">{v.name}</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase text-stone-400">{v.label}</span>
                </button>
              ))}
            </div>
            <button 
              onClick={() => setSelectedForFirmeza(null)}
              className="mt-6 w-full p-3 text-sm font-bold text-stone-400 hover:text-stone-600"
            >
              Agora não
            </button>
          </div>
        </div>
      )}

      {/* Oferenda/Zelar Modal */}
      {selectedForOferenda && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 animate-in fade-in">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setSelectedForOferenda(null)} />
          <div className="relative bg-white w-full max-w-md max-h-[85vh] rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom-5 flex flex-col">
            <h2 className="text-xl font-serif font-bold text-stone-900 mb-2">Zelar: {selectedForOferenda.nome}</h2>
            <p className="text-xs text-stone-500 mb-6">Qual elemento de fundamento deseja firmar ou renovar hoje?</p>
            <div className="grid grid-cols-2 gap-3 overflow-y-auto no-scrollbar pb-4 -mx-2 px-2 flex-1">
              {OFERENDA_TYPES.map(type => (
                <button 
                  key={type.id}
                  onClick={() => addOferenda(selectedForOferenda.id, type)}
                  className="p-4 rounded-2xl bg-stone-50 border border-stone-100 flex flex-col items-center justify-center text-center gap-2 hover:bg-blue-50 hover:border-blue-200 transition-all group"
                >
                  <type.icon className="w-6 h-6 text-stone-400 group-hover:text-blue-500 group-hover:scale-110 transition-all" />
                  <span className="font-bold text-[10px] text-stone-700 leading-tight">{type.name}</span>
                </button>
              ))}
            </div>
            <button 
              onClick={() => setSelectedForOferenda(null)}
              className="mt-4 shrink-0 w-full p-3 text-sm font-bold text-stone-400 hover:text-stone-600 rounded-xl hover:bg-stone-50 transition-colors"
            >
              Agora não
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {entityToDelete && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-6 animate-in fade-in">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setEntityToDelete(null)} />
          <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-serif font-bold text-stone-900 mb-2">Desassentar Guia?</h2>
            <p className="text-sm text-stone-500 mb-6">
              Você tem certeza que deseja retirar <strong className="text-stone-800">{entityToDelete.nome}</strong> do seu Congá? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setEntityToDelete(null)}
                className="flex-1 p-3 rounded-2xl font-bold text-stone-500 bg-stone-100 hover:bg-stone-200 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 p-3 rounded-2xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Desassentar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Galeria Modal */}
      {selectedForGaleria && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 animate-in fade-in">
          <div className="absolute inset-0 bg-stone-900/90 backdrop-blur-md" onClick={() => setSelectedForGaleria(null)} />
          <div className="relative bg-white w-full h-[85vh] max-w-lg rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10">
            <div className="flex items-center justify-between p-6 border-b border-stone-100 shrink-0">
              <div>
                <h2 className="text-xl font-serif font-bold text-stone-900 leading-tight">Galeria Sagrada</h2>
                <p className="text-xs font-bold uppercase tracking-wider text-purple-600">{selectedForGaleria.nome}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => cameraInputRef.current?.click()}
                  className="p-2 sm:p-3 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors tooltip"
                  title="Tirar Foto"
                >
                  <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <button 
                  onClick={() => galleryInputRef.current?.click()}
                  className="p-2 sm:p-3 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors tooltip"
                  title="Adicionar da Galeria"
                >
                  <Images className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <button onClick={() => setSelectedForGaleria(null)} className="p-2 sm:p-3 bg-stone-100 rounded-full text-stone-500 hover:bg-stone-200">
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-stone-50 no-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                {/* Main profile photo as first item */}
                {selectedForGaleria.fotoUrl && (
                  <div className="aspect-square rounded-2xl overflow-hidden relative shadow-sm border border-stone-200 group">
                    <img src={selectedForGaleria.fotoUrl} className="w-full h-full object-cover" alt="Foto principal" />
                    <div className="absolute top-2 left-2 bg-stone-900/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] text-white font-bold uppercase tracking-wider">
                      Perfil
                    </div>
                  </div>
                )}
                
                {/* Additional gallery photos */}
                {(selectedForGaleria.galeria || []).map((img: any, index: number) => {
                  const isString = typeof img === 'string';
                  const url = isString ? img : img.url;
                  const desc = isString ? '' : (img.descricao || '');

                  return (
                    <div key={index} className="aspect-square rounded-2xl overflow-hidden relative shadow-sm border border-stone-200 group flex flex-col bg-white">
                      <div className="h-2/3 w-full relative">
                         <img src={url} className="w-full h-full object-cover" alt={`Foto ${index + 1}`} />
                         <button 
                           onClick={() => {
                             const newGallery = [...selectedForGaleria.galeria];
                             newGallery.splice(index, 1);
                             const ref = doc(db, 'assentamentos', selectedForGaleria.id);
                             updateDoc(ref, { galeria: newGallery }).then(() => {
                               setSelectedForGaleria({...selectedForGaleria, galeria: newGallery});
                             });
                           }}
                           className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                           title="Excluir foto"
                         >
                            <Trash2 className="w-3.5 h-3.5" />
                         </button>
                      </div>
                      <div className="h-1/3 w-full p-2">
                        <textarea 
                          placeholder="Adicione um fundamento..."
                          className="w-full h-full bg-transparent resize-none text-[10px] text-stone-600 focus:outline-none placeholder-stone-400"
                          defaultValue={desc}
                          onBlur={(e) => {
                            if (e.target.value !== desc) {
                              updateGalleryDescription(index, e.target.value);
                            }
                          }}
                        />
                      </div>
                    </div>
                  );
                })}

                {/* Empty State / Add Photo Card */}
                {(!selectedForGaleria.galeria || selectedForGaleria.galeria.length === 0) && !selectedForGaleria.fotoUrl && (
                  <div className="col-span-2 text-center py-10">
                    <Images className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                    <p className="text-stone-500 text-sm font-medium">Nenhuma foto no acervo ainda.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alert Settings Modal */}
      {showAlertModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden flex flex-col max-h-[80vh] shadow-2xl relative">
            <button 
              onClick={() => setShowAlertModal(false)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-6 bg-stone-50 border-b border-stone-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-stone-600">
                <BellRing className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-stone-900 text-lg">Alertas de Zelo</h3>
            </div>
            
            <div className="p-6 space-y-6">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <h4 className="font-bold text-stone-900">Ativar Alertas</h4>
                  <p className="text-xs text-stone-500 mt-1">Ligar o radar no Congá</p>
                </div>
                <div className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${alertConfig.enabled ? 'bg-emerald-500' : 'bg-stone-300'}`}>
                  <input type="checkbox" onClick={() => setAlertConfig(prev => ({...prev, enabled: !prev.enabled}))} className="sr-only" />
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${alertConfig.enabled ? 'left-7' : 'left-1'}`}></div>
                </div>
              </label>

              <label className={`flex items-center justify-between cursor-pointer ${!alertConfig.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                <div>
                  <h4 className="font-bold text-stone-900">Vibrar Celular</h4>
                  <p className="text-xs text-stone-500 mt-1">Dá um toque quando precisar de zelo</p>
                </div>
                <div className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${alertConfig.vibrate ? 'bg-emerald-500' : 'bg-stone-300'}`}>
                  <input type="checkbox" onClick={() => setAlertConfig(prev => ({...prev, vibrate: !prev.vibrate}))} className="sr-only" />
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${alertConfig.vibrate ? 'left-7' : 'left-1'}`}></div>
                </div>
              </label>

              <div className={`pt-4 border-t border-stone-100 ${!alertConfig.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                <h4 className="font-bold text-stone-900 mb-4">Avisar com antecedência</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[2, 6, 12, 24].map(hours => (
                    <button
                      key={hours}
                      onClick={() => setAlertConfig(prev => ({...prev, preExpiryHours: hours}))}
                      className={`py-3 px-4 rounded-2xl border text-sm font-bold transition-colors ${alertConfig.preExpiryHours === hours ? 'bg-stone-900 border-stone-900 text-white shadow-md' : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'}`}
                    >
                      {hours} {hours === 1 ? 'hora' : 'horas'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 bg-stone-900/90 backdrop-blur-md text-white text-xs font-bold rounded-full shadow-2xl animate-in slide-in-from-bottom-5 fade-in flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          {toastMsg}
        </div>
      )}

    </div>
  );
}
