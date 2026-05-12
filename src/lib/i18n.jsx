import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export const supportedLanguages = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'da', label: 'Dansk', short: 'DA' },
  { code: 'de', label: 'Deutsch', short: 'DE' },
  { code: 'fr', label: 'Français', short: 'FR' },
  { code: 'es', label: 'Español', short: 'ES' },
  { code: 'it', label: 'Italiano', short: 'IT' },
  { code: 'nl', label: 'Nederlands', short: 'NL' },
  { code: 'pt', label: 'Português', short: 'PT' },
  { code: 'pl', label: 'Polski', short: 'PL' },
  { code: 'sv', label: 'Svenska', short: 'SV' },
  { code: 'no', label: 'Norsk', short: 'NO' },
  { code: 'fi', label: 'Suomi', short: 'FI' },
];

const translations = {
  en: {
    'nav.dashboard': 'Dashboard',
    'nav.newAIFace': 'New AIFace',
    'donation.button': 'Support via PayPal',
    'donation.message': 'SnapTrainer is an open source AI platform. All models are free to use; donations are voluntary and help fund operations and development.',
    'dashboard.heroTitle': 'Your personal AI identity with an invisible agent team',
    'dashboard.heroText': 'Build an AIFace that learns your tone, files and preferences - and let SnapTrainer route complex tasks through specialists.',
    'dashboard.create': 'Create AIFace',
    'dashboard.activeIdentity': 'active AI identity',
    'dashboard.activeIdentities': 'active AI identities',
    'dashboard.personalLearning': 'Personal learning',
    'dashboard.personalLearningText': 'Your AIFace uses files, preferences, history and feedback to become more accurate.',
    'dashboard.orchestration': 'Orchestration',
    'dashboard.orchestrationText': 'Complex prompts are decomposed, routed and can run through sequential or parallel specialist lanes.',
    'dashboard.transparentControl': 'Transparent control',
    'dashboard.transparentControlText': 'You can inspect profile, knowledge, feedback, agent steps, quality gates and fallback logic.',
    'empty.title': 'Train your first AI identity',
    'empty.text': 'Create an AIFace that learns your style and can use an invisible team of specialist agents for more complex tasks.',
    'empty.cta': 'Create your first AIFace',
    'model.freeTitle': 'All models are free to use',
    'model.freeText': 'SnapTrainer is open source and funded by voluntary donations - not model paywalls.',
    'model.gptMini': 'Fast and free to use - perfect for daily tasks',
    'model.gemini': 'Fast with web search and multimodal understanding',
    'model.gptAdvanced': 'Stronger reasoning and deeper analysis - free in SnapTrainer',
    'model.claudeSonnet': 'Excellent for writing, code and nuanced answers - free',
    'model.claudeOpus': 'Powerful model for complex, creative tasks - free',
    'create.stepName': 'Name',
    'create.stepNameSub': 'Give your AIFace an identity and role',
    'create.stepModel': 'Choose model',
    'create.stepModelSub': 'Choose freely between all models - everything is free to use',
    'create.stepStyle': 'Style preferences',
    'create.stepStyleSub': 'Tell your AI how it should communicate',
    'create.stepAdvanced': 'Advanced training',
    'create.stepAdvancedSub': 'Optional expert layer for AI/ML specialists',
    'create.stepKnowledge': 'Knowledge sources',
    'create.stepKnowledgeSub': 'Upload files, crawl URLs and add FAQs',
    'create.back': 'Back',
    'create.previous': 'Previous',
    'create.next': 'Next',
    'create.createAIFace': 'Create AIFace',
    'create.creating': 'Creating...',
    'create.uploading': 'Uploading files...',
    'create.nameLabel': 'Name',
    'create.namePlaceholder': "E.g. 'My work assistant', 'Creative writer'...",
    'create.roleLabel': 'Role',
    'create.knowledgeNote': 'You can always add more files, URLs and FAQs later. SnapTrainer uses the material in your AIFace knowledge sweep.',
    'chat.placeholder': 'Write naturally - SnapTrainer handles the prompt work...',
  },
  da: {
    'nav.dashboard': 'Dashboard',
    'nav.newAIFace': 'Nyt AIFace',
    'donation.button': 'Støt via PayPal',
    'donation.message': 'SnapTrainer er en open source AI-platform. Alle modeller er gratis at bruge; donationer er frivillige og hjælper med drift og udvikling.',
    'dashboard.heroTitle': 'Din personlige AI-identitet med et usynligt agentteam',
    'dashboard.heroText': 'Byg et AIFace, der lærer din tone, dine filer og dine præferencer - og lad SnapTrainer route større opgaver gennem specialister.',
    'dashboard.create': 'Opret AIFace',
    'dashboard.activeIdentity': 'aktiv AI-identitet',
    'dashboard.activeIdentities': 'aktive AI-identiteter',
    'dashboard.personalLearning': 'Personlig læring',
    'dashboard.personalLearningText': 'AIFacet bruger filer, præferencer, historik og feedback til at blive mere præcist.',
    'dashboard.orchestration': 'Orkestrering',
    'dashboard.orchestrationText': 'Komplekse prompts opdeles, routes og kan køre i sekventielle eller parallelle specialist-lanes.',
    'dashboard.transparentControl': 'Synlig kontrol',
    'dashboard.transparentControlText': 'Du kan se profil, viden, feedback, agenttrin, quality gates og fallback-logik.',
    'empty.title': 'Træn din første AI-identitet',
    'empty.text': 'Opret et AIFace, der lærer din stil og kan bruge et usynligt team af specialistagenter til mere komplekse opgaver.',
    'empty.cta': 'Opret dit første AIFace',
    'model.freeTitle': 'Alle modeller er free to use',
    'model.freeText': 'SnapTrainer er open source og finansieres af frivillige donationer - ikke model-paywalls.',
    'model.gptMini': 'Hurtig og gratis at bruge - perfekt til daglige opgaver',
    'model.gemini': 'Hurtig med internetsøgning og multimodal forståelse',
    'model.gptAdvanced': 'Stærkere resonering og dybere analyse - gratis i SnapTrainer',
    'model.claudeSonnet': 'Fremragende til skrivning, kode og nuancerede svar - gratis',
    'model.claudeOpus': 'Kraftfuld model til komplekse, kreative opgaver - gratis',
    'create.stepName': 'Navngiv',
    'create.stepNameSub': 'Giv dit AIFace en identitet og rolle',
    'create.stepModel': 'Vælg model',
    'create.stepModelSub': 'Vælg frit mellem alle modeller - alt er gratis at bruge',
    'create.stepStyle': 'Stilpræferencer',
    'create.stepStyleSub': 'Fortæl hvordan din AI skal kommunikere',
    'create.stepAdvanced': 'Avanceret træning',
    'create.stepAdvancedSub': 'Valgfrit ekspertlag for AI/ML-specialister',
    'create.stepKnowledge': 'Knowledge sources',
    'create.stepKnowledgeSub': 'Upload filer, crawl URLer og tilføj FAQer',
    'create.back': 'Tilbage',
    'create.previous': 'Forrige',
    'create.next': 'Næste',
    'create.createAIFace': 'Opret AIFace',
    'create.creating': 'Opretter...',
    'create.uploading': 'Uploader filer...',
    'create.nameLabel': 'Navn',
    'create.namePlaceholder': "F.eks. 'Min arbejdsassistent', 'Kreativ skribent'...",
    'create.roleLabel': 'Rolle',
    'create.knowledgeNote': "Du kan altid tilføje flere filer, URL'er og FAQ'er senere. SnapTrainer bruger materialet i AIFacets knowledge sweep.",
    'chat.placeholder': 'Skriv naturligt - SnapTrainer klarer promptarbejdet...',
  },
};

