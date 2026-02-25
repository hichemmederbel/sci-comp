import { Rnd } from 'react-rnd';

function Window({ app, onClose, onFocus, zIndex }) {
    return (
        <Rnd
            default={{
                x: 100 + Math.random() * 50, // Décale un peu chaque nouvelle fenêtre
                y: 100 + Math.random() * 50,
                width: 400,
                height: 350,
            }}
            minWidth={300}
            minHeight={200}
            bounds="parent"
            onDragStart={onFocus}
            style={{ zIndex: zIndex }}
            className="window"
        >
            {/* Barre de titre */}
            <div className="title-bar" onMouseDown={onFocus} style={{ cursor: 'move' }}>
                <div className="title-bar-text">{app.name} - {app.author}</div>
                <div className="title-bar-controls">
                    <button aria-label="Minimize"></button>
                    <button aria-label="Maximize"></button>
                    <button aria-label="Close" onClick={() => onClose(app.id)}></button>
                </div>
            </div>

            {/* Contenu (L'Iframe du sous-projet) */}
            <div className="window-body" style={{ margin: 0, padding: 0, height: 'calc(100% - 30px)' }}>
                <iframe
                    src={app.entry_point}
                    style={{ width: '100%', height: '100%', border: 'none', backgroundColor: '#fff' }}
                    title={app.name}
                />
            </div>
        </Rnd>
    );
}

export default Window;