import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Car, Clock, CreditCard, Shield, ArrowRight, MapPin, Zap, Fuel, Battery, AlertCircle, CheckCircle2, Navigation, X } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import L from 'leaflet';
import 'leaflet-routing-machine';

// Fix for default marker icons in Leaflet
const defaultIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const petrolIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const evIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Set default icon for all markers
L.Marker.prototype.options.icon = defaultIcon;

interface Location {
  id: number;
  name: string;
  type: 'fuel' | 'ev';
  address: string;
  distance: number;
  coordinates: [number, number];
  status: 'open' | 'closed';
  price?: string;
  openingHours?: string;
  facilities?: string[];
}

interface RoutingMachineProps {
  start: [number, number] | null;
  end: [number, number] | null;
}

const RoutingMachine: React.FC<RoutingMachineProps> = ({ start, end }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !start || !end) return;

    const instance = L.Routing.control({
      waypoints: [
        L.latLng(start[0], start[1]),
        L.latLng(end[0], end[1])
      ],
      show: false,
      addWaypoints: false,
      routeWhileDragging: false,
      fitSelectedRoutes: true,
      showAlternatives: false,
      lineOptions: {
        styles: [{ color: '#6366F1', weight: 4 }],
        extendToWaypoints: true,
        missingRouteTolerance: 0
      }
    });

    instance.addTo(map);

    return () => {
      if (map) {
        instance.remove();
      }
    };
  }, [map, start, end]);

  return null;
};

const DirectionsControl: React.FC<{ location: Location | null; userLocation: [number, number] | null }> = ({ location, userLocation }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !location || !userLocation) return;

    const start = userLocation;
    const end = location.coordinates;

    const bounds = L.latLngBounds([start, end]);
    map.fitBounds(bounds, { padding: [50, 50] });
    
    // Remove existing routing control if any
    map.eachLayer((layer: any) => {
      if (layer instanceof L.Routing.Control) {
        map.removeControl(layer);
      }
    });

    // Add new routing control
    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(start[0], start[1]),
        L.latLng(end[0], end[1])
      ],
      show: false,
      addWaypoints: false,
      routeWhileDragging: false,
      fitSelectedRoutes: true,
      showAlternatives: false,
      lineOptions: {
        styles: [{ color: '#6366F1', weight: 4 }],
        extendToWaypoints: true,
        missingRouteTolerance: 0
      }
    }).addTo(map);

    return () => {
      map.removeControl(routingControl);
    };
  }, [map, location, userLocation]);

  return null;
};

