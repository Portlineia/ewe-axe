import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Globe, PlusSquare, Heart, MessageCircle, Send, MoreHorizontal, Bookmark, Flame, X, Camera, Plus, Trash2, Edit2, CheckCircle2, Share2 } from 'lucide-react';
import { db, storage } from '../../firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, arrayUnion, arrayRemove, addDoc, deleteDoc, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../auth/AuthProvider';
import { motion, AnimatePresence } from 'motion/react';

// Custom Post Type
interface PostData {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto: string;
  type: 'mensagem' | 'conga' | 'pensamento' | 'ajuda' | 'mironga';
  content: string;
  imageURL?: string;
  axedBy: string[]; // List of user IDs who emanated Axé
  attachedRecipe?: any;
  createdAt: string;
}

interface CommentData {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorPhoto: string;
  content: string;
  createdAt: string;
}

export function ScreenComunidade() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostData[]>(() => {
    const cached = localStorage.getItem('cache_corrente_posts');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  const [isCreating, setIsCreating] = useState(false);
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);

  useEffect(() => {
    if (posts.length > 0) {
      localStorage.setItem('cache_corrente_posts', JSON.stringify(posts));
    }
  }, [posts]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'corrente_posts'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() } as PostData)));
    }, (error) => {
      console.error('Error fetching posts:', error);
    });
    return unsub;
  }, [user]);

  return (
    <div className="flex-1 flex flex-col w-full h-full bg-slate-50 relative z-10 animate-fade-in overflow-hidden">
      
      {/* Header - Instagram Style Light */}
      <header className="px-4 pt-14 pb-3 flex items-center justify-between border-b border-slate-200 bg-white sticky top-0 z-30 shadow-sm">
        <h1 className="text-2xl font-serif text-emerald-950 tracking-wide flex items-center gap-2">
            A Corrente
        </h1>
        <div className="flex items-center gap-4 text-slate-800">
          <button onClick={() => setIsCreating(true)} className="hover:text-emerald-600 transition-colors">
             <PlusSquare className="w-6 h-6" />
          </button>
          <button className="hover:text-emerald-600 transition-colors relative">
             <Heart className="w-6 h-6" />
             <span className="absolute top-0 right-0 w-2 h-2 bg-amber-500 rounded-full border-2 border-white"></span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar pb-32 bg-slate-100">
        
        {/* FEED DE PUBLICAÇÕES */}
        <div className="space-y-4 bg-slate-100 py-2">
          {posts.length === 0 && (
            <div className="text-center py-16 px-8 flex flex-col items-center bg-white border-y border-slate-200">
               <div className="w-16 h-16 border-2 border-slate-200 rounded-full flex items-center justify-center mb-4 bg-slate-50">
                 <Camera className="w-6 h-6 text-slate-400" />
               </div>
               <h3 className="text-slate-900 font-bold mb-2">Sua Corrente está vazia.</h3>
               <p className="text-slate-500 text-sm text-center">Inicie partilhando a luz do seu Congá com os irmãos.</p>
            </div>
          )}
          {posts.map(post => (
             <Post key={post.id} post={post} userId={user?.uid} onOpenComments={() => setActiveCommentsPostId(post.id)} />
          ))}
        </div>
      </main>

      {/* Modal de Criação */}
      <AnimatePresence>
         {isCreating && (
            <PostCreationModal onClose={() => setIsCreating(false)} />
         )}
      </AnimatePresence>

      {/* Modal de Comentários */}
      <AnimatePresence>
         {activeCommentsPostId && (
            <CommentsModal postId={activeCommentsPostId} onClose={() => setActiveCommentsPostId(null)} />
         )}
      </AnimatePresence>

    </div>
  );
}

function Post({ post, userId, onOpenComments }: { post: PostData, userId?: string, onOpenComments: () => void }) {
  const [animatingAxe, setAnimatingAxe] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [imageZoomed, setImageZoomed] = useState(false);
  const optionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (optionsRef.current && !optionsRef.current.contains(event.target as Node)) {
        setShowOptions(false);
      }
    }
    if (showOptions) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showOptions]);

  const hasEmanated = userId ? (post.axedBy || []).includes(userId) : false;
  const axeCount = (post.axedBy || []).length;
  const isAuthor = userId === post.authorId;

  const handleAxeToggle = async () => {
    if (!userId) return;
    
    setAnimatingAxe(true);
    setTimeout(() => setAnimatingAxe(false), 500);

    const postRef = doc(db, 'corrente_posts', post.id);
    try {
       if (hasEmanated) {
          await updateDoc(postRef, { axedBy: arrayRemove(userId) });
       } else {
          await updateDoc(postRef, { axedBy: arrayUnion(userId) });
       }
    } catch (e) {
       console.error("Erro ao emanar axé: ", e);
    }
  };

  const handleDelete = async () => {
     if (!isAuthor) return;
     if (window.confirm("Deseja apagar esta publicação e remover da corrente?")) {
        try {
           await deleteDoc(doc(db, 'corrente_posts', post.id));
        } catch (e) {
           console.error("Erro ao deletar:", e);
           alert("Erro ao excluir. Verifique sua conexão.");
        }
     }
  };

  const handleSaveEdit = async () => {
     if (!isAuthor || !editContent.trim()) return;
     try {
        await updateDoc(doc(db, 'corrente_posts', post.id), {
           content: editContent
        });
        setIsEditing(false);
        setShowOptions(false);
     } catch (e) {
        console.error("Erro ao editar:", e);
        alert("Erro ao salvar.");
     }
  };

  const handleShare = async () => {
    const shareText = `"${post.content}"\n\n- Partilhado por ${post.authorName} na Corrente Ewé Axé.`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Ewé Axé - A Corrente',
          text: shareText,
          url: window.location.origin
        });
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(`${shareText}\n\n${window.location.origin}`);
        alert("Link copiado para a área de transferência!");
      } else {
        alert("A partilha ou cópia não é suportada por este dispositivo neste momento.");
      }
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
    }
  };

  const dt = new Date(post.createdAt);
  const isRecent = (Date.now() - dt.getTime()) < 24 * 60 * 60 * 1000;
  const timeStr = isRecent 
    ? `${Math.max(1, Math.floor((Date.now() - dt.getTime()) / (1000 * 60 * 60)))} HORAS ATRÁS`
    : dt.toLocaleDateString([], { month: 'long', day: 'numeric' }).toUpperCase();

  return (
    <article className="bg-white border-y border-slate-200 pb-4 shadow-sm">
      {/* Post Header */}
      <div className="flex items-center justify-between px-3 py-3 relative">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-emerald-500 p-[2px]">
             <img src={post.authorPhoto} alt="Avatar" className="w-full h-full rounded-full object-cover border-2 border-white" />
          </div>
          <span className="font-bold text-sm text-slate-900">{post.authorName}</span>
        </div>
        
        <div className="relative" ref={optionsRef}>
          <button onClick={() => setShowOptions(!showOptions)} className="text-slate-500 hover:text-slate-700 p-1">
            <MoreHorizontal className="w-5 h-5" />
          </button>
          
          <AnimatePresence>
            {showOptions && (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9, y: 5 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.9 }}
                 className="absolute right-0 top-8 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden"
               >
                  {/* Public Actions */}
                  <button onClick={() => { handleAxeToggle(); setShowOptions(false); }} className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 border-b border-slate-100 font-medium">
                     <Flame className={`w-4 h-4 ${hasEmanated ? 'text-amber-500 fill-amber-500' : 'text-slate-500'}`} /> {hasEmanated ? 'Remover Axé' : 'Emanar Axé'}
                  </button>
                  <button onClick={() => { onOpenComments(); setShowOptions(false); }} className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 border-b border-slate-100 font-medium">
                     <MessageCircle className="w-4 h-4 text-slate-500 -scale-x-100" /> Comentar
                  </button>
                  <button onClick={() => { handleShare(); setShowOptions(false); }} className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 border-b border-slate-100 font-medium">
                     <Share2 className="w-4 h-4 text-slate-500" /> Partilhar
                  </button>
                  
                  {/* Author Actions */}
                  {isAuthor && (
                    <>
                      <button onClick={() => { setIsEditing(true); setShowOptions(false); }} className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 border-b border-slate-100 font-medium">
                         <Edit2 className="w-4 h-4 text-slate-500" /> Editar 
                      </button>
                      <button onClick={handleDelete} className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 font-medium">
                         <Trash2 className="w-4 h-4 text-red-500" /> Apagar
                      </button>
                    </>
                  )}
               </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Post Media Area */}
      <motion.div 
        onTapStart={() => setImageZoomed(true)}
        onTap={() => setImageZoomed(false)}
        onTapCancel={() => setImageZoomed(false)}
        className={`w-full relative cursor-pointer overflow-hidden origin-center ${
           (post.type === 'conga' || post.type === 'mironga') && post.imageURL ? 'aspect-[4/5] sm:aspect-[4/5] bg-slate-100 flex items-center justify-center' : 
           post.type === 'ajuda' ? 'min-h-[200px] bg-gradient-to-br from-rose-50 to-white flex' :
           post.type === 'pensamento' ? 'min-h-[200px] bg-gradient-to-br from-purple-50 to-white flex' :
           'min-h-[300px] bg-gradient-to-br from-emerald-50 to-white flex'
        }`}
      >
         {(post.type === 'conga' || post.type === 'mironga') && post.imageURL ? (
            <motion.img 
              animate={{ scale: imageZoomed ? 1.05 : 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              src={post.imageURL} 
              alt="Mídia partilhada" 
              className={`w-full h-full object-cover absolute inset-0 ${post.type === 'mironga' ? 'scale-105' : ''}`} 
            />
         ) : (
            <motion.div 
               animate={{ scale: imageZoomed ? 1.03 : 1 }}
               transition={{ duration: 0.4, ease: "easeOut" }}
               className="w-full flex-1 flex flex-col justify-center p-6 lg:p-10 relative overflow-hidden"
            >
               <div className={`absolute top-4 right-4 opacity-10 pointer-events-none ${post.type === 'ajuda' ? 'text-rose-800' : post.type === 'pensamento' ? 'text-purple-800' : 'text-emerald-800'}`}>
                  {post.type === 'ajuda' ? <Flame size={120} /> : <Sparkles size={120} />}
               </div>
               
               {isEditing ? (
                  <div className="w-full h-full flex flex-col justify-center items-center relative z-20 px-2 py-4">
                     <textarea 
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full bg-white/90 text-sm md:text-base font-serif text-slate-900 p-4 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none min-h-[200px] text-left shadow-sm mb-4 whitespace-pre-wrap"
                        onClick={(e) => e.stopPropagation()}
                     />
                     <div className="flex gap-3 mt-auto">
                        <button onClick={(e) => { e.stopPropagation(); setIsEditing(false); }} className="px-5 py-2 rounded-full font-bold text-xs bg-slate-200 text-slate-700 hover:bg-slate-300">Cancelar</button>
                        <button onClick={(e) => { e.stopPropagation(); handleSaveEdit(); }} className="px-5 py-2 rounded-full font-bold text-xs bg-emerald-600 text-white shadow-md hover:bg-emerald-700">Salvar</button>
                     </div>
                  </div>
               ) : (
                  <div className="relative z-10 w-full flex flex-col justify-center">
                    {post.type === 'ajuda' && (
                       <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-800 text-[10px] font-bold uppercase tracking-widest rounded-full mb-4 w-max self-start border border-rose-200 shadow-sm"><Flame className="w-3 h-3" /> Pedido de Ajuda</span>
                    )}
                    <p className={`font-serif font-medium break-words drop-shadow-sm whitespace-pre-wrap ${post.type === 'ajuda' ? 'text-rose-950/90' : post.type === 'pensamento' ? 'text-purple-950/90' : 'text-emerald-950/90'} ${post.content.length > 150 ? 'text-[16px] leading-relaxed text-left' : 'text-2xl lg:text-3xl leading-relaxed italic text-center'}`}>
                       {post.content.length <= 150 && post.type !== 'ajuda' ? `"${post.content}"` : post.content}
                    </p>
                  </div>
               )}
            </motion.div>
         )}
      </motion.div>

      {/* Action Bar (Simplified) */}
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-4">
           <motion.button 
             onClick={handleAxeToggle} 
             animate={animatingAxe ? { scale: [1, 1.4, 1] } : { scale: 1 }}
             transition={{ duration: 0.3 }}
             className="relative flex items-center gap-1.5"
           >
             <Flame className={`w-7 h-7 transition-colors ${hasEmanated ? 'text-amber-500 fill-amber-500' : 'text-slate-800 hover:text-slate-600'}`} />
             {axeCount > 0 && <span className="font-bold text-sm text-slate-900">{axeCount}</span>}
           </motion.button>
           <button onClick={onOpenComments}>
             <MessageCircle className="w-6 h-6 text-slate-800 hover:text-slate-600 -scale-x-100 cursor-pointer" />
           </button>
           <button onClick={handleShare}>
             <Share2 className="w-6 h-6 text-slate-800 hover:text-slate-600 cursor-pointer" />
           </button>
        </div>
        <Bookmark className="w-6 h-6 text-slate-800 hover:text-slate-600 cursor-pointer" />
      </div>

      {/* Content & Likes Area (Including Image Caption Edit logic) */}
      <div className="px-3">
         {(post.type === 'conga' || post.type === 'mironga') && (
           <div className="mb-1">
             {post.type === 'mironga' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[8px] font-bold uppercase tracking-widest rounded-full mb-2 w-max self-start border border-emerald-200 mt-1"><Camera className="w-3 h-3" /> Reel de Mironga</span>
             )}
             {isEditing ? (
                 <div className="flex flex-col gap-2 mt-2">
                     <textarea 
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm p-3 rounded-xl focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 min-h-[80px]"
                     />
                     <div className="flex gap-2 justify-end">
                        <button onClick={() => setIsEditing(false)} className="px-4 py-1.5 rounded-full text-xs font-bold bg-slate-200 text-slate-700 hover:bg-slate-300">Cancelar</button>
                        <button onClick={handleSaveEdit} className="px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700">Salvar</button>
                     </div>
                 </div>
             ) : (
                 <p className="text-sm text-slate-900 leading-relaxed mt-1">
                   <span className="font-bold mr-2 text-slate-900">{post.authorName}</span>
                   {post.content}
                 </p>
             )}
           </div>
         )}

         {post.type === 'mensagem' && !isEditing && (
           <p className="text-[13px] text-slate-600 leading-relaxed mb-1 mt-1">
             <span className="font-bold mr-2 text-slate-900">{post.authorName}</span>
             Compartilhou uma mensagem na corrente.
           </p>
         )}

         <p className="text-[10px] font-medium text-slate-500 uppercase mt-1">{timeStr}</p>
      </div>
    </article>
  );
}

