import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Upload, Leaf, Lock, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { db, storage } from '../../firebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../auth/AuthProvider';

interface ScannerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ScreenScanner({ isOpen, onClose }: ScannerProps) {
  const { user } = useAuth();
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Paywall Logic
  const [scansUsed, setScansUsed] = useState(() => parseInt(localStorage.getItem('scansUsed') || '0'));
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
     if (scansUsed >= 3) {
        setShowPaywall(true);
     }
  }, [scansUsed]);

  if (!isOpen) return null;

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

  const cleanJSON = (str: string) => {
    try {
      const jsonStr = str.replace(/```json\n?|```\n?/g, '').trim();
      return JSON.parse(jsonStr);
    } catch (e) {
      return null;
    }
  };

  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    setResult(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Full = reader.result as string;
      const base64Data = base64Full.split(',')[1];
      setPreview(base64Full);
      
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
        
        // 1. Ask Gemini to extract the botanical info in pure JSON to cross-check with DB
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            {
              role: 'user',
              parts: [
                { text: 'Você é um Kosi Ewé e mestre botânico da Umbanda. Identifique a planta e forneça a resposta EXATAMENTE no seguinte formato JSON, sem blocos de código markdown:\n{"nomePopular": "Nome","nomeCientifico": "Cientifico","temperatura": "quente|morna|fria","orixas": ["Orixa1", "Orixa2"],"uso": "Como é usada em banhos ou defumação. Seja respeitoso.","descricao": "Descrição mística."}' },
                { inlineData: { mimeType: file.type, data: base64Data } }
              ]
            }
          ]
        });

        const parsedData = cleanJSON(response.text || '');
        if (!parsedData || !parsedData.nomeCientifico) {
          throw new Error("Não foi possível decifrar os mistérios desta folha.");
        }
        
        // Define accepted Orixás in the umbanda context
        const VALID_ORIXAS = ['Exu', 'Pombagira', 'Ogum', 'Oxóssi', 'Xangô', 'Obaluaiê', 'Omolu', 'Oxumaré', 'Ossain', 'Tempo', 'Ewa', 'Iansã', 'Oyá', 'Oxum', 'Iemanjá', 'Nanã', 'Obá', 'Oxalá', 'Preto Velho', 'Caboclo', 'Baiano', 'Marinheiro', 'Erê', 'Boiadeiro', 'Malandro', 'Cigano'];
        
        // Filter out Orixás that do not match the valid list (case insensitive partial match)
        const validatedOrixas = (parsedData.orixas || []).filter((orixaStr: string) => {
           return VALID_ORIXAS.some(valid => orixaStr.toLowerCase().includes(valid.toLowerCase()));
        });
        
        // Provide a default if the AI hallucinated completely wrong ones
        if(validatedOrixas.length === 0) validatedOrixas.push('Oxalá');

        const compressed = await compressImage(base64Full);

        // Upload to Storage
        let downloadUrl = compressed; // Default to base64 if user is anon or storage fails, but try storage first
        if (user) {
           try {
               const response = await fetch(compressed);
               const blob = await response.blob();
               const fileExt = 'jpg';
               const storageRef = ref(storage, `users/${user.uid}/scanner/${Date.now()}.${fileExt}`);
               await uploadBytes(storageRef, blob);
               downloadUrl = await getDownloadURL(storageRef);
           } catch (e) {
               console.error("Storage upload failed, fallback to base64", e);
           }
        }

        // 2. Cross-check with Global Database (ervas_catalogadas)
        const ervasRef = collection(db, 'ervas_catalogadas');
        const q = query(ervasRef, where('nomeCientifico', '==', parsedData.nomeCientifico));
        const querySnapshot = await getDocs(q);

        let finalData;

        if (querySnapshot.empty) {
          // It's a new plant! Save to Global Database to save AI costs in the future
          const validTillDate = new Date();
          validTillDate.setMonth(validTillDate.getMonth() + 6); // Valid for 6 months

          const newErva = {
            nomePopular: parsedData.nomePopular,
            nomeCientifico: parsedData.nomeCientifico,
            temperatura: parsedData.temperatura,
            orixas: validatedOrixas, // Use validated array
            uso: parsedData.uso,
            descricao: parsedData.descricao,
            imagemURL: downloadUrl,
            descobridorId: user?.uid || 'anon',
            lastAIUpdate: new Date().toISOString(),
            validTill: validTillDate.toISOString()
          };

          await addDoc(ervasRef, newErva);
          finalData = newErva;
          finalData.isNew = true;
        } else {
          // Plant exists! Use the global knowledge (Cache Hit!)
          const existingErvaDoc = querySnapshot.docs[0];
          finalData = existingErvaDoc.data();
          finalData.isNew = false;
        }

        setResult(finalData);

        // 3. Save purely to the user's personal log (Diário/Acervo)
        if (user) {
          await addDoc(collection(db, 'plantScans'), {
            userId: user.uid,
            plantName: finalData.nomePopular,
            nomeCientifico: finalData.nomeCientifico,
            imageURL: downloadUrl,
            createdAt: new Date().toISOString()
          });
        }

        // Increment scan count locally
        const newTotal = scansUsed + 1;
        setScansUsed(newTotal);
        localStorage.setItem('scansUsed', newTotal.toString());

      } catch (err) {
        console.error(err);
        setResult({ error: "A conexão com o Axé falhou ou a folha não foi reconhecida." });
      } finally {
        setAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const closeAndReset = () => {
    setResult(null);
    setPreview(null);
    onClose();
  };

  return (
    <div className="absolute inset-0 z-[100] bg-stone-950 flex flex-col items-center justify-center text-white animate-fade-in w-full h-full rounded-[40px] overflow-hidden">
      <button 
        onClick={closeAndReset} 
        className="absolute top-14 right-6 p-2 bg-white/10 rounded-full backdrop-blur-md z-50 text-white"
      >
        <X className="w-5 h-5" />
      </button>

      {showPaywall ? (
        <div className="flex-1 w-full bg-stone-950 flex flex-col pt-16 px-6 pb-6 overflow-y-auto">
          <div className="flex flex-col items-center justify-center text-center space-y-6 mt-10">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-tr from-amber-400 to-amber-600 rounded-3xl rotate-12 flex items-center justify-center shadow-2xl shadow-amber-500/20">
                <Lock className="w-10 h-10 text-stone-950 -rotate-12" />
              </div>
              <Sparkles className="absolute -top-4 -right-4 w-8 h-8 text-amber-200 animate-pulse" />
            </div>
            
            <div className="space-y-4">
              <h2 className="text-3xl font-serif text-white font-bold max-w-xs mx-auto">
                Desbloqueie os Mistérios da Floresta
              </h2>
              <p className="text-stone-400 text-sm leading-relaxed max-w-sm mx-auto">
                Você utilizou suas visões gratuitas deste ciclo. A Inteligência Oculta de Ossain requer recursos para se manter canalizada.
              </p>
            </div>

            <div className="w-full bg-stone-900 border border-stone-800 rounded-3xl p-6 relative overflow-hidden mt-6 shadow-2xl">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                 <Leaf size={100} />
              </div>
              <p className="text-amber-500 font-bold uppercase tracking-widest text-[10px] mb-2">Apoie a Corrente</p>
              <h3 className="text-white text-xl font-bold mb-4">Assinatura Sete Folhas</h3>
              <ul className="space-y-3 text-sm text-stone-300 text-left mb-6">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Scans & Visões botânicas Ilimitadas</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Backup do Congá na Nuvem</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Insígnia de Apoiador na Comunidade</li>
              </ul>
              
              <button onClick={() => alert("Integração de pagamento será ativada na próxima versão!")} className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-lg py-4 rounded-2xl transition-colors shadow-lg shadow-amber-500/20">
                Acessar por R$ 7,77 / mês
              </button>
            </div>
          </div>
        </div>
      ) : !result ? (
        <div className="flex-1 w-full relative flex flex-col items-center justify-center p-6">
          <div className="relative w-full aspect-square max-w-sm rounded-[3rem] overflow-hidden border-2 border-emerald-500/30 shadow-2xl bg-stone-900 flex items-center justify-center group">
            {preview ? (
              <img src={preview} className="w-full h-full object-cover" alt="Preview" />
            ) : (
              <Camera className="w-16 h-16 text-emerald-500/20 group-hover:scale-110 transition-transform" />
            )}
            
            {analyzing && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center">
                <div className="w-full h-1 bg-emerald-500 shadow-[0_0_20px_#10b981] absolute top-1/2 left-0 animate-[scan_2s_ease-in-out_infinite]"></div>
                <div className="relative mt-20 flex flex-col items-center">
                   <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                   <p className="text-emerald-400 font-bold text-xs uppercase tracking-[0.2em] animate-pulse">Lendo a assinatura da folha...</p>
                </div>
              </div>
            )}
          </div>

          {!analyzing && !preview && (
            <div className="mt-12 text-center w-full px-6">
              <h2 className="text-xl font-serif font-bold mb-2">Revelador de Ewé</h2>
              <p className="text-stone-400 text-sm mb-8 px-8">Desvende o fundamento das folhas sagradas através da nossa visão espiritual.</p>
              
              <div className="flex flex-col gap-3 max-w-xs mx-auto">
                <button 
                  onClick={() => {
                    const input = fileInputRef.current;
                    if (input) {
                      input.setAttribute('capture', 'environment');
                      input.click();
                    }
                  }}
                  className="bg-emerald-600 active:scale-95 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-emerald-900/40 transition-all"
                >
                  <Camera className="w-5 h-5" /> Usar Câmera
                </button>
                
                <button 
                  onClick={() => {
                    const input = fileInputRef.current;
                    if (input) {
                      input.removeAttribute('capture');
                      input.click();
                    }
                  }}
                  className="bg-stone-800 active:scale-95 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 border border-stone-700 transition-all"
                >
                  <Upload className="w-5 h-5 text-emerald-500" /> Galeria / Arquivos
                </button>
              </div>
            </div>
          )}

          <input 
            type="file" 
            accept="image/*" 
            capture="environment"
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleScan} 
          />
        </div>
      ) : (
        <div className="flex-1 w-full bg-[#FAFAFA] text-slate-800 overflow-y-auto pt-24 px-6 pb-32 rounded-t-[40px]">
          {preview && (
            <img src={preview} className="w-full h-48 object-cover rounded-3xl mb-6 shadow-xl" alt="Planta" />
          )}
          
          {result.error ? (
             <div className="bg-red-50 text-red-700 p-4 rounded-2xl text-center font-medium">{result.error}</div>
          ) : (
             <div className="animate-fade-in flex flex-col gap-4">
                {result.isNew ? (
                   <span className="self-start px-3 py-1 bg-amber-100 text-amber-800 text-[10px] uppercase font-bold tracking-widest rounded-full flex items-center gap-1"><Leaf className="w-3 h-3"/> Descoberta Nova</span>
                ) : (
                   <span className="self-start px-3 py-1 bg-emerald-100 text-emerald-800 text-[10px] uppercase font-bold tracking-widest rounded-full flex items-center gap-1"><Leaf className="w-3 h-3"/> Conhecimento do Acervo</span>
                )}
                
                <div>
                   <h2 className="text-3xl font-serif font-bold text-slate-900">{result.nomePopular}</h2>
                   <p className="text-emerald-700 uppercase tracking-widest text-xs font-bold mt-1">{result.nomeCientifico}</p>
                </div>
                
                <div className="flex gap-2 mb-2">
                   <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${result.temperatura === 'quente' ? 'bg-red-100 text-red-700' : result.temperatura === 'morna' ? 'bg-amber-100 text-amber-700' : 'bg-cyan-100 text-cyan-700'}`}>
                      {result.temperatura}
                   </div>
                   <div className="px-3 py-1 rounded-full bg-slate-200 text-slate-700 text-xs font-bold uppercase">
                      {result.orixas?.join(', ')}
                   </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm mt-2">
                   <h3 className="text-xs uppercase font-bold text-slate-400 tracking-widest mb-2">Uso Ritualístico</h3>
                   <p className="text-slate-700 leading-relaxed font-serif">{result.uso}</p>
                </div>
                
                {result.descricao && (
                   <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                      <h3 className="text-xs uppercase font-bold text-slate-400 tracking-widest mb-2">Fundamento Adicional</h3>
                      <p className="text-slate-700 leading-relaxed font-serif">{result.descricao}</p>
                   </div>
                )}
             </div>
          )}

          <button 
             onClick={closeAndReset}
             className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-5 rounded-2xl mt-10 transition-colors shadow-lg"
          >
            Guardar no Diário e Retornar
          </button>
        </div>
      )}

      <style>{`
        @keyframes scan {
          0% { top: 0%; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  );
}
