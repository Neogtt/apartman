import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import ApartmentLogin from './pages/ApartmentLogin';
import ApartmentOrder from './pages/ApartmentOrder';
import ApartmentManager from './pages/ApartmentManager';
import './App.css';

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [apartmentNumber, setApartmentNumber] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('apartmentUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setApartmentNumber(user.apartmentNumber);
        setIsLoggedIn(true);
      } catch (e) {
        localStorage.removeItem('apartmentUser');
      }
    }
  }, []);

  const handleLoginSuccess = (aptNumber) => {
    setApartmentNumber(aptNumber);
    setIsLoggedIn(true);
    navigate('/siparis-ver');
  };

  const handleLogout = () => {
    localStorage.removeItem('apartmentUser');
    setIsLoggedIn(false);
    setApartmentNumber('');
    navigate('/');
  };

  if (!isLoggedIn) {
    return <ApartmentLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app">
      <div className="sidebar">
        <h2>🏢 Apartman Görevlisi</h2>
        <div className="user-info">
          <p>🏠 {apartmentNumber}</p>
          <button onClick={handleLogout} className="logout-button">
            Çıkış Yap
          </button>
        </div>
        <ul className="sidebar-menu">
          <li>
            <NavLink
              to="/siparis-ver"
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              🏠 Sipariş Ver
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/gorevli"
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              🏢 Görevli Paneli
            </NavLink>
          </li>
        </ul>
      </div>
      <div className="main-content">
        <Routes>
          <Route path="/" element={<ApartmentOrder />} />
          <Route path="/siparis-ver" element={<ApartmentOrder />} />
          <Route path="/gorevli" element={<ApartmentManager />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;

