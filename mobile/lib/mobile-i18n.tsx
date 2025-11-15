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
  'nav.notifications': { fr: 'Notifications', en: 'Notifications' },

  // Notifications sections
  'notifications.unread': { fr: 'non lues', en: 'unread' },
  'notifications.markAllRead': { fr: 'Tout marquer lu', en: 'Mark all read' },
  'notifications.new': { fr: 'Nouveau', en: 'New' },
  'notifications.empty.title': { fr: 'Aucune notification', en: 'No notifications' },
  'notifications.empty.description': { fr: 'Vous n\'avez aucune notification pour le moment', en: 'You have no notifications at the moment' },
  'notifications.sections.unread': { fr: 'Non lues', en: 'Unread' },
  'notifications.sections.previous': { fr: 'Précédentes', en: 'Previous' },

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

  // Map & Bikes
  'map.interactive': { fr: 'Carte Interactive', en: 'Interactive Map' },
  'map.bikesAvailable': { fr: '{{count}} vélos disponibles', en: '{{count}} bikes available' },
  'map.searchPlaceholder': { fr: 'Rechercher un vélo...', en: 'Search for a bike...' },
  'map.filters.title': { fr: 'Filtres de recherche', en: 'Search Filters' },
  'map.filters.description': { fr: 'Personnalisez votre recherche de vélos', en: 'Customize your bike search' },
  'map.filters.searchMode': { fr: 'Mode de recherche', en: 'Search Mode' },
  'map.filters.nearby': { fr: 'À proximité', en: 'Nearby' },
  'map.filters.byArea': { fr: 'Par quartier', en: 'By Area' },
  'map.filters.selectArea': { fr: 'Sélectionner un quartier', en: 'Select an Area' },
  'map.filters.chooseArea': { fr: 'Choisir un quartier...', en: 'Choose an area...' },
  'map.filters.searchArea': { fr: 'Rechercher un quartier...', en: 'Search for an area...' },
  'map.filters.noAreaFound': { fr: 'Aucun quartier trouvé', en: 'No area found' },
  'map.filters.maxDistance': { fr: 'Distance maximale', en: 'Maximum Distance' },
  'map.filters.minBattery': { fr: 'Batterie minimale', en: 'Minimum Battery' },
  'map.bikesInArea': { fr: 'Vélos dans {{area}}', en: 'Bikes in {{area}}' },
  'map.nearbyBikes': { fr: 'Vélos à proximité', en: 'Nearby Bikes' },
  'map.available': { fr: 'disponibles', en: 'available' },
  'map.noBikesFound': { fr: 'Aucun vélo trouvé', en: 'No bikes found' },
  'map.adjustFilters': { fr: 'Essayez de modifier vos filtres de recherche', en: 'Try adjusting your search filters' },
  'map.modifyFilters': { fr: 'Modifier les filtres', en: 'Adjust Filters' },
  'map.unlock': { fr: 'Déverrouiller', en: 'Unlock' },
  'map.reserve': { fr: 'Réserver', en: 'Reserve' },
  'map.distance': { fr: 'Distance', en: 'Distance' },
  'map.priceUnavailable': { fr: 'Prix indisponible', en: 'Price unavailable' },

  // Bike Details
  'bike.details': { fr: 'Détails du vélo', en: 'Bike Details' },
  'bike.model': { fr: 'Modèle', en: 'Model' },
  'bike.battery': { fr: 'Batterie', en: 'Battery' },
  'bike.range': { fr: 'Autonomie', en: 'Range' },
  'bike.price': { fr: 'Prix', en: 'Price' },
  'bike.perMinute': { fr: '/min', en: '/min' },
  'bike.features': { fr: 'Caractéristiques', en: 'Features' },
  'bike.getDirections': { fr: 'Itinéraire', en: 'Directions' },
  'bike.location': { fr: 'Localisation', en: 'Location' },
  'bike.unavailable': { fr: 'Ce vélo n\'est pas disponible pour le moment', en: 'This bike is not available at the moment' },
  'bike.unlockConfirm.title': { fr: 'Déverrouiller le vélo ?', en: 'Unlock bike?' },
  'bike.unlockConfirm.description': { fr: 'Vous allez commencer un trajet avec {{bikeName}}. Coût: {{price}} XOF/h', en: 'You\'re about to start a ride with {{bikeName}}. Cost: {{price}} XOF/h' },
  'bike.reserveConfirm.title': { fr: 'Réserver le vélo ?', en: 'Reserve bike?' },
  'bike.reserveConfirm.description': { fr: 'Le vélo {{bikeName}} sera réservé pour vous pendant 15 minutes.', en: '{{bikeName}} will be reserved for you for 15 minutes.' },

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
  'profile.security': { fr: 'Sécurité', en: 'Security' },
  'profile.chatSupport': { fr: 'Chat avec le support', en: 'Chat with support' },
  'profile.emailVerified': { fr: 'Email vérifié', en: 'Email verified' },
  'profile.phoneVerified': { fr: 'Téléphone vérifié', en: 'Phone verified' },
  'profile.yourStats': { fr: 'Vos statistiques', en: 'Your statistics' },
  'profile.helpComingSoon': { fr: 'Page d\'aide bientôt disponible', en: 'Help page coming soon' },
  'profile.legalComingSoon': { fr: 'Page légale bientôt disponible', en: 'Legal page coming soon' },

  // Profile sections
  'profile.sections.account': { fr: 'Compte', en: 'Account' },
  'profile.sections.preferences': { fr: 'Préférences', en: 'Preferences' },
  'profile.sections.support': { fr: 'Support', en: 'Support' },

  // Profile stats
  'profile.stats.rides': { fr: 'Trajets', en: 'Rides' },
  'profile.stats.carbonSaved': { fr: 'CO₂ économisé', en: 'CO₂ saved' },
  'profile.stats.averageRating': { fr: 'Note moyenne', en: 'Average rating' },

  // Logout confirmation
  'profile.logoutConfirm.title': { fr: 'Se déconnecter ?', en: 'Log out?' },
  'profile.logoutConfirm.description': { fr: 'Êtes-vous sûr de vouloir vous déconnecter ?', en: 'Are you sure you want to log out?' },

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
  'qr.scanning': { fr: 'Scan en cours...', en: 'Scanning...' },
  'qr.startScanning': { fr: 'Commencer le scan', en: 'Start Scanning' },
  'qr.scanSuccess': { fr: 'QR Code scanné !', en: 'QR Code scanned!' },
  'qr.bikeFound': { fr: 'Vélo trouvé !', en: 'Bike found!' },
  'qr.invalidCode': { fr: 'Code invalide', en: 'Invalid code' },
  'qr.bikeUnavailable': { fr: 'Ce vélo n\'est pas disponible', en: 'This bike is not available' },
  
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
  'inspection.notesPlaceholder': { fr: 'Décrivez les problèmes identifiés en détail...', en: 'Describe the identified issues in detail...' },
  'inspection.optionalNotes': { fr: 'Ajoutez des notes (optionnel)', en: 'Add notes (optional)' },
  'inspection.photos': { fr: 'Photos', en: 'Photos' },
  'inspection.photosOptional': { fr: 'Photos (optionnel)', en: 'Photos (optional)' },
  'inspection.photosRecommended': { fr: 'Ajoutez des photos des problèmes identifiés', en: 'Add photos of identified issues' },
  'inspection.recommended': { fr: 'recommandé', en: 'recommended' },
  'inspection.addPhoto': { fr: 'Ajouter une photo', en: 'Add Photo' },
  'inspection.maxPhotos': { fr: 'Maximum 5 photos', en: 'Maximum 5 photos' },
  'inspection.photoPermissionDenied': { fr: 'Permission d\'accéder à la galerie refusée', en: 'Gallery access permission denied' },
  'inspection.photoError': { fr: 'Erreur lors de la sélection de l\'image', en: 'Error selecting image' },
  'inspection.completeAllItems': { fr: 'Veuillez inspecter tous les éléments', en: 'Please inspect all items' },
  'inspection.pickupAction': { fr: 'Commencer le trajet', en: 'Start Ride' },
  'inspection.returnAction': { fr: 'Retourner le vélo', en: 'Return Bike' },
  'inspection.confirmPickup': { fr: 'En confirmant, vous déclarez avoir vérifié l\'état du vélo', en: 'By confirming, you declare that you have checked the bike condition' },
  'inspection.confirmReturn': { fr: 'En confirmant, vous déclarez retourner le vélo dans l\'état indiqué', en: 'By confirming, you declare that you are returning the bike in the indicated condition' },
  
  // Report/Incident
  'report.title': { fr: 'Mes signalements', en: 'My Reports' },
  'report.createNew': { fr: 'Nouveau signalement', en: 'New Report' },
  'report.edit': { fr: 'Modifier le signalement', en: 'Edit Report' },
  'report.details': { fr: 'Détails du signalement', en: 'Report Details' },
  'report.noReports': { fr: 'Aucun signalement', en: 'No Reports' },
  'report.noReportsDescription': { fr: 'Vous n\'avez effectué aucun signalement pour le moment', en: 'You haven\'t made any reports yet' },
  'report.type': { fr: 'Type de problème', en: 'Problem Type' },
  'report.selectType': { fr: 'Sélectionner le type de problème', en: 'Select problem type' },
  'report.detailedDescription': { fr: 'Description détaillée', en: 'Detailed Description' },
  'report.descriptionPlaceholder': { fr: 'Décrivez le problème en détail...', en: 'Describe the problem in detail...' },
  'report.photos': { fr: 'Photos (optionnel)', en: 'Photos (optional)' },
  'report.photosDescription': { fr: 'Ajoutez jusqu\'à 5 photos pour illustrer le problème', en: 'Add up to 5 photos to illustrate the problem' },
  'report.photoNumber': { fr: 'Photo {number}', en: 'Photo {number}' },
  'report.addPhoto': { fr: 'Ajouter une photo', en: 'Add Photo' },
  'report.submit': { fr: 'Envoyer le signalement', en: 'Send Report' },
  'report.success': { fr: 'Signalement envoyé avec succès', en: 'Report submitted successfully' },
  'report.fillRequired': { fr: 'Veuillez remplir tous les champs requis', en: 'Please fill in all required fields' },
  'report.minLength': { fr: 'Description trop courte (minimum 20 caractères)', en: 'Description too short (minimum 20 characters)' },
  'report.characterCount': { fr: 'Minimum {min} caractères ({current}/{min})', en: 'Minimum {min} characters ({current}/{min})' },
  'report.maxPhotos': { fr: 'Maximum 5 photos', en: 'Maximum 5 photos' },
  'report.photoPermissionDenied': { fr: 'Permission d\'accéder à la galerie refusée', en: 'Gallery access permission denied' },
  'report.photoError': { fr: 'Erreur lors de la sélection de l\'image', en: 'Error selecting image' },
  'report.processingNotice': { fr: 'Nous traiterons votre signalement dans les plus brefs délais', en: 'We will process your report as soon as possible' },
  'report.infoDescription': { fr: 'Décrivez le problème rencontré avec ce vélo. Votre signalement nous aidera à améliorer la qualité du service.', en: 'Describe the problem encountered with this bike. Your report will help us improve service quality.' },
  'report.createdAt': { fr: 'Créé le', en: 'Created on' },
  'report.description': { fr: 'Description', en: 'Description' },

  // Incident statuses
  'incident.status.open': { fr: 'Ouvert', en: 'Open' },
  'incident.status.in_progress': { fr: 'En cours', en: 'In Progress' },
  'incident.status.resolved': { fr: 'Résolu', en: 'Resolved' },
  'incident.status.closed': { fr: 'Fermé', en: 'Closed' },
  'incident.adminNote': { fr: 'Note administrative', en: 'Admin Note' },
  'incident.updated': { fr: 'Signalement mis à jour', en: 'Report updated' },
  'incident.deleted': { fr: 'Signalement supprimé', en: 'Report deleted' },

  // Chat
  'chat.title': { fr: 'Chat Support', en: 'Support Chat' },
  'chat.support': { fr: 'Support EcoMobile', en: 'EcoMobile Support' },
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
  
  // Chat support info
  'chat.supportInfo.description': { fr: 'Informations sur le support', en: 'Support Information' },
  'chat.supportInfo.service': { fr: 'Service', en: 'Service' },
  'chat.supportInfo.status': { fr: 'Statut', en: 'Status' },
  'chat.supportInfo.responseTime': { fr: 'Temps de réponse', en: 'Response Time' },
  'chat.supportInfo.responseTimeValue': { fr: '~5 minutes', en: '~5 minutes' },
  'chat.supportInfo.availability': { fr: 'Disponibilité', en: 'Availability' },
  'chat.supportInfo.availabilityValue': { fr: 'Lun-Dim 7h-22h', en: 'Mon-Sun 7am-10pm' },

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
  'common.reset': { fr: 'Réinitialiser', en: 'Reset' },
  'common.apply': { fr: 'Appliquer', en: 'Apply' },
  'common.required': { fr: 'Ce champ est requis', en: 'This field is required' },
};

interface MobileI18nContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string) => string;
  isLoading: boolean;
}

const STORAGE_KEY = 'EcoMobile_mobile_language';

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