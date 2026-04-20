export type Temperatura = 'quente' | 'morna' | 'fria';

export interface ErvaSeed {
  nomePopular: string;
  nomeCientifico: string;
  temperatura: Temperatura;
  orixas: string[];
  uso: string;
  descricao: string;
  imagemURL: string;
}

export interface PreparoSeed {
  titulo: string;
  tipo: 'banho' | 'defumacao' | 'amaci';
  ingredientes: string[];
  indicacao: string;
  preparo: string;
}

// Compilação dos Conhecimentos do Acervo PDF (Ednay Melo & Aline Dríade)
export const BOTANICA_ERVAS: ErvaSeed[] = [
  // --- ERVAS FRIAS (ERÓ) ---
  {
    nomePopular: 'Tapete de Oxalá (Boldo)',
    nomeCientifico: 'Plectranthus barbatus',
    temperatura: 'fria',
    orixas: ['Oxalá'],
    uso: 'Banho de coroa, elevação espiritual máxima.',
    descricao: 'Consagrada a Oxalá, esta folha fria (Eró) é o próprio manto da paz. Macerada em água fria, sua seiva aveludada é usada para lavar o Ori (cabeça) oferecendo tranquilidade profunda, reduzindo ansiedade e abrindo o chakra coronário para a mediunidade.',
    imagemURL: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Plectranthus_barbatus.jpg'
  },
  {
    nomePopular: 'Colônia',
    nomeCientifico: 'Alpinia zerumbet',
    temperatura: 'fria',
    orixas: ['Iemanjá'],
    uso: 'Banhos propiciadores de relaxamento do sistema nervoso e paz interior.',
    descricao: 'Erva calmante, equilibradora e repositora de boas energias. Excelente banho para crianças sentindo perturbações e para reequilíbrio dos pensamentos antes de deitar ou após aborrecimentos diários.',
    imagemURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Alpinia_zerumbet_2.jpg'
  },
  {
    nomePopular: 'Macassá',
    nomeCientifico: 'Aeollanthus suaveolens',
    temperatura: 'fria',
    orixas: ['Iansã', 'Oxum', 'Iemanjá'],
    uso: 'Amaci, lavagem de contas estrutural, e banhos para depressão.',
    descricao: 'Também conhecida como Catinga de Mulata. Uma das favas mais perfumadas e sagradas. Folha fria que atrai boas energias, tratando a baixa autoestima e sendo largamente utilizada em banhos de purificação antes de grandes obrigações rituais.',
    imagemURL: 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Starr-060413-7208-Aeollanthus_suaveolens.jpg'
  },
  {
    nomePopular: 'Erva-Cidreira (Melissa)',
    nomeCientifico: 'Melissa officinalis',
    temperatura: 'fria',
    orixas: ['Oxum'],
    uso: 'Proteção, paz, relaxamento do estresse contínuo e calma ao espírito.',
    descricao: 'A abençoada Erva-Cidreira emana a doçura da Orixá Oxum. Serve como forte repouso após desgastes espirituais intensos, trazendo calma instantânea para a aura e sendo o colo reconfortante nas perdas e tristezas profundas.',
    imagemURL: 'https://upload.wikimedia.org/wikipedia/commons/e/ee/Melissa_officinalis_-_K%C3%B6hler%E2%80%93s_Medizinal-Pflanzen-093.jpg'
  },
  {
    nomePopular: 'Malva',
    nomeCientifico: 'Malva sylvestris',
    temperatura: 'fria',
    orixas: ['Oxum'],
    uso: 'Equilíbrio emocional e mediúnico. Evoca acolhimento mental.',
    descricao: 'Embanha-se de Malva aquele que traz feridas na alma ou atravessa vales de depressão. Promove uma atmosfera de paz, acolhimento, e atua muito bem na recuperação do corpo e do espírito pós-catárses energéticas.',
    imagemURL: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Malva_sylvestris_Sturm60.jpg'
  },

  // --- ERVAS MORNAS (MORNAS/EQUILÍBRIO) ---
  {
    nomePopular: 'Manjericão Branco',
    nomeCientifico: 'Ocimum basilicum',
    temperatura: 'morna',
    orixas: ['Oxalá', 'Iemanjá', 'Oxum'],
    uso: 'Adoça a aura, limpa negatividade amena, atrai tranquilidade familiar.',
    descricao: 'O Manjericão é a erva do amor universal e da divindade. Ele não corta o mal agressivamente, mas impregna sua aura com luz, não deixando espaço para as trevas. Sua presença no ambiente acalma ânimos e restaura tecidos perispirituais celestiais.',
    imagemURL: 'https://upload.wikimedia.org/wikipedia/commons/0/07/Ocimum_basilicum_2.jpg'
  },
  {
    nomePopular: 'Alecrim',
    nomeCientifico: 'Rosmarinus officinalis',
    temperatura: 'morna',
    orixas: ['Oxalá', 'Oxóssi', 'Iemanjá'],
    uso: 'Limpeza, reequilíbrio energético, alegria e clareza mental.',
    descricao: 'Reconhecido pelas lavadeiras e guardiões ancestrais como o antídoto da tristeza leve. Estimulante, ajuda contra fadigas espirituais depois de pesados trabalhos e protege o indivíduo contra espíritos obsessores, alegrando a alma.',
    imagemURL: 'https://upload.wikimedia.org/wikipedia/commons/f/f2/Rosemary_01.jpg'
  },
  {
    nomePopular: 'Barba de Velho',
    nomeCientifico: 'Tillandsia usneoides',
    temperatura: 'morna',
    orixas: ['Omulu'],
    uso: 'Transmutação de energias doentemente apegadas, estabilidade.',
    descricao: 'Um fio prateado das matas que transborda a força das transmutações. Usada para curas profundas e alívio de "cargas mortas". Desce como uma teia curativa nos banhos para aqueles que estão com os fluidos e chakras totalmente adoecidos ou trancados.',
    imagemURL: 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Spanish_moss_01.jpg'
  },
  {
    nomePopular: 'Hortelã',
    nomeCientifico: 'Mentha spicata',
    temperatura: 'morna',
    orixas: ['Oxóssi', 'Omulu'],
    uso: 'Reconstituição da aura enfraquecida, atração de saúde e prosperidade.',
    descricao: 'Erva de extrema resiliência olfativa, a Hortelã reabre a circulação fluídica que se encontra presa pelo medo ou demanda de inveja. Ideal para uso pós banhos fortes de proteção ou sal grosso, como reconstrutor.',
    imagemURL: 'https://upload.wikimedia.org/wikipedia/commons/0/01/Mentha_spicata_-_K%C3%B6hler%E2%80%93s_Medizinal-Pflanzen-094.jpg'
  },
  {
    nomePopular: 'Erva Pitanga',
    nomeCientifico: 'Eugenia uniflora',
    temperatura: 'morna',
    orixas: ['Iansã'],
    uso: 'Estimula a coragem, movimento financeiro, e prosperidade vital.',
    descricao: 'Nas folhas maduras da Pitangueira concentra-se o poder dos ventos dinâmicos. Quando macerada, ativa no indivíduo o autodomínio, varrendo a inércia e atraindo fluidos e oportunidades que os Orixás guerreiros concedem a quem tem coragem.',
    imagemURL: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Eugenia_uniflora_A.jpg'
  },

  // --- ERVAS QUENTES (GUNN / DESCARREGO) ---
  {
    nomePopular: 'Arruda',
    nomeCientifico: 'Ruta graveolens',
    temperatura: 'quente',
    orixas: ['Exú', 'Pretos Velhos', 'Oxóssi'],
    uso: 'Descarrego pesado, quebra de inveja severa e afastamento de espíritos rasteiros.',
    descricao: 'Folha agressivamente desobstrutiva (Gunn). A Arruda é a lâmina da mãe natureza e do Preto Velho benzador. Escuda a aura etérica. Um banho quente não deve banhar a coroa/cabeça sem a devida guia e permissão das entidades para não roubar o discernimento.',
    imagemURL: 'https://upload.wikimedia.org/wikipedia/commons/2/23/Ruta_graveolens_001.JPG'
  },
  {
    nomePopular: 'Guiné (Tipi)',
    nomeCientifico: 'Petiveria alliacea',
    temperatura: 'quente',
    orixas: ['Ogum', 'Exú', 'Omulu'],
    uso: 'Lâmina mágica, descarrego brutal contra feitiços.',
    descricao: 'Conhecida por ser cortante contra energias vampirescas. Muito vista nos rituais de guiar defesas, bate-folhas e desintegração de miasmas perigosos aderidos no campo eletromagnético (aura). Pode ser fervida do pescoço para baixo.',
    imagemURL: 'https://upload.wikimedia.org/wikipedia/commons/c/cc/Petiveria_alliacea_-_K%C3%B6hler%E2%80%93s_Medizinal-Pflanzen-235.jpg'
  },
  {
    nomePopular: 'Espada de Ogum',
    nomeCientifico: 'Sansevieria trifasciata',
    temperatura: 'quente',
    orixas: ['Ogum'],
    uso: 'Absorve poluição espiritual severa, purificação ferrenha.',
    descricao: 'A lança vegetal absorve maldições lançadas nos ambientes e também formol ou radiações químicas do próprio ar. Nos banhos, corta-se a folha em formato de cruzes em água fervida, tornando a aura uma armadura impenetrável contra falanges astrais invasoras.',
    imagemURL: 'https://upload.wikimedia.org/wikipedia/commons/0/0c/Sansevieria_trifasciata.jpeg'
  },
  {
    nomePopular: 'Carrapateira (Mamona)',
    nomeCientifico: 'Ricinus communis',
    temperatura: 'quente',
    orixas: ['Exú'],
    uso: 'Banhos e bate-folha contra magias densas e vampiros.',
    descricao: 'Tóxica e estritamente defensiva, as grandes folhas da Carrapateira-roxa são esfregadas (em pontos cego) para absorver rituais de maldições lançadas. Seu banho (do pescoço abaixo) arrasta do fundo d\'alma o desânimo incutido por inveja.',
    imagemURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Ricinus_communis_flower.jpg'
  },
  {
    nomePopular: 'Alfavaca de Caboclo',
    nomeCientifico: 'Ocimum gratissimum',
    temperatura: 'quente',
    orixas: ['Oxóssi'],
    uso: 'Limpeza pesada com reequilíbrio rápido de auto-estima.',
    descricao: 'Uma folha robusta que é comumente encontrada nas mãos de caboclos durante ritos de passe e benzimento. A alfavaca não apenas desconecta amarras maliciosas da sua costa, mas restaura sua coragem espiritual instantaneamente.',
    imagemURL: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Ocimum_gratissimum_flower.jpg'
  },
  {
    nomePopular: 'Eucalipto',
    nomeCientifico: 'Eucalyptus globulus',
    temperatura: 'quente',
    orixas: ['Oxóssi', 'Iansã'],
    uso: 'Poderoso descarrego e alinhamento ambiental.',
    descricao: 'Fervura com cascas ou folhas de formidável odor mentolado, capaz de atordoar obsessores e desencarnados perturbados que rondam uma casa ou uma pessoa, além de possuir funções purificadoras no plano carnal (respiração/anti-micróbios).',
    imagemURL: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Eucalyptus_globulus_11.jpg'
  },
  {
    nomePopular: 'Aroeira',
    nomeCientifico: 'Schinus terebinthifolius',
    temperatura: 'quente',
    orixas: ['Ogum', 'Exú Guardião'],
    uso: 'Afasta obsessores, constrói escudo magnético de defesa.',
    descricao: 'Planta ardente cuja seiva tem poder místico inquestionável. Aplicada pela força de guerreiros, atua cortando energias deletérias pesadas através da pele (nunca na coroa), desinfetando o indivíduo de parasitas do bajo astral.',
    imagemURL: 'https://upload.wikimedia.org/wikipedia/commons/2/23/Brazilian_peppertree_%2850980209426%29.jpg'
  },
  {
    nomePopular: 'Erva Quebra-Pedra',
    nomeCientifico: 'Phyllanthus niruri',
    temperatura: 'quente',
    orixas: ['Xangô', 'Oxóssi'],
    uso: 'Desintegrador espiritual. Esmaga cargas pétreas na vida financeira.',
    descricao: 'Tal qual dissolve calcários nos rins em medicamentos e surge quebrando concretos nos canteiros, sua magia invisível destrói barreiras rochosas, inveja cravada com ferroidez e limpa travamentos no fluxo de abundância e da justiça. ',
    imagemURL: 'https://upload.wikimedia.org/wikipedia/commons/4/41/Phyllanthus_niruri_W_IMG_0006.jpg'
  }
];

