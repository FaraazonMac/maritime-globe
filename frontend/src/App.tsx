import { useState } from 'react'
import Globe from 'react-globe.gl'

const ships = [
  {
    name: 'MV Pacific Glory', lat: 1.29, lng: 103.85, type: 'Container Ship',
    flag: 'Panama', operator: 'Maersk Line', buildYear: 2015,
    origin: 'Shanghai', destination: 'Rotterdam',
  },
  {
    name: 'MV Atlas', lat: 51.95, lng: 4.14, type: 'Tanker',
    flag: 'Liberia', operator: 'MSC', buildYear: 2018,
    origin: 'Jebel Ali', destination: 'Singapore',
  },
  {
    name: 'MV Northern Star', lat: 29.97, lng: 32.55, type: 'Bulk Carrier',
    flag: 'Marshall Islands', operator: 'COSCO Shipping', buildYear: 2012,
    origin: 'Mumbai', destination: 'Hamburg',
  },
  {
    name: 'MV Ocean Pioneer', lat: 25.01, lng: 55.06, type: 'Passenger Ship',
    flag: 'Malta', operator: 'Star Bulk', buildYear: 2020,
    origin: 'Piraeus', destination: 'Busan',
  },
]

function App() {
  const [selectedShip, setSelectedShip] = useState(null)

  return (
    <div style={{ position: 'relative' }}>
      <Globe
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        pointsData={ships}
        pointLat="lat"
        pointLng="lng"
        pointLabel="name"
        pointColor={() => '#3fd9c7'}
        pointRadius={0.6}
        pointAltitude={0.01}
        onPointClick={(ship) => setSelectedShip(ship)}
        ringsData={ships}
        ringLat="lat"
        ringLng="lng"
        ringColor={() => (t) => `rgba(63, 217, 199, ${1 - t})`}
        ringMaxRadius={3}
        ringPropagationSpeed={2}
        ringRepeatPeriod={1500}
      />

      {selectedShip && (
        <div style={{
          position: 'absolute',
          top: 20,
          right: 20,
          width: 280,
          background: 'rgba(17, 30, 46, 0.85)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(63, 217, 199, 0.3)',
          borderLeft: '3px solid #3fd9c7',
          borderRadius: 8,
          padding: '20px 24px',
          color: '#e8edf2',
          fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
          boxShadow: '0 0 24px rgba(63, 217, 199, 0.15)',
        }}>
          <button
            onClick={() => setSelectedShip(null)}
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              background: 'none',
              border: 'none',
              color: '#7f95a8',
              fontSize: 16,
              cursor: 'pointer',
            }}
          >
            ✕
          </button>

          <h3 style={{ margin: '0 0 4px', fontSize: 18, letterSpacing: '-0.01em' }}>
            {selectedShip.name}
          </h3>
          <p style={{ margin: '0 0 16px', color: '#3fd9c7', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {selectedShip.type}
          </p>

          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, lineHeight: 1.9 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#7f95a8' }}>Flag</span><span>{selectedShip.flag}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#7f95a8' }}>Operator</span><span>{selectedShip.operator}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#7f95a8' }}>Built</span><span>{selectedShip.buildYear}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#7f95a8' }}>From</span><span>{selectedShip.origin}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#7f95a8' }}>To</span><span>{selectedShip.destination}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App