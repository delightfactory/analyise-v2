import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import Products from './pages/Products'
import Upload from './pages/Upload'
import { loadFromLocalStorage } from './utils/dataProcessor'

function App() {
  const [hasData, setHasData] = useState(false)

  useEffect(() => {
    const checkData = async () => {
      const data = await loadFromLocalStorage()
      setHasData(!!data)
    }
    checkData()
  }, [])

  return (
    <Router>
      <Routes>
        {!hasData ? (
          <>
            <Route path="/upload" element={<Upload onDataLoaded={() => setHasData(true)} />} />
            <Route path="*" element={<Navigate to="/upload" replace />} />
          </>
        ) : (
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="customers" element={<Customers />} />
            <Route path="products" element={<Products />} />
            <Route path="upload" element={<Upload onDataLoaded={() => setHasData(true)} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        )}
      </Routes>
    </Router>
  )
}

export default App
