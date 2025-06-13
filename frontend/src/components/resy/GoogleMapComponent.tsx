import React, { useEffect, useRef, useCallback } from 'react';

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

  const initializeMap = useCallback(() => {
    if (!window.google || !mapRef.current || googleMapRef.current) return;

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
  }, [providers, onProviderSelect]);

  // Initialize map when Google Maps is loaded
  useEffect(() => {
    if (window.google) {
      initializeMap();
    } else {
      // Wait for Google Maps to load
      const checkGoogleMaps = setInterval(() => {
        if (window.google) {
          clearInterval(checkGoogleMaps);
          initializeMap();
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

  return (
    <div ref={mapRef} className="w-full h-full rounded-lg" />
  );
};

export default GoogleMapComponent;