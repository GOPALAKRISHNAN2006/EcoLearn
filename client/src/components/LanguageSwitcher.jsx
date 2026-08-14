import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const languages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
];

const LanguageSwitcher = ({ variant = 'default', className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');
  const dropdownRef = useRef(null);

  // Load Google Translate script
  useEffect(() => {
    // Check if script already exists
    if (document.getElementById('google-translate-script')) return;

    // Add Google Translate script
    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);

    // Initialize Google Translate
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          includedLanguages: 'en,pa,hi',
          autoDisplay: false,
        },
        'google_translate_element'
      );
    };

    // Add CSS to hide Google Translate bar, branding, and floating icon
    const style = document.createElement('style');
    style.id = 'google-translate-styles';
    style.textContent = `
      .goog-te-banner-frame, .goog-te-balloon-frame { display: none !important; }
      .goog-te-menu-value span:first-child { display: none; }
      .goog-te-gadget-simple { background-color: transparent !important; border: none !important; }
      .goog-te-menu-frame { box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1) !important; }
      #google_translate_element { display: none !important; }
      .skiptranslate { display: none !important; }
      body { top: 0 !important; }
      .goog-te-gadget { font-size: 0 !important; }
      .VIpgJd-ZVi9od-l4eHX-hSRGPd { display: none !important; }
      .VIpgJd-ZVi9od-ORHb-OEVmcd { display: none !important; }
      .VIpgJd-ZVi9od-xl07Ob-lTBxed { display: none !important; }
      #goog-gt-tt { display: none !important; }
      .goog-te-balloon-frame { display: none !important; }
      .goog-text-highlight { background: none !important; box-shadow: none !important; }
      div.skiptranslate { display: none !important; }
      iframe.skiptranslate { display: none !important; }
      body > .skiptranslate { display: none !important; }
      .goog-te-spinner-pos { display: none !important; }
      .VIpgJd-ZVi9od-aZ2wEe-wOHMyf { display: none !important; }
      .VIpgJd-ZVi9od-aZ2wEe-wOHMyf-ti6hGc { display: none !important; }
      [class*="VIpgJd"] { display: none !important; }
    `;
    document.head.appendChild(style);

    // Load saved language preference
    const savedLang = localStorage.getItem('selectedLanguage') || 'en';
    setCurrentLang(savedLang);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (langCode) => {
    setCurrentLang(langCode);
    setIsOpen(false);
    localStorage.setItem('selectedLanguage', langCode);

    const googleTranslateSelect = document.querySelector('.goog-te-combo');
    if (googleTranslateSelect) {
      googleTranslateSelect.value = langCode;
      googleTranslateSelect.dispatchEvent(new Event('change'));
    } else {
      // If Google Translate hasn't loaded yet, wait and retry
      setTimeout(() => {
        const retrySelect = document.querySelector('.goog-te-combo');
        if (retrySelect) {
          retrySelect.value = langCode;
          retrySelect.dispatchEvent(new Event('change'));
        }
      }, 1000);
    }
  };

  // Apply saved language on load
  useEffect(() => {
    const savedLang = localStorage.getItem('selectedLanguage');
    if (savedLang && savedLang !== 'en') {
      setTimeout(() => {
        handleLanguageChange(savedLang);
      }, 1500);
    }
  }, []);

  const getCurrentLanguage = () => {
    return languages.find(l => l.code === currentLang) || languages[0];
  };

  const currentLanguage = getCurrentLanguage();

  if (variant === 'minimal') {
    return (
      <>
        {/* Hidden Google Translate Element */}
        <div id="google_translate_element" style={{ display: 'none' }}></div>
        
        <div className="relative" ref={dropdownRef}>
          <Button 
            variant="ghost" 
            size="sm" 
            type="button"
            className={`flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500 shadow-md ${className}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
          >
            <Globe className="h-4 w-4 text-white" />
            <span className="hidden sm:inline text-sm font-medium text-white">
              {currentLanguage.nativeName}
            </span>
            <ChevronDown className={`h-3 w-3 text-white transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
          
          {isOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleLanguageChange(lang.code);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm cursor-pointer transition-colors ${
                    currentLang === lang.code 
                      ? 'bg-green-50 text-green-700' 
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    <span>{lang.nativeName}</span>
                  </span>
                  {currentLang === lang.code && <Check className="h-4 w-4 text-green-600" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </>
    );
  }

  // Default full variant
  return (
    <>
      {/* Hidden Google Translate Element */}
      <div id="google_translate_element" style={{ display: 'none' }}></div>
      
      <div className="relative" ref={dropdownRef}>
        <Button 
          variant="outline" 
          type="button"
          className={`flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 shadow-md ${className}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
        >
          <Globe className="h-4 w-4 text-white" />
          <span className="font-medium text-white">{currentLanguage.nativeName}</span>
          <ChevronDown className={`h-4 w-4 text-white transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
        
        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-[9999]">
            {languages.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleLanguageChange(lang.code);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 cursor-pointer transition-colors ${
                  currentLang === lang.code 
                    ? 'bg-green-100 text-green-800' 
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className="text-lg">{lang.flag}</span>
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{lang.nativeName}</span>
                    {lang.code !== 'en' && (
                      <span className="text-xs text-gray-500">{lang.name}</span>
                    )}
                  </div>
                </span>
                {currentLang === lang.code && (
                  <Check className="h-5 w-5 text-green-600" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default LanguageSwitcher;
