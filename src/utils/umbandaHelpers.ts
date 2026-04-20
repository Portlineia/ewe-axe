import { Swords, Sparkles, Flame, Leaf, Sun, Cloud, Droplets } from 'lucide-react';

export const getOrixaDoDia = () => {
  const registry = [
    { nome: 'Nàná e Ibeji', theme: 'text-purple-900', bgGrad: 'bg-gradient-to-br from-violet-900 via-purple-800 to-fuchsia-900', icon: Cloud, frase: 'O domingo pertence aos mais velhos e às crianças. Dia de buscar sabedoria, calma, pureza e renovação d\'alma.' },
    { nome: 'Exú e Omolu', theme: 'text-amber-900', bgGrad: 'bg-gradient-to-br from-neutral-900 via-red-950 to-amber-950', icon: Flame, frase: 'A segunda-feira é regida pelos senhores dos caminhos. Perfeito para clareza, descarregos fortes e para desbravar as vias da semana com firmeza.' },
    { nome: 'Ogum', theme: 'text-rose-900', bgGrad: 'bg-gradient-to-br from-slate-900 via-red-900 to-rose-950', icon: Swords, frase: 'A terça-feira vibra na energia do General. Dia propício para buscar coragem, quebra de demandas e força motriz para as batalhas do dia.' },
    { nome: 'Xangô e Iansã', theme: 'text-amber-700', bgGrad: 'bg-gradient-to-br from-amber-900 via-red-900 to-orange-900', icon: Sparkles, frase: 'A quarta-feira flameja com fogo e venta com a força de Oyá. Excelente para pedir justiça, equilibrar pendências e buscar clareza tática.' },
    { nome: 'Oxóssi e Logun Edé', theme: 'text-emerald-900', bgGrad: 'bg-gradient-to-br from-emerald-950 via-green-900 to-teal-900', icon: Leaf, frase: 'A quinta-feira traz a flecha certeira do Caçador. Momento de focar na prosperidade, na busca pelo conhecimento e nas energias das matas.' },
    { nome: 'Oxalá', theme: 'text-slate-800', bgGrad: 'bg-gradient-to-br from-slate-200 via-blue-50 to-white', icon: Sun, textDark: true, frase: 'A sexta-feira é coberta pelo Alá branco do Pai Maior. Dia de silêncio, vestir roupas claras, evitar excessos e buscar a elevação espiritual.' },
    { nome: 'Iemanjá e Oxum', theme: 'text-cyan-900', bgGrad: 'bg-gradient-to-br from-blue-900 via-cyan-800 to-amber-600/60', icon: Droplets, frase: 'O sábado deságua nas Mães d\'Água. Energia de fertilidade, doçura, limpeza emocional profunda e renovação do amor e das relações.' },
  ];
  return registry[new Date().getDay()];
};
