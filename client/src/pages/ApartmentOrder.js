import React, { useState, useEffect } from 'react';
import { createApartmentOrder } from '../utils/api';
import './ApartmentOrder.css';

function ApartmentOrder() {
  const [apartmentNumber, setApartmentNumber] = useState('');
  const [orderText, setOrderText] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [isTrashCollection, setIsTrashCollection] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Kullanıcı giriş yaptıysa daire numarasını otomatik doldur
  useEffect(() => {
    const savedUser = localStorage.getItem('apartmentUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setApartmentNumber(user.apartmentNumber || '');
      } catch (e) {
        console.error('Kullanıcı bilgisi okunamadı:', e);
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!apartmentNumber.trim() || !orderText.trim()) {
      setError('Lütfen daire numarası ve sipariş detaylarını giriniz.');
      return;
    }

    setLoading(true);
    try {
      await createApartmentOrder({
        apartmentNumber: apartmentNumber.trim(),
        orderText: orderText.trim(),
        contactInfo: contactInfo.trim(),
        isTrashCollection: isTrashCollection
      });
      setSuccess(true);
      // Daire numarasını sadece giriş yapılmamışsa temizle
      const savedUser = localStorage.getItem('apartmentUser');
      if (!savedUser) {
        setApartmentNumber('');
      }
      setOrderText('');
      setContactInfo('');
      setIsTrashCollection(false);
      
      // Başarı mesajını 3 saniye sonra kaldır
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Sipariş gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="apartment-order-container">
      <div className="apartment-order-card">
        <h1>🏠 Apartman Sipariş Formu</h1>
        <p className="subtitle">İhtiyaçlarınızı buradan görevliye iletebilirsiniz</p>

        {success && (
          <div className="alert alert-success">
            ✅ Siparişiniz başarıyla gönderildi! Görevli en kısa sürede sizinle iletişime geçecektir.
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="apartment-order-form">
          <div className="form-group">
            <label htmlFor="apartmentNumber">
              Daire Numarası <span className="required">*</span>
            </label>
            <input
              type="text"
              id="apartmentNumber"
              value={apartmentNumber}
              onChange={(e) => setApartmentNumber(e.target.value.toUpperCase())}
              placeholder="Örn: A1, B5, C10"
              required
              disabled={loading || !!localStorage.getItem('apartmentUser')}
              className={localStorage.getItem('apartmentUser') ? 'disabled-input' : ''}
            />
            {localStorage.getItem('apartmentUser') && (
              <small className="form-hint">Daire numaranız giriş yaptığınız bilgilerden alınmıştır</small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="orderText">
              İhtiyaç / Sipariş Detayları <span className="required">*</span>
            </label>
            <textarea
              id="orderText"
              value={orderText}
              onChange={(e) => setOrderText(e.target.value)}
              placeholder="Örn: 2 kg domates, 1 ekmek, 1 paket süt..."
              rows="5"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="contactInfo">
              İletişim Bilgisi (Opsiyonel)
            </label>
            <input
              type="text"
              id="contactInfo"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder="Telefon numarası veya not"
              disabled={loading}
            />
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isTrashCollection}
                onChange={(e) => setIsTrashCollection(e.target.checked)}
                disabled={loading}
              />
              <span>🗑️ Çöp Alma</span>
            </label>
            <small className="form-hint">
              Çöp alma işaretlenirse, görevli kapınızı çalmaz, sadece çöpü alır
            </small>
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Gönderiliyor...' : '📤 Siparişi Gönder'}
          </button>
        </form>

        <div className="info-box">
          <h3>ℹ️ Bilgi</h3>
          <ul>
            <li>Siparişiniz görevliye iletilecektir</li>
            <li>Görevli siparişinizi aldıktan sonra sizinle iletişime geçecektir</li>
            <li>Daha önce verdiğiniz siparişleri görmek için görevli ile iletişime geçin</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ApartmentOrder;