const europeanFallbacks = {
  de: {
    'nav.dashboard': 'Dashboard',
    'nav.newAIFace': 'Neues AIFace',
    'donation.button': 'Per PayPal unterstützen',
    'dashboard.create': 'AIFace erstellen',
    'empty.cta': 'Erstes AIFace erstellen',
    'create.back': 'Zurück',
    'create.previous': 'Zurück',
    'create.next': 'Weiter',
    'create.createAIFace': 'AIFace erstellen',
    'chat.placeholder': 'Schreib natürlich - SnapTrainer übernimmt die Prompt-Arbeit...',
  },
  fr: {
    'nav.newAIFace': 'Nouvel AIFace',
    'donation.button': 'Soutenir via PayPal',
    'dashboard.create': 'Créer un AIFace',
    'empty.cta': 'Créer votre premier AIFace',
    'create.back': 'Retour',
    'create.previous': 'Précédent',
    'create.next': 'Suivant',
    'create.createAIFace': 'Créer AIFace',
    'chat.placeholder': "Écrivez naturellement - SnapTrainer s'occupe du prompt...",
  },
  es: {
    'nav.newAIFace': 'Nuevo AIFace',
    'donation.button': 'Apoyar con PayPal',
    'dashboard.create': 'Crear AIFace',
    'empty.cta': 'Crear tu primer AIFace',
    'create.back': 'Atrás',
    'create.previous': 'Anterior',
    'create.next': 'Siguiente',
    'create.createAIFace': 'Crear AIFace',
    'chat.placeholder': 'Escribe de forma natural - SnapTrainer gestiona el prompt...',
  },
  it: {
    'nav.newAIFace': 'Nuovo AIFace',
    'donation.button': 'Sostieni via PayPal',
    'dashboard.create': 'Crea AIFace',
    'empty.cta': 'Crea il tuo primo AIFace',
    'create.back': 'Indietro',
    'create.previous': 'Precedente',
    'create.next': 'Avanti',
    'create.createAIFace': 'Crea AIFace',
  },
  nl: {
    'nav.newAIFace': 'Nieuw AIFace',
    'donation.button': 'Steun via PayPal',
    'dashboard.create': 'AIFace maken',
    'empty.cta': 'Maak je eerste AIFace',
    'create.back': 'Terug',
    'create.previous': 'Vorige',
    'create.next': 'Volgende',
    'create.createAIFace': 'AIFace maken',
  },
  pt: {
    'nav.newAIFace': 'Novo AIFace',
    'donation.button': 'Apoiar via PayPal',
    'dashboard.create': 'Criar AIFace',
    'empty.cta': 'Criar o primeiro AIFace',
    'create.back': 'Voltar',
    'create.previous': 'Anterior',
    'create.next': 'Seguinte',
    'create.createAIFace': 'Criar AIFace',
  },
  pl: {
    'nav.newAIFace': 'Nowy AIFace',
    'donation.button': 'Wesprzyj przez PayPal',
    'dashboard.create': 'Utwórz AIFace',
    'empty.cta': 'Utwórz pierwszy AIFace',
    'create.back': 'Wstecz',
    'create.previous': 'Poprzedni',
    'create.next': 'Dalej',
    'create.createAIFace': 'Utwórz AIFace',
  },
  sv: {
    'nav.newAIFace': 'Ny AIFace',
    'donation.button': 'Stöd via PayPal',
    'dashboard.create': 'Skapa AIFace',
    'empty.cta': 'Skapa din första AIFace',
    'create.back': 'Tillbaka',
    'create.previous': 'Föregående',
    'create.next': 'Nästa',
    'create.createAIFace': 'Skapa AIFace',
  },
  no: {
    'nav.newAIFace': 'Ny AIFace',
    'donation.button': 'Støtt via PayPal',
    'dashboard.create': 'Opprett AIFace',
    'empty.cta': 'Opprett ditt første AIFace',
    'create.back': 'Tilbake',
    'create.previous': 'Forrige',
    'create.next': 'Neste',
    'create.createAIFace': 'Opprett AIFace',
  },
  fi: {
    'nav.newAIFace': 'Uusi AIFace',
    'donation.button': 'Tue PayPalilla',
    'dashboard.create': 'Luo AIFace',
    'empty.cta': 'Luo ensimmäinen AIFace',
    'create.back': 'Takaisin',
    'create.previous': 'Edellinen',
    'create.next': 'Seuraava',
    'create.createAIFace': 'Luo AIFace',
  },
};

const dictionaries = Object.fromEntries(
  supportedLanguages.map(({ code }) => [
    code,
    {
      ...translations.en,
      ...(translations[code] || {}),
      ...(europeanFallbacks[code] || {}),
    },
  ])
);

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem('snaptrainer_language') || 'en');

  useEffect(() => {
    localStorage.setItem('snaptrainer_language', language);
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo(() => {
    const t = (key) => dictionaries[language]?.[key] || dictionaries.en[key] || key;
    return { language, setLanguage, t, languages: supportedLanguages };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