export const BOTANICA_PREPAROS: PreparoSeed[] = [
  {
    titulo: 'Descarrego de Ogum',
    tipo: 'banho',
    ingredientes: ['Espada de São Jorge (em rodelas)', 'Aroeira (punhado)', 'Guiné (3 galhos)'],
    indicacao: 'Para quando há extrema sensação de peso, raiva injustificada, dores nas costas e percepção de que suas estradas financeiras estão estagnadas ou amarradas.',
    preparo: 'Ferva 2 litros de água limpa. Pique a Espada de São Jorge fazendo sempre o sinal da cruz, adicione a Aroeira e a Guiné e ferva por 4 minutos. Desligue, abafe e coe (jogando as ervas na natureza). Tome do pescoço para baixo após seu banho higiênico, visualizando correntes sendo quebradas.'
  },
  {
    titulo: 'Banho Harmonizador e Revitalizante',
    tipo: 'banho',
    ingredientes: ['Alecrim (3 galhos)', 'Manjericão (1 punhado)', 'Malva (Folhas frescas)', 'Sálvia (opcional)'],
    indicacao: 'Desânimo, depressão leve, cansaço prolongado e para refazer a aura após um banho de descarrego ou sal grosso. Promove perdão e clareza.',
    preparo: 'Em água recém-fervida (mas fora do fogo), adicione as ervas mornas picadas com as mãos e macere. Abafe e reserve até amornar. Coe, e se desejar adoçar, pode ser levado até a coroa (cabeça). Imagine os raios do sol penetrando os chacras.'
  },
  {
    titulo: 'Banho do Acolhimento e Colo Maternal',
    tipo: 'banho',
    ingredientes: ['Camomila (Flor ou óleo)', 'Macassá (1 fava ou punhado)', 'Erva Cidreira (Melissa)'],
    indicacao: 'Para grande carência afetiva, luto, dor emocional esmaga-coração. Atrai o aconchego angelical e as irradiações de Mãe Oxum ou Iemanjá.',
    preparo: 'Ervas sensíveis não suportam fervuras agressivas. Macere suavemente em água fria ou em infusão rápida. Mentalize estar mergulhando nas águas calmas de uma lagoa limpa e ensolarada. Sinta-se nos braços do Divino, banhando também a coroa.'
  },
  {
    titulo: 'Banho de Abertura de Caminhos e Sorte',
    tipo: 'banho',
    ingredientes: ['7 folhas maduras de Louro', '7 galhos largos de Manjericão Branco', '7 sementes de Girassol ou Alpiste'],
    indicacao: 'Início de pequenos ciclos, buscas de emprego, negócios ou quando você deseja deslumbrar as realidades prósperas escondidas do outro lado dor véu.',
    preparo: 'Ferva as sementes de girassol (ou alpiste) e o louro. Desligue. Deite o manjericão na água descansando. Tome o banho, sentindo uma imensa luz amarela transbordando pela vida. A esperança floresce.'
  },
  {
    titulo: 'Defumação Sagrada Ancestral (Macaia)',
    tipo: 'defumacao',
    ingredientes: ['Guiné SECA', 'Arruda SECA', 'Cascas de Alho', 'Alecrim SECO (sobreposto)'],
    indicacao: 'Expulsar e limpar o ambiente fático ou doméstico de sombras, lamentos aprisionados, dores persistentes nos convivas do lar e desavenças.',
    preparo: 'Utilize um turíbulo ou alguidar de cerâmica com carvão no fundo. Com o carbono em brasa, jogue as ervas QUENTES (Guiné, Alho, Arruda). Caminhe do fundo para a porta, cantando a limpeza. Finalize espalhando folhas de Alecrim sobre a porta, selando pacíficamente.'
  }
];
