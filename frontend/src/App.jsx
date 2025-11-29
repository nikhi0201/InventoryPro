import React from 'react'
import { Routes, Route, Link, Navigate } from 'react-router-dom'

// pages
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Suppliers from './pages/Suppliers'

// auth utils
import { getToken, logout, getUser } from './utils/auth'

// galaxy background component
import GalaxyBackground from './components/GalaxyBackground'

function Private({ children }) {
  return getToken() ? children : <Navigate to="/login" />
}

export default function App() {
  const user = getUser()

  // Local path to the uploaded assignment PDF (served from your machine during dev)
  const ASSIGNMENT_PATH = '/mnt/data/InventoryPro_Assignment.pdf'

  return (
    <div className="min-h-screen relative bg-beast-900 text-slate-100 overflow-hidden">

      {/* Galaxy Background */}
      <GalaxyBackground />

      {/* App Content */}
      <div className="app-content relative z-20">

        {/* ======= NAVIGATION BAR ======= */}
        <nav className="w-full px-6 md:px-10 py-4 flex items-center bg-transparent">
          {/* LEFT — Brand */}
          <Link
            to="/"
            className="text-2xl font-bold text-white tracking-wide hover:text-slate-200 transition-colors"
          >
            InventoryPro
          </Link>

          {/* Space between left and right */}
          <div className="flex-1" />

          {/* RIGHT — Menu Items */}
          <div className="nav-items flex items-center gap-10">
            <Link to="/" className="nav-item">Home</Link>
            <Link to="/products" className="nav-item">Products</Link>
            <Link to="/suppliers" className="nav-item">Suppliers</Link>

            

            {/* Auth links */}
            {getToken() ? (
              <>
                {/* show user name if available */}
                {user?.name ? (
                  <span className="text-sm text-slate-200 ml-2 hidden md:inline">{user.name}</span>
                ) : null}

                <button
                  onClick={logout}
                  className="nav-item nav-cta ml-2 px-4 py-2 rounded-md text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/signup" className="nav-item">Sign up</Link>
                <Link to="/login" className="nav-item nav-cta px-4 py-2 rounded-md text-sm">Login</Link>
              </>
            )}
          </div>
        </nav>

        {/* ======= ROUTES ======= */}
        <main className="container mx-auto px-6 py-8">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<Private><Dashboard /></Private>} />
            <Route path="/products" element={<Private><Products /></Private>} />
            <Route path="/suppliers" element={<Private><Suppliers /></Private>} />
          </Routes>
        </main>

      </div>
    </div>
  )
}
