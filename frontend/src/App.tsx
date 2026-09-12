import { useRef, useEffect, useState } from 'react'
import Globe from 'react-globe.gl'

const ports = [
  { name: 'Rotterdam', lat: 51.95, lng: 4.14 },
  { name: 'Singapore', lat: 1.26, lng: 103.82 },
  { name: 'Shanghai', lat: 31.23, lng: 121.47 },
  { name: 'Jebel Ali', lat: 25.01, lng: 55.06 },
]

const lighthouses = [
  { name: 'Eddystone Lighthouse', lat: 50.11, lng: -4.32 },
  { name: 'Cape Otway Lighthouse', lat: -38.86, lng: 143.51 },
]

const ships = [
  {
    name: 'MV Pacific Glory', lat: 1.5, lng: 104.1, type: 'Container Ship',
    flag: 'Panama', operator: 'Maersk Line', buildYear: 2015,
    origin: 'Shanghai', destination: 'Rotterdam', status: 'moving',
  },
  {
    name: 'MV Atlas', lat: 51.95, lng: 4.14, type: 'Tanker',
    flag: 'Liberia', operator: 'MSC', buildYear: 2018,
    origin: 'Jebel Ali', destination: 'Singapore', status: 'anchored-port',
  },
  {
    name: 'MV Northern Star', lat: 29.97, lng: 32.55, type: 'Bulk Carrier',
    flag: 'Marshall Islands', operator: 'COSCO Shipping', buildYear: 2012,
    origin: 'Mumbai', destination: 'Hamburg', status: 'anchored-sea',
  },
  {
    name: 'MV Ocean Pioneer', lat: 25.3, lng: 55.4, type: 'Passenger Ship',
    flag: 'Malta', operator: 'Star Bulk', buildYear: 2020,
    origin: 'Piraeus', destination: 'Busan', status: 'anchored-port',
  },
]

function markerSVG(kind, status) {
  if (kind === 'ship') {
    if (status === 'moving') {
      return `<svg width="18" height="18" viewBox="0 0 24 24">
        <path d="M12 2 L20 20 L12 15 L4 20 Z" fill="#3fd9c7" stroke="#0a1420" stroke-width="1"/>
      </svg>`
    }
    const color = status === 'anchored-port' ? '#4a90d9' : '#e07b3f'
    return `<svg width="14" height="14" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8" fill="${color}" stroke="#0a1420" stroke-width="1.5"/>
    </svg>`
  }
  if (kind === 'lighthouse') {
    return `<svg width="14" height="14" viewBox="0 0 24 24">
      <path d="M12 2 L18 22 L6 22 Z" fill="#f2c94c" stroke="#0a1420" stroke-width="1"/>
    </svg>`
  }
  return `<svg width="16" height="16" viewBox="0 0 24 24">
    <circle cx="12" cy="6" r="3" fill="none" stroke="#7f95a8" stroke-width="2"/>
    <path d="M12 9 L12 20 M6 14 A6 7 0 0 0 12 20 A6 7 0 0 0 18 14"
      fill="none" stroke="#7f95a8" stroke-width="2"/>
  </svg>`
}

function App() {
  const globeRef = useRef()
  const [selectedShip, setSelectedShip] = useState(null)

  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.controls().minDistance = 150
    }
  }, [])

  return (
    <div style={{ position: 'relative' }}>
      <Globe
        ref={globeRef}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        ringsData={ships}
        ringLat="lat"
        ringLng="lng"
        ringColor={() => (t) => `rgba(63, 217, 199, ${1 - t})`}
        ringMaxRadius={3}
        ringPropagationSpeed={2}
        ringRepeatPeriod={1500}
        htmlElementsData={[...ships, ...ports, ...lighthouses]}
        htmlLat="lat"
        htmlLng="lng"
        htmlElement={(d) => {
          const el = document.createElement('div')
          el.title = d.name
          el.style.pointerEvents = 'auto'

          if (d.type) {
            el.innerHTML = markerSVG('ship', d.status)
            el.style.cursor = 'pointer'
            el.addEventListener('click', () => setSelectedShip(d))
          } else if (lighthouses.includes(d)) {
            el.innerHTML = markerSVG('lighthouse')
          } else {
            el.innerHTML = markerSVG('port')
          }

          return el
        }}
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