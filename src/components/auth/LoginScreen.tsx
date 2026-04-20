import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { Leaf, Flame, Sparkles, ChevronRight, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function LoginScreen() {
  const { signIn } = useAuth();
  
  // Stages: 0: Splash, 1: Onboarding 1, 2: Onb 2, 3: Onb 3, 4: Login
  const [stage, setStage] = useState(() => {
     // Check if user has seen onboarding before
     const hasSeen = localStorage.getItem('hasSeenEweOnboarding');
     return hasSeen ? 4 : 0; // Skip to login if seen
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  useEffect(() => {
    // Splash screen timer
    if (stage === 0) {
      const timer = setTimeout(() => {
        // Automatically move to the first onboarding step after splash
        setStage(1);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  const handleFinishOnboarding = () => {
     localStorage.setItem('hasSeenEweOnboarding', 'true');
     setStage(4);
  }

  const onboardingSteps = [
    {
      icon: Flame,
      title: "O Congá",
      description: "Firme seus guias, controle suas luzes e não deixe a força do seu altar apagar.",
      color: "from-amber-600 to-red-800"
    },
    {
      icon: Leaf,
      title: "O Herbanário",
      description: "Desvende o segredo das folhas sagradas usando nosso Revelador de Ewé.",
      color: "from-emerald-500 to-emerald-900"
    },
    {
      icon: Sparkles,
      title: "A Corrente",
      description: "Partilhe o seu Axé e receba o Conselho D'Aruanda para iluminar o seu dia.",
      color: "from-purple-500 to-indigo-900"
    }
  ];

  return (
    <div className="flex-1 w-full h-full bg-stone-950 relative flex flex-col items-center justify-center overflow-hidden z-50">
      
      {/* Background Animated Orbs */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1] 
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/20 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/2"
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.1, 0.3, 0.1] 
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-amber-500/20 rounded-full blur-[80px] pointer-events-none translate-y-1/3 -translate-x-1/3"
      />

      <AnimatePresence mode="wait">
        
        {/* SPLASH SCREEN */}
        {stage === 0 && (
          <motion.div 
            key="splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1 } }}
            className="flex flex-col items-center justify-center p-8 text-center h-full w-full absolute inset-0 z-10"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, filter: 'blur(10px)' }}
              animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-900 shadow-[0_0_40px_rgba(16,185,129,0.4)] flex items-center justify-center relative"
            >
              <motion.div 
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full border border-emerald-300/30 ring-4 ring-emerald-900/50"
              />
              <Leaf className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
            >
              <h1 className="text-4xl font-serif font-bold text-white mb-2 tracking-wide">Ewé Axé</h1>
              <p className="text-emerald-400 font-medium tracking-widest uppercase text-xs">Agô.</p>
              <p className="text-stone-400 mt-6 font-serif max-w-[200px] mx-auto text-sm leading-relaxed">
                Seja bem-vindo ao seu espaço de zelo e fé.
              </p>
            </motion.div>
          </motion.div>
        )}

        {/* ONBOARDING */}
        {(stage >= 1 && stage <= 3) && (
          <motion.div 
            key={`onboarding-${stage}`}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40, transition: { duration: 0.4 } }}
            className="flex flex-col items-center justify-center p-8 text-center h-full w-full absolute inset-0 z-10"
          >
            {(() => {
              const step = onboardingSteps[stage - 1];
              const Icon = step.icon;
              return (
                <div className="flex flex-col items-center justify-center w-full max-w-[300px] h-full relative">
                  <div className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
                      <motion.div 
                        initial={{ scale: 0.5, rotate: -20, opacity: 0 }}
                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                        transition={{ 
                          type: "spring", stiffness: 200, damping: 20,
                          duration: 0.6 
                        }}
                        className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${step.color} shadow-2xl flex items-center justify-center mb-10 rotate-3 transform relative`}
                      >
                         <Icon className="w-16 h-16 text-white drop-shadow-md" />
                      </motion.div>
                      
                      <h2 className="text-3xl font-serif font-bold text-white mb-4">{step.title}</h2>
                      <p className="text-stone-400 text-sm leading-relaxed font-medium px-4">
                        {step.description}
                      </p>
                  </div>

                  <div className="w-full pb-10">
                      {/* Dots */}
                      <div className="flex items-center justify-center gap-2 mb-8">
                        {[1, 2, 3].map((idx) => (
                          <div 
                            key={idx} 
                            className={`h-1.5 rounded-full transition-all duration-300 ${stage === idx ? 'w-6 bg-emerald-500' : 'w-1.5 bg-stone-700'}`} 
                          />
                        ))}
                      </div>

                      <button 
                        onClick={() => {
                           if (stage === 3) {
                               handleFinishOnboarding();
                           } else {
                               setStage(stage + 1)
                           }
                        }}
                        className="w-full py-4 rounded-2xl bg-white text-stone-900 font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-[1.02] transition-transform"
                      >
                         {stage === 3 ? 'Pedir Licença' : 'Continuar a jornada'} <ArrowRight className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={handleFinishOnboarding}
                        className="mt-4 text-xs font-bold text-stone-500 uppercase tracking-widest"
                      >
                        Pular
                      </button>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}

        {/* LOGIN SCREEN */}
        {stage === 4 && (
          <motion.div 
            key="login"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-end p-8 text-center h-full w-full absolute inset-0 z-10 pb-16"
          >
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    className="relative w-40 h-40 flex items-center justify-center"
                >
                   {/* Abstract geometric shapes around */}
                   <div className="absolute inset-0 border border-emerald-500/20 rounded-full" />
                   <div className="absolute inset-2 border border-amber-500/20 rounded-full rotate-45" />
                   <div className="absolute inset-4 border border-purple-500/20 rounded-full -rotate-12" />
                </motion.div>
                
                <div className="absolute inset-0 flex items-center justify-center">
                    <Leaf className="w-12 h-12 text-emerald-400" />
                </div>
            </div>

            <h1 className="text-3xl font-serif font-bold text-white mb-3">Pedir Licença</h1>
            <p className="text-stone-400 text-sm mb-6 max-w-[260px]">
              Para firmar o seu Congá, peça licença e entre na corrente.
            </p>

            <TermsCheckbox onAccept={(val) => setTermsAccepted(val)} accepted={termsAccepted} onReadTerms={() => setShowTermsModal(true)} />

            <button 
              onClick={() => {
                  if (termsAccepted) {
                      signIn();
                  } else {
                      alert('Para entrar, você precisa aceitar os termos de uso e privacidade.');
                  }
              }}
              className={`w-full max-w-[300px] flex items-center justify-center gap-3 px-6 py-4 rounded-2xl transition-all font-bold ${termsAccepted ? 'bg-white text-stone-900 shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:scale-[1.02]' : 'bg-stone-800 text-stone-500 cursor-not-allowed'}`}
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className={`w-5 h-5 ${!termsAccepted && 'opacity-50 grayscale'}`} alt="Google logo" />
              Entrar com Google
            </button>
            <p className="mt-8 text-[10px] text-stone-600 uppercase tracking-widest max-w-[200px] text-center">
                A tecnologia servindo ao sagrado
            </p>
          </motion.div>
        )}

      </AnimatePresence>

      {/* TERMS MODAL */}
      <AnimatePresence>
        {showTermsModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
             <motion.div 
               initial={{ y: 50, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               exit={{ y: 50, opacity: 0 }}
               className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-sm max-h-[80vh] flex flex-col overflow-hidden shadow-2xl"
             >
                <div className="p-6 border-b border-stone-800 flex items-center justify-between">
                   <h3 className="text-white font-serif font-bold text-xl">Termos e Privacidade</h3>
                   <button onClick={() => setShowTermsModal(false)} className="p-2 text-stone-500 hover:text-white rounded-full bg-stone-800/50">
                      <X className="w-5 h-5" />
                   </button>
                </div>
                <div className="p-6 overflow-y-auto text-sm text-stone-400 leading-relaxed font-sans flex-1">
                   <p className="mb-4 text-emerald-400 font-bold">1. A Natureza do Espaço</p>
                   <p className="mb-6">O Ewé Axé é um ambiente virtual dedicado ao estudo, reflexão e prática de fundamentos afro-brasileiros. Não substituímos a figura de sacerdotes, pais ou mães de santo, nem o calor do terreiro real.</p>
                   
                   <p className="mb-4 text-emerald-400 font-bold">2. Proteção de Dados Singulares (LGPD)</p>
                   <p className="mb-6">Cuidamos de suas conexões e informações (como seu orixá de cabeça, rituais agendados e fotos do altar) com responsabilidade e fé. Ao utilizar este app, você permite que reservemos estes dados em nossos servidores seguros puramente para o seu próprio uso (backup na nuvem).</p>

                   <p className="mb-4 text-emerald-400 font-bold">3. Inteligência Artificial (O Oráculo)</p>
                   <p className="mb-6">As respostas geradas pelo "Oráculo" são elaboradas através de modelos de inteligência artificial. São concebidas para aconselhamento inspiracional e catalogação de ervas. Nunca substitua tratamentos médicos por chás e banhos aconselhados virtualmente.</p>

                   <p className="mb-4 text-emerald-400 font-bold">4. Respeito Mútuo na Corrente</p>
                   <p>Nossa comunidade e correio interativo ("A Corrente") exigem respeito irrestrito. Intolerância não tem vez sob a luz de Olorum.</p>
                </div>
                <div className="p-4 border-t border-stone-800">
                   <button 
                     onClick={() => {
                        setTermsAccepted(true);
                        setShowTermsModal(false);
                     }}
                     className="w-full bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-emerald-500 transition-colors"
                   >
                       Aceitar os Termos e Voltar
                   </button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TermsCheckbox({ accepted, onAccept, onReadTerms }: { accepted: boolean, onAccept: (v: boolean) => void, onReadTerms?: () => void }) {
  return (
    <div className="flex items-start gap-3 mb-6 max-w-[300px] text-left mx-auto">
      <button 
        onClick={() => onAccept(!accepted)}
        className={`w-5 h-5 shrink-0 rounded flex items-center justify-center mt-0.5 transition-colors border ${accepted ? 'bg-emerald-500 border-emerald-500' : 'bg-transparent border-stone-600'}`}
      >
        {accepted && <span className="text-white text-sm font-bold">✓</span>}
      </button>
      <div className="text-xs text-stone-500 leading-snug">
        Estou ciente e concordo com os{' '}
        <span 
          onClick={onReadTerms} 
          className="text-emerald-500 underline cursor-pointer hover:text-emerald-400"
        >
          Termos de Uso e Política de Privacidade (LGPD)
        </span>{' '}
        do ambiente digital Ewé Axé.
      </div>
    </div>
  );
}
