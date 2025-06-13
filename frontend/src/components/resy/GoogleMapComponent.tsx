import React, { useEffect, useRef, useCallback, useState } from 'react';
import MapComponent from './MapComponent'; // Fallback map component

interface Provider {
  id?: string;
  provider_id?: string;
  name: string;
  location?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface GoogleMapComponentProps {
  providers: Provider[];
  selectedProvider: Provider | null;
  hoveredProvider: Provider | null;
  onProviderSelect: (provider: Provider) => void;
}

declare global {
  interface Window {
    google: any;
    initMap?: () => void;
  }
}

const GoogleMapComponent: React.FC<GoogleMapComponentProps> = ({ 
  providers, 
  selectedProvider, 
  hoveredProvider, 
  onProviderSelect 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const [mapLoadError, setMapLoadError] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);
  const [initAttempts, setInitAttempts] = useState(0);

  const initializeMap = useCallback(() => {
    console.log('Initializing Google Map:', { 
      hasGoogle: !!window.google, 
      hasGoogleMaps: !!window.google?.maps,
      hasMapRef: !!mapRef.current,
      hasGoogleMapRef: !!googleMapRef.current 
    });
    
    if (!window.google || !window.google.maps || !mapRef.current) {
      console.log('Cannot initialize - missing requirements');
      return;
    }
    
    // Allow re-initialization if needed
    if (googleMapRef.current) {
      console.log('Map already initialized, skipping...');
      setMapLoading(false);
      return;
    }

    try {
      // Initialize the map
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 40.7128, lng: -74.0060 }, // NYC coordinates
        zoom: 12,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ],
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false
      });

      googleMapRef.current = map;

    // Create an info window
    const infoWindow = new window.google.maps.InfoWindow();

    // Add markers for each provider
    providers.forEach((provider) => {
      if (provider.coordinates) {
        const marker = new window.google.maps.Marker({
          position: provider.coordinates,
          map: map,
          title: provider.name,
          animation: window.google.maps.Animation.DROP,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#3B82F6',
            fillOpacity: 0.9,
            strokeColor: '#1E40AF',
            strokeWeight: 2
          }
        });

        // Add click listener
        marker.addListener('click', () => {
          onProviderSelect(provider);
          infoWindow.setContent(`
            <div class="p-2">
              <h3 class="font-semibold">${provider.name}</h3>
              <p class="text-sm text-gray-600">${provider.location?.split(',')[0] || ''}</p>
            </div>
          `);
          infoWindow.open(map, marker);
        });

        markersRef.current[provider.provider_id || provider.id || ''] = marker;
      }
    });

    // Fit bounds to show all markers
    if (providers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      providers.forEach(provider => {
        if (provider.coordinates) {
          bounds.extend(provider.coordinates);
        }
      });
      map.fitBounds(bounds);
    }
    
    console.log('Google Maps initialized successfully!');
    setMapLoading(false);
    setInitAttempts(0); // Reset on success
    } catch (error) {
      console.error('Error initializing Google Maps:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        mapRefExists: !!mapRef.current,
        googleMapsExists: !!window.google?.maps,
        attempt: initAttempts + 1
      });
      
      // Retry a few times before giving up
      if (initAttempts < 2) {
        setInitAttempts(prev => prev + 1);
        setTimeout(() => {
          console.log('Retrying Google Maps initialization...');
          initializeMap();
        }, 1000);
      } else {
        setMapLoadError(true);
        setMapLoading(false);
      }
    }
  }, [providers, onProviderSelect, initAttempts]);

  // Initialize map when Google Maps is loaded and DOM is ready
  useEffect(() => {
    console.log('GoogleMapComponent useEffect running...', {
      hasMapRef: !!mapRef.current,
      providersCount: providers.length,
      mapElement: mapRef.current
    });
    
    if (!mapRef.current || providers.length === 0) {
      console.log('Waiting for DOM ref and providers...', {
        hasMapRef: !!mapRef.current,
        providersCount: providers.length
      });
      return;
    }
    
    console.log('GoogleMapComponent ready to initialize...');
    
    // Skip demo mode check for now - always try to load Google Maps
    const isDemoMode = false; // import.meta.env.VITE_DEMO_MODE === 'true' || import.meta.env.GITHUB_PAGES === 'true';
    
    console.log('GoogleMapComponent mount:', {
      isDemoMode,
      hasGoogle: !!window.google,
      hasGoogleMaps: !!window.google?.maps,
      hasMapRef: !!mapRef.current,
      providersCount: providers.length
    });
    
    if (isDemoMode) {
      console.log('Demo mode detected, using fallback map');
      setMapLoadError(true);
      setMapLoading(false);
      return;
    }
    
    // Small delay to ensure everything is ready
    const initTimer = setTimeout(() => {
      if (window.google && window.google.maps && mapRef.current) {
        console.log('Google Maps ready, initializing...');
        initializeMap();
      } else if (!window.google || !window.google.maps) {
        console.log('Waiting for Google Maps to load...');
        // Wait for Google Maps to load
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds timeout
        
        const checkGoogleMaps = setInterval(() => {
          attempts++;
          if (window.google && window.google.maps) {
            clearInterval(checkGoogleMaps);
            console.log('Google Maps loaded after', attempts, 'attempts');
            initializeMap();
          } else if (attempts >= maxAttempts) {
            clearInterval(checkGoogleMaps);
            console.warn('Google Maps failed to load after timeout, using fallback');
            setMapLoadError(true);
            setMapLoading(false);
          }
        }, 100);
      }
    }, 200); // Slightly longer delay for DOM to be ready
    
    return () => clearTimeout(initTimer);
  }, [initializeMap, providers.length]);

  // Handle hover and selection effects
  useEffect(() => {
    if (!window.google || !window.google.maps) return;

    Object.entries(markersRef.current).forEach(([providerId, marker]) => {
      const isHovered = hoveredProvider?.provider_id === providerId || hoveredProvider?.id === providerId;
      const isSelected = selectedProvider?.provider_id === providerId || selectedProvider?.id === providerId;
      
      // Update marker appearance
      marker.setIcon({
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: isHovered || isSelected ? 10 : 8,
        fillColor: isSelected ? '#DC2626' : isHovered ? '#10B981' : '#3B82F6',
        fillOpacity: 0.9,
        strokeColor: isSelected ? '#991B1B' : isHovered ? '#059669' : '#1E40AF',
        strokeWeight: 2
      });

      // Add bounce animation on hover
      if (isHovered && !isSelected) {
        marker.setAnimation(window.google.maps.Animation.BOUNCE);
        setTimeout(() => marker.setAnimation(null), 700);
      }
    });
  }, [hoveredProvider, selectedProvider]);

  // If there's an error, use the fallback map
  if (mapLoadError) {
    console.log('Using fallback map due to error');
    return (
      <MapComponent
        providers={providers}
        selectedProvider={selectedProvider}
        hoveredProvider={hoveredProvider}
        onProviderSelect={onProviderSelect}
      />
    );
  }
  
  // Always render the map div so the ref can attach, but show loading overlay if needed
  return (
    <div className="w-full h-full relative">
      <div ref={mapRef} className="w-full h-full rounded-lg" />
      
      {/* Loading overlay */}
      {mapLoading && (
        <div className="absolute inset-0 rounded-lg bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading Google Maps...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleMapComponent;