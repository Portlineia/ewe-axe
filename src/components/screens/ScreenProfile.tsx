import React, { useState } from 'react';
import { Camera, Save, ArrowLeft, UserCircle, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { updateProfile } from 'firebase/auth';

interface ScreenProfileProps {
  onBack: () => void;
}

export function ScreenProfile({ onBack }: ScreenProfileProps) {
  const { user, logOut } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const compressImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
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
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      const compressed = await compressImage(base64);
      setPhotoURL(compressed);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSuccess(false);

    try {
      // Update Firebase Auth
      await updateProfile(user, {
        displayName: displayName,
        photoURL: photoURL || user.photoURL
      });

      // Update Firestore user document
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: displayName,
        photoURL: photoURL || user.photoURL
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      console.error("Failed to update profile", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col animate-fade-in w-full h-full bg-[#F7F7F5] relative z-20">
      <header className="px-6 pt-14 pb-4 bg-white border-b border-stone-200 shadow-sm flex items-center gap-4 relative z-10">
        <button onClick={onBack} className="p-2 text-stone-400 hover:text-stone-700 bg-stone-50 rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 font-serif">Meu Perfil</h1>
      </header>

      <main className="flex-1 px-6 py-8 overflow-y-auto w-full max-w-md mx-auto">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 flex flex-col items-center mb-6">
          <div className="relative mb-6">
            <img 
              src={photoURL || "https://i.pravatar.cc/150?img=11"} 
              alt="Avatar" 
              className="w-24 h-24 rounded-full object-cover border-4 border-emerald-50 shadow-md"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 bg-brand-emerald text-white rounded-full flex items-center justify-center border-2 border-white shadow-sm hover:scale-105 transition-transform"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
          <p className="text-xs text-stone-400 mb-1">{user?.email}</p>
          <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
            Irmão(ã) de Santo
          </span>
        </div>

        {/* Premium Upgrade Card */}
        <div className="mb-6 relative overflow-hidden rounded-3xl p-6 border border-amber-200 shadow-lg group bg-gradient-to-br from-amber-50 to-amber-100/80">
           <div className="absolute top-0 right-0 p-4 opacity-20 scale-150 rotate-12 pointer-events-none">
             <div className="w-32 h-32 rounded-full border-[10px] border-amber-400/30 blur-xl"></div>
           </div>
           
           <div className="relative z-10 flex flex-col items-center text-center">
              <div className="bg-amber-100 p-3 rounded-full mb-3 shadow-[0_0_20px_rgba(251,191,36,0.3)] border border-amber-200">
                <Sparkles className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-serif font-bold text-amber-950 mb-2">Ewé Axé Premium</h3>
              <p className="text-sm text-amber-800 font-medium leading-relaxed mb-5">
                 Desperte o máximo do seu potencial espiritual. Apoie a plataforma e destranque oráculos vocais e acesso livre à ferramenta de catalogação e reconhecimento global dos terreiros.
              </p>
              <button 
                onClick={() => alert("O gateway de pagamento via Stripe/Pix está sendo ativado. Retorne em breve!")}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold py-3.5 rounded-2xl shadow-lg hover:shadow-xl transition-all font-sans text-sm tracking-wide"
              >
                Apoiar com R$ 7,77
              </button>
           </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200">
          <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wide mb-4">Informações Públicas</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1 px-1">Nome no Terreiro</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-800 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
                placeholder="Seu nome"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1 px-1">URL da Fotografia</label>
              <input
                type="text"
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-800 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
                placeholder="https://..."
              />
               <p className="text-[10px] text-stone-400 mt-1 px-1">Cole aqui o link de uma imagem válida para o seu avatar.</p>
            </div>
          </div>

          <button 
            onClick={handleSave}
            disabled={saving}
            className={`w-full mt-8 p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${
              success 
                ? 'bg-emerald-100 border border-emerald-200 text-emerald-800'
                : 'bg-stone-900 hover:bg-stone-800 text-white shadow-lg'
            }`}
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : success ? (
              <>Salvo com Axé! ✨</>
            ) : (
              <><Save className="w-5 h-5" /> Guardar Alterações</>
            )}
          </button>
        </div>

        <div className="bg-red-50 rounded-3xl p-6 shadow-none border border-red-100 flex flex-col items-center">
           <h2 className="text-sm font-bold text-red-900 uppercase tracking-wide mb-2 self-start flex items-center gap-2"><LogOut className="w-4 h-4" /> Conta</h2>
           <p className="text-xs text-red-700/80 mb-6 leading-relaxed self-start">Encerrar a sua sessão desvincula este aparelho da Corrente, mas seus dados ficam firmados no nosso Congá em nuvem.</p>
           
           <button 
            onClick={() => logOut()}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-xl text-red-600 bg-white hover:bg-red-100 border border-red-200/50 text-sm font-bold transition-colors shadow-sm"
          >
            Desconectar (Sair)
          </button>
        </div>

      </main>
    </div>
  );
}
