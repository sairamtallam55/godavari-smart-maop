import {createRoot} from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

// Register service worker for offline caching of facility data and map tiles
registerSW({
  immediate: true,
  onOfflineReady() {
    console.log('Godavari SmartMap is ready to work offline with cached facility data and map tiles.');
  },
});

createRoot(document.getElementById('root')!).render(<App />);
