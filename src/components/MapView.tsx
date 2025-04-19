import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Item } from './Listings';
import { Typography } from '@mui/material'; // Added import for Typography

interface MapViewProps {
  items: Item[];
}

const MapView = ({ items }: MapViewProps) => {
  const validItems = items.filter(item => item.latitude && item.longitude);

  if (validItems.length === 0) return <Typography>No items with location data.</Typography>;

  return (
    <MapContainer center={[validItems[0].latitude, validItems[0].longitude]} zoom={13} style={{ height: '400px', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {validItems.map(item => (
        <Marker key={item.id} position={[item.latitude!, item.longitude!]}>
          <Popup>
            <Typography>{item.title}</Typography>
            <Typography>Price: ${item.price} / day</Typography>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapView;