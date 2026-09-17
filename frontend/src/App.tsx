import { useRef, useEffect, useState } from 'react'
import Globe from 'react-globe.gl'
import * as THREE from 'three'
import { feature } from 'topojson-client'
import { geoCentroid } from 'd3-geo'

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

const waterBodies = [
  { name: 'Pacific Ocean', lat: 0, lng: -160 },
  { name: 'Atlantic Ocean', lat: 30, lng: -40 },
  { name: 'Indian Ocean', lat: -20, lng: 75 },
  { name: 'Southern Ocean', lat: -65, lng: 0 },
  { name: 'Arctic Ocean', lat: 85, lng: 0 },
  { name: 'Mediterranean Sea', lat: 35, lng: 18 },
  { name: 'Red Sea', lat: 20, lng: 38 },
  { name: 'Arabian Sea', lat: 15, lng: 65 },
  { name: 'South China Sea', lat: 12, lng: 114 },
  { name: 'East China Sea', lat: 29, lng: 125 },
  { name: 'Caribbean Sea', lat: 15, lng: -75 },
  { name: 'North Sea', lat: 56.5, lng: 3.5 },
  { name: 'Baltic Sea', lat: 58, lng: 19 },
  { name: 'Black Sea', lat: 43, lng: 35 },
  { name: 'Caspian Sea', lat: 42, lng: 51 },
  { name: 'Sea of Japan', lat: 40, lng: 135 },
  { name: 'Yellow Sea', lat: 36, lng: 123 },
  { name: 'Persian Gulf', lat: 27, lng: 51 },
  { name: 'Gulf of Mexico', lat: 25, lng: -90 },
  { name: 'Gulf of Aden', lat: 12.5, lng: 47 },
  { name: 'Java Sea', lat: -5, lng: 111 },
  { name: 'Sulu Sea', lat: 8, lng: 120 },
  { name: 'Celebes Sea', lat: 3, lng: 122 },
  { name: 'Tasman Sea', lat: -40, lng: 160 },
  { name: 'Bering Sea', lat: 58, lng: -178 },
  { name: 'Sea of Okhotsk', lat: 55, lng: 150 },
  { name: 'Adriatic Sea', lat: 43, lng: 15 },
  { name: 'Aegean Sea', lat: 38.5, lng: 25 },
  { name: 'Ionian Sea', lat: 38, lng: 18.5 },
  { name: 'Strait of Malacca', lat: 2.5, lng: 101 },
  { name: 'Strait of Hormuz', lat: 26.6, lng: 56.3 },
  { name: 'Suez Canal', lat: 30.6, lng: 32.3 },
  { name: 'Panama Canal', lat: 9.08, lng: -79.68 },
  { name: 'Strait of Gibraltar', lat: 35.95, lng: -5.6 },
  { name: 'Bosphorus & Dardanelles', lat: 41.1, lng: 29.05 },
  { name: 'Bab-el-Mandeb', lat: 12.6, lng: 43.4 },
  { name: 'English Channel', lat: 49.8, lng: -1.5 },
  { name: 'Danish Straits', lat: 56.5, lng: 11 },
  { name: 'Strait of Taiwan', lat: 24, lng: 119.5 },
  { name: 'Sunda Strait', lat: -6, lng: 105.9 },
  { name: 'Lombok Strait', lat: -8.5, lng: 115.7 },
  { name: 'Northern Sea Route', lat: 76, lng: 100 },
  { name: 'Northwest Passage', lat: 74, lng: -95 },
  { name: 'Cape of Good Hope Route', lat: -34.5, lng: 18.5 },
  { name: 'Cape Horn Route', lat: -56, lng: -67 },
  { name: 'Great Lakes', lat: 45, lng: -83 },
  { name: 'Lake Victoria', lat: -1, lng: 33 },
  { name: 'Lake Baikal', lat: 53.5, lng: 108 },
  { name: 'Lake Titicaca', lat: -15.9, lng: -69.3 },
  { name: 'Lake Malawi', lat: -12, lng: 34.5 },
  { name: 'Lake Nicaragua', lat: 11.6, lng: -85.3 },
  { name: 'Lake Tanganyika', lat: -6.5, lng: 29.5 },
  { name: 'Lake Chad', lat: 13.2, lng: 14.2 },
  { name: 'Ligurian Sea', lat: 43.5, lng: 9 },
  { name: 'Tyrrhenian Sea', lat: 40, lng: 12 },
  { name: 'Balearic Sea', lat: 40, lng: 2.5 },
  { name: 'Alboran Sea', lat: 36, lng: -3.5 },
  { name: 'Sea of Marmara', lat: 40.7, lng: 28 },
  { name: 'Norwegian Sea', lat: 68, lng: 2 },
  { name: 'Greenland Sea', lat: 75, lng: -5 },
  { name: 'Irish Sea', lat: 53.5, lng: -5 },
  { name: 'Celtic Sea', lat: 50, lng: -8 },
  { name: 'White Sea', lat: 65.5, lng: 38 },
  { name: 'Barents Sea', lat: 75, lng: 40 },
  { name: 'Wadden Sea', lat: 53.4, lng: 6 },
  { name: 'Gulf of Suez', lat: 28.5, lng: 33 },
  { name: 'Gulf of Aqaba', lat: 29, lng: 34.7 },
  { name: 'Gulf of Oman', lat: 24.5, lng: 58.5 },
  { name: 'Mozambique Channel', lat: -18, lng: 42 },
  { name: 'Gulf of Thailand', lat: 10, lng: 101 },
  { name: 'Gulf of Tonkin', lat: 19.5, lng: 107.5 },
  { name: 'Andaman Sea', lat: 10, lng: 96 },
  { name: 'Timor Sea', lat: -11, lng: 127 },
  { name: 'Arafura Sea', lat: -9, lng: 133 },
  { name: 'Banda Sea', lat: -5, lng: 128 },
  { name: 'Flores Sea', lat: -7.5, lng: 121 },
  { name: 'Molucca Sea', lat: 1, lng: 125 },
  { name: 'Ceram Sea', lat: -2.5, lng: 129 },
  { name: 'Philippine Sea', lat: 18, lng: 135 },
  { name: 'Coral Sea', lat: -18, lng: 152 },
  { name: 'Bay of Bengal', lat: 15, lng: 88 },
  { name: 'Laccadive Sea', lat: 10, lng: 73 },
  { name: 'Gulf of California', lat: 27.5, lng: -111.5 },
  { name: 'Gulf of St. Lawrence', lat: 48, lng: -62 },
  { name: 'Labrador Sea', lat: 58, lng: -55 },
  { name: 'Beaufort Sea', lat: 72, lng: -140 },
  { name: 'Chukchi Sea', lat: 69, lng: -170 },
  { name: 'Hudson Bay', lat: 60, lng: -85 },
  { name: 'Sargasso Sea', lat: 30, lng: -60 },
  { name: 'Bay of Biscay', lat: 45, lng: -4 },
  { name: 'San Francisco Bay', lat: 37.8, lng: -122.3 },
  { name: 'Chesapeake Bay', lat: 38, lng: -76.2 },
  { name: 'Delaware Bay', lat: 39, lng: -75.2 },
  { name: 'Korea Strait', lat: 34.5, lng: 129 },
  { name: 'Yucatan Channel', lat: 21.5, lng: -85.5 },
  { name: 'Windward Passage', lat: 20, lng: -74 },
  { name: 'Mona Passage', lat: 18.3, lng: -67.8 },
  { name: 'Strait of Messina', lat: 38.2, lng: 15.6 },
  { name: 'Strait of Otranto', lat: 40, lng: 19 },
  { name: 'Kerch Strait', lat: 45.3, lng: 36.5 },
  { name: 'Strait of Juan de Fuca', lat: 48.3, lng: -124 },
  { name: 'Bonifacio Strait', lat: 41.4, lng: 9.2 },
  { name: 'Torres Strait', lat: -10.5, lng: 142.2 },
  { name: 'Sea of Azov', lat: 46, lng: 36.5 },
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
  const [countries, setCountries] = useState([])
  const [countryLabels, setCountryLabels] = useState([])
  const [rivers, setRivers] = useState([])
  const [riverLabels, setRiverLabels] = useState([])

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

  useEffect(() => {
    fetch('https://unpkg.com/world-atlas/countries-110m.json')
      .then((res) => res.json())
      .then((topology) => {
        const geo = feature(topology, topology.objects.countries)
        setCountries(geo.features)

        const labels = geo.features
          .filter((f) => f.properties?.name)
          .map((f) => {
            const [lng, lat] = geoCentroid(f)
            return { name: f.properties.name, lat, lng, kind: 'country' }
          })
        setCountryLabels(labels)
      })
      .catch((err) => console.error('Failed to load country borders:', err))
  }, [])

  useEffect(() => {
    // Natural Earth's free rivers dataset — not bundled with world-atlas,
    // so fetched separately, same CDN pattern as everything else.
    fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_rivers_lake_centerlines.geojson')
      .then((res) => res.json())
      .then((geo) => {
        const paths = []
        const labels = []
        const seenNames = new Set()

        geo.features.forEach((f) => {
          const name = f.properties?.name
          const geom = f.geometry
          if (!geom) return

          const lineStrings = geom.type === 'MultiLineString' ? geom.coordinates : [geom.coordinates]

          lineStrings.forEach((coords) => {
            if (!coords || coords.length < 2) return
            paths.push(coords.map(([lng, lat]) => [lat, lng]))

            if (name && !seenNames.has(name)) {
              seenNames.add(name)
              const mid = coords[Math.floor(coords.length / 2)]
              labels.push({ name, lat: mid[1], lng: mid[0], kind: 'river' })
            }
          })
        })

        setRivers(paths)
        setRiverLabels(labels)
      })
      .catch((err) => console.error('Failed to load rivers:', err))
  }, [])

  const textLabels = [
    ...waterBodies.map((w) => ({ ...w, kind: 'water' })),
    ...countryLabels,
    ...riverLabels,
  ]

  return (
    <div style={{ position: 'relative' }}>
      <Globe
        ref={globeRef}
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        globeMaterial={new THREE.MeshBasicMaterial({ color: '#18293a'})}

        polygonsData={countries}
        polygonCapColor={() => 'rgba(0, 0, 0, 0)'}
        polygonSideColor={() => 'rgba(0, 0, 0, 0)'}
        polygonAltitude={0}
        polygonStrokeColor={() => '#3fd9c7'}

        pathsData={rivers}
        pathColor={() => '#4a90d9'}
        pathStroke={0.3}
        pathPointAlt={() => 0.001}

        objectsData={ships}
        objectLat="lat"
        objectLng="lng"
        objectAltitude={0.001}
        objectThreeObject={buildShipMarker}
        onObjectClick={(obj) => setSelectedShip(obj.userData)}

        htmlElementsData={[...ports, ...lighthouses, ...textLabels]}
        htmlLat="lat"
        htmlLng="lng"
        htmlElement={(d) => {
          const el = document.createElement('div')
          el.style.pointerEvents = d.kind ? 'none' : 'auto'

          if (d.kind === 'water') {
            el.innerHTML = d.name
            el.style.color = 'rgba(150, 170, 190, 0.55)'
            el.style.fontFamily = "Georgia, 'Times New Roman', serif"
            el.style.fontStyle = 'italic'
            el.style.fontSize = '10px'
            el.style.letterSpacing = '0.04em'
            el.style.whiteSpace = 'nowrap'
          } else if (d.kind === 'country') {
            el.innerHTML = d.name
            el.style.color = 'rgba(200, 215, 225, 0.65)'
            el.style.fontFamily = "'IBM Plex Sans', system-ui, sans-serif"
            el.style.fontSize = '8px'
            el.style.letterSpacing = '0.02em'
            el.style.whiteSpace = 'nowrap'
            el.style.textTransform = 'uppercase'
          } else if (d.kind === 'river') {
            el.innerHTML = d.name
            el.style.color = 'rgba(74, 144, 217, 0.6)'
            el.style.fontFamily = "Georgia, 'Times New Roman', serif"
            el.style.fontStyle = 'italic'
            el.style.fontSize = '8px'
            el.style.whiteSpace = 'nowrap'
          } else {
            el.title = d.name
            if (lighthouses.includes(d)) {
              el.innerHTML = markerSVG('lighthouse')
            } else {
              el.innerHTML = markerSVG('port')
            }
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