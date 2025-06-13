import React, { useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';

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

interface MapComponentProps {
  providers: Provider[];
  selectedProvider: Provider | null;
  hoveredProvider: Provider | null;
  onProviderSelect: (provider: Provider) => void;
}

// Mock map component that doesn't require Google Maps API
const MapComponent: React.FC<MapComponentProps> = ({ 
  providers, 
  selectedProvider, 
  hoveredProvider, 
  onProviderSelect 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);

  // Calculate bounds to center map
  const bounds = providers.reduce(
    (acc, provider) => {
      if (provider.coordinates) {
        return {
          minLat: Math.min(acc.minLat, provider.coordinates.lat),
          maxLat: Math.max(acc.maxLat, provider.coordinates.lat),
          minLng: Math.min(acc.minLng, provider.coordinates.lng),
          maxLng: Math.max(acc.maxLng, provider.coordinates.lng),
        };
      }
      return acc;
    },
    { minLat: 90, maxLat: -90, minLng: 180, maxLng: -180 }
  );

  const centerLat = (bounds.minLat + bounds.maxLat) / 2;
  const centerLng = (bounds.minLng + bounds.maxLng) / 2;

  // Convert coordinates to pixel positions
  const getPosition = (lat: number, lng: number) => {
    const width = 100; // percentage
    const height = 100; // percentage
    
    const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * width;
    const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * height;
    
    return { x: `${x}%`, y: `${y}%` };
  };

  return (
    <div 
      ref={mapRef} 
      className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpattern id='grid' width='20' height='20' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 20 0 L 0 0 0 20' fill='none' stroke='%23e5e7eb' stroke-width='1'/%3E%3C/pattern%3E%3Crect width='100' height='100' fill='url(%23grid)' /%3E%3C/svg%3E")`,
        backgroundSize: '100px 100px'
      }}
    >
      {/* Map placeholder with street-like pattern */}
      <div className="absolute inset-0">
        {/* Main streets */}
        <div className="absolute top-1/3 left-0 right-0 h-1 bg-gray-300" />
        <div className="absolute top-2/3 left-0 right-0 h-1 bg-gray-300" />
        <div className="absolute left-1/3 top-0 bottom-0 w-1 bg-gray-300" />
        <div className="absolute left-2/3 top-0 bottom-0 w-1 bg-gray-300" />
      </div>

      {/* Provider markers */}
      {providers.map((provider) => {
        if (!provider.coordinates) return null;
        
        const position = getPosition(provider.coordinates.lat, provider.coordinates.lng);
        const providerId = provider.provider_id || provider.id || '';
        const isHovered = hoveredProvider?.provider_id === providerId || hoveredProvider?.id === providerId;
        const isSelected = selectedProvider?.provider_id === providerId || selectedProvider?.id === providerId;
        
        return (
          <div
            key={providerId}
            className={`absolute transform -translate-x-1/2 -translate-y-full cursor-pointer transition-all duration-300 ${
              isHovered || isSelected ? 'z-20' : 'z-10'
            }`}
            style={{ 
              left: position.x, 
              top: position.y,
              transform: `translate(-50%, -100%) ${isHovered || isSelected ? 'scale(1.2)' : 'scale(1)'}`
            }}
            onClick={() => onProviderSelect(provider)}
          >
            {/* Marker */}
            <div className={`relative ${isHovered ? 'animate-bounce' : ''}`}>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-colors ${
                  isSelected 
                    ? 'bg-red-500' 
                    : isHovered 
                    ? 'bg-green-500' 
                    : 'bg-blue-500'
                }`}
              >
                <MapPin className="w-6 h-6 text-white" />
              </div>
              
              {/* Pin point */}
              <div 
                className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent ${
                  isSelected 
                    ? 'border-t-[10px] border-t-red-500' 
                    : isHovered 
                    ? 'border-t-[10px] border-t-green-500' 
                    : 'border-t-[10px] border-t-blue-500'
                }`}
              />
            </div>
            
            {/* Tooltip */}
            {(isHovered || isSelected) && (
              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-2 whitespace-nowrap">
                <p className="text-sm font-medium">{provider.name}</p>
                <p className="text-xs text-gray-600">{provider.location?.split(',')[0]}</p>
              </div>
            )}
          </div>
        );
      })}

      {/* Map controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button className="bg-white rounded-lg shadow-md p-2 hover:bg-gray-50">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
        <button className="bg-white rounded-lg shadow-md p-2 hover:bg-gray-50">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
      </div>

      {/* Map attribution */}
      <div className="absolute bottom-2 left-2 bg-white bg-opacity-90 rounded px-2 py-1">
        <p className="text-xs text-gray-600">Provider Locations</p>
      </div>
    </div>
  );
};

export default MapComponent;