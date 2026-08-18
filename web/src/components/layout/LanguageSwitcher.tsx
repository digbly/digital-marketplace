import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { supportedLanguages } from '../../i18n';

interface LanguageSwitcherProps {
  variant?: 'navbar' | 'compact' | 'drawer';
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ variant = 'navbar' }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Normalize language code (e.g. 'en-US' -> 'en')
  const currentLngCode = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0];
  const currentLanguage =
    supportedLanguages.find((l) => l.code === currentLngCode) || supportedLanguages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
    const segments = location.pathname.split('/');
    if (segments[1] && supportedLanguages.some((l) => l.code === segments[1])) {
      segments[1] = code;
      navigate(segments.join('/') + location.search + location.hash);
    } else {
      navigate(`/${code}${location.pathname}${location.search}${location.hash}`);
    }
    setIsOpen(false);
  };

  if (variant === 'compact') {
    return (
      <div className="relative inline-block text-left" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-md bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
          title={t('languages.changeLanguage')}
        >
          <span className="text-sm leading-none">{currentLanguage.flag}</span>
          <span className="uppercase text-[11px] font-semibold">{currentLanguage.code}</span>
          <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-1.5 w-40 rounded-lg bg-slate-900 border border-slate-700 shadow-xl shadow-black/50 py-1 z-50 animate-in fade-in zoom-in-95">
            <div className="px-3 py-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase border-b border-slate-800 mb-1">
              {t('languages.selectLanguage')}
            </div>
            {supportedLanguages.map((lng) => {
              const isSelected = lng.code === currentLngCode;
              return (
                <button
                  key={lng.code}
                  type="button"
                  onClick={() => handleLanguageChange(lng.code)}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600/20 text-indigo-300 font-medium'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm leading-none">{lng.flag}</span>
                    <span>{t(`languages.${lng.code}`, lng.label)}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800/90 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 hover:border-slate-600 transition-all cursor-pointer shadow-sm"
        aria-expanded={isOpen}
        aria-haspopup="true"
        title={t('languages.changeLanguage')}
      >
        <Globe className="w-3.5 h-3.5 text-indigo-400" />
        <span className="text-sm leading-none">{currentLanguage.flag}</span>
        <span className="font-medium text-slate-200 hidden sm:inline">{t(`languages.${currentLanguage.code}`, currentLanguage.label)}</span>
        <span className="font-medium text-slate-200 sm:hidden uppercase">{currentLanguage.code}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-900/95 backdrop-blur-md border border-slate-700/80 shadow-2xl shadow-black/70 py-1.5 z-50 divide-y divide-slate-800 animate-in fade-in zoom-in-95">
          <div className="px-3 py-1.5 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
            {t('languages.selectLanguage')}
          </div>
          <div className="py-1">
            {supportedLanguages.map((lng) => {
              const isSelected = lng.code === currentLngCode;
              return (
                <button
                  key={lng.code}
                  type="button"
                  onClick={() => handleLanguageChange(lng.code)}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600/20 text-indigo-300 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base leading-none">{lng.flag}</span>
                    <span>{t(`languages.${lng.code}`, lng.label)}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
