import { useRef, useEffect, useState } from 'react'
import Globe from 'react-globe.gl'
import * as THREE from 'three'

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

function markerSVG(kind) {
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
// Draws a clean flat arrow onto a small canvas, once per color, and reuses
// it — this is what makes it look crisp like the old SVG version while
// staying cheap enough to render hundreds of times.
const shipTextureCache = {}
function getShipTexture(shape, color) {
  const key = `${shape}-${color}`
  if (shipTextureCache[key]) return shipTextureCache[key]

  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = color

  if (shape === 'arrow') {
    ctx.beginPath()
    ctx.moveTo(size / 2, 4)
    ctx.lineTo(size - 10, size - 10)
    ctx.lineTo(size / 2, size - 22)
    ctx.lineTo(10, size - 10)
    ctx.closePath()
    ctx.fill()
  } else {
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size / 2 - 6, 0, Math.PI * 2)
    ctx.fill()
  }

  const texture = new THREE.CanvasTexture(canvas)
  shipTextureCache[key] = texture
  return texture
}
// Builds a real 3D marker per ship: a cone pointing its actual heading if
// it's moving, or a plain dot if it's anchored (heading isn't meaningful
// for a stationary ship). `d` is the ship's data object.
function buildShipMarker(d) {
  const color =
    d.status === 'moving' ? '#3fd9c7' :
    d.status === 'anchored-port' ? '#4a90d9' : '#e07b3f'

  const group = new THREE.Group()
  group.userData = d

  const shape = d.status === 'moving' ? 'arrow' : 'circle'
  const material = new THREE.SpriteMaterial({
    map: getShipTexture(shape, color),
    rotation: shape === 'arrow' ? THREE.MathUtils.degToRad(d.heading ?? 0) : 0,
    sizeAttenuation: false,
  })
  const sprite = new THREE.Sprite(material)
  sprite.scale.set(0.008, 0.008, 1)
  group.add(sprite)

  return group
}
function App() {
  const globeRef = useRef()
  const [selectedShip, setSelectedShip] = useState(null)
  const [ships, setShips] = useState([])

  useEffect(() => {
    const loadShips = () => {
      fetch('http://127.0.0.1:8000/ships')
        .then((res) => res.json())
        .then((data) => setShips(data))
        .catch((err) => console.error('Failed to load ships:', err))
    }

    loadShips()
    const interval = setInterval(loadShips, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ position: 'relative' }}>
      <Globe
        ref={globeRef}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"

        objectsData={ships}
        objectLat="lat"
        objectLng="lng"
        objectAltitude={0.01}
        objectThreeObject={buildShipMarker}
        onObjectClick={(obj) => setSelectedShip(obj.userData)}

        htmlElementsData={[...ports, ...lighthouses]}
        htmlLat="lat"
        htmlLng="lng"
        htmlElement={(d) => {
          const el = document.createElement('div')
          el.title = d.name
          el.style.pointerEvents = 'auto'

          if (lighthouses.includes(d)) {
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
              <span style={{ color: '#7f95a8' }}>Status</span><span>{selectedShip.status}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#7f95a8' }}>Speed</span><span>{selectedShip.speed} kn</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#7f95a8' }}>Heading</span><span>{selectedShip.heading}°</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App