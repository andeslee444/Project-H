import React, { useEffect, useRef, useCallback, useState } from 'react';
import MapComponent from './MapComponent'; // Fallback map component

interface Provider {
  id: string;
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

  const initializeMap = useCallback(() => {
    if (!window.google || !mapRef.current || googleMapRef.current) return;

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

        markersRef.current[provider.id] = marker;
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
    
    setMapLoading(false);
    } catch (error) {
      console.error('Error initializing Google Maps:', error);
      setMapLoadError(true);
      setMapLoading(false);
    }
  }, [providers, onProviderSelect]);

  // Initialize map when Google Maps is loaded
  useEffect(() => {
    // Check if we're in demo mode
    const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true' || import.meta.env.GITHUB_PAGES === 'true';
    
    if (isDemoMode) {
      setMapLoadError(true);
      setMapLoading(false);
      return;
    }
    
    if (window.google) {
      initializeMap();
    } else {
      // Wait for Google Maps to load
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds timeout
      
      const checkGoogleMaps = setInterval(() => {
        attempts++;
        if (window.google) {
          clearInterval(checkGoogleMaps);
          initializeMap();
        } else if (attempts >= maxAttempts) {
          clearInterval(checkGoogleMaps);
          console.warn('Google Maps failed to load, using fallback');
          setMapLoadError(true);
          setMapLoading(false);
        }
      }, 100);

      return () => clearInterval(checkGoogleMaps);
    }
  }, [initializeMap]);

  // Handle hover and selection effects
  useEffect(() => {
    if (!window.google) return;

    Object.entries(markersRef.current).forEach(([providerId, marker]) => {
      const isHovered = hoveredProvider?.id === providerId;
      const isSelected = selectedProvider?.id === providerId;
      
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

  // If there's an error or in demo mode, use the fallback map
  if (mapLoadError || mapLoading) {
    if (mapLoadError) {
      return (
        <MapComponent
          providers={providers}
          selectedProvider={selectedProvider}
          hoveredProvider={hoveredProvider}
          onProviderSelect={onProviderSelect}
        />
      );
    }
    
    // Show loading state
    return (
      <div className="w-full h-full rounded-lg bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={mapRef} className="w-full h-full rounded-lg" />
  );
};

export default GoogleMapComponent;