// ----------------------------------------------------
// Modal / Drawer de Criação
// ----------------------------------------------------
function PostCreationModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [type, setType] = useState<'mensagem'|'conga'|'pensamento'|'ajuda'|'mironga'>('pensamento');
  const [content, setContent] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressImage = (base64Str: string): Promise<string> => {
     return new Promise((resolve) => {
       const img = new Image();
       img.src = base64Str;
       img.onload = () => {
         const canvas = document.createElement('canvas');
         const MAX_WIDTH = 1080;
         const MAX_HEIGHT = 1080;
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
         resolve(canvas.toDataURL('image/jpeg', 0.8));
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

  const handleSubmit = async () => {
     if (!user) return;
     // Validation
     if ((type === 'conga' || type === 'mironga') && !content.trim() && !photoURL) return;
     if ((type === 'mensagem' || type === 'pensamento' || type === 'ajuda') && !content.trim()) return;

     setIsSubmitting(true);
     try {
       let finalImageURL = null;
       // Upload to Storage if there is an image
       if ((type === 'conga' || type === 'mironga') && photoURL) {
           const response = await fetch(photoURL);
           const blob = await response.blob();
           const storageRef = ref(storage, `users/${user.uid}/corrente/${Date.now()}.jpg`);
           await uploadBytes(storageRef, blob);
           finalImageURL = await getDownloadURL(storageRef);
       }

       await addDoc(collection(db, 'corrente_posts'), {
          authorId: user.uid,
          authorName: user.displayName || 'Irmão de Coruja',
          authorPhoto: user.photoURL || 'https://i.pravatar.cc/150?img=11',
          type,
          content,
          imageURL: finalImageURL,
          axedBy: [], 
          createdAt: new Date().toISOString()
       });
       setIsSubmitting(false);
       setIsSuccess(true);
       setTimeout(() => {
          onClose();
       }, 1200);
     } catch (e) {
       console.error("Erro ao postar:", e);
       alert("Erro na publicação. Tente novamente.");
       setIsSubmitting(false);
     }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-[2px] flex flex-col justify-end"
    >
       <div className="absolute inset-0" onClick={onClose} />
       
       <motion.div 
         initial={{ y: "100%" }}
         animate={{ y: 0 }}
         exit={{ y: "100%" }}
         transition={{ type: "spring", stiffness: 300, damping: 25 }}
         className="w-full bg-white rounded-t-3xl border-t border-slate-200 flex flex-col shadow-2xl relative z-10 max-h-[90vh]"
       >
         <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto my-3" />
         
         {/* Success / Loading Overlays */}
         <AnimatePresence>
            {(isSubmitting || isSuccess) && (
               <motion.div 
                 initial={{ opacity: 0 }} 
                 animate={{ opacity: 1 }} 
                 exit={{ opacity: 0 }} 
                 className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm rounded-t-3xl flex flex-col items-center justify-center p-6"
               >
                 {isSubmitting ? (
                    <div className="flex flex-col items-center gap-4">
                       <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin"></div>
                       <p className="text-sm font-bold text-slate-800 animate-pulse">Emanando para a Corrente...</p>
                    </div>
                 ) : (
                    <motion.div 
                      initial={{ scale: 0.5, opacity: 0 }} 
                      animate={{ scale: 1, opacity: 1 }} 
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="flex flex-col items-center gap-3"
                    >
                       <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center shadow-lg shadow-emerald-100/50">
                          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                       </div>
                       <p className="text-base font-bold text-emerald-950">Publicação Partilhada!</p>
                    </motion.div>
                 )}
               </motion.div>
            )}
         </AnimatePresence>

         <div className="px-4 pb-3 border-b border-slate-100 flex items-center justify-between">
           <button onClick={onClose} disabled={isSubmitting || isSuccess} className="text-slate-500 hover:text-slate-900 transition-colors text-sm font-bold disabled:opacity-50">
              Cancelar
           </button>
           <h2 className="text-base font-bold text-slate-900">Nova Publicação</h2>
           <button 
             onClick={handleSubmit}
             disabled={isSubmitting || isSuccess || 
                ((type === 'conga' || type === 'mironga') && !content.trim() && !photoURL) || 
                ((type === 'mensagem' || type === 'pensamento' || type === 'ajuda') && !content.trim())
             }
             className="text-emerald-600 hover:text-emerald-700 transition-colors text-sm font-bold disabled:text-slate-400 flex items-center gap-2"
           >
              {isSubmitting ? (
                 <><div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" /> ...</>
              ) : isSuccess ? (
                 <><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Feito</>
              ) : 'Partilhar'}
           </button>
         </div>

         <div className="p-4 overflow-y-auto w-full max-w-lg mx-auto flex flex-col gap-6">
            
            {/* Type Selector Tabs */}
            <div className="grid grid-cols-4 gap-1 border-b border-slate-100 pb-4">
               <button 
                 onClick={() => setType('pensamento')}
                 className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border transition-colors ${type === 'pensamento' || type === 'mensagem' ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
               >
                  <Sparkles className="w-5 h-5" /> 
                  <span className="text-[10px] uppercase font-bold tracking-wider">Pensamento</span>
               </button>
               <button 
                 onClick={() => setType('ajuda')}
                 className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border transition-colors ${type === 'ajuda' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
               >
                  <Flame className="w-5 h-5" /> 
                  <span className="text-[10px] uppercase font-bold tracking-wider">SOS Ajuda</span>
               </button>
               <button 
                 onClick={() => setType('mironga')}
                 className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border transition-colors ${type === 'mironga' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
               >
                  <Camera className="w-5 h-5" /> 
                  <span className="text-[10px] uppercase font-bold tracking-wider">Mironga Reel</span>
               </button>
               <button 
                 onClick={() => setType('conga')}
                 className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border transition-colors ${type === 'conga' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
               >
                  <Camera className="w-5 h-5" /> 
                  <span className="text-[10px] uppercase font-bold tracking-wider">Foto Congá</span>
               </button>
            </div>

            {/* Content Body */}
            {type === 'mensagem' || type === 'pensamento' || type === 'ajuda' ? (
               <div className="flex gap-3">
                  <img src={user?.photoURL || ''} className="w-8 h-8 rounded-full border border-slate-200 bg-slate-100" alt="Avatar"/>
                  <textarea 
                     value={content}
                     onChange={(e) => setContent(e.target.value)}
                     placeholder={type === 'ajuda' ? "Irmãos, preciso de um conselho/banho para..." : "Partilhe um conselho, oração ou pensamento..."}
                     className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none min-h-[160px] resize-none font-serif text-lg leading-relaxed mt-1"
                  />
               </div>
            ) : (
               <div className="flex flex-col gap-4">
                  <div className="flex gap-3">
                      <img src={user?.photoURL || ''} className="w-8 h-8 rounded-full border border-slate-200 bg-slate-100" alt="Avatar"/>
                      <textarea 
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          placeholder={type === 'mironga' ? "Partilhe sua técnica, receita ou folha em vídeo/foto vertical..." : "Escreva uma legenda sobre o seu Axé..."}
                          className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none min-h-[60px] resize-none text-sm mt-1"
                      />
                  </div>
                  
                  {!photoURL ? (
                      <div 
                         onClick={() => fileInputRef.current?.click()}
                         className={`w-full ${type === 'mironga' ? 'aspect-[9/16]' : 'aspect-[4/5]'} bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-slate-100 hover:border-emerald-500/50 transition-colors`}
                      >
                         <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                            <Camera className="w-5 h-5 text-slate-400" />
                         </div>
                         <span className="text-slate-500 font-medium text-sm">Toque para selecionar imagem/recorte vertical</span>
                      </div>
                   ) : (
                      <div className={`relative w-full ${type === 'mironga' ? 'aspect-[9/16]' : 'aspect-[4/5]'} rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm`}>
                         <img src={photoURL} alt="Upload Preview" className="w-full h-full object-cover" />
                         <button onClick={() => setPhotoURL('')} className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full text-slate-600 hover:text-slate-900 hover:bg-white transition-colors border border-slate-200 shadow-sm">
                            <X className="w-4 h-4" />
                         </button>
                      </div>
                   )}
                   <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
               </div>
            )}
         </div>
       </motion.div>
    </motion.div>
  );
}

// ----------------------------------------------------
// Modal de Comentários
// ----------------------------------------------------
function CommentsModal({ postId, onClose }: { postId: string, onClose: () => void }) {
   const { user } = useAuth();
   const [comments, setComments] = useState<CommentData[]>([]);
   const [newComment, setNewComment] = useState('');
   const [isSubmitting, setIsSubmitting] = useState(false);
 
   useEffect(() => {
     const q = query(
        collection(db, 'corrente_comments'), 
        where('postId', '==', postId)
     );
     const unsub = onSnapshot(q, (snap) => {
       const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as CommentData));
       docs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
       setComments(docs);
     }, (error) => {
       console.error("Firestore Comments Error:", error);
     });
     return unsub;
   }, [postId]);
 
   const handleSubmit = async () => {
      if (!user || !newComment.trim()) return;
      setIsSubmitting(true);
      try {
        await addDoc(collection(db, 'corrente_comments'), {
           postId: postId,
           authorId: user.uid,
           authorName: user.displayName || 'Irmão de Coruja',
           authorPhoto: user.photoURL || 'https://i.pravatar.cc/150?img=11',
           content: newComment,
           createdAt: new Date().toISOString()
        });
        setNewComment('');
      } catch (e) {
        console.error("Erro ao enviar comentário:", e);
      } finally {
         setIsSubmitting(false);
      }
   };
 
   const handleDelete = async (commentId: string, authorId: string) => {
      if (user?.uid !== authorId) return;
      if (window.confirm("Apagar este comentário?")) {
         await deleteDoc(doc(db, 'corrente_comments', commentId));
      }
   };
 
   return (
     <motion.div 
       initial={{ opacity: 0 }}
       animate={{ opacity: 1 }}
       exit={{ opacity: 0 }}
       className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-[2px] flex flex-col justify-end"
     >
        <div className="absolute inset-0" onClick={onClose} />
        
        <motion.div 
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="w-full h-[70vh] bg-slate-50 flex flex-col rounded-t-3xl border-t border-slate-200 shadow-2xl relative z-10"
        >
          <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto my-3 shrink-0" />
          <div className="px-4 pb-3 border-b border-slate-200 flex justify-center relative shrink-0">
             <h2 className="text-base font-bold text-slate-900">Comentários</h2>
             <button onClick={onClose} className="absolute right-4 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
             </button>
          </div>
 
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
             {comments.length === 0 ? (
                <div className="text-center py-10 opacity-50">
                   <MessageCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                   <p className="text-sm font-medium">Nenhuma mensagem ainda.</p>
                   <p className="text-xs">Seja o primeiro a partilhar o axé!</p>
                </div>
             ) : (
                comments.map(c => (
                   <div key={c.id} className="flex gap-3 relative group">
                      <img src={c.authorPhoto} alt="Avatar" className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200" />
                      <div className="flex-1">
                         <div className="bg-white px-4 py-2.5 rounded-2xl rounded-tl-none shadow-sm border border-slate-100">
                            <span className="font-bold text-sm text-slate-900 mr-2">{c.authorName}</span>
                            <span className="text-sm text-slate-700 break-words">{c.content}</span>
                         </div>
                         <div className="flex gap-4 mt-1 ml-1 text-[10px] uppercase font-bold text-slate-400">
                            <span>{new Date(c.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            {user?.uid === c.authorId && (
                               <button onClick={() => handleDelete(c.id, c.authorId)} className="text-red-400 hover:text-red-500 opacity-0 group-[&:active]:opacity-100 sm:group-hover:opacity-100 transition-opacity">Apagar</button>
                            )}
                         </div>
                      </div>
                   </div>
                ))
             )}
          </div>
 
          <div className="p-3 bg-white border-t border-slate-200 shrink-0 flex gap-2" style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))'}}>
             <img src={user?.photoURL || ''} alt="User" className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200 bg-slate-100" />
             <div className="flex-1 relative flex">
                <input 
                  type="text" 
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  placeholder="Partilhe algo..."
                  className="w-full bg-slate-100 border-none rounded-full py-2.5 pl-4 pr-12 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <button 
                  onClick={handleSubmit}
                  disabled={!newComment.trim() || isSubmitting}
                  className="absolute right-1 top-1 p-1.5 rounded-full bg-emerald-600 text-white disabled:opacity-50 hover:bg-emerald-700 transition flex items-center justify-center"
                >
                   <Send className="w-4 h-4 ml-0.5" />
                </button>
             </div>
          </div>
        </motion.div>
     </motion.div>
   );
 }
