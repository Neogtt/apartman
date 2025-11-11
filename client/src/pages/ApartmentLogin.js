import React, { useState } from 'react';
import { loginApartment, getBlocks } from '../utils/api';
import './ApartmentLogin.css';

function ApartmentLogin({ onLoginSuccess }) {
  const [apartmentNumber, setApartmentNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [blocks, setBlocks] = useState([]);

  React.useEffect(() => {
    loadBlocks();
  }, []);

  const loadBlocks = async () => {
    try {
      const response = await getBlocks();
      setBlocks(response.data || []);
    } catch (error) {
      console.error('Bloklar yüklenemedi:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!apartmentNumber || !password) {
      setError('Lütfen daire numarası ve şifrenizi giriniz.');
      setLoading(false);
      return;
    }

    try {
      const response = await loginApartment(apartmentNumber, password);
      if (response.data.success) {
        // Kullanıcı bilgisini localStorage'a kaydet
        localStorage.setItem('apartmentUser', JSON.stringify({
          apartmentNumber: response.data.apartmentNumber,
          id: response.data.user.id
        }));
        onLoginSuccess(response.data.apartmentNumber);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Giriş yapılamadı. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="apartment-login-container">
      <div className="apartment-login-card">
        <h1>🏠 Apartman Giriş</h1>
        <p className="subtitle">Daire numaranız ve şifrenizle giriş yapın</p>

        {error && (
          <div className="alert alert-error">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="apartment-login-form">
          <div className="form-group">
            <label htmlFor="apartmentNumber">
              Daire Numarası <span className="required">*</span>
            </label>
            <select
              id="apartmentNumber"
              value={apartmentNumber}
              onChange={(e) => setApartmentNumber(e.target.value)}
              required
              disabled={loading}
              className="apartment-select"
            >
              <option value="">Daire seçiniz</option>
              {blocks.map(apt => (
                <option key={apt.value} value={apt.value}>
                  {apt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Şifre <span className="required">*</span>
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Şifrenizi giriniz"
              required
              disabled={loading}
            />
            <small className="form-hint">İlk girişte şifreniz otomatik oluşturulur</small>
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Giriş yapılıyor...' : '🔑 Giriş Yap'}
          </button>
        </form>

        <div className="info-box">
          <h3>ℹ️ Bilgi</h3>
          <ul>
            <li>3 blok var: A, B ve C blokları</li>
            <li>Her blokta 10 daire bulunmaktadır</li>
            <li>İlk girişte şifreniz otomatik oluşturulur</li>
            <li>Giriş yaptıktan sonra daire numaranız otomatik doldurulur</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ApartmentLogin;

