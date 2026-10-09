import React, { createContext, useContext, useState } from 'react';
import { translations } from '../utils/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(localStorage.getItem('wsm_lang') || 'en');

  const toggleLanguage = (selectedLang) => {
    const newLang = selectedLang || (lang === 'en' ? 'ur' : 'en');
    localStorage.setItem('wsm_lang', newLang);
    setLang(newLang);
  };

  const t = (key) => {
    return translations[lang][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