const MapComponent = ({ userLocation, locations, selectedLocation }: { 
  userLocation: [number, number] | null, 
  locations: Location[],
  selectedLocation: Location | null 
}) => {
  const { t } = useTranslation();
  const defaultCenter: [number, number] = [19.0760, 72.8777];
  
  return (
    <MapContainer
      center={userLocation || defaultCenter}
      zoom={15}
      style={{ height: '100%', width: '100%' }}
      className="z-0"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {userLocation && (
        <Marker position={userLocation} icon={defaultIcon}>
          <Popup>{t('home.yourLocation')}</Popup>
        </Marker>
      )}
      {locations.map((location) => (
        <Marker 
          key={location.id} 
          position={location.coordinates} 
          icon={location.type === 'fuel' ? petrolIcon : evIcon}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold">{location.name}</h3>
              <p className="text-sm text-gray-600">{location.address}</p>
              <p className="text-sm">
                <span className={location.status === 'open' ? 'text-green-600' : 'text-red-600'}>
                  {location.status.toUpperCase()}
                </span>
              </p>
              {location.price && (
                <p className="text-sm">Price: {location.price}</p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
      {userLocation && selectedLocation && (
        <DirectionsControl location={selectedLocation} userLocation={userLocation} />
      )}
    </MapContainer>
  );
};

const Home = () => {
  const { t } = useTranslation();
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [nearbyLocations, setNearbyLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPetrol, setShowPetrol] = useState(true);
  const [showEV, setShowEV] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isInSafeZone, setIsInSafeZone] = useState(true);
  const [violationStatus, setViolationStatus] = useState<string>(t('noViolationsDetected'));
  const [selectedLocationDetails, setSelectedLocationDetails] = useState<Location | null>(null);
  const [selectedLocationForDirections, setSelectedLocationForDirections] = useState<Location | null>(null);

  // Mock safe zones (in a real app, these would come from an API)
  const safeZones: { center: [number, number]; radius: number }[] = [
    { center: [19.0760, 72.8777], radius: 500 }, // 500 meters radius
    { center: [19.0750, 72.8780], radius: 300 },
  ];

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation: [number, number] = [
            position.coords.latitude,
            position.coords.longitude
          ];
          setUserLocation(newLocation);
          checkSafeZone(newLocation);
          fetchNearbyLocations(position.coords.latitude, position.coords.longitude);
          setLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setError(t('locationError'));
          setLoading(false);
          // Set default location to Mumbai
          setUserLocation([19.0760, 72.8777]);
          checkSafeZone([19.0760, 72.8777]);
          fetchNearbyLocations(19.0760, 72.8777);
        }
      );
    } else {
      setError(t('browserLocationError'));
      setLoading(false);
      // Set default location to Mumbai
      setUserLocation([19.0760, 72.8777]);
      checkSafeZone([19.0760, 72.8777]);
      fetchNearbyLocations(19.0760, 72.8777);
    }
  }, [t]);

  const fetchNearbyLocations = async (lat: number, lng: number) => {
    try {
      // Simulated API call with IndianOil locations
      const mockLocations: Location[] = [
        {
          id: 1,
          name: 'IndianOil - Hemant Automobile Services',
          type: 'fuel',
          address: 'Mahul Road, FCI, Chembur, Mumbai - 400074 (Opposite Ashish Cinema)',
          distance: 0.6,
          coordinates: [19.0584, 72.9087],
          status: 'open',
          price: '₹94.50/L',
          openingHours: '06:00 AM - 10:00 PM',
          facilities: ['ATM', 'Air filling']
        },
        {
          id: 2,
          name: 'IndianOil - Poonam Auto Service',
          type: 'fuel',
          address: 'Sion Trombay Road, Suman Nagar, Chembur, Mumbai - 400071',
          distance: 1.3,
          coordinates: [19.0632, 72.8991],
          status: 'open',
          price: '₹94.50/L',
          openingHours: '24 hours',
          facilities: ['Convenience store', 'Air filling']
        },
        {
          id: 3,
          name: 'IndianOil - Indus Filling Station',
          type: 'fuel',
          address: 'Anik Wadala Link Road, Phase 1, Wadala Truck Terminal, Mumbai - 400037 (Near Wadala RTO)',
          distance: 1.8,
          coordinates: [19.0721, 72.8793],
          status: 'open',
          price: '₹94.50/L',
          openingHours: '24 hours',
          facilities: ['Car wash', 'ATM']
        },
        {
          id: 4,
          name: 'IndianOil - Narayan Fuel Station',
          type: 'fuel',
          address: 'Survey No 8, DP Road, 120 Ft Road, Phase 1, Wadala Truck Terminal, Mumbai - 400037 (Opposite Bhakti Park)',
          distance: 1.9,
          coordinates: [19.0735, 72.8786],
          status: 'open',
          price: '₹94.50/L',
          openingHours: '24 hours',
          facilities: ['Air filling', 'Convenience store']
        },
        {
          id: 5,
          name: 'IndianOil - Joaquim Petroleum',
          type: 'fuel',
          address: 'Sion Trombay Road, Deonar, Mumbai - 400088 (Opposite Telecom Factory)',
          distance: 2.6,
          coordinates: [19.0482, 72.9183],
          status: 'open',
          price: '₹94.50/L',
          openingHours: '24 hours',
          facilities: ['Air filling']
        },
        {
          id: 6,
          name: 'IndianOil - Coco Prabhadevi',
          type: 'fuel',
          address: 'No 17, Veer Savarkar Marg, Cadell Rd, Prabhadevi, Mumbai - 400022',
          distance: 3.0,
          coordinates: [19.0168, 72.8301],
          status: 'open',
          price: '₹94.50/L',
          openingHours: '24 hours',
          facilities: ['ATM', 'Car wash']
        },
        {
          id: 7,
          name: 'IndianOil - Vivanta Petroleum',
          type: 'fuel',
          address: 'Plot No A/3, CTS No 1, TF Donar, Govandi, Borla, Chedanagar, Mumbai - 400088',
          distance: 3.2,
          coordinates: [19.0421, 72.9237],
          status: 'open',
          price: '₹94.50/L',
          openingHours: '06:00 AM - 10:00 PM',
          facilities: ['Air filling']
        },
        {
          id: 8,
          name: 'IndianOil - Ravi Automobiles Services',
          type: 'fuel',
          address: 'Tilak Nagar, Ghatkopar, Mahul Road, Chembur, Mumbai - 400089 (Near Shoppers Stop)',
          distance: 3.3,
          coordinates: [19.0852, 72.9087],
          status: 'open',
          price: '₹94.50/L',
          openingHours: '06:00 AM - 10:00 PM',
          facilities: ['ATM', 'Convenience store']
        },
        {
          id: 9,
          name: 'IndianOil - Coco BKC',
          type: 'fuel',
          address: 'No C/67, Block G, BN Bhavan, Mumbai - 400051',
          distance: 3.4,
          coordinates: [19.0678, 72.8652],
          status: 'open',
          price: '₹94.50/L',
          openingHours: '24 hours',
          facilities: ['Car wash', 'Air filling']
        },
        {
          id: 10,
          name: 'IndianOil - Asha Auto Service',
          type: 'fuel',
          address: 'No 142, LBS Marg, Kurla West, Mumbai - 400070 (Opposite Equinoh)',
          distance: 3.5,
          coordinates: [19.0668, 72.8806],
          status: 'open',
          price: '₹94.50/L',
          openingHours: '07:00 AM - 09:00 PM',
          facilities: ['Air filling']
        }
      ];

      setNearbyLocations(mockLocations);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching locations:', err);
      setError('Failed to fetch nearby locations');
      setLoading(false);
    }
  };

  const checkSafeZone = (location: [number, number]) => {
    // Check if user is in any safe zone
    const isSafe = safeZones.some(zone => {
      const distance = calculateDistance(location, zone.center);
      return distance <= zone.radius;
    });
    
    setIsInSafeZone(isSafe);
    setViolationStatus(isSafe ? t('noViolationsDetected') : t('outsideSafeZone'));
  };

  const calculateDistance = (point1: [number, number], point2: [number, number]) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = point1[0] * Math.PI/180;
    const φ2 = point2[0] * Math.PI/180;
    const Δφ = (point2[0] - point1[0]) * Math.PI/180;
    const Δλ = (point2[1] - point1[1]) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  };

  const filteredLocations = nearbyLocations.filter(location => {
    if (showPetrol && showEV) return true;
    if (showPetrol) return location.type === 'fuel';
    if (showEV) return location.type === 'ev';
    return false;
  });

  const handleGetDirections = (location: Location) => {
    if (!userLocation) {
      alert("Please enable location services to get directions");
      return;
    }
    setSelectedLocationForDirections(location);
    setSelectedLocationDetails(null);
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-indigo-900/90 z-10"></div>
        <div 
          className="h-[600px] bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80')" }}
        ></div>
        <div className="absolute inset-0 flex items-center z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Smart Parking Detection & Booking System
              </h1>
              <p className="text-xl text-blue-100 mb-8">
                AI-powered parking detection with real-time availability and dynamic pricing
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link 
                  to="/booking" 
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg"
                >
                  Book a Parking Slot
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link 
                  to="/live" 
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 transition-colors shadow-lg"
                >
                  View Live Detection
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nearby Locations Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nearby Fuel & Charging Stations</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Find the nearest fuel stations and EV charging points
            </p>
          </div>

          <div className="flex justify-center space-x-4 mb-8">
            <button
              onClick={() => setShowPetrol(!showPetrol)}
              className={`flex items-center px-4 py-2 rounded-md ${
                showPetrol ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              <Fuel className="h-5 w-5 mr-2" />
              Petrol Pumps
            </button>
            <button
              onClick={() => setShowEV(!showEV)}
              className={`flex items-center px-4 py-2 rounded-md ${
                showEV ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              <Battery className="h-5 w-5 mr-2" />
              EV Charging
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-md p-4 h-[500px] relative">
              {mapError ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                  <p className="text-red-600">{mapError}</p>
                </div>
              ) : (
                <MapComponent 
                  userLocation={userLocation} 
                  locations={filteredLocations}
                  selectedLocation={selectedLocationForDirections}
                />
              )}
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">Loading nearby locations...</div>
              ) : error ? (
                <div className="text-center py-8 text-red-600">{error}</div>
              ) : (
                filteredLocations.map((location) => (
                  <div key={location.id} className="bg-white rounded-lg shadow-md p-4">
                    <div className="flex items-start">
                      <div className={`p-2 rounded-full mr-4 ${
                        location.type === 'fuel' ? 'bg-orange-100' : 'bg-green-100'
                      }`}>
                        {location.type === 'fuel' ? (
                          <Fuel className="h-6 w-6 text-orange-600" />
                        ) : (
                          <Battery className="h-6 w-6 text-green-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{location.name}</h3>
                        <p className="text-sm text-gray-600">{location.address}</p>
                        <div className="flex items-center mt-2">
                          <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-600">{location.distance} km away</span>
                        </div>
                        {location.price && (
                          <p className="text-sm font-medium text-blue-600 mt-1">{location.price}</p>
                        )}
                        <div className="mt-3 flex items-center space-x-3">
                          <button
                            onClick={() => setSelectedLocationDetails(location)}
                            className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
                              location.status === 'open' 
                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            {location.status === 'open' ? 'Open' : 'Closed'}
                          </button>
                          <button
                            onClick={() => handleGetDirections(location)}
                            className="inline-flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                          >
                            <Navigation className="h-4 w-4 mr-1" />
                            Get Directions
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Location Details Modal */}
      {selectedLocationDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 relative">
            <button
              onClick={() => setSelectedLocationDetails(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              aria-label="Close details"
              title="Close details"
            >
              <X className="h-6 w-6" />
            </button>
            
            <div className="flex items-center mb-4">
              <div className={`p-2 rounded-full mr-4 ${
                selectedLocationDetails.type === 'fuel' ? 'bg-orange-100' : 'bg-green-100'
              }`}>
                {selectedLocationDetails.type === 'fuel' ? (
                  <Fuel className="h-6 w-6 text-orange-600" />
                ) : (
                  <Battery className="h-6 w-6 text-green-600" />
                )}
              </div>
              <h3 className="text-xl font-semibold text-gray-900">{selectedLocationDetails.name}</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">{selectedLocationDetails.address}</p>
                <div className="flex items-center mt-2">
                  <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="text-sm text-gray-600">{selectedLocationDetails.distance} km away</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Details</h4>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Status:</span>{' '}
                    <span className={selectedLocationDetails.status === 'open' ? 'text-green-600' : 'text-red-600'}>
                      {selectedLocationDetails.status.toUpperCase()}
                    </span>
                  </p>
                  {selectedLocationDetails.price && (
                    <p className="text-sm">
                      <span className="font-medium">Price:</span> {selectedLocationDetails.price}
                    </p>
                  )}
                  {selectedLocationDetails.openingHours && (
                    <p className="text-sm">
                      <span className="font-medium">Hours:</span> {selectedLocationDetails.openingHours}
                    </p>
                  )}
                </div>
              </div>

              {selectedLocationDetails.facilities && (
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Facilities</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedLocationDetails.facilities.map((facility, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded"
                      >
                        {facility}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t pt-4 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedLocationDetails(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Close
                </button>
                <button
                  onClick={() => handleGetDirections(selectedLocationDetails)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Get Directions
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alerts Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Safe Zone Status</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real-time monitoring of your parking location
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                {isInSafeZone ? (
                  <CheckCircle2 className="h-6 w-6 text-green-500 mr-2" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
                )}
                <h3 className="text-xl font-semibold text-gray-900">Current Status</h3>
              </div>
              <p className="text-gray-600">
                {isInSafeZone 
                  ? "You are in a safe parking zone"
                  : "Warning: You are outside safe parking zone"}
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <MapPin className="h-6 w-6 text-blue-500 mr-2" />
                <h3 className="text-xl font-semibold text-gray-900">Location</h3>
              </div>
              <p className="text-gray-600">
                {userLocation 
                  ? "Mumbai, Maharashtra, India"
                  : "Location not available"}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {userLocation 
                  ? `Coordinates: ${userLocation[0].toFixed(6)}, ${userLocation[1].toFixed(6)}`
                  : "Enable location services to see your location"}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {userLocation 
                  ? `Near ${safeZones.length} designated safe parking areas`
                  : ""}
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <Shield className="h-6 w-6 text-indigo-500 mr-2" />
                <h3 className="text-xl font-semibold text-gray-900">Safe Zones</h3>
              </div>
              <p className="text-gray-600">
                {safeZones.length} designated safe parking areas in your vicinity
              </p>
            </div>
          </div>

          {!isInSafeZone && (
            <div className="mt-8 text-center">
              <div className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600">
                <AlertCircle className="h-5 w-5 mr-2" />
                {violationStatus}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Smart Features for Modern Parking</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered system makes parking hassle-free with real-time detection and seamless booking
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-blue-50 p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center mb-6">
                <Car className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI Parking Detection</h3>
              <p className="text-gray-600">
                YOLO-powered computer vision detects available parking spaces in real-time from CCTV footage
              </p>
            </div>
            
            <div className="bg-indigo-50 p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-indigo-600 rounded-full w-12 h-12 flex items-center justify-center mb-6">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Safe Zone Monitoring</h3>
              <p className="text-gray-600">
                Real-time monitoring of safe zones with instant violation alerts to prevent illegal parking
              </p>
            </div>
            
            <div className="bg-purple-50 p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-purple-600 rounded-full w-12 h-12 flex items-center justify-center mb-6">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Real-time Booking</h3>
              <p className="text-gray-600">
                Book parking slots in advance or on-the-go with our easy-to-use interface and secure payment
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
