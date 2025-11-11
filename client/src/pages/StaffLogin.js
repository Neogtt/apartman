import React, { useState } from 'react';
import { loginStaff } from '../utils/api';
import './StaffLogin.css';

function StaffLogin({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username || !password) {
      setError('Lütfen kullanıcı adı ve şifrenizi giriniz.');
      setLoading(false);
      return;
    }

    try {
      const response = await loginStaff(username, password);
      if (response.data.success) {
        // Görevli bilgisini localStorage'a kaydet
        localStorage.setItem('staffUser', JSON.stringify({
          username: response.data.user.username,
          role: response.data.user.role
        }));
        onLoginSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Giriş yapılamadı. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="staff-login-container">
      <div className="staff-login-card">
        <h1>🏢 Görevli Girişi</h1>
        <p className="subtitle">Görevli paneline erişmek için giriş yapın</p>

        {error && (
          <div className="alert alert-error">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="staff-login-form">
          <div className="form-group">
            <label htmlFor="username">
              Kullanıcı Adı <span className="required">*</span>
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Kullanıcı adınızı giriniz"
              required
              disabled={loading}
              autoComplete="username"
            />
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
              autoComplete="current-password"
            />
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
            <li>Görevli paneline erişim için özel giriş gereklidir</li>
            <li>Tüm siparişleri görüntüleyebilir ve yönetebilirsiniz</li>
            <li>Çöp alma işaretli daireler özel olarak gösterilir</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default StaffLogin;

