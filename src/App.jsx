import { useState, useEffect } from 'react';
import Window from './Window';

function App() {
  const [registry, setRegistry] = useState([]);
  const [openWindows, setOpenWindows] = useState([]);
  const [activeWindowId, setActiveWindowId] = useState(null);

  // 1. On charge le JSON au démarrage
  useEffect(() => {
    fetch('/registry.json')
      .then(res => res.json())
      .then(data => setRegistry(data))
      .catch(err => console.error("Erreur de chargement du registry :", err));
  }, []);

  // 2. Fonction pour ouvrir une app
  const openApp = (appId) => {
    if (!openWindows.includes(appId)) {
      setOpenWindows([...openWindows, appId]);
    }
    setActiveWindowId(appId);
  };

  // 3. Fonction pour fermer une app
  const closeApp = (appId) => {
    setOpenWindows(openWindows.filter(id => id !== appId));
  };

  return (
    <div
      style={{
        backgroundColor: '#008080',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* --- LE BUREAU (AFFICHAGE DES ICÔNES) --- */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {registry.map((app) => (
          <div
            key={app.id}
            onDoubleClick={() => openApp(app.id)}
            style={{
              width: '80px',
              textAlign: 'center',
              color: 'white',
              cursor: 'pointer',
              textShadow: '1px 1px 2px black'
            }}
          >
            {/* Remplaçant temporaire d'icône */}
            <div style={{ fontSize: '40px' }}>📁</div>
            <div style={{ fontSize: '12px', marginTop: '5px' }}>{app.name}</div>
          </div>
        ))}
      </div>

      {/* --- LES FENÊTRES OUVERTES --- */}
      {openWindows.map((appId) => {
        const appData = registry.find(a => a.id === appId);
        return (
          <Window
            key={appId}
            app={appData}
            onClose={closeApp}
            onFocus={() => setActiveWindowId(appId)}
            zIndex={activeWindowId === appId ? 100 : 10}
          />
        );
      })}
    </div>
  );
}

export default App;