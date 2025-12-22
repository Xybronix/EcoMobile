/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/display-name */
import React, { useRef, useImperativeHandle, forwardRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, Platform } from 'react-native';

interface Bike {
  id: string;
  latitude: number | null;
  longitude: number | null;
  batteryLevel: number;
  code: string;
  distance?: number;
  model: string;
}

interface OSMMapProps {
  userLocation?: { lat: number; lng: number } | null;
  bikes: Bike[];
  radius: number;
  onBikePress?: (bike: Bike) => void;
  onMapReady?: () => void;
  colorScheme: 'light' | 'dark';
}

export interface OSMMapRef {
  centerOnUser: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  toggleMapStyle: () => void;
}

export const OSMMap = forwardRef<OSMMapRef, OSMMapProps>(({
  userLocation,
  bikes,
  radius,
  onBikePress,
  onMapReady,
  colorScheme
}, ref) => {
  const webViewRef = useRef<any>(null);
  const mapContainerRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);
  const isWeb = Platform.OS === 'web';
  
  // Coordonnées par défaut (Douala, Cameroun)
  const center = userLocation || { lat: 4.0511, lng: 9.7679 };
  
  // Filtrer les vélos avec coordonnées valides
  const bikesWithCoords = bikes.filter(b => 
    b.latitude !== null && 
    b.longitude !== null &&
    !isNaN(b.latitude) && 
    !isNaN(b.longitude)
  );

  // Fonctions pour le web (Leaflet direct)
  const centerOnUserWeb = useCallback(() => {
    if (mapInstanceRef.current && leafletRef.current && center) {
      mapInstanceRef.current.setView([center.lat, center.lng], mapInstanceRef.current.getZoom(), {
        animate: true
      });
    }
  }, [center]);

  const zoomInWeb = useCallback(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn(0.5, { animate: true });
    }
  }, []);

  const zoomOutWeb = useCallback(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut(0.5, { animate: true });
    }
  }, []);

  const toggleMapStyleWeb = useCallback(() => {
    if (mapInstanceRef.current && leafletRef.current) {
      const currentTileLayer = mapInstanceRef.current._baseLayer;
      const mapStyles = [
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      ];
      
      const currentUrl = currentTileLayer?._url || '';
      let currentIndex = 0;
      
      if (currentUrl.includes('openstreetmap')) currentIndex = 0;
      else if (currentUrl.includes('arcgisonline')) currentIndex = 1;
      else if (currentUrl.includes('cartocdn.com/dark')) currentIndex = 2;
      
      const nextIndex = (currentIndex + 1) % mapStyles.length;
      
      const newTileLayer = leafletRef.current.tileLayer(mapStyles[nextIndex], {
        attribution: nextIndex === 0 ? '© StreetMap' : 
                     nextIndex === 1 ? '© Esri' : '© CartoDB',
        maxZoom: 19,
        detectRetina: true
      });
      
      currentTileLayer.remove();
      mapInstanceRef.current._baseLayer = newTileLayer.addTo(mapInstanceRef.current);
    }
  }, []);

  // Fonctions pour mobile (WebView)
  const centerOnUserMobile = useCallback(() => {
    console.log('[RN] Tentative centerOnUser');
    if (webViewRef.current && webViewRef.current.postMessage) {
      webViewRef.current.postMessage(JSON.stringify({
        type: 'centerOnUser'
      }));
    }
  }, []);

  const zoomInMobile = useCallback(() => {
    console.log('[RN] Tentative zoomIn');
    if (webViewRef.current && webViewRef.current.postMessage) {
      webViewRef.current.postMessage(JSON.stringify({
        type: 'zoomIn'
      }));
    }
  }, []);

  const zoomOutMobile = useCallback(() => {
    console.log('[RN] Tentative zoomOut');
    if (webViewRef.current && webViewRef.current.postMessage) {
      webViewRef.current.postMessage(JSON.stringify({
        type: 'zoomOut'
      }));
    }
  }, []);

  const toggleMapStyleMobile = useCallback(() => {
    console.log('[RN] Tentative toggleMapStyle');
    if (webViewRef.current && webViewRef.current.postMessage) {
      webViewRef.current.postMessage(JSON.stringify({
        type: 'toggleMapStyle'
      }));
    }
  }, []);

  // Exposition des fonctions via ref
  useImperativeHandle(ref, () => ({
    centerOnUser: isWeb ? centerOnUserWeb : centerOnUserMobile,
    zoomIn: isWeb ? zoomInWeb : zoomInMobile,
    zoomOut: isWeb ? zoomOutWeb : zoomOutMobile,
    toggleMapStyle: isWeb ? toggleMapStyleWeb : toggleMapStyleMobile
  }), [
    isWeb, 
    centerOnUserWeb, zoomInWeb, zoomOutWeb, toggleMapStyleWeb,
    centerOnUserMobile, zoomInMobile, zoomOutMobile, toggleMapStyleMobile
  ]);

  // Effet pour initialiser la carte web
  useEffect(() => {
    if (!isWeb || !mapContainerRef.current) return;

    let mounted = true;
    
    const initializeWebMap = async () => {
      try {
        // Vérifier si Leaflet est déjà chargé
        if ((window as any).L) {
          leafletRef.current = (window as any).L;
        } else {
          // Charger Leaflet dynamiquement
          await new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            link.onload = () => {
              const script = document.createElement('script');
              script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
              script.onload = () => {
                leafletRef.current = (window as any).L;
                resolve(true);
              };
              script.onerror = reject;
              document.head.appendChild(script);
            };
            link.onerror = reject;
            document.head.appendChild(link);
          });
        }

        if (!mounted || !leafletRef.current) return;

        // Initialiser la carte
        const map = leafletRef.current.map(mapContainerRef.current, {
          zoomControl: false,
          touchZoom: true,
          scrollWheelZoom: true,
          doubleClickZoom: true,
          boxZoom: false,
          keyboard: true,
          dragging: true,
          zoomSnap: 0.5,
          tap: true
        }).setView([center.lat, center.lng], 14);

        mapInstanceRef.current = map;

        // Ajouter la couche de base
        const baseLayer = leafletRef.current.tileLayer(
          'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          {
            attribution: '© StreetMap',
            maxZoom: 19,
            detectRetina: true
          }
        ).addTo(map);
        
        map._baseLayer = baseLayer;

        // Marqueur utilisateur
        const userIcon = leafletRef.current.divIcon({
          className: 'user-marker',
          html: '<div style="background: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>',
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        });

        leafletRef.current.marker([center.lat, center.lng], { icon: userIcon })
          .addTo(map);

        // Cercle de recherche
        leafletRef.current.circle([center.lat, center.lng], {
          radius: radius * 1000,
          fillColor: '#3b82f6',
          fillOpacity: 0.1,
          color: '#3b82f6',
          weight: 2,
          opacity: 0.6
        }).addTo(map);

        // Ajouter les marqueurs de vélos
        bikesWithCoords.forEach(bike => {
          const batteryColor = bike.batteryLevel > 50 ? '#16a34a' : 
                            bike.batteryLevel > 20 ? '#f59e0b' : '#ef4444';
          
          const bikeIcon = leafletRef.current.divIcon({
            className: 'bike-marker',
            html: `
              <div style="
                background: ${batteryColor}; 
                color: white; 
                width: 32px; 
                height: 32px; 
                border-radius: 50%; 
                border: 2px solid white; 
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                display: flex; 
                align-items: center; 
                justify-content: center; 
                font-size: 10px; 
                font-weight: bold;
                position: relative;
                cursor: pointer;
              ">
                ${bike.batteryLevel}%
              </div>
            `,
            iconSize: [36, 36],
            iconAnchor: [18, 18]
          });

          const marker = leafletRef.current.marker([bike.latitude!, bike.longitude!], {
            icon: bikeIcon
          }).addTo(map);

          // Créer le contenu du popup amélioré
          const popupContent = `
            <div class="bike-popup" style="
              min-width: 240px;
              padding: 12px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            ">
              <div style="
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 12px;
              ">
                <div style="
                  background: ${batteryColor};
                  width: 24px;
                  height: 24px;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-size: 10px;
                  font-weight: bold;
                ">
                  ${bike.batteryLevel}%
                </div>
                <div>
                  <div style="font-weight: 600; font-size: 16px; color: #111827;">
                    Vélo ${bike.code}
                  </div>
                  <div style="font-size: 14px; color: #6b7280;">
                    ${bike.model}
                  </div>
                </div>
              </div>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
                <div style="text-align: center;">
                  <div style="font-weight: 600; font-size: 14px; color: #111827; margin-bottom: 4px;">
                    ⚡ ${bike.batteryLevel}%
                  </div>
                  <div style="font-size: 12px; color: #6b7280;">
                    Batterie
                  </div>
                </div>
                <div style="text-align: center;">
                  <div style="font-weight: 600; font-size: 14px; color: #111827; margin-bottom: 4px;">
                    📍 ${bike.distance ? bike.distance.toFixed(1) + ' km' : '--'}
                  </div>
                  <div style="font-size: 12px; color: #6b7280;">
                    Distance
                  </div>
                </div>
              </div>
              
              <button onclick="window.handleBikeSelect && window.handleBikeSelect('${bike.id}')" 
                      style="
                        background: #5D5CDE;
                        color: white;
                        border: none;
                        padding: 10px 16px;
                        border-radius: 8px;
                        font-size: 14px;
                        font-weight: 500;
                        cursor: pointer;
                        width: 100%;
                        transition: background 0.2s;
                      "
                      onmouseover="this.style.background='#4c4bcc'"
                      onmouseout="this.style.background='#5D5CDE'">
                Déverrouiller
              </button>
            </div>
          `;

          // Lier le popup au marqueur
          marker.bindPopup(popupContent, {
            className: 'bike-popup-leaflet',
            maxWidth: 280,
            minWidth: 240,
            offset: [0, -15],
            closeButton: true,
            autoClose: false,
            closeOnClick: false
          });

          // Ouvrir le popup au clic
          marker.on('click', () => {
            marker.openPopup();
          });

          // Ouvrir le popup au survol (hover)
          marker.on('mouseover', () => {
            marker.openPopup();
          });

          // Fermer le popup quand on quitte le marqueur
          marker.on('mouseout', () => {
            // Petit délai pour éviter de fermer trop vite
            setTimeout(() => {
              if (!marker._popup._container?.matches(':hover')) {
                marker.closePopup();
              }
            }, 100);
          });

          // Garder le popup ouvert si la souris est dessus
          marker.on('popupopen', () => {
            const popup = marker.getPopup();
            if (popup && popup._container) {
              popup._container.addEventListener('mouseenter', () => {
                marker._popupHovered = true;
              });
              popup._container.addEventListener('mouseleave', () => {
                marker._popupHovered = false;
                setTimeout(() => {
                  if (!marker._popupHovered) {
                    marker.closePopup();
                  }
                }, 100);
              });
            }
          });
        });

        // Ajouter les styles CSS
        const style = document.createElement('style');
        style.innerHTML = `
          .leaflet-popup.bike-popup-leaflet .leaflet-popup-content-wrapper {
            border-radius: 12px;
            padding: 0;
            overflow: hidden;
            box-shadow: 0 6px 16px rgba(0,0,0,0.15);
          }
          
          .leaflet-popup.bike-popup-leaflet .leaflet-popup-content {
            margin: 0;
            line-height: 1.4;
          }
          
          .leaflet-popup.bike-popup-leaflet .leaflet-popup-tip-container {
            margin-top: -1px;
          }
          
          .leaflet-popup.bike-popup-leaflet .leaflet-popup-tip {
            background: white;
            box-shadow: 0 3px 8px rgba(0,0,0,0.1);
          }
          
          .leaflet-popup.bike-popup-leaflet .leaflet-popup-close-button {
            width: 24px;
            height: 24px;
            font-size: 18px;
            line-height: 24px;
            color: #6b7280;
            transition: color 0.2s;
            z-index: 1000;
          }
          
          .leaflet-popup.bike-popup-leaflet .leaflet-popup-close-button:hover {
            color: #111827;
          }
        `;
        document.head.appendChild(style);

        onMapReady?.();
      } catch (error) {
        console.error('Error loading Leaflet:', error);
      }
    };

    initializeWebMap();

    return () => {
      mounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isWeb, center.lat, center.lng, radius, bikesWithCoords, onBikePress, onMapReady]);

  // HTML pour la version mobile - VERSION CORRIGÉE POUR ANDROID
  const mapHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=3.0, minimum-scale=0.5, user-scalable=yes, viewport-fit=cover">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <style>
            * {
                box-sizing: border-box;
                -webkit-touch-callout: none;
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
            }
            
            body { 
                margin: 0; 
                padding: 0; 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                overflow: hidden;
                position: fixed;
                width: 100vw;
                height: 100vh;
                background: #f0f0f0;
                touch-action: none;
                overscroll-behavior: none;
                -webkit-overflow-scrolling: auto;
            }
            
            #map { 
                height: 100vh; 
                width: 100vw; 
                position: absolute;
                top: 0;
                left: 0;
                background: #e0e0e0;
                touch-action: none;
                overscroll-behavior: none;
            }
            
            .leaflet-container {
                touch-action: none !important;
                -webkit-touch-callout: none !important;
                -webkit-user-select: none !important;
                background: #d0d0d0;
                cursor: grab;
            }
            
            .leaflet-container.leaflet-touch-drag {
                touch-action: none !important;
            }
            
            .leaflet-container.leaflet-touch-zoom {
                touch-action: none !important;
            }
            
            .leaflet-control-container {
                pointer-events: none;
            }
            
            .leaflet-control {
                pointer-events: auto;
            }
            
            .leaflet-popup-content-wrapper {
                touch-action: auto;
                pointer-events: auto;
            }
            
            .bike-popup {
                font-family: inherit;
                text-align: center;
                min-width: 200px;
            }
            
            .bike-popup .title {
                font-size: 16px;
                font-weight: 600;
                margin-bottom: 8px;
                color: #111827;
            }
            
            .bike-popup .details {
                display: flex;
                gap: 12px;
                justify-content: center;
                margin-bottom: 12px;
            }
            
            .bike-popup .detail-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 4px;
            }
            
            .bike-popup .detail-value {
                font-weight: 600;
                font-size: 14px;
            }
            
            .bike-popup .detail-label {
                font-size: 12px;
                color: #6b7280;
            }
            
            .bike-popup .action-btn {
                background: #5D5CDE;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                width: 100%;
                margin-top: 8px;
                touch-action: manipulation;
            }

            /* Indicateur de debug */
            .debug-indicator {
                position: fixed;
                top: 10px;
                left: 10px;
                background: rgba(255,0,0,0.8);
                color: white;
                padding: 5px 10px;
                border-radius: 5px;
                font-size: 12px;
                z-index: 9999;
                font-family: monospace;
                pointer-events: none;
                max-width: calc(100vw - 20px);
                word-break: break-all;
            }

            /* Prévenir le zoom automatique sur les inputs en cas de popup */
            input, select, textarea {
                font-size: 16px !important;
            }
        </style>
    </head>
    <body>
        <div id="debugIndicator" class="debug-indicator">Chargement...</div>
        <div id="map"></div>
        
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
            let map;
            let userMarker;
            let radiusCircle;
            let bikeMarkers = [];
            let currentMapStyle = 'osm';
            let debugIndicator = document.getElementById('debugIndicator');
            
            // Fonction de log pour déboguer
            function logToRN(message, data) {
                console.log('[CARTE]', message, data);
                debugIndicator.textContent = message;
                
                if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                    try {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: 'debug',
                            message: message,
                            data: data || {},
                            timestamp: Date.now()
                        }));
                    } catch (e) {
                        console.error('Erreur envoi log:', e);
                    }
                }
            }
            
            // Désactiver le défilement au niveau document
            document.addEventListener('touchstart', function(e) {
                logToRN('👆 TOUCHSTART Global: ' + e.touches.length + ' touches');
            }, { passive: false });
            
            document.addEventListener('touchmove', function(e) {
                if (e.target.closest('#map') || e.target.id === 'map') {
                    // Laisser passer pour la carte
                    logToRN('👆 TOUCHMOVE sur carte');
                } else {
                    // Bloquer ailleurs
                    e.preventDefault();
                }
            }, { passive: false });
            
            document.addEventListener('touchend', function(e) {
                logToRN('👆 TOUCHEND Global');
            }, { passive: false });
            
            const mapStyles = {
                osm: {
                    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    attribution: '© StreetMap'
                },
                satellite: {
                    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                    attribution: '© Esri'
                },
                dark: {
                    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
                    attribution: '© CartoDB'
                }
            };
            
            function initMap() {
                try {
                    logToRN('🚀 DÉBUT INITIALISATION CARTE ANDROID');
                    
                    // Vérifier si Leaflet est disponible
                    if (typeof L === 'undefined') {
                        logToRN('❌ ERREUR: Leaflet non chargé');
                        return;
                    }
                    logToRN('✅ Leaflet chargé pour Android');
                    
                    // CONFIGURATION SPÉCIALE ANDROID
                    map = L.map('map', {
                        // Configuration de base
                        zoomControl: false,
                        attributionControl: true,
                        
                        // NAVIGATION TACTILE OPTIMISÉE ANDROID
                        touchZoom: true,           
                        scrollWheelZoom: false,    // Désactivé sur mobile
                        doubleClickZoom: true,     
                        dragging: true,           
                        
                        // CONFIGURATION TACTILE ANDROID SPÉCIFIQUE
                        tap: true,                
                        tapTolerance: 30,         // Augmenté pour Android
                        touchExtend: true,        
                        
                        // Animation optimisée Android
                        zoomAnimation: true,
                        fadeAnimation: true,
                        markerZoomAnimation: true,
                        
                        // Inertie adaptée Android
                        inertia: true,
                        inertiaDeceleration: 2000,
                        inertiaMaxSpeed: 1500,    // Limité pour Android
                        easeLinearity: 0.1,       
                        
                        // Configuration zoom Android
                        zoomSnap: 0.1,            
                        zoomDelta: 1,             
                        wheelDebounceTime: 10,    
                        wheelPxPerZoomLevel: 100, 
                        
                        // Limites
                        maxZoom: 18,
                        minZoom: 8,
                        bounceAtZoomLimits: false,
                        
                        // Options Android
                        keyboard: false,           
                        boxZoom: false,
                        closePopupOnClick: false,
                        trackResize: true,
                        preferCanvas: false,
                        
                        // OPTIMISATIONS ANDROID WEBVIEW
                        worldCopyJump: false,
                        maxBoundsViscosity: 0.0,
                        transform3DLimit: 1048576,
                        
                        // Configuration rendu Android
                        updateWhenZooming: false,  // Performance Android
                        updateWhenIdle: true,      // Moins de mises à jour
                        updateInterval: 200        // Intervalles plus larges
                    }).setView([${center.lat}, ${center.lng}], 14);
                    
                    logToRN('✅ CARTE ANDROID INITIALISÉE', {
                        center: [${center.lat}, ${center.lng}],
                        touchZoom: map.options.touchZoom,
                        dragging: map.options.dragging,
                        touchExtend: map.options.touchExtend,
                        tapTolerance: map.options.tapTolerance
                    });
                    
                    // FORCER LA GESTION TACTILE ANDROID
                    setTimeout(() => {
                        if (map._container) {
                            map._container.style.touchAction = 'none';
                            logToRN('🔧 touch-action forcé sur container');
                        }
                        
                        // Forcer la réactivation des handlers
                        if (map._handlers) {
                            ['touchZoom', 'dragging', 'tap'].forEach(handlerName => {
                                const handler = map._handlers[handlerName];
                                if (handler) {
                                    if (handler._enabled) {
                                        handler.disable();
                                        setTimeout(() => {
                                            handler.enable();
                                            logToRN('🔧 Handler ' + handlerName + ' réactivé');
                                        }, 50);
                                    } else {
                                        handler.enable();
                                        logToRN('🔧 Handler ' + handlerName + ' activé');
                                    }
                                }
                            });
                        }
                    }, 300);
                    
                    // Ajouter des listeners pour déboguer
                    map.on('dragstart', () => logToRN('✅ DRAGSTART MARCHE !'));
                    map.on('drag', () => logToRN('✅ DRAG EN COURS !'));
                    map.on('dragend', () => logToRN('✅ DRAGEND TERMINÉ !'));
                    map.on('zoomstart', (e) => logToRN('✅ ZOOMSTART: ' + e.target.getZoom()));
                    map.on('zoom', (e) => logToRN('✅ ZOOM: ' + e.target.getZoom()));
                    map.on('zoomend', (e) => logToRN('✅ ZOOMEND: ' + e.target.getZoom()));
                    map.on('movestart', () => logToRN('📍 MOVESTART'));
                    map.on('move', () => logToRN('📍 MOVE'));
                    map.on('moveend', () => logToRN('📍 MOVEEND'));
                    map.on('click', (e) => logToRN('👆 CLICK: ' + e.latlng.lat.toFixed(4) + ',' + e.latlng.lng.toFixed(4)));
                    
                    // Diagnostics spéciaux Android
                    setTimeout(() => {
                        const container = map.getContainer();
                        logToRN('📊 DIAGNOSTICS ANDROID:', {
                            touchAction: container.style.touchAction,
                            containerClass: container.className,
                            handlers: Object.keys(map._handlers || {}).map(h => ({
                                name: h,
                                enabled: map._handlers[h]._enabled
                            }))
                        });
                    }, 1000);
                    
                    // Force invalidation après init
                    setTimeout(() => {
                        if (map) {
                            map.invalidateSize(true);
                            logToRN('📐 TAILLE CARTE MISE À JOUR ANDROID');
                        }
                    }, 100);
                    
                    updateMapStyle();
                    updateUserLocation();
                    updateBikes();
                    
                    logToRN('🎯 CARTE ANDROID COMPLÈTEMENT CONFIGURÉE');
                    
                    // Confirmation de chargement
                    setTimeout(() => {
                        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                            window.ReactNativeWebView.postMessage(JSON.stringify({
                                type: 'mapReady'
                            }));
                            logToRN('📨 MESSAGE mapReady ENVOYÉ ANDROID');
                        }
                    }, 500);
                    
                } catch (error) {
                    logToRN('❌ ERREUR INIT ANDROID: ' + error.message);
                    console.error('Error initializing Android map:', error);
                }
            }
            
            function updateMapStyle() {
                if (!map) return;
                
                try {
                    if (map._baseLayer) {
                        map.removeLayer(map._baseLayer);
                    }
                    
                    const style = mapStyles[currentMapStyle] || mapStyles.osm;
                    map._baseLayer = L.tileLayer(style.url, {
                        attribution: style.attribution,
                        maxZoom: 19,
                        detectRetina: true
                    }).addTo(map);
                    
                    logToRN('🎨 Style carte appliqué: ' + currentMapStyle);
                } catch (error) {
                    logToRN('❌ Erreur style carte: ' + error.message);
                }
            }
            
            function updateUserLocation() {
                if (!map) return;
                
                try {
                    if (userMarker) map.removeLayer(userMarker);
                    if (radiusCircle) map.removeLayer(radiusCircle);
                    
                    const userIcon = L.divIcon({
                        className: 'user-marker',
                        html: '<div style="background: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>',
                        iconSize: [26, 26],
                        iconAnchor: [13, 13]
                    });
                    
                    userMarker = L.marker([${center.lat}, ${center.lng}], { 
                        icon: userIcon,
                        interactive: false
                    }).addTo(map);
                    
                    radiusCircle = L.circle([${center.lat}, ${center.lng}], {
                        radius: ${radius * 1000},
                        fillColor: '#3b82f6',
                        fillOpacity: 0.1,
                        color: '#3b82f6',
                        weight: 2,
                        opacity: 0.6,
                        interactive: false
                    }).addTo(map);
                    
                    logToRN('📍 Marqueurs ajoutés');
                } catch (error) {
                    logToRN('❌ Erreur marqueurs: ' + error.message);
                }
            }
            
            function updateBikes() {
                if (!map) return;
                
                try {
                    bikeMarkers.forEach(marker => map.removeLayer(marker));
                    bikeMarkers = [];
                    
                    const bikes = ${JSON.stringify(bikesWithCoords)};
                    logToRN('🚲 Ajout vélos: ' + bikes.length);
                    
                    bikes.forEach(bike => {
                        let batteryColor = '#16a34a';
                        if (bike.batteryLevel <= 50) batteryColor = '#f59e0b';
                        if (bike.batteryLevel <= 20) batteryColor = '#ef4444';
                        
                        const bikeIcon = L.divIcon({
                            className: 'bike-marker',
                            html: \`
                                <div style="
                                    background: \${batteryColor}; 
                                    color: white; 
                                    width: 32px; 
                                    height: 32px; 
                                    border-radius: 50%; 
                                    border: 2px solid white; 
                                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                                    display: flex; 
                                    align-items: center; 
                                    justify-content: center; 
                                    font-size: 10px; 
                                    font-weight: bold;
                                    cursor: pointer;
                                    touch-action: manipulation;
                                ">
                                    \${bike.batteryLevel}%
                                </div>
                            \`,
                            iconSize: [36, 36],
                            iconAnchor: [18, 18]
                        });
                        
                        const popupContent = \`
                            <div class="bike-popup">
                                <div class="title">🚲 \${bike.code}</div>
                                <div style="color: #6b7280; margin-bottom: 12px;">\${bike.model}</div>
                                <div class="details">
                                    <div class="detail-item">
                                        <div class="detail-value" style="color: \${batteryColor}">
                                            ⚡ \${bike.batteryLevel}%
                                        </div>
                                        <div class="detail-label">Batterie</div>
                                    </div>
                                    <div class="detail-item">
                                        <div class="detail-value">📍 \${bike.distance ? bike.distance.toFixed(1) + ' km' : '--'}</div>
                                        <div class="detail-label">Distance</div>
                                    </div>
                                </div>
                            </div>
                        \`;
                        
                        const marker = L.marker([bike.latitude, bike.longitude], { 
                            icon: bikeIcon 
                        })
                        .bindPopup(popupContent, {
                            className: 'bike-popup-container',
                            maxWidth: 280,
                            offset: [0, -10]
                        })
                        .addTo(map);
                        
                        marker.on('click', (e) => {
                            logToRN('🚲 Vélo cliqué: ' + bike.code);
                            e.originalEvent?.preventDefault();
                            e.originalEvent?.stopPropagation();
                            
                            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                                window.ReactNativeWebView.postMessage(JSON.stringify({
                                    type: 'bikeSelected',
                                    bike: bike
                                }));
                            }
                        });
                        
                        bikeMarkers.push(marker);
                    });
                    
                    logToRN('✅ Vélos ajoutés: ' + bikeMarkers.length);
                } catch (error) {
                    logToRN('❌ Erreur ajout vélos: ' + error.message);
                }
            }
            
            function centerOnUser() {
                logToRN('🎯 Recentrage demandé');
                if (map) {
                    map.setView([${center.lat}, ${center.lng}], map.getZoom(), { 
                        animate: true,
                        duration: 0.5 
                    });
                    logToRN('✅ Recentrage effectué');
                }
            }
            
            function zoomIn() {
                logToRN('🔍 Zoom in demandé');
                if (map) {
                    const oldZoom = map.getZoom();
                    map.zoomIn(1, { animate: true });
                    setTimeout(() => {
                        logToRN('✅ Zoom in: ' + oldZoom + ' → ' + map.getZoom());
                    }, 300);
                }
            }
            
            function zoomOut() {
                logToRN('🔍 Zoom out demandé');
                if (map) {
                    const oldZoom = map.getZoom();
                    map.zoomOut(1, { animate: true });
                    setTimeout(() => {
                        logToRN('✅ Zoom out: ' + oldZoom + ' → ' + map.getZoom());
                    }, 300);
                }
            }
            
            function toggleMapStyle() {
                logToRN('🎨 Changement style demandé');
                const styles = Object.keys(mapStyles);
                const currentIndex = styles.indexOf(currentMapStyle);
                const nextIndex = (currentIndex + 1) % styles.length;
                const oldStyle = currentMapStyle;
                currentMapStyle = styles[nextIndex];
                updateMapStyle();
                logToRN('✅ Style changé: ' + oldStyle + ' → ' + currentMapStyle);
            }
            
            // Gestionnaire de messages
            function handleMessage(event) {
                try {
                    const data = JSON.parse(event.data);
                    logToRN('📨 Message reçu: ' + data.type);
                    
                    switch(data.type) {
                        case 'centerOnUser':
                            centerOnUser();
                            break;
                        case 'zoomIn':
                            zoomIn();
                            break;
                        case 'zoomOut':
                            zoomOut();
                            break;
                        case 'toggleMapStyle':
                            toggleMapStyle();
                            break;
                        default:
                            logToRN('❓ Message non géré: ' + data.type);
                    }
                } catch (e) {
                    logToRN('❌ Erreur parsing message: ' + e.message);
                }
            }
            
            // Attacher les événements
            window.addEventListener('message', handleMessage);
            document.addEventListener('message', handleMessage);
            
            // Gestion du redimensionnement
            window.addEventListener('resize', function() {
                logToRN('📐 Redimensionnement fenêtre');
                if (map) {
                    setTimeout(() => {
                        map.invalidateSize(true);
                        logToRN('📐 Taille carte mise à jour après redimensionnement');
                    }, 100);
                }
            });
            
            // Test de support tactile Android
            window.addEventListener('load', function() {
                logToRN('📱 Support tactile Android: ' + ('ontouchstart' in window));
                logToRN('📱 Max touch points: ' + (navigator.maxTouchPoints || 'inconnu'));
                logToRN('🌐 User Agent: Android détecté');
            });
            
            // Prévenir les comportements par défaut indésirables
            document.addEventListener('gesturestart', function(e) {
                e.preventDefault();
                logToRN('🚫 Gesturestart bloqué');
            });
            
            document.addEventListener('gesturechange', function(e) {
                e.preventDefault();
                logToRN('🚫 Gesturechange bloqué');
            });
            
            document.addEventListener('gestureend', function(e) {
                e.preventDefault();
                logToRN('🚫 Gestureend bloqué');
            });
            
            // Initialisation
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initMap);
            } else {
                initMap();
            }
            
            logToRN('📄 Script carte Android chargé');
        </script>
    </body>
    </html>
  `;

  // Rendu conditionnel basé sur la plateforme
  if (isWeb) {
    return (
      <View style={styles.container}>
        <div 
          ref={(el: any) => { mapContainerRef.current = el; }}
          style={{ 
            width: '100%', 
            height: '100%',
            touchAction: 'auto'
          }}
        />
      </View>
    );
  }

  // Version mobile avec WebView - CONFIGURATION ANDROID OPTIMISÉE
  const ReactNativeWebView = require('react-native-webview').WebView;

  return (
    <View style={styles.container}>
      <ReactNativeWebView
        ref={webViewRef}
        source={{ html: mapHTML }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        scalesPageToFit={false}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        bounces={false}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        originWhitelist={['*']}
        mixedContentMode="compatibility"
        thirdPartyCookiesEnabled={true}
        sharedCookiesEnabled={true}
        allowsFullscreenVideo={false}
        allowsBackForwardNavigationGestures={false}
        cacheEnabled={true}
        incognito={false}
        nestedScrollEnabled={false}
        overScrollMode="never"
        androidLayerType="hardware"
        onMessage={(event: any) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            
            // Logger tous les messages reçus
            console.log('[RN] Message reçu de la WebView:', data);
            
            switch(data.type) {
              case 'mapReady':
                console.log('[RN] ✅ Carte prête');
                onMapReady?.();
                break;
              case 'bikeSelected':
                console.log('[RN] 🚲 Vélo sélectionné:', data.bike);
                onBikePress?.(data.bike);
                break;
              case 'debug':
                console.log('[RN] 🐛 DEBUG CARTE:', data.message, data.data);
                break;
              default:
                console.log('[RN] ❓ Message non géré:', data.type);
            }
          } catch (e) {
            console.error('[RN] ❌ Error parsing WebView message:', e);
          }
        }}
        onError={(syntheticEvent: { nativeEvent: any; }) => {
          const { nativeEvent } = syntheticEvent;
          console.error('[RN] ❌ WebView error: ', nativeEvent);
        }}
        onLoadStart={() => {
          console.log('[RN] 🔄 WebView chargement commencé');
        }}
        onLoadEnd={() => {
          console.log('[RN] ✅ WebView chargement terminé');
        }}
        onLoadProgress={({ nativeEvent }: { nativeEvent: { progress: number } }) => {
          console.log('[RN] 📊 WebView progression:', nativeEvent.progress);
        }}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});