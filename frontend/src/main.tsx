import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
// Prevent the browser's own pinch-to-zoom from fighting with the globe's
// zoom — without this, trackpad pinch zooms the whole webpage (including
// the detail panel) instead of just the 3D globe.
document.addEventListener('wheel', (e) => {
  if (e.ctrlKey) e.preventDefault()
}, { passive: false })
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
