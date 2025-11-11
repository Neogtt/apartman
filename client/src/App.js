import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import ApartmentLogin from './pages/ApartmentLogin';
import StaffLogin from './pages/StaffLogin';
import ApartmentOrder from './pages/ApartmentOrder';
import ApartmentManager from './pages/ApartmentManager';
import './App.css';

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isStaffLoggedIn, setIsStaffLoggedIn] = useState(false);
  const [apartmentNumber, setApartmentNumber] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const savedUser = localStorage.getItem('apartmentUser');
    const savedStaff = localStorage.getItem('staffUser');
    
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setApartmentNumber(user.apartmentNumber);
        setIsLoggedIn(true);
      } catch (e) {
        localStorage.removeItem('apartmentUser');
      }
    }

    if (savedStaff) {
      try {
        const staff = JSON.parse(savedStaff);
        setIsStaffLoggedIn(true);
      } catch (e) {
        localStorage.removeItem('staffUser');
      }
    }
  }, []);

  const handleLoginSuccess = (aptNumber) => {
    setApartmentNumber(aptNumber);
    setIsLoggedIn(true);
    navigate('/siparis-ver');
  };

  const handleStaffLoginSuccess = () => {
    setIsStaffLoggedIn(true);
    navigate('/gorevli');
  };

  const handleLogout = () => {
    localStorage.removeItem('apartmentUser');
    setIsLoggedIn(false);
    setApartmentNumber('');
    navigate('/');
  };

  const handleStaffLogout = () => {
    localStorage.removeItem('staffUser');
    setIsStaffLoggedIn(false);
    navigate('/');
  };

  // Görevli giriş sayfası kontrolü (önce kontrol edilmeli)
  if (location.pathname === '/staff-login' || location.pathname === '/gorevli') {
    if (!isStaffLoggedIn) {
      return <StaffLogin onLoginSuccess={handleStaffLoginSuccess} />;
    }
  }

  // Normal kullanıcı girişi için kontrol
  if (!isLoggedIn && location.pathname !== '/gorevli' && location.pathname !== '/staff-login') {
    return <ApartmentLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app">
        <div className="sidebar">
          <h2>🏢 Apartman Görevlisi</h2>
          <div className="user-info">
            {isStaffLoggedIn ? (
              <>
                <p>👤 Görevli</p>
                <button onClick={handleStaffLogout} className="logout-button">
                  Çıkış Yap
                </button>
              </>
            ) : (
              <>
                <p>🏠 {apartmentNumber}</p>
                <button onClick={handleLogout} className="logout-button">
                  Çıkış Yap
                </button>
              </>
            )}
          </div>
          <ul className="sidebar-menu">
            {!isStaffLoggedIn && (
              <li>
                <NavLink
                  to="/siparis-ver"
                  className={({ isActive }) => (isActive ? 'active' : '')}
                >
                  🏠 Sipariş Ver
                </NavLink>
              </li>
            )}
            {isStaffLoggedIn && (
              <li>
                <NavLink
                  to="/gorevli"
                  className={({ isActive }) => (isActive ? 'active' : '')}
                >
                  🏢 Görevli Paneli
                </NavLink>
              </li>
            )}
          </ul>
        </div>
      <div className="main-content">
        <Routes>
          <Route path="/" element={<ApartmentOrder />} />
          <Route path="/siparis-ver" element={<ApartmentOrder />} />
          <Route path="/gorevli" element={<ApartmentManager />} />
          <Route path="/staff-login" element={<StaffLogin onLoginSuccess={handleStaffLoginSuccess} />} />
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

