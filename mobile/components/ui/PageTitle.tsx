import { useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { useMobileI18n } from '@/lib/mobile-i18n';
import { useFocusEffect } from '@react-navigation/native';

interface PageTitleProps {
  titleFr: string;
  titleEn: string;
  descriptionFr?: string;
  descriptionEn?: string;
  appNameFr?: string;
  appNameEn?: string;
}

export function PageTitle({ 
  titleFr, 
  titleEn, 
  descriptionFr, 
  descriptionEn,
  appNameFr = "FreeBike",
  appNameEn = "FreeBike"
}: PageTitleProps) {
  const { language } = useMobileI18n();

  const updatePageTitle = useCallback(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const title = language === 'fr' ? titleFr : titleEn;
      const description = language === 'fr' ? descriptionFr : descriptionEn;
      const appName = language === 'fr' ? appNameFr : appNameEn;

      const fullTitle = title ? `${title} | ${appName}` : appName;
      document.title = fullTitle;
      
      updateMeta('description', description || appName);
      
      updateMeta('og:title', fullTitle);
      updateMeta('og:description', description || appName);
      
      document.documentElement.lang = language;
    }
  }, [language, titleFr, titleEn, descriptionFr, descriptionEn, appNameFr, appNameEn]);

  useEffect(() => {
    updatePageTitle();
  }, [updatePageTitle]);

  useFocusEffect(updatePageTitle);

  return null;
}

function updateMeta(name: string, content: string) {
  if (typeof document === 'undefined') return;
  
  let meta = document.querySelector(`meta[name="${name}"]`) || 
             document.querySelector(`meta[property="${name}"]`);
  
  if (!meta) {
    meta = document.createElement('meta');
    if (name.startsWith('og:')) {
      meta.setAttribute('property', name);
    } else {
      meta.setAttribute('name', name);
    }
    document.head.appendChild(meta);
  }
  
  meta.setAttribute('content', content);
}