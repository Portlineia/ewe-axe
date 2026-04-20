import React from 'react';
import { FlaskConical, Leaf } from 'lucide-react';

export interface BanhoRecipeProps {
  id?: string;
  titulo: string;
  indicacao: string;
  ingredientes: string[];
  dicaPreparo: string;
  onSave?: () => void;
  isSaved?: boolean;
}

export function BanhoRecipe({ titulo, indicacao, ingredientes, dicaPreparo, onSave, isSaved }: BanhoRecipeProps) {
  return (
    <div className="bg-emerald-50 rounded-3xl p-5 border-l-4 border-emerald-500 shadow-sm w-full max-w-sm ml-2">
      <div className="flex items-center gap-2 text-emerald-800 mb-3">
        <FlaskConical className="w-5 h-5" />
        <h4 className="font-serif font-bold text-lg">{titulo}</h4>
      </div>
      <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-4 bg-emerald-100/50 inline-block px-2 py-1 rounded">
        Indicado para: {indicacao}
      </p>
      <div className="mb-4">
        <strong className="text-[10px] uppercase text-emerald-900/60 tracking-wider">Ervas & Elementos:</strong>
        <ul className="mt-2 space-y-2">
          {ingredientes.map((ing, i) => (
            <li key={i} className="text-sm font-medium text-emerald-900 flex items-center gap-2.5 bg-emerald-100/40 p-2 rounded-lg">
              <Leaf className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{ing}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="p-3 bg-white/60 rounded-2xl">
        <p className="text-sm text-emerald-900">{dicaPreparo}</p>
      </div>
      {onSave && (
        <button 
          onClick={onSave}
          disabled={isSaved}
          className={`w-full mt-4 p-3 rounded-xl font-bold text-xs uppercase shadow-sm transition-all ${isSaved ? 'bg-emerald-200 text-emerald-700 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
        >
          {isSaved ? 'Salvo no Acervo!' : 'Salvar no Acervo'}
        </button>
      )}
    </div>
  );
}
