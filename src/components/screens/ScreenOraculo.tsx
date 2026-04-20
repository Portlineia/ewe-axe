import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, FileText, FlaskConical, Bot, Mic, MicOff } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../auth/AuthProvider';
import { GoogleGenAI, Type } from '@google/genai';
import { db } from '../../firebase';
import { collection, query, where, getDocs, doc, setDoc, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { BanhoRecipe } from '../ui/BanhoRecipe';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  uiComponent?: {
    type: 'BanhoRecipe' | 'CongaSuggestion';
    props: any;
  };
}

export function ScreenOraculo() {
  const { user } = useAuth();
  
  const initialGreeting: Message = {
    id: '1',
    role: 'assistant',
    content: 'Saravá, filho! Aqui a intuição se alia ao Axé. Me diga, como está a sua energia e o seu coração hoje?'
  };

  const [mensagemDoDia, setMensagemDoDia] = useState<string | null>(null);
  const [loadingMensagem, setLoadingMensagem] = useState(false);

  useEffect(() => {
     // Fetch quick daily message on load
     const fetchMensagem = async () => {
         const cachedMessage = localStorage.getItem(`oraculo_msg_dia_${new Date().toDateString()}`);
         if (cachedMessage) {
             setMensagemDoDia(cachedMessage);
             return;
         }

         setLoadingMensagem(true);
         try {
             let apiKey = process.env.GEMINI_API_KEY;
             if (!apiKey && typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) {
                 apiKey = import.meta.env.VITE_GEMINI_API_KEY;
             }
             if (!apiKey) return;

             const ai = new GoogleGenAI({ apiKey });
             const prompt = `Escreva uma mensagem de sabedoria e axé super curta (máximo 2 linhas) assinada por um Preto Velho para o dia de hoje. Não use emojis.`;
             const response = await ai.models.generateContent({
                 model: 'gemini-2.5-flash',
                 contents: prompt,
                 config: { temperature: 0.8 }
             });
             
             if (response.text) {
                 setMensagemDoDia(response.text);
                 localStorage.setItem(`oraculo_msg_dia_${new Date().toDateString()}`, response.text);
             }
         } catch (e: any) {
             console.error("Erro ao gerar mensagem do dia:", e);
             const fallbacks = [
                 "Filho, quando a caminhada estiver pesada, senta no toco e firma sua cabeça. A luz que te guia nunca apaga.",
                 "Não tenha pressa, cavalo que corre muito também cansa. Deixe o tempo de Olorum trabalhar na sua vida.",
                 "Quem tem fé nas Almas, tem o caminho iluminado na noite mais escura. Respira fundo, meu filho.",
                 "As ervas curam o corpo, mas só o amor verdadeiro cura o espírito. Seja paz por onde caminhar.",
                 "A fumaça do cachimbo leva embora a tristeza e traz a sabedoria dos ancestrais. Tenha calma."
             ];
             const randomFallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];
             setMensagemDoDia(randomFallback + " – Adorei as Almas");
         } finally {
             setLoadingMensagem(false);
         }
     }
     fetchMensagem();
  }, []);

  const [messages, setMessages] = useState<Message[]>(() => {
    const cached = localStorage.getItem('cache_oraculo_messages');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // null
      }
    }
    return [initialGreeting];
  });
  
  const [conversationId, setConversationId] = useState<string>(() => {
     return localStorage.getItem('cache_oraculo_thread_id') || `thread_${Date.now()}`;
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [savedRecipes, setSavedRecipes] = useState<Record<string, boolean>>({});
  const [chatOpen, setChatOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Restore chat status if a cached conversation exists other than initial greeting
  useEffect(() => {
    if (messages.length > 1) {
      setChatOpen(true);
    }
  }, []);

  const handleSaveToAcervo = async (msgId: string, props: any) => {
    if (!user) return;
    try {
      const newRecipeRef = doc(collection(db, 'userRecipes'));
      await setDoc(newRecipeRef, {
        userId: user.uid,
        titulo: props.titulo || "Banho Sagrado",
        indicacao: props.indicacao || "",
        ingredientes: props.ingredientes || [],
        preparo: props.dicaPreparo || "",
        createdAt: new Date().toISOString()
      });
      
      setSavedRecipes(prev => ({ ...prev, [msgId]: true }));
    } catch (e) {
      console.error("Erro ao guardar na nova coleção:", e);
      alert('Erro ao guardar a receita. Tente novamente.');
    }
  };

  // Initial load from Firebase if available
  useEffect(() => {
    if (!user) return;
    const fetchLatestThread = async () => {
       try {
         const q = query(
           collection(db, 'oraculo_history'), 
           where('userId', '==', user.uid)
         );
         const snaps = await getDocs(q);
         if (!snaps.empty) {
           const docs = snaps.docs.map(d => ({id: d.id, ...d.data()}));
           docs.sort((a: any, b: any) => {
              const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
              const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
              return bTime - aTime;
           });
           
           const data = docs[0] as any;
           setMessages(data.messages || [initialGreeting]);
           setConversationId(data.id);
         }
       } catch (err) {
         console.warn("Could not fetch remote thread, standard behavior continues.", err);
       }
    };
    
    // Only fetch if we are just starting and the cache was empty (implies new session)
    const cached = localStorage.getItem('cache_oraculo_messages');
    if (!cached) {
        fetchLatestThread();
    }
  }, [user]);

  // Persist to local storage constantly
  useEffect(() => {
    localStorage.setItem('cache_oraculo_messages', JSON.stringify(messages));
    localStorage.setItem('cache_oraculo_thread_id', conversationId);
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, conversationId, isLoading]);

  // Sync to Firebase on new interaction
  const syncToFirebase = async (msgs: Message[]) => {
    if (!user) return;
    try {
      const ref = doc(db, 'oraculo_history', conversationId);
      await setDoc(ref, {
        userId: user.uid,
        messages: msgs,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.warn("Failed to sync conversation to cloud", e);
    }
  };

  const handleClear = () => {
    if(window.confirm('Deseja iniciar uma nova conversa com o Oráculo?')) {
       // Start a brand new isolated conversation id
       const newId = `thread_${Date.now()}`;
       setConversationId(newId);
       setMessages([initialGreeting]);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const timestamp = Date.now();
    const userMsg: Message = { id: timestamp.toString(), role: 'user', content: input };
    
    setMessages(prev => {
      const nextMsgs = [...prev, userMsg];
      syncToFirebase(nextMsgs);
      return nextMsgs;
    });
    
    setInput('');
    setIsLoading(true);

    try {
      // NOTE: Using environment variables handled securely.
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Chave do Gemini não encontrada.");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const systemInstruction = `Você é um sábio Pai/Mãe de Santo virtual ("O Oráculo"). 
Seu papel é oferecer acolhimento e escuta atenta, recomendando fundamentos práticos da Umbanda (banhos, defumações, firmezas e preceitos).
Em vez de dar respostas muito genéricas, forneça conselhos acionáveis e específicos indicando elementos exatos (ex: cor de vela, erva específica, forma de fazer).
Se o usuário relatar uma dor, aflição ou situação complexa através de poucas palavras, faça algumas perguntas de acompanhamento de forma natural e carinhosa para entender o contexto antes de receitar a solução final. Isso garante uma recomendação mais personalizada e assertiva para o ori dele.
Seja sempre acolhedor, empático e direto.
SEMPRE que for aconselhar a elaboração de um banho de ervas, VOCÊ DEVE OBRIGATORIAMENTE USAR A FERRAMENTA 'renderBanhoRecipe' para gerar o card da receita, em vez de escrevê-la no texto da resposta.`;

      // Definindo o Function Calling (Tool) simulando o Generative UI / A2UI
      const tools = [{
        functionDeclarations: [{
          name: 'renderBanhoRecipe',
          description: 'Sempre chame essa ferramenta quando for aconselhar e descrever um Banho de ervas para o usuário.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              titulo: { type: Type.STRING, description: "Nome do banho" },
              indicacao: { type: Type.STRING, description: "Para que serve o banho" },
              ingredientes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de ervas" },
              dicaPreparo: { type: Type.STRING, description: "Instruções de como fazer e tomar o banho" }
            },
            required: ['titulo', 'indicacao', 'ingredientes', 'dicaPreparo']
          }
        }]
      }];

      // Gemini requires the first message in the history to be from the 'user'.
      // We will skip the initial greeting from the 'assistant' if it's the first message.
      const history = messages
        .filter((m, index) => !(index === 0 && m.role === 'assistant'))
        .map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content || "Recomendação enviada via componente interativo." }]
        }));
      history.push({ role: 'user', parts: [{ text: userMsg.content }]});

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: history,
        config: {
          systemInstruction: systemInstruction,
          tools: tools,
          temperature: 0.7
        }
      });

      // Parse response to find Tool Calls (Generative UI interception)
      let responseText = '';
      let uiComponent: any = undefined;

      if (response.functionCalls && response.functionCalls.length > 0) {
        const call = response.functionCalls[0];
        if (call.name === 'renderBanhoRecipe') {
          uiComponent = {
            type: 'BanhoRecipe',
            props: call.args as any
          };
          responseText = response.text ? response.text.replace(/<tool_code>[\s\S]*?<\/tool_code>/g, '').trim() : "Preparei esta intuição especialmente para você:";
          if (!responseText) responseText = "Preparei esta intuição especialmente para você:";
        }
      } else {
        // Fallback cleanup if the model hallucinates <tool_code> without triggering function calling
        responseText = response.text || "Às vezes o silêncio é a melhor resposta.";
        const toolCodeMatch = responseText.match(/<tool_code>[\s\S]*?renderBanhoRecipe\((.*?)\)[\s\S]*?<\/tool_code>/);
        if (toolCodeMatch) {
            responseText = responseText.replace(/<tool_code>[\s\S]*?<\/tool_code>/g, '').trim();
            // Try to extract if it failed
            try {
                // This is a naive extraction for hallucinated fallback if needed, but the official tools block should catch it now.
            } catch (e) {}
        }
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        uiComponent
      };

      setMessages(prev => {
        const nextMsgs = [...prev, botMsg];
        syncToFirebase(nextMsgs);
        return nextMsgs;
      });

    } catch (error: any) {
      console.error(error);
      const isOverloaded = error.message && (error.message.includes('503') || error.message.includes('high demand'));
      const friendlyMessage = isOverloaded 
        ? "Meu filho, existem muitos corações pedindo conselho agora e a tenda está cheia. Os ventos estão agitados. Por favor, aguarde alguns instantes e me chame de novo."
        : `Desculpe, uma interferência espiritual ofuscou a mensagem. Algo deu errado na conexão com o sagrado: ${error.message}`;

      const errMsg: Message = {
        id: (Date.now() + 100).toString(), // Ensure ID is unique from userMsg
        role: 'assistant',
        content: friendlyMessage
      };
      setMessages(prev => {
         const nextMsgs = [...prev, errMsg];
         syncToFirebase(nextMsgs);
         return nextMsgs;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full h-full relative z-10 bg-stone-50">
      
      {/* Header */}
      <header className="px-6 pt-16 pb-4 bg-white border-b border-stone-200 sticky top-0 z-30 shadow-sm flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-serif text-stone-900 leading-tight tracking-tight flex items-center gap-2">
             <Sparkles className="w-7 h-7 text-purple-600" /> 
             O Oráculo
          </h1>
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">Generative UI Interativo</p>
        </div>
        <button 
          onClick={handleClear}
          className="text-[10px] tracking-widest px-3 py-1.5 rounded-full border border-stone-200 bg-stone-50 text-stone-500 uppercase font-bold hover:text-stone-800 hover:bg-stone-100 transition-colors shadow-sm"
        >
          Limpar
        </button>
      </header>

      {/* Main Content Area */}
      {!chatOpen ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 mb-20 animate-in fade-in zoom-in-95 duration-500">
           <div className="w-full max-w-sm">
              <div className="bg-gradient-to-br from-stone-900 to-stone-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden text-center flex flex-col items-center">
                 <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
                    <Bot size={180} className="text-white" />
                 </div>
                 
                 <div className="w-16 h-16 rounded-full bg-stone-800/50 border border-stone-700 flex items-center justify-center mb-6 relative z-10 shadow-inner">
                    <Sparkles className="w-8 h-8 text-amber-400" />
                 </div>

                 <h2 className="text-[10px] tracking-[0.3em] font-bold uppercase text-amber-400/80 mb-6 relative z-10">
                    Mensagem do Dia
                 </h2>

                 {loadingMensagem ? (
                    <div className="flex flex-col gap-3 w-full items-center mb-8 relative z-10">
                       <div className="h-4 bg-white/10 rounded animate-pulse w-full max-w-[200px]"></div>
                       <div className="h-4 bg-white/10 rounded animate-pulse w-full max-w-[150px]"></div>
                    </div>
                 ) : (
                    <p className="font-serif text-lg text-stone-200 leading-relaxed italic mb-10 relative z-10">
                       "{mensagemDoDia || 'O silêncio também é resposta, filho. Confie no tempo.'}"
                    </p>
                 )}

                 <button 
                   onClick={() => setChatOpen(true)}
                   className="relative z-10 w-full py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold uppercase tracking-wider text-xs transition-all backdrop-blur-sm border border-white/10 shadow-lg flex items-center justify-center gap-2"
                 >
                   <Bot className="w-4 h-4" />
                   Consultar o Oráculo
                 </button>
              </div>
           </div>
        </div>
      ) : (
        <>
          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={scrollRef}>
            {messages.map((msg) => (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className="shrink-0 mt-1">
                    {msg.role === 'user' ? (
                      <img src={user?.photoURL || "https://i.pravatar.cc/150"} alt="User" className="w-8 h-8 rounded-full border border-stone-200" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center border border-purple-200 shadow-sm">
                        <Bot className="w-5 h-5 text-purple-700" />
                      </div>
                    )}
                  </div>
                  
                  <div className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    {msg.content && (
                      <div className={`p-4 rounded-3xl ${msg.role === 'user' ? 'bg-stone-900 text-white rounded-tr-none' : 'bg-white border border-stone-200 text-stone-800 rounded-tl-none shadow-sm text-[15px] leading-relaxed'}`}>
                        {msg.content}
                      </div>
                    )}

                    {/* Generative UI Component Rendering */}
                    {msg.uiComponent && msg.uiComponent.type === 'BanhoRecipe' && (
                      <BanhoRecipe 
                        titulo={msg.uiComponent.props.titulo}
                        indicacao={msg.uiComponent.props.indicacao}
                        ingredientes={msg.uiComponent.props.ingredientes}
                        dicaPreparo={msg.uiComponent.props.dicaPreparo}
                        onSave={() => handleSaveToAcervo(msg.id, msg.uiComponent!.props)}
                        isSaved={savedRecipes[msg.id]}
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {isLoading && (
              <div className="flex w-full justify-start">
                <div className="flex gap-3 max-w-[85%]">
                  <div className="shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center border border-purple-200">
                      <Bot className="w-5 h-5 text-purple-700 animate-pulse" />
                    </div>
                  </div>
                  <div className="bg-white border border-stone-200 text-stone-800 p-4 rounded-3xl rounded-tl-none shadow-sm flex gap-1 items-center">
                    <div className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s'}}></div>
                    <div className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-stone-100 pb-36">
            <div className="relative flex items-center gap-2">
              <div className="relative flex-1">
                <input 
                  type="text" 
                  placeholder="Pergunte ao Oráculo..." 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="w-full bg-stone-50 border border-stone-200 rounded-full py-4 pl-5 pr-14 text-sm focus:outline-none focus:border-purple-500 font-medium shadow-sm transition-colors"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-2 p-2.5 bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-md"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
