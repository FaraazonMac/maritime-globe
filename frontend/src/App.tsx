import './App.css'

const ships = [
  { name: "MV Pacific Glory", type: "Container Ship" },
  { name: "MV Atlas", type: "Tanker" },
  { name: "MV Northern Star", type: "Bulk Carrier" },
]

function App() {
  return (
    <div>
      <h1>Mohammed's Maritime Globe</h1>
      <ul>
        {ships.map((ship) => (
          <li key={ship.name}>{ship.name} — {ship.type}</li>
        ))}
      </ul>
    </div>
  )
}

export default App