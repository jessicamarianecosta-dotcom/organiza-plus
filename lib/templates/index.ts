/**
 * Organiza+ — Professional Template System
 * Each profession gets its own identity, copy, icons, and UX flavor.
 */

export type ProfessionTemplate = {
  key: string
  // Matching keywords (lowercase)
  keywords: string[]
  // Hero section
  hero: {
    headline: string      // big emotional headline
    sub: string           // subheadline
    cta: string           // main CTA text
    badge: string         // floating badge text
    emoji: string         // decorative
  }
  // About section
  about: {
    title: string
    intro: string         // opening line of about section
    values: string[]      // 4 bullet values
  }
  // Specialties section
  specialties: {
    title: string
    sub: string
    extras: string[]      // suggested extra specialties to fill grid
  }
  // Booking section
  booking: {
    title: string
    sub: string
    confirmMsg: string
  }
  // Differentials
  differentials: {
    title: string
    sub: string
    items: { icon:string; title:string; desc:string }[]
  }
  // Quote / emotional phrase
  quote: string
  // Footer profession label
  profLabel: string
  // Default specialties if none set
  defaultSpecs: string[]
  // Accent emoji for sections
  icons: { about:string; specs:string; diff:string; book:string }
}

const TEMPLATES: ProfessionTemplate[] = [
  // ── PSICÓLOGO ────────────────────────────────────────────────────────────
  {
    key: 'psychologist',
    keywords: ['psicólogo','psicóloga','psicologia','psicoterapeuta','psicoterapia'],
    hero: {
      headline: 'Um espaço seguro para cuidar da sua saúde emocional.',
      sub: 'Atendimento acolhedor e profissional para ajudar você a viver com mais leveza, autoconhecimento e equilíbrio.',
      cta: 'Agendar consulta',
      badge: 'Psicologia baseada em evidências',
      emoji: '🌿',
    },
    about: {
      title: 'Conheça minha abordagem',
      intro: 'Acredito que cada pessoa tem a capacidade de encontrar seu próprio caminho — meu papel é ser um guia acolhedor nessa jornada.',
      values: [
        'Escuta ativa e sem julgamentos',
        'Terapia baseada em evidências científicas',
        'Espaço seguro e sigiloso',
        'Desenvolvimento emocional contínuo',
      ],
    },
    specialties: {
      title: 'Como posso te ajudar',
      sub: 'Seu emocional merece atenção. Conheça as áreas em que ofereço suporte especializado.',
      extras: ['Autoestima','Burnout','Inteligência Emocional','Desenvolvimento Pessoal','Bem-estar'],
    },
    booking: {
      title: 'Agende sua consulta',
      sub: 'Simples, rápido e sem burocracia. Em menos de 2 minutos.',
      confirmMsg: 'Em breve você receberá uma confirmação. Qualquer dúvida, fale pelo WhatsApp.',
    },
    differentials: {
      title: 'Por que me escolher',
      sub: 'Um espaço seguro para a sua evolução pessoal.',
      items: [
        { icon:'🫶', title:'Atendimento acolhedor', desc:'Escuta genuína, sem julgamentos, onde você pode ser você mesmo.' },
        { icon:'🔬', title:'Baseado em ciência', desc:'Técnicas validadas cientificamente para promover seu bem-estar.' },
        { icon:'💻', title:'Online e presencial', desc:'Flexibilidade para você escolher o formato que funciona melhor.' },
        { icon:'🔒', title:'Ambiente sigiloso', desc:'Total confidencialidade. Tudo que você compartilha fica entre nós.' },
        { icon:'📈', title:'Evolução contínua', desc:'Acompanhamento personalizado com foco no seu crescimento.' },
        { icon:'⏰', title:'Pontualidade e respeito', desc:'Sessões pontuais e totalmente dedicadas a você.' },
      ],
    },
    quote: 'Você não precisa enfrentar tudo sozinho. Cuidar da mente também é prioridade.',
    profLabel: 'Psicólogo(a) Clínico(a)',
    defaultSpecs: ['Ansiedade','Depressão','TCC','Relacionamentos','Autoconhecimento','TDAH','Trauma','Autoestima'],
    icons: { about:'💚', specs:'🧠', diff:'✨', book:'📅' },
  },

  // ── PSIQUIATRA ────────────────────────────────────────────────────────────
  {
    key: 'psychiatrist',
    keywords: ['psiquiatra','psiquiatria'],
    hero: {
      headline: 'Saúde mental com cuidado clínico e humanizado.',
      sub: 'Avaliação especializada, diagnóstico preciso e tratamento integrado para seu bem-estar mental.',
      cta: 'Agendar avaliação',
      badge: 'Psiquiatria clínica especializada',
      emoji: '🏥',
    },
    about: {
      title: 'Cuidado clínico e humanizado',
      intro: 'A saúde mental merece o mesmo rigor científico e cuidado que qualquer área da medicina.',
      values: [
        'Avaliação psiquiátrica completa',
        'Tratamento baseado em evidências',
        'Abordagem integrativa e humanizada',
        'Acompanhamento contínuo e personalizado',
      ],
    },
    specialties: {
      title: 'Áreas de atuação',
      sub: 'Diagnóstico e tratamento especializado para diversas condições de saúde mental.',
      extras: ['Avaliação Diagnóstica','Saúde Mental','Bem-estar','Prevenção'],
    },
    booking: {
      title: 'Agende sua consulta',
      sub: 'Avaliação especializada com agendamento rápido e simples.',
      confirmMsg: 'Confirmação enviada. Traga seus exames anteriores se tiver.',
    },
    differentials: {
      title: 'Por que me escolher',
      sub: 'Cuidado clínico com abordagem humana.',
      items: [
        { icon:'🔬', title:'Diagnóstico preciso', desc:'Avaliação psiquiátrica completa e cuidadosa.' },
        { icon:'💊', title:'Tratamento personalizado', desc:'Plano terapêutico individualizado para cada paciente.' },
        { icon:'🤝', title:'Abordagem humanizada', desc:'Você é ouvido e respeitado em cada consulta.' },
        { icon:'📋', title:'Laudos e relatórios', desc:'Documentação clínica completa quando necessária.' },
        { icon:'🔄', title:'Acompanhamento', desc:'Retornos regulares para ajuste e evolução do tratamento.' },
        { icon:'🌐', title:'Online e presencial', desc:'Consultas no formato que for mais conveniente para você.' },
      ],
    },
    quote: 'Saúde mental é saúde. Tratá-la com seriedade é o primeiro passo para uma vida plena.',
    profLabel: 'Psiquiatra',
    defaultSpecs: ['Depressão','Ansiedade','Transtorno Bipolar','TDAH','TOC','Insônia','Burnout'],
    icons: { about:'🏥', specs:'🧠', diff:'⚕️', book:'📅' },
  },

  // ── NUTRICIONISTA ─────────────────────────────────────────────────────────
  {
    key: 'nutritionist',
    keywords: ['nutricionista','nutrição','nutri'],
    hero: {
      headline: 'Transforme sua relação com a alimentação e conquiste saúde de verdade.',
      sub: 'Orientação nutricional personalizada para você atingir seus objetivos com mais saúde, disposição e prazer.',
      cta: 'Agendar consulta',
      badge: 'Nutrição funcional e integrativa',
      emoji: '🥗',
    },
    about: {
      title: 'Alimentação que transforma',
      intro: 'Acredito que comer bem não é seguir dieta — é criar uma relação saudável e prazerosa com a comida.',
      values: [
        'Planos alimentares individualizados',
        'Sem dietas restritivas e sem sofrimento',
        'Foco em saúde e qualidade de vida',
        'Educação nutricional para o longo prazo',
      ],
    },
    specialties: {
      title: 'Objetivos que atendo',
      sub: 'Da performance esportiva ao equilíbrio metabólico — cada objetivo tem uma estratégia.',
      extras: ['Reeducação Alimentar','Saúde Intestinal','Longevidade','Bem-estar'],
    },
    booking: {
      title: 'Agende sua consulta',
      sub: 'Sua jornada para uma alimentação mais saudável começa aqui.',
      confirmMsg: 'Confirmação enviada! Traga um diário alimentar de 3 dias se possível.',
    },
    differentials: {
      title: 'Por que me escolher',
      sub: 'Resultados reais com prazer e sem restrições desnecessárias.',
      items: [
        { icon:'🥗', title:'Plano personalizado', desc:'Cardápio criado exclusivamente para você, sua rotina e objetivos.' },
        { icon:'🎯', title:'Resultados reais', desc:'Estratégias que funcionam a longo prazo, não dietas temporárias.' },
        { icon:'📊', title:'Acompanhamento mensal', desc:'Ajustes contínuos baseados na sua evolução.' },
        { icon:'💻', title:'Online e presencial', desc:'Consultas no formato que for mais conveniente.' },
        { icon:'🌱', title:'Nutrição integrativa', desc:'Olhar completo para sua saúde, não apenas para o peso.' },
        { icon:'🤝', title:'Suporte contínuo', desc:'Tire dúvidas e receba orientações entre as consultas.' },
      ],
    },
    quote: 'Comer bem não é punição. É o maior ato de autocuidado que você pode ter.',
    profLabel: 'Nutricionista',
    defaultSpecs: ['Emagrecimento','Hipertrofia','Diabetes','Alimentação Esportiva','Nutrição Funcional','Vegetariano/Vegano'],
    icons: { about:'🌱', specs:'🥗', diff:'✨', book:'📅' },
  },

  // ── FISIOTERAPEUTA ────────────────────────────────────────────────────────
  {
    key: 'physiotherapist',
    keywords: ['fisioterapeuta','fisioterapia','fisio'],
    hero: {
      headline: 'Recupere seu movimento e viva sem dor.',
      sub: 'Tratamento especializado e personalizado para você voltar a fazer o que ama com qualidade de vida.',
      cta: 'Agendar avaliação',
      badge: 'Fisioterapia especializada',
      emoji: '💆',
    },
    about: {
      title: 'Movimento é qualidade de vida',
      intro: 'Meu objetivo é devolver o movimento, a funcionalidade e a qualidade de vida de cada paciente.',
      values: [
        'Avaliação cinético-funcional completa',
        'Tratamento individualizado e baseado em evidências',
        'Foco na recuperação e prevenção',
        'Acompanhamento próximo do progresso',
      ],
    },
    specialties: {
      title: 'Especialidades',
      sub: 'Do tratamento de lesões à reabilitação completa — cada caso é único.',
      extras: ['Reabilitação','Prevenção de Lesões','Qualidade de Vida','Equilíbrio Postural'],
    },
    booking: {
      title: 'Agende sua avaliação',
      sub: 'O primeiro passo para recuperar seu movimento começa aqui.',
      confirmMsg: 'Traga exames e laudos médicos anteriores para a primeira consulta.',
    },
    differentials: {
      title: 'Por que me escolher',
      sub: 'Tratamento eficaz para você recuperar movimento e qualidade de vida.',
      items: [
        { icon:'🏋️', title:'Avaliação completa', desc:'Diagnóstico funcional detalhado para planejar o melhor tratamento.' },
        { icon:'⚡', title:'Resultados rápidos', desc:'Protocolos baseados em evidências para recuperação eficiente.' },
        { icon:'🎯', title:'Tratamento personalizado', desc:'Cada sessão adaptada à sua evolução e necessidades.' },
        { icon:'🛡️', title:'Prevenção', desc:'Além de tratar, ensinamos a prevenir novas lesões.' },
        { icon:'💪', title:'Equipe multidisciplinar', desc:'Integração com médicos e outros profissionais de saúde.' },
        { icon:'📈', title:'Evolução monitorada', desc:'Acompanhamento contínuo com métricas claras de progresso.' },
      ],
    },
    quote: 'Seu corpo tem capacidade de se recuperar. Eu estou aqui para ajudá-lo nesse processo.',
    profLabel: 'Fisioterapeuta',
    defaultSpecs: ['Ortopedia','Pós-operatório','Pilates','Neurológica','RPG','Estética'],
    icons: { about:'💪', specs:'🏃', diff:'⚕️', book:'📅' },
  },

  // ── MÉDICO ────────────────────────────────────────────────────────────────
  {
    key: 'medical',
    keywords: ['médico','médica','medicina','clínico','clínica','dermatolog','cardiolog','endocrinolog','ginecolog','ortoped','oftalmolog'],
    hero: {
      headline: 'Cuidado médico de excelência com atenção individualizada.',
      sub: 'Consultas completas, diagnósticos precisos e tratamentos personalizados para a sua saúde.',
      cta: 'Agendar consulta',
      badge: 'Medicina baseada em evidências',
      emoji: '⚕️',
    },
    about: {
      title: 'Medicina com humanização',
      intro: 'Pratico uma medicina que escuta, que se importa e que trata a pessoa — não apenas a doença.',
      values: [
        'Consultas sem pressa, com atenção total',
        'Diagnósticos baseados em evidências científicas',
        'Planos terapêuticos individualizados',
        'Acompanhamento longitudinal da sua saúde',
      ],
    },
    specialties: {
      title: 'Áreas de atendimento',
      sub: 'Cuidado médico completo e especializado.',
      extras: ['Saúde Preventiva','Check-up','Acompanhamento Clínico','Bem-estar'],
    },
    booking: {
      title: 'Agende sua consulta',
      sub: 'Cuidado médico de qualidade ao alcance de um clique.',
      confirmMsg: 'Traga exames anteriores e lista de medicamentos em uso.',
    },
    differentials: {
      title: 'Por que me escolher',
      sub: 'Medicina de excelência com humanização e atenção individualizada.',
      items: [
        { icon:'⚕️', title:'Consultas completas', desc:'Tempo e atenção que você merece em cada consulta.' },
        { icon:'🔬', title:'Diagnóstico preciso', desc:'Avaliação criteriosa com solicitação consciente de exames.' },
        { icon:'📋', title:'Prontuário digital', desc:'Histórico completo e atualizado da sua saúde.' },
        { icon:'🌐', title:'Teleconsulta', desc:'Consultas online para comodidade e praticidade.' },
        { icon:'💊', title:'Prescrição segura', desc:'Medicação adequada com monitoramento cuidadoso.' },
        { icon:'🤝', title:'Relação médico-paciente', desc:'Comunicação clara, transparente e respeitosa.' },
      ],
    },
    quote: 'Saúde não é ausência de doença. É qualidade de vida, prevenção e cuidado contínuo.',
    profLabel: 'Médico(a)',
    defaultSpecs: ['Clínica Geral','Saúde Preventiva','Check-up','Doenças Crônicas'],
    icons: { about:'🏥', specs:'⚕️', diff:'🔬', book:'📅' },
  },

  // ── DENTISTA ──────────────────────────────────────────────────────────────
  {
    key: 'dentist',
    keywords: ['dentista','odontolog','ortodont'],
    hero: {
      headline: 'Sorria com confiança. Cuide do seu sorriso com quem entende.',
      sub: 'Tratamentos odontológicos modernos, confortáveis e personalizados para um sorriso saudável e bonito.',
      cta: 'Agendar consulta',
      badge: 'Odontologia estética e preventiva',
      emoji: '🦷',
    },
    about: {
      title: 'Seu sorriso, nossa missão',
      intro: 'Cada sorriso é único. Meu objetivo é cuidar da sua saúde bucal com técnica, tecnologia e leveza.',
      values: [
        'Ambiente confortável e acolhedor',
        'Técnicas modernas e minimamente invasivas',
        'Planos de tratamento transparentes',
        'Foco na saúde e estética do seu sorriso',
      ],
    },
    specialties: {
      title: 'Tratamentos',
      sub: 'Da prevenção à estética — cuidados completos para o seu sorriso.',
      extras: ['Prevenção','Saúde Bucal','Sorriso Harmonioso','Estética Dental'],
    },
    booking: {
      title: 'Agende sua consulta',
      sub: 'O sorriso dos seus sonhos começa aqui.',
      confirmMsg: 'Confirmação enviada! Evite refeições 30 minutos antes da consulta.',
    },
    differentials: {
      title: 'Por que me escolher',
      sub: 'Tecnologia e cuidado para o sorriso que você sempre quis.',
      items: [
        { icon:'🦷', title:'Tecnologia avançada', desc:'Equipamentos modernos para tratamentos mais precisos e confortáveis.' },
        { icon:'😌', title:'Ambiente confortável', desc:'Atendimento pensado para você se sentir seguro e relaxado.' },
        { icon:'🎨', title:'Estética e função', desc:'Cuidamos tanto da beleza quanto da saúde do seu sorriso.' },
        { icon:'🛡️', title:'Prevenção em primeiro lugar', desc:'Evitar problemas é sempre o melhor tratamento.' },
        { icon:'💳', title:'Planos facilitados', desc:'Parcelamento sem juros para seu tratamento ficar ao alcance.' },
        { icon:'📸', title:'Documentação digital', desc:'Fotos e radiografias para acompanhar sua evolução.' },
      ],
    },
    quote: 'Um sorriso saudável transforma não só o rosto — transforma a autoestima e a vida.',
    profLabel: 'Dentista',
    defaultSpecs: ['Clínica Geral','Estética','Ortodontia','Implante','Endodontia','Periodontia'],
    icons: { about:'😊', specs:'🦷', diff:'✨', book:'📅' },
  },

  // ── ESTETICISTA ───────────────────────────────────────────────────────────
  {
    key: 'aesthetic',
    keywords: ['esteticista','estética','estetica','beauty','beleza','cosmetolog'],
    hero: {
      headline: 'Realce sua beleza natural e cuide de você com sofisticação.',
      sub: 'Tratamentos estéticos personalizados que revelam o melhor de você, com técnica e produtos premium.',
      cta: 'Agendar tratamento',
      badge: 'Estética avançada e personalizada',
      emoji: '🌸',
    },
    about: {
      title: 'Beleza que transforma',
      intro: 'Acredito que beleza é expressão de quem você é. Meu trabalho é realçar o que já existe em você.',
      values: [
        'Protocolos personalizados para cada pele',
        'Produtos e técnicas de alta qualidade',
        'Ambiente exclusivo e acolhedor',
        'Resultados visíveis e duradouros',
      ],
    },
    specialties: {
      title: 'Tratamentos',
      sub: 'Cada tratamento pensado para o que você precisa, com técnica e produtos premium.',
      extras: ['Autoestima','Bem-estar','Relaxamento','Rejuvenescimento'],
    },
    booking: {
      title: 'Agendar tratamento',
      sub: 'Reserve seu horário e comece sua transformação.',
      confirmMsg: 'Confirmação enviada! Venha com pele limpa e sem maquiagem se possível.',
    },
    differentials: {
      title: 'Por que me escolher',
      sub: 'Tratamentos premium que entregam resultados reais com sofisticação.',
      items: [
        { icon:'🌸', title:'Protocolos exclusivos', desc:'Tratamentos personalizados para cada tipo de pele e necessidade.' },
        { icon:'💆', title:'Ambiente relaxante', desc:'Um espaço criado para você descansar e se renovar.' },
        { icon:'✨', title:'Produtos premium', desc:'Linha profissional de alta performance para resultados superiores.' },
        { icon:'📸', title:'Antes e depois', desc:'Documentação fotográfica para você acompanhar sua evolução.' },
        { icon:'🎯', title:'Resultados duradouros', desc:'Foco em melhoras que se mantêm além do tratamento.' },
        { icon:'🤝', title:'Atendimento exclusivo', desc:'Atenção total para cada detalhe da sua experiência.' },
      ],
    },
    quote: 'Cuidar da sua pele é um ato de amor próprio. Você merece se sentir linda todos os dias.',
    profLabel: 'Esteticista',
    defaultSpecs: ['Limpeza de Pele','Facial','Corporal','Drenagem','Massagem','Microagulhamento'],
    icons: { about:'🌸', specs:'✨', diff:'💆', book:'📅' },
  },

  // ── TERAPEUTA ─────────────────────────────────────────────────────────────
  {
    key: 'therapist',
    keywords: ['terapeuta','terapia','reiki','acupuntura','constelação','coaching terapêutico','hipnoterapia','aromaterapia','meditação'],
    hero: {
      headline: 'Reconecte-se com sua essência e encontre equilíbrio.',
      sub: 'Terapias integrativas e holísticas para seu bem-estar físico, emocional e espiritual.',
      cta: 'Agendar sessão',
      badge: 'Terapias holísticas e integrativas',
      emoji: '🧘',
    },
    about: {
      title: 'Uma jornada de cura e equilíbrio',
      intro: 'Acredito no poder da cura natural e no potencial ilimitado que cada ser humano carrega dentro de si.',
      values: [
        'Abordagem integrativa e holística',
        'Respeito à sua individualidade e crenças',
        'Espaço de acolhimento e transformação',
        'Práticas validadas e seguras',
      ],
    },
    specialties: {
      title: 'Práticas terapêuticas',
      sub: 'Encontre a modalidade terapêutica que ressoa com você.',
      extras: ['Autoconhecimento','Equilíbrio Energético','Bem-estar','Espiritualidade'],
    },
    booking: {
      title: 'Agendar sessão',
      sub: 'Seu caminho para o equilíbrio começa com um passo.',
      confirmMsg: 'Vista roupa confortável e venha com mente aberta para a sessão.',
    },
    differentials: {
      title: 'Por que me escolher',
      sub: 'Um espaço sagrado para sua cura e transformação.',
      items: [
        { icon:'🧘', title:'Espaço sagrado', desc:'Ambiente pensado para acolher, curar e transformar.' },
        { icon:'🌿', title:'Abordagem natural', desc:'Práticas que trabalham em harmonia com sua natureza.' },
        { icon:'💫', title:'Visão integrativa', desc:'Cuidado do ser humano em todas as suas dimensões.' },
        { icon:'🤝', title:'Escuta profunda', desc:'Presença total e atenção às suas necessidades.' },
        { icon:'🔄', title:'Processo transformador', desc:'Resultados que vão além da sessão, para a vida toda.' },
        { icon:'🌱', title:'Crescimento pessoal', desc:'Suporte para sua jornada de evolução e autoconhecimento.' },
      ],
    },
    quote: 'Dentro de você existe uma sabedoria que aguarda ser despertada. Estou aqui para facilitar esse encontro.',
    profLabel: 'Terapeuta',
    defaultSpecs: ['Reiki','Acupuntura','Constelação Familiar','Hipnoterapia','Meditação','Aromaterapia'],
    icons: { about:'🌙', specs:'🧘', diff:'🌿', book:'📅' },
  },

  // ── COACH ─────────────────────────────────────────────────────────────────
  {
    key: 'coach',
    keywords: ['coach','coaching','mentor','mentoria'],
    hero: {
      headline: 'Desperte seu potencial e alcance resultados extraordinários.',
      sub: 'Processo de coaching estratégico e personalizado para você atingir seus objetivos com clareza, foco e confiança.',
      cta: 'Agendar sessão estratégica',
      badge: 'Coaching certificado',
      emoji: '🎯',
    },
    about: {
      title: 'Seu potencial, nossa missão',
      intro: 'Coaching não é sobre te dizer o que fazer — é sobre te ajudar a descobrir o que você já sabe e ainda não usa.',
      values: [
        'Metodologia estruturada e comprovada',
        'Foco em resultados concretos e mensuráveis',
        'Desenvolvimento de potencial e autoconfiança',
        'Acompanhamento próximo em cada etapa',
      ],
    },
    specialties: {
      title: 'Áreas de atuação',
      sub: 'Do desenvolvimento pessoal ao sucesso profissional — cada área com estratégia específica.',
      extras: ['Propósito de Vida','Alta Performance','Tomada de Decisão','Liderança'],
    },
    booking: {
      title: 'Agendar sessão',
      sub: 'Sua transformação começa com uma conversa.',
      confirmMsg: 'Prepare-se para uma conversa poderosa. Tenha papel e caneta à mão.',
    },
    differentials: {
      title: 'Por que me escolher',
      sub: 'Resultados reais com metodologia comprovada e suporte dedicado.',
      items: [
        { icon:'🎯', title:'Resultados mensuráveis', desc:'Metas claras, prazos definidos e métricas de evolução.' },
        { icon:'🧠', title:'Metodologia estruturada', desc:'Processo validado que acelera sua transformação.' },
        { icon:'💡', title:'Clareza e foco', desc:'Elimine a confusão e saiba exatamente para onde ir.' },
        { icon:'⚡', title:'Alta performance', desc:'Técnicas avançadas para você operar no seu melhor nível.' },
        { icon:'🤝', title:'Parceria estratégica', desc:'Estou ao seu lado em cada passo da jornada.' },
        { icon:'🏆', title:'Resultados comprovados', desc:'Histórico de clientes que transformaram suas vidas.' },
      ],
    },
    quote: 'Seu futuro não é determinado pelo seu passado. É construído pelas decisões que você toma agora.',
    profLabel: 'Coach',
    defaultSpecs: ['Life Coaching','Carreira','Executive Coaching','Relacionamentos','Financeiro','Liderança'],
    icons: { about:'🎯', specs:'💡', diff:'⚡', book:'📅' },
  },

  // ── EDUCADOR FÍSICO / PERSONAL ───────────────────────────────────────────
  {
    key: 'fitness',
    keywords: ['educador físico','personal trainer','personal','fitness','musculação','academia','treino'],
    hero: {
      headline: 'Transforme seu corpo e sua performance com treino de excelência.',
      sub: 'Personal training especializado para você alcançar seus objetivos com segurança, ciência e resultado real.',
      cta: 'Agendar avaliação',
      badge: 'Personal trainer certificado',
      emoji: '🏃',
    },
    about: {
      title: 'Treinamento que transforma',
      intro: 'Treinar com qualidade vai muito além de levantar peso — é entender seu corpo e respeitar seus limites para evoluir.',
      values: [
        'Avaliação física e funcional completa',
        'Treinos individualizados com periodização científica',
        'Foco em saúde, performance e longevidade',
        'Acompanhamento da evolução com dados reais',
      ],
    },
    specialties: {
      title: 'Objetivos que atendo',
      sub: 'Da perda de peso à performance atlética — cada objetivo tem seu protocolo.',
      extras: ['Saúde e Bem-estar','Longevidade','Performance','Condicionamento Físico'],
    },
    booking: {
      title: 'Agendar avaliação',
      sub: 'Sua transformação física começa com uma avaliação completa.',
      confirmMsg: 'Use roupas confortáveis para a avaliação física. Traga exames médicos se tiver.',
    },
    differentials: {
      title: 'Por que me escolher',
      sub: 'Treinamento com ciência, segurança e resultado garantido.',
      items: [
        { icon:'💪', title:'Avaliação física completa', desc:'Diagnóstico detalhado para um treino eficiente e seguro.' },
        { icon:'📊', title:'Periodização científica', desc:'Treinos planejados com base em ciência do exercício.' },
        { icon:'⚡', title:'Resultados acelerados', desc:'Protocolos que maximizam seus resultados em menos tempo.' },
        { icon:'🛡️', title:'Treino seguro', desc:'Técnica perfeita para prevenir lesões e evoluir com saúde.' },
        { icon:'📈', title:'Evolução monitorada', desc:'Métricas reais para acompanhar cada avanço.' },
        { icon:'🥗', title:'Orientação nutricional', desc:'Suporte alimentar integrado ao seu treino.' },
      ],
    },
    quote: 'Seu corpo é capaz de muito mais do que você imagina. Meu trabalho é mostrar isso a você.',
    profLabel: 'Educador(a) Físico(a)',
    defaultSpecs: ['Musculação','Emagrecimento','Hipertrofia','Funcional','Cardio','Performance'],
    icons: { about:'💪', specs:'🏃', diff:'⚡', book:'📅' },
  },

  // ── GENERIC (fallback) ────────────────────────────────────────────────────
  {
    key: 'generic',
    keywords: [],
    hero: {
      headline: 'Profissional especializado pronto para te atender com excelência.',
      sub: 'Agende sua consulta de forma rápida, simples e sem burocracia. Tecnologia a serviço do seu cuidado.',
      cta: 'Agendar consulta',
      badge: 'Atendimento profissional especializado',
      emoji: '⭐',
    },
    about: {
      title: 'Sobre mim',
      intro: 'Profissional comprometido(a) com a excelência no atendimento e com o bem-estar de cada cliente.',
      values: [
        'Atendimento personalizado e cuidadoso',
        'Experiência e qualificação comprovadas',
        'Foco nos seus objetivos e necessidades',
        'Comunicação clara e transparente',
      ],
    },
    specialties: {
      title: 'Áreas de atuação',
      sub: 'Conheça como posso te ajudar.',
      extras: ['Atendimento Personalizado','Consultoria','Acompanhamento','Desenvolvimento'],
    },
    booking: {
      title: 'Agendar consulta',
      sub: 'Simples, rápido e sem burocracia.',
      confirmMsg: 'Em breve você receberá uma confirmação. Qualquer dúvida, entre em contato.',
    },
    differentials: {
      title: 'Por que me escolher',
      sub: 'Atendimento de qualidade com foco nos seus resultados.',
      items: [
        { icon:'⭐', title:'Excelência no atendimento', desc:'Dedicação total para cada cliente.' },
        { icon:'🎯', title:'Foco em resultados', desc:'Estratégias personalizadas para seus objetivos.' },
        { icon:'🤝', title:'Relação de confiança', desc:'Transparência e respeito em cada interação.' },
        { icon:'📈', title:'Evolução contínua', desc:'Acompanhamento próximo do seu progresso.' },
        { icon:'💻', title:'Online e presencial', desc:'Flexibilidade para o formato mais conveniente.' },
        { icon:'⏰', title:'Pontualidade', desc:'Respeito ao seu tempo em todos os atendimentos.' },
      ],
    },
    quote: 'Excelência não é um ato isolado — é um hábito construído com dedicação e cuidado.',
    profLabel: 'Profissional',
    defaultSpecs: ['Consultoria','Atendimento Personalizado','Acompanhamento'],
    icons: { about:'⭐', specs:'🎯', diff:'✨', book:'📅' },
  },
]

/**
 * Get the template for a given profession string.
 * Matches by keyword (case-insensitive). Falls back to 'generic'.
 */
export function getTemplate(profession: string): ProfessionTemplate {
  if (!profession) return TEMPLATES.find(t => t.key === 'generic')!
  const lower = profession.toLowerCase()
  const match = TEMPLATES.find(t => t.keywords.some(kw => lower.includes(kw)))
  return match || TEMPLATES.find(t => t.key === 'generic')!
}

export { TEMPLATES }
