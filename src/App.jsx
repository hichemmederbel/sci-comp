import { useState, useEffect } from 'react';
import Window from './Window';

function App() {
  const [registry, setRegistry] = useState([]);
  const [openWindows, setOpenWindows] = useState([]);
  const [activeWindowId, setActiveWindowId] = useState(null);

  const [minimizedWindows, setMinimizedWindows] = useState([]);
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);

  useEffect(() => {
    const audio = new Audio('https://www.myinstants.com/media/sounds/windows-xp-startup.mp3');
    audio.play().catch(() => console.log("Cliquez pour le son"));

    fetch('/registry.json')
      .then(res => res.json())
      .then(data => setRegistry(data))
      .catch(err => console.error("Erreur de chargement du registry :", err));
  }, []);

  const openApp = (appId) => {
    if (!openWindows.includes(appId)) {
      setOpenWindows([...openWindows, appId]);
    }
    setMinimizedWindows(minimizedWindows.filter(id => id !== appId));
    setActiveWindowId(appId);
    setIsStartMenuOpen(false);
  };

  const closeApp = (appId) => {
    setOpenWindows(openWindows.filter(id => id !== appId));
    setMinimizedWindows(minimizedWindows.filter(id => id !== appId));
  };

  const toggleTaskbarApp = (appId) => {
    if (activeWindowId === appId && !minimizedWindows.includes(appId)) {
      setMinimizedWindows([...minimizedWindows, appId]);
    } else {
      setMinimizedWindows(minimizedWindows.filter(id => id !== appId));
      setActiveWindowId(appId);
    }
    setIsStartMenuOpen(false);
  };

  return (
    <div
      onClick={() => setIsStartMenuOpen(false)}
      style={{
        backgroundImage: 'url("/background.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* --- LE BUREAU --- */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Icône statique de la Corbeille */}
        <div
          style={{ width: '80px', textAlign: 'center', color: 'white', cursor: 'default', textShadow: '2px 2px 4px #000' }}
        >
          <div style={{ fontSize: '35px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40px' }}>
            <img src="/icons-windows-95-corbeille.png" alt="Corbeille" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
          </div>
          <div style={{ fontSize: '12px', marginTop: '5px', fontFamily: 'Tahoma, sans-serif', fontWeight: 'bold' }}>Corbeille</div>
        </div>

        {registry.map((app) => (
          <div
            key={app.id}
            onDoubleClick={() => openApp(app.id)}
            style={{ width: '80px', textAlign: 'center', color: 'white', cursor: 'pointer', textShadow: '2px 2px 4px #000' }}
          >
            <div style={{ fontSize: '35px' }}>
              {app.icon === 'computer' ? '💻' : '📁'}
            </div>
            <div style={{ fontSize: '12px', marginTop: '5px', fontFamily: 'Tahoma, sans-serif', fontWeight: 'bold' }}>{app.name}</div>
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
            onFocus={() => {
              setActiveWindowId(appId);
              setMinimizedWindows(minimizedWindows.filter(id => id !== appId));
            }}
            zIndex={activeWindowId === appId ? 100 : 10}
            isMinimized={minimizedWindows.includes(appId)}
            onMinimize={() => setMinimizedWindows([...minimizedWindows, appId])}
          />
        );
      })}

      {/* --- LE MENU DÉMARRER --- */}
      {isStartMenuOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute', bottom: '44px', left: 0, width: '250px',
            backgroundColor: '#c0c0c0',
            boxShadow: 'inset 1px 1px 0 #fff, inset -1px -1px 0 #000, inset 2px 2px 0 #dfdfdf, inset -2px -2px 0 #808080',
            zIndex: 10000, display: 'flex', flexDirection: 'row',
          }}
        >
          {/* Bandeau latéral gauche avec alignement naturel */}
          <div style={{ backgroundColor: '#000080', color: 'white', width: '32px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '8px' }}>
            <div style={{
              transform: 'rotate(-90deg)',
              fontFamily: 'Tahoma, sans-serif',
              fontSize: '18px',
              whiteSpace: 'nowrap',
              marginBottom: '45px'
            }}>
              <strong style={{ fontWeight: '900' }}>AMU</strong> System
            </div>
          </div>

          <div style={{ padding: '4px', display: 'flex', flexDirection: 'column', gap: '2px', width: '100%' }}>
            {registry.map(app => (
              <div
                key={app.id}
                onClick={() => openApp(app.id)}
                style={{ padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', fontFamily: 'Tahoma, sans-serif', fontSize: '13px' }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#000080'; e.currentTarget.style.color = '#fff'; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#000'; }}
              >
                {/* Boîte d'icône plus petite (22px) et centrée, avec marge fixe */}
                <div style={{ width: '22px', display: 'flex', justifyContent: 'center', marginRight: '8px' }}>
                  <span style={{ fontSize: '16px' }}>🚀</span>
                </div>
                <span>{app.name}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid #808080', borderBottom: '1px solid #fff', margin: '4px 2px' }}></div>
            <div
              style={{ padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', fontFamily: 'Tahoma, sans-serif', fontSize: '13px' }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#000080'; e.currentTarget.style.color = '#fff'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#000'; }}
            >
              {/* Même boîte d'icône stricte pour l'alignement */}
              <div style={{ width: '22px', display: 'flex', justifyContent: 'center', marginRight: '8px' }}>
                <span style={{ fontSize: '16px' }}>🔌</span>
              </div>
              <span>Arrêter...</span>
            </div>
          </div>
        </div>
      )}

      {/* --- LA BARRE DES TÂCHES --- */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '42px',
          backgroundColor: '#c0c0c0', borderTop: '1px solid #fff',
          boxShadow: 'inset 0 1px 0 #dfdfdf',
          display: 'flex', alignItems: 'center', padding: '3px 4px', zIndex: 9999,
        }}
      >
        <button
          onClick={() => setIsStartMenuOpen(!isStartMenuOpen)}
          style={{
            fontWeight: 'bold', height: '100%', padding: '0 8px', display: 'flex', alignItems: 'center', gap: '6px',
            backgroundColor: '#c0c0c0', border: 'none', color: 'black', fontFamily: 'Tahoma, sans-serif', fontSize: '14px',
            boxShadow: isStartMenuOpen
              ? 'inset 1px 1px 0 #000, inset -1px -1px 0 #fff, inset 2px 2px 0 #808080, inset -2px -2px 0 #dfdfdf'
              : 'inset 1px 1px 0 #fff, inset -1px -1px 0 #000, inset 2px 2px 0 #dfdfdf, inset -2px -2px 0 #808080',
            cursor: 'pointer', marginRight: '6px'
          }}
        >
          <img src="/icons-windows-95.png" alt="Start" style={{ width: '20px', height: '20px' }} />
          Démarrer
        </button>

        <div style={{ display: 'flex', gap: '4px', flexGrow: 1, height: '100%' }}>
          {openWindows.map(appId => {
            const appData = registry.find(a => a.id === appId);
            const isActive = activeWindowId === appId && !minimizedWindows.includes(appId);
            return (
              <button
                key={appId}
                onClick={() => toggleTaskbarApp(appId)}
                style={{
                  width: '160px', textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  backgroundColor: '#c0c0c0', border: 'none', color: 'black', fontFamily: 'Tahoma, sans-serif', fontSize: '13px',
                  padding: '0 8px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
                  boxShadow: isActive
                    ? 'inset 1px 1px 0 #000, inset -1px -1px 0 #fff, inset 2px 2px 0 #808080, inset -2px -2px 0 #dfdfdf'
                    : 'inset 1px 1px 0 #fff, inset -1px -1px 0 #000, inset 2px 2px 0 #dfdfdf, inset -2px -2px 0 #808080'
                }}
              >
                <span>📁</span>
                {appData?.name}
              </button>
            );
          })}
        </div>

        <div style={{
          padding: '0 12px', height: '80%', display: 'flex', alignItems: 'center',
          backgroundColor: '#c0c0c0', color: 'black', fontFamily: 'Tahoma, sans-serif', fontSize: '12px',
          boxShadow: 'inset 1px 1px 0 #808080, inset -1px -1px 0 #fff',
          marginLeft: '6px'
        }}>
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}

export default App;