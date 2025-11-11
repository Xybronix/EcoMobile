// lib/mobile-i18n.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storage } from '../utils/storage';

type Language = 'fr' | 'en';

interface Translations {
  [key: string]: {
    fr: string;
    en: string;
  };
}

const translations: Translations = {
  // Auth
  'auth.login': { fr: 'Connexion', en: 'Login' },
  'auth.register': { fr: 'Inscription', en: 'Sign Up' },
  'auth.email': { fr: 'Email', en: 'Email' },
  'auth.password': { fr: 'Mot de passe', en: 'Password' },
  'auth.firstName': { fr: 'Prénom', en: 'First Name' },
  'auth.lastName': { fr: 'Nom', en: 'Last Name' },
  'auth.phone': { fr: 'Téléphone', en: 'Phone' },
  'auth.forgotPassword': { fr: 'Mot de passe oublié ?', en: 'Forgot password?' },
  'auth.noAccount': { fr: 'Pas de compte ?', en: 'No account?' },
  'auth.hasAccount': { fr: 'Déjà un compte ?', en: 'Already have an account?' },
  'auth.logout': { fr: 'Déconnexion', en: 'Logout' },

  // Navigation
  'nav.home': { fr: 'Accueil', en: 'Home' },
  'nav.map': { fr: 'Carte', en: 'Map' },
  'nav.scan': { fr: 'Scanner', en: 'Scan' },
  'nav.rides': { fr: 'Trajets', en: 'Rides' },
  'nav.profile': { fr: 'Profil', en: 'Profile' },

  // Home
  'home.welcome': { fr: 'Bienvenue', en: 'Welcome' },
  'home.findBike': { fr: 'Trouver un vélo', en: 'Find a Bike' },
  'home.scanQR': { fr: 'Scanner QR', en: 'Scan QR' },
  'home.myRides': { fr: 'Mes trajets', en: 'My Rides' },
  'home.wallet': { fr: 'Portefeuille', en: 'Wallet' },
  'home.balance': { fr: 'Solde', en: 'Balance' },
  'home.topUp': { fr: 'Recharger', en: 'Top Up' },
  'home.recentRides': { fr: 'Trajets récents', en: 'Recent Rides' },
  'home.noRides': { fr: 'Aucun trajet pour le moment', en: 'No rides yet' },

  // Bike Details
  'bike.details': { fr: 'Détails du vélo', en: 'Bike Details' },
  'bike.model': { fr: 'Modèle', en: 'Model' },
  'bike.battery': { fr: 'Batterie', en: 'Battery' },
  'bike.range': { fr: 'Autonomie', en: 'Range' },
  'bike.price': { fr: 'Prix', en: 'Price' },
  'bike.perMinute': { fr: '/min', en: '/min' },
  'bike.features': { fr: 'Caractéristiques', en: 'Features' },
  'bike.getDirections': { fr: 'Itinéraire', en: 'Directions' },

  // Ride
  'ride.inProgress': { fr: 'Trajet en cours', en: 'Ride in Progress' },
  'ride.duration': { fr: 'Durée', en: 'Duration' },
  'ride.distance': { fr: 'Distance', en: 'Distance' },
  'ride.currentCost': { fr: 'Coût actuel', en: 'Current Cost' },
  'ride.endRide': { fr: 'Terminer le trajet', en: 'End Ride' },
  'ride.pauseRide': { fr: 'Mettre en pause', en: 'Pause Ride' },
  'ride.reportIssue': { fr: 'Signaler un problème', en: 'Report Issue' },
  'ride.history': { fr: 'Historique', en: 'History' },
  'ride.completed': { fr: 'Terminé', en: 'Completed' },
  'ride.cancelled': { fr: 'Annulé', en: 'Cancelled' },

  // Wallet
  'wallet.title': { fr: 'Mon portefeuille', en: 'My Wallet' },
  'wallet.balance': { fr: 'Solde disponible', en: 'Available Balance' },
  'wallet.topUp': { fr: 'Recharger', en: 'Top Up' },
  'wallet.history': { fr: 'Historique', en: 'History' },
  'wallet.selectAmount': { fr: 'Sélectionner un montant', en: 'Select Amount' },
  'wallet.customAmount': { fr: 'Montant personnalisé', en: 'Custom Amount' },
  'wallet.paymentMethod': { fr: 'Méthode de paiement', en: 'Payment Method' },
  'wallet.orangeMoney': { fr: 'Orange Money', en: 'Orange Money' },
  'wallet.mobileMoney': { fr: 'Mobile Money', en: 'Mobile Money' },
  'wallet.confirm': { fr: 'Confirmer', en: 'Confirm' },

  // Profile
  'profile.title': { fr: 'Mon profil', en: 'My Profile' },
  'profile.personalInfo': { fr: 'Informations personnelles', en: 'Personal Information' },
  'profile.editProfile': { fr: 'Modifier le profil', en: 'Edit Profile' },
  'profile.language': { fr: 'Langue', en: 'Language' },
  'profile.notifications': { fr: 'Notifications', en: 'Notifications' },
  'profile.help': { fr: 'Aide', en: 'Help' },
  'profile.legal': { fr: 'Mentions légales', en: 'Legal' },
  'profile.version': { fr: 'Version', en: 'Version' },

  // Incident
  'incident.report': { fr: 'Signaler un incident', en: 'Report Incident' },
  'incident.type': { fr: 'Type d\'incident', en: 'Incident Type' },
  'incident.technical': { fr: 'Problème technique', en: 'Technical Issue' },
  'incident.accident': { fr: 'Accident', en: 'Accident' },
  'incident.theft': { fr: 'Vol', en: 'Theft' },
  'incident.damage': { fr: 'Dommage', en: 'Damage' },
  'incident.other': { fr: 'Autre', en: 'Other' },
  'incident.description': { fr: 'Description', en: 'Description' },
  'incident.addPhotos': { fr: 'Ajouter des photos', en: 'Add Photos' },
  'incident.submit': { fr: 'Soumettre', en: 'Submit' },

  // QR Scanner
  'qr.title': { fr: 'Scanner le QR code', en: 'Scan QR Code' },
  'qr.instructions': { fr: 'Pointez vers le QR code sur le vélo', en: 'Point at the QR code on the bike' },
  'qr.manualInput': { fr: 'Saisir le code manuellement', en: 'Enter Code Manually' },
  'qr.bikeCode': { fr: 'Code du vélo', en: 'Bike Code' },

  // Report Issue
  'report.title': { fr: 'Signaler un problème', en: 'Report Issue' },
  'report.description': { fr: 'Décrivez le problème rencontré', en: 'Describe the problem encountered' },
  'report.type': { fr: 'Type de problème', en: 'Issue Type' },
  'report.selectType': { fr: 'Sélectionner le type de problème', en: 'Select issue type' },
  'report.detailedDescription': { fr: 'Description détaillée', en: 'Detailed Description' },
  'report.descriptionPlaceholder': { fr: 'Décrivez le problème en détail...', en: 'Describe the problem in detail...' },
  'report.photos': { fr: 'Photos', en: 'Photos' },
  'report.addPhoto': { fr: 'Ajouter une photo', en: 'Add Photo' },
  'report.submit': { fr: 'Envoyer le signalement', en: 'Submit Report' },
  'report.success': { fr: 'Signalement envoyé avec succès', en: 'Report submitted successfully' },
  
  // Bike Inspection
  'inspection.title.pickup': { fr: 'Inspection avant prise', en: 'Pre-pickup Inspection' },
  'inspection.title.return': { fr: 'Inspection avant retour', en: 'Pre-return Inspection' },
  'inspection.description.pickup': { fr: 'Vérifiez l\'état du vélo avant de commencer votre trajet', en: 'Check bike condition before starting your ride' },
  'inspection.description.return': { fr: 'Vérifiez l\'état du vélo avant de le retourner', en: 'Check bike condition before returning it' },
  'inspection.checkItems': { fr: 'Éléments à vérifier', en: 'Items to Check' },
  'inspection.progress': { fr: 'Progression', en: 'Progress' },
  'inspection.issues': { fr: 'Problèmes identifiés', en: 'Issues Identified' },
  'inspection.notes': { fr: 'Notes', en: 'Notes' },
  'inspection.notesRequired': { fr: 'Des notes sont requises lorsque des problèmes sont identifiés', en: 'Notes required when issues are identified' },
  'inspection.photosOptional': { fr: 'Photos (optionnel)', en: 'Photos (optional)' },
  'inspection.photosRecommended': { fr: 'Photos (recommandé)', en: 'Photos (recommended)' },
  'inspection.startRide': { fr: 'Commencer le trajet', en: 'Start Ride' },
  'inspection.returnBike': { fr: 'Retourner le vélo', en: 'Return Bike' },
  'inspection.confirmPickup': { fr: 'En confirmant, vous déclarez avoir vérifié l\'état du vélo', en: 'By confirming, you declare that you have checked the bike condition' },
  'inspection.confirmReturn': { fr: 'En confirmant, vous déclarez retourner le vélo dans l\'état indiqué', en: 'By confirming, you declare that you are returning the bike in the indicated condition' },
  
  // Chat
  'chat.title': { fr: 'Chat Support', en: 'Support Chat' },
  'chat.support': { fr: 'Support FreeBike', en: 'FreeBike Support' },
  'chat.online': { fr: 'En ligne', en: 'Online' },
  'chat.offline': { fr: 'Hors ligne', en: 'Offline' },
  'chat.typing': { fr: 'En train d\'écrire...', en: 'Typing...' },
  'chat.messagePlaceholder': { fr: 'Écrire un message...', en: 'Write a message...' },
  'chat.secureNotice': { fr: 'Cette conversation est sécurisée et privée', en: 'This conversation is secure and private' },
  'chat.averageResponse': { fr: 'Temps de réponse moyen : 5 minutes', en: 'Average response time: 5 minutes' },
  'chat.information': { fr: 'Informations', en: 'Information' },
  'chat.you': { fr: 'Vous', en: 'You' },
  'chat.justNow': { fr: 'À l\'instant', en: 'Just now' },
  'chat.autoResponse': { fr: 'Merci pour votre message. Un membre de notre équipe vous répondra dans les plus brefs délais.', en: 'Thank you for your message. A member of our team will respond to you as soon as possible.' },

  // Common
  'common.cancel': { fr: 'Annuler', en: 'Cancel' },
  'common.confirm': { fr: 'Confirmer', en: 'Confirm' },
  'common.save': { fr: 'Enregistrer', en: 'Save' },
  'common.close': { fr: 'Fermer', en: 'Close' },
  'common.back': { fr: 'Retour', en: 'Back' },
  'common.next': { fr: 'Suivant', en: 'Next' },
  'common.loading': { fr: 'Chargement...', en: 'Loading...' },
  'common.error': { fr: 'Erreur', en: 'Error' },
  'common.success': { fr: 'Succès', en: 'Success' },
  'common.search': { fr: 'Rechercher', en: 'Search' },
};

interface MobileI18nContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string) => string;
  isLoading: boolean;
}

const STORAGE_KEY = 'freebike_mobile_language';

const MobileI18nContext = createContext<MobileI18nContextType | undefined>(undefined);

export function MobileI18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('fr');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSavedLanguage();
  }, []);

  const loadSavedLanguage = async () => {
    try {
      const savedLanguage = await storage.getItem(STORAGE_KEY);
      if (savedLanguage && (savedLanguage === 'fr' || savedLanguage === 'en')) {
        setLanguageState(savedLanguage as Language);
      }
    } catch (error) {
      console.error('Error loading saved language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      setLanguageState(lang);
      await storage.setItem(STORAGE_KEY, lang);
    } catch (error) {
      console.error('Error saving language:', error);
      // En cas d'erreur de sauvegarde, on garde quand même le changement en mémoire
    }
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <MobileI18nContext.Provider 
      value={{ 
        language, 
        setLanguage, 
        t, 
        isLoading 
      }}
    >
      {children}
    </MobileI18nContext.Provider>
  );
}

export function useMobileI18n() {
  const context = useContext(MobileI18nContext);
  if (context === undefined) {
    throw new Error('useMobileI18n must be used within a MobileI18nProvider');
  }
  return context;
}