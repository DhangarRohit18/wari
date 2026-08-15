'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'mr' | 'hi';

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Branding & Common
    appName: "WariVerse AI",
    appSubtitle: "Wari Pilgrimage Management System",
    welcome: "Welcome",
    signOut: "Sign Out",
    devotionalGreeting: "Jai Hari Vitthal! 🙏",
    language: "Language",
    english: "English",
    marathi: "मराठी (Marathi)",
    hindi: "हिंदी (Hindi)",
    
    // Roles
    varkari: "Varkari Pilgrim",
    volunteer: "Volunteer",
    medicalTeam: "Medical Team",
    police: "Police / Security",
    ngo: "NGO Coordinator",
    serviceProvider: "Service Provider",
    cleaner: "Sanitation Staff",
    admin: "Command Center Admin",

    // Navigation Labels
    home: "Home",
    map: "Pilgrimage Map",
    smartSos: "Emergency SOS",
    wariConnect: "Wari Connect",
    food: "Annadan & Food",
    water: "Water Supply",
    medical: "Medical Camps",
    shelter: "Shelter & Stay",
    toilets: "Sanitation",
    wellness: "Foot Care & Wellness",
    lostFound: "Lost & Found",
    alerts: "Safety Alerts",
    dashboard: "Dashboard",
    sosIncidents: "SOS Incidents",
    helpRequests: "Help Requests",
    lostPersons: "Missing Persons",
    community: "Community Feed",
    crowdReports: "Crowd Density",
    emergencyQueue: "Emergency Queue",
    camps: "Medical Camps",
    ambulance: "Ambulance",
    cases: "Case Records",
    crowdAlerts: "Crowd Alerts",
    routeAlerts: "Route Advisories",
    foodDist: "Food Distribution",
    waterDist: "Water Distribution",
    volunteers: "Volunteers",
    resources: "Resources",
    charging: "Charging Points",
    cleaningLog: "Cleaning Log",
    issues: "Reported Issues",
    commandCenter: "Command Center",
    digitalTwin: "Digital Twin",
    analytics: "Analytics",
    aiPredictions: "AI Predictions",
    users: "User Directory",
    demoControl: "Demo Simulator",

    // Actions & Buttons
    refresh: "Refresh",
    cancel: "Cancel",
    submit: "Submit",
    accept: "Accept",
    resolve: "Mark Resolved",
    details: "View Details",
    filter: "Filter",
    search: "Search",
    openNow: "Open Now",
    closed: "Closed",
    available: "Available",
    urgent: "Urgent",
  },
  mr: {
    // Branding & Common
    appName: "वारीव्हर्स AI",
    appSubtitle: "पंढरपूर वारी व्यवस्थापन प्रणाली",
    welcome: "सुस्वागतम",
    signOut: "बाहेर पडा (Sign Out)",
    devotionalGreeting: "जय हरी विठ्ठल! 🙏",
    language: "भाषा (Language)",
    english: "English",
    marathi: "मराठी",
    hindi: "हिंदी",
    
    // Roles
    varkari: "वारकरी भक्त",
    volunteer: "स्वयंसेवक",
    medicalTeam: "वैद्यकीय पथक",
    police: "पोलीस / सुरक्षा",
    ngo: "एनजीओ समन्वयक",
    serviceProvider: "सेवा पुरवठादार",
    cleaner: "स्वच्छता कर्मचारी",
    admin: "नियंत्रण कक्ष प्रशासक",

    // Navigation Labels
    home: "मुख्य पृष्ठ",
    map: "वारी नकाशा",
    smartSos: "तातडीची मदत (SOS)",
    wariConnect: "वारी कनेक्ट",
    food: "अन्नदान व भोजन",
    water: "पिण्याचे पाणी",
    medical: "वैद्यकीय केंद्र",
    shelter: "निवास व धर्मशाळा",
    toilets: "शौचालय सुविधा",
    wellness: "पाय सेवा व आरोग्य",
    lostFound: "हरवले-सापडले",
    alerts: "सुरक्षा सूचना",
    dashboard: "डॅशबोर्ड",
    sosIncidents: "आणीबाणी घटना",
    helpRequests: "मदतीचे अर्ज",
    lostPersons: "हरवलेल्या व्यक्ती",
    community: "समुदाय संवाद",
    crowdReports: "गर्दी अहवाल",
    emergencyQueue: "आणीबाणी रांग",
    camps: "वैद्यकीय छावण्या",
    ambulance: "रुग्णवाहिका",
    cases: "रुग्ण नोंदी",
    crowdAlerts: "गर्दी इशारे",
    routeAlerts: "मार्ग सूचना",
    foodDist: "अन्न वितरण",
    waterDist: "जल वितरण",
    volunteers: "स्वयंसेवक",
    resources: "साहित्य व संसाधने",
    charging: "चार्जिंग केंद्र",
    cleaningLog: "स्वच्छता नोंदवही",
    issues: "नोंदवलेल्या अडचणी",
    commandCenter: "मुख्य नियंत्रण केंद्र",
    digitalTwin: "डिजिटल नकाशा (Live)",
    analytics: "आकडेवारी विश्लेषण",
    aiPredictions: "AI अंदाज",
    users: "वापरकर्ते सूची",
    demoControl: "डेमो नियंत्रण",

    // Actions & Buttons
    refresh: "ताजे करा",
    cancel: "रद्द करा",
    submit: "सबमिट करा",
    accept: "स्वीकारा",
    resolve: "पूर्ण झाले",
    details: "तपशील पहा",
    filter: "गाळून पहा",
    search: "शोधा",
    openNow: "सुरू आहे",
    closed: "बंद आहे",
    available: "उपलब्ध",
    urgent: "तातडीचे",
  },
  hi: {
    // Branding & Common
    appName: "वारीवर्स AI",
    appSubtitle: "वारकरी यात्रा प्रबंधन प्रणाली",
    welcome: "स्वागत है",
    signOut: "साइन आउट करें",
    devotionalGreeting: "जय हरी विट्ठल! 🙏",
    language: "भाषा",
    english: "English",
    marathi: "मराठी",
    hindi: "हिंदी",
    
    // Roles
    varkari: "वारकरी श्रद्धालु",
    volunteer: "सेवक / स्वयंसेवक",
    medicalTeam: "चिकित्सा टीम",
    police: "पुलिस / सुरक्षा",
    ngo: "एनजीओ समन्वयक",
    serviceProvider: "सेवा प्रदाता",
    cleaner: "स्वच्छता कर्मी",
    admin: "कमांड सेंटर एडमिन",

    // Navigation Labels
    home: "मुख्य पृष्ठ",
    map: "यात्रा मानचित्र",
    smartSos: "आपातकालीन SOS",
    wariConnect: "वारी कनेक्ट",
    food: "अन्नदान व भोजन",
    water: "पेयजल सुविधा",
    medical: "चिकित्सा शिविर",
    shelter: "आवास व विश्राम",
    toilets: "शौचालय सुविधा",
    wellness: "चरण सेवा व स्वास्थ्य",
    lostFound: "खोया-पाया",
    alerts: "सुरक्षा अलर्ट",
    dashboard: "डैशबोर्ड",
    sosIncidents: "आपातकालीन घटनाएं",
    helpRequests: "सहायता अनुरोध",
    lostPersons: "लापता व्यक्ति",
    community: "समुदाय संवाद",
    crowdReports: "भीड़ रिपोर्ट",
    emergencyQueue: "आपातकालीन कतार",
    camps: "चिकित्सा शिविर",
    ambulance: "एम्बुलेंस सेवा",
    cases: "मामलों का विवरण",
    crowdAlerts: "भीड़ चेतावनी",
    routeAlerts: "मार्ग सलाह",
    foodDist: "भोजन वितरण",
    waterDist: "जल वितरण",
    volunteers: "स्वयंसेवक",
    resources: "संसाधन व सामग्री",
    charging: "चार्जिंग प्वाइंट",
    cleaningLog: "सफाई लॉग",
    issues: "दर्ज समस्याएं",
    commandCenter: "कमांड सेंटर",
    digitalTwin: "डिजिटल मानचित्र (Live)",
    analytics: "विश्लेषण व आंकड़े",
    aiPredictions: "AI भविष्यवाणी",
    users: "उपयोगकर्ता सूची",
    demoControl: "डेमो नियंत्रण",

    // Actions & Buttons
    refresh: "रिफ्रेश करें",
    cancel: "रद्द करें",
    submit: "जमा करें",
    accept: "स्वीकार करें",
    resolve: "हल हुआ",
    details: "विवरण देखें",
    filter: "फ़िल्टर",
    search: "खोजें",
    openNow: "खुला है",
    closed: "बंद है",
    available: "उपलब्ध",
    urgent: "अत्यंत आवश्यक",
  }
};

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>('mr'); // Default to Marathi for Varkari audience

  useEffect(() => {
    const saved = localStorage.getItem('wv_lang') as Language;
    if (saved && (saved === 'en' || saved === 'mr' || saved === 'hi')) {
      setLangState(saved);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('wv_lang', newLang);
  };

  const t = (key: string): string => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
