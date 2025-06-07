import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker, useJsApiLoader, InfoWindow } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px',
};

const Map = ({ locations }) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyCrS1WMwIuKwYEYm6oir3d3obZU7Yw4tMo',
  });
  
  const [locationsWithCoords, setLocationsWithCoords] = useState([]);
  const [activeLocation, setActiveLocation] = useState(null);

  const geocodeAddress = async (address) => {
    if (!window.google) return null;
    
    const geocoder = new window.google.maps.Geocoder();
    return new Promise((resolve) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results[0]) {
          resolve({
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng(),
          });
        } else {
          resolve(null);
        }
      });
    });
  };

  // Обработка локаций
  useEffect(() => {
    if (!isLoaded || !locations?.length) return;

    const processLocations = async () => {
      const processed = await Promise.all(
        locations.map(async (loc) => {
          const fullAddress = [
            loc.address1,
            loc.address2,
            loc.city,
            loc.zip,
            loc.country
          ].filter(Boolean).join(', ');
          
          const coords = await geocodeAddress(fullAddress);
          return coords ? { ...loc, ...coords } : null;
        })
      );

      setLocationsWithCoords(processed.filter(Boolean));
    };

    processLocations();
  }, [isLoaded, locations]);

  if (!isLoaded) return <div>Загрузка карты...</div>;

  return (
    <div className="map-container">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={locationsWithCoords[0] || { lat: 52.2297, lng: 21.0122 }}
        zoom={14}
      >
        {locationsWithCoords.map((loc, index) => (
          <Marker
            key={loc.id || index}
            position={{ lat: loc.lat, lng: loc.lng }}
            onMouseOver={() => setActiveLocation(loc)}
            onMouseOut={() => setActiveLocation(null)}
          >
            {activeLocation?.id === loc.id && (
              <InfoWindow
                position={{ lat: loc.lat, lng: loc.lng }}
                onCloseClick={() => setActiveLocation(null)}
              >
                <div style={{ padding: '10px' }}>
                  <h4><b>Location Name:</b>{loc.name}</h4>
                  <p><b>Address:</b></p>
                  <p>
                    {loc.address1}<br />
                    {loc.address2 && <>{loc.address2}<br /></>}
                    {loc.city}, {loc.zip}<br />
                    {loc.country}
                  </p>
                  <p><b>Opening Hours:</b> {loc.openingHours}</p>
                  <p><b>Closing Hours:</b> {loc.closingHours}</p>
                  <p><b>Free Parking:</b> {loc.freeParking ? "Yes" : "No"}</p>
                  <p><b>Store Name:</b> {loc.storeName}</p>
                </div>
              </InfoWindow>
            )}
          </Marker>
        ))}
      </GoogleMap>
    </div>
  );
};

export default Map;
