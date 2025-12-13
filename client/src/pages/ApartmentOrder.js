import React, { useState, useEffect } from 'react';
import { createApartmentOrder, getOrderTimeInfo, getApartmentOrdersByNumber, updateApartmentOrder } from '../utils/api';
import { format } from 'date-fns';
import './ApartmentOrder.css';

function ApartmentOrder() {
  const [apartmentNumber, setApartmentNumber] = useState('');
  const [orderText, setOrderText] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isTrashCollection, setIsTrashCollection] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [timeInfo, setTimeInfo] = useState(null);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [myOrders, setMyOrders] = useState([]);
  const [totalDebt, setTotalDebt] = useState(0);

  // Kullanıcı giriş yaptıysa daire numarasını otomatik doldur ve saat bilgisini al
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

    // Sipariş saat bilgisini al
    loadTimeInfo();
    // Her 30 saniyede bir güncelle
    const timeInterval = setInterval(loadTimeInfo, 30000);
    return () => clearInterval(timeInterval);
  }, []);

  useEffect(() => {
    if (apartmentNumber) {
      loadMyOrders();
    } else {
      setMyOrders([]);
      setTotalDebt(0);
    }
  }, [apartmentNumber]);

  const loadMyOrders = async () => {
    if (!apartmentNumber) return;
    try {
      const response = await getApartmentOrdersByNumber(apartmentNumber);
      const orders = response.data || [];
      setMyOrders(orders);

      // Borç hesapla (Tamamlanmış ama ödenmemiş siparişler)
      const debt = orders.reduce((total, order) => {
        if (order.status === 'completed' && order.price && !order.isPaid) {
          return total + parseFloat(order.price);
        }
        return total;
      }, 0);
      setTotalDebt(debt);
    } catch (err) {
      console.error('Sipariş geçmişi yüklenemedi:', err);
    }
  };

  const loadTimeInfo = async () => {
    try {
      const response = await getOrderTimeInfo();
      setTimeInfo(response.data);
    } catch (error) {
      console.error('Saat bilgisi yüklenemedi:', error);
    }
  };

  // Web Speech API'yi başlat
  useEffect(() => {
    const initSpeechRecognition = () => {
      try {
        // Tarayıcı kontrolü
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
          console.warn('Bu tarayıcı ses tanımayı desteklemiyor');
          return;
        }

        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;
        recognitionInstance.lang = 'tr-TR'; // Türkçe

        recognitionInstance.onstart = () => {
          console.log('Ses tanıma başladı');
          setIsListening(true);
        };

        recognitionInstance.onresult = (event) => {
          if (event.results && event.results.length > 0) {
            const transcript = event.results[0][0].transcript;
            setOrderText(prev => prev + (prev ? ' ' : '') + transcript);
          }
          setIsListening(false);
        };

        recognitionInstance.onerror = (event) => {
          console.error('Ses tanıma hatası:', event.error);
          setIsListening(false);

          let errorMessage = 'Ses tanıma hatası oluştu.';

          switch (event.error) {
            case 'no-speech':
              errorMessage = 'Konuşma algılanamadı. Lütfen tekrar deneyin ve net konuşun.';
              break;
            case 'audio-capture':
              errorMessage = 'Mikrofon bulunamadı. Lütfen mikrofonunuzun bağlı olduğundan emin olun.';
              break;
            case 'not-allowed':
              errorMessage = 'Mikrofon erişim izni gerekli. Lütfen tarayıcı ayarlarından izin verin.';
              break;
            case 'aborted':
              errorMessage = 'Ses tanıma iptal edildi.';
              break;
            case 'network':
              errorMessage = 'Ağ hatası. İnternet bağlantınızı kontrol edin.';
              break;
            case 'service-not-allowed':
              errorMessage = 'Ses tanıma servisi kullanılamıyor. Chrome veya Edge tarayıcısını kullanmayı deneyin.';
              break;
            default:
              errorMessage = `Ses tanıma hatası: ${event.error}. Chrome veya Edge tarayıcısını kullanmayı deneyin.`;
          }

          setError(errorMessage);
          setTimeout(() => setError(''), 5000);
        };

        recognitionInstance.onend = () => {
          setIsListening(false);
        };

        recognitionInstance.onnomatch = () => {
          setError('Konuşma anlaşılamadı. Lütfen tekrar deneyin.');
          setIsListening(false);
          setTimeout(() => setError(''), 5000);
        };

        setRecognition(recognitionInstance);
      } catch (error) {
        console.error('Ses tanıma başlatma hatası:', error);
        setError('Ses tanıma başlatılamadı. Chrome veya Edge tarayıcısını kullanmayı deneyin.');
        setTimeout(() => setError(''), 5000);
      }
    };

    initSpeechRecognition();
  }, []);

  // Düzenleme modunu başlat
  const handleEdit = (order) => {
    setEditingOrderId(order.id);
    setOrderText(order.orderText);
    setContactInfo(order.contactInfo || '');
    setPaymentAmount(order.paymentAmount || '');
    setIsTrashCollection(order.isTrashCollection || false);

    // Formun görünür olduğundan emin ol (mobil için önemli)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Düzenlemeyi iptal et
  const cancelEdit = () => {
    setEditingOrderId(null);
    setOrderText('');
    setContactInfo('');
    setPaymentAmount('');
    setIsTrashCollection(false);
  };

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
      let response;

      if (editingOrderId) {
        // Mevcut siparişi güncelle
        response = await updateApartmentOrder(editingOrderId, {
          orderText: orderText.trim(),
          contactInfo: contactInfo.trim(),
          paymentAmount: paymentAmount,
          isTrashCollection: isTrashCollection
        });
      } else {
        // Yeni sipariş oluştur
        response = await createApartmentOrder({
          apartmentNumber: apartmentNumber.trim(),
          orderText: orderText.trim(),
          contactInfo: contactInfo.trim(),
          paymentAmount: paymentAmount,
          isTrashCollection: isTrashCollection
        });
      }

      // Saat bilgisi varsa güncelle (yeni siparişte döner)
      if (response.data && response.data.timeInfo) {
        setTimeInfo(response.data.timeInfo);
      }

      setSuccess(true);

      // State'leri temizle
      const savedUser = localStorage.getItem('apartmentUser');
      if (!savedUser) {
        setApartmentNumber('');
      }

      cancelEdit(); // Formu sıfırla

      loadMyOrders();

      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err.response?.data?.error || 'Sipariş işlenirken bir hata oluştu. Lütfen tekrar deneyin.');
      if (err.response?.data?.timeInfo) {
        setTimeInfo(err.response.data.timeInfo);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStartListening = () => {
    if (!recognition) {
      setError('Ses tanıma bu tarayıcıda desteklenmiyor. Chrome veya Edge tarayıcısını kullanmayı deneyin.');
      setTimeout(() => setError(''), 5000);
      return;
    }

    if (isListening) {
      try {
        recognition.stop();
        setIsListening(false);
      } catch (error) {
        console.error('Durdurma hatası:', error);
        setIsListening(false);
      }
    } else {
      setError('');
      try {
        recognition.start();
      } catch (error) {
        console.error('Başlatma hatası:', error);
        setError('Ses tanıma başlatılamadı. Lütfen tekrar deneyin veya Chrome/Edge kullanın.');
        setIsListening(false);
        setTimeout(() => setError(''), 5000);
      }
    }
  };

  return (
    <div className="apartment-order-container">
      <div className="apartment-order-card">
        <h1>🏠 Apartman Sipariş Formu</h1>
        <p className="subtitle">İhtiyaçlarınızı buradan görevliye iletebilirsiniz</p>

        {timeInfo && (
          <div className={`time - info - box ${timeInfo.canOrder ? 'time-info-open' : 'time-info-closed'} `}>
            <div className="time-info-header">
              <span className="time-icon">🕐</span>
              <span className="current-time">{timeInfo.currentTime} (GMT+3)</span>
            </div>
            <p className="time-message">{timeInfo.message}</p>
            {!timeInfo.canOrder && (
              <p className="time-warning">⚠️ Şu anda sipariş kabul edilmiyor</p>
            )}
          </div>
        )}

        {totalDebt > 0 && (
          <div className="debt-alert">
            <span className="debt-icon">💰</span>
            <div className="debt-info">
              <h3>Toplam Borcunuz: {totalDebt} TL</h3>
              <p>Ödenmemiş tamalanan siparişleriniz bulunmaktadır. Lütfen görevliye ödeme yapınız.</p>
            </div>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            ✅ Siparişiniz başarıyla gönderildi!
            {timeInfo && timeInfo.message && (
              <div style={{ marginTop: '10px', fontSize: '0.9rem' }}>
                📌 {timeInfo.message}
              </div>
            )}
            <div style={{ marginTop: '10px' }}>Görevli en kısa sürede sizinle iletişime geçecektir.</div>
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
              onBlur={loadMyOrders}
            />
            {localStorage.getItem('apartmentUser') && (
              <small className="form-hint">Daire numaranız giriş yaptığınız bilgilerden alınmıştır</small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="orderText">
              İhtiyaç / Sipariş Detayları <span className="required">*</span>
            </label>
            <div className="textarea-with-voice">
              <textarea
                id="orderText"
                value={orderText}
                onChange={(e) => setOrderText(e.target.value)}
                placeholder="Örn: 2 kg domates, 1 ekmek, 1 paket süt... veya mikrofon butonuna tıklayarak sesli giriş yapabilirsiniz"
                rows="5"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={handleStartListening}
                disabled={loading || !recognition}
                className={`voice - button ${isListening ? 'listening' : ''} `}
                title={isListening ? 'Dinlemeyi durdurmak için tıklayın' : 'Sesli giriş için tıklayın'}
              >
                {isListening ? '🛑' : '🎤'}
              </button>
            </div>
            {isListening && (
              <small className="listening-indicator">
                🎙️ Dinliyorum... Konuşun (durdurmak için tekrar tıklayın)
              </small>
            )}
            {!recognition && (
              <small className="form-hint warning-hint">
                ⚠️ Bu tarayıcı ses tanımayı desteklemiyor. Mac'te Chrome veya Edge tarayıcısını kullanmanız önerilir.
                <br />
                Safari'de ses tanıma özelliği çalışmayabilir.
              </small>
            )}
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
              <span>🗑️ Çöp Yok / Kapıyı Çalmayınız</span>
            </label>
            <small className="form-hint">
              İşaretlerseniz görevli çöp için kapınızı çalmayacaktır.
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="paymentAmount">
              💲 Bırakılan Tutar (TL)
            </label>
            <input
              type="number"
              id="paymentAmount"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder="Örn: 200"
              min="0"
              disabled={loading}
            />
            <small className="form-hint">Sadece rakam giriniz (Tutar)</small>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className={`submit-button ${editingOrderId ? 'edit-mode' : ''}`}
              disabled={loading || (!editingOrderId && timeInfo && !timeInfo.canOrder)}
            >
              {loading ? 'İşleniyor...' :
                editingOrderId ? '✏️ Siparişi Güncelle' :
                  (timeInfo && !timeInfo.canOrder) ? '⏰ Sipariş Saatleri Dışı' : '📤 Siparişi Gönder'}
            </button>

            {editingOrderId && (
              <button
                type="button"
                className="cancel-edit-button"
                onClick={cancelEdit}
                disabled={loading}
              >
                ❌ Vazgeç
              </button>
            )}
          </div>
        </form>

        {myOrders.length > 0 && (
          <div className="my-orders-section">
            <h3>📋 Geçmiş Siparişleriniz</h3>
            <div className="my-orders-list">
              {myOrders.slice(0, 5).map(order => (
                <div key={order.id} className={`my - order - item status - ${order.status} ${!order.isPaid && order.status === 'completed' && order.price ? 'unpaid' : ''} `}>
                  <div className="my-order-header">
                    <span className="my-order-date">{format(new Date(order.createdAt), 'dd.MM HH:mm')}</span>
                    <div className="header-actions">
                      <span className="my-order-status">
                        {order.status === 'pending' ? '⏳ Bekliyor' :
                          order.status === 'completed' ? '✅ Tamamlandı' : '❌ İptal'}
                      </span>
                      {order.status === 'pending' && (
                        <button
                          className="edit-order-btn"
                          onClick={() => handleEdit(order)}
                          title="Siparişi Düzenle"
                          disabled={timeInfo && !timeInfo.canOrder}
                        >
                          ✏️
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="my-order-text">{order.orderText}</div>
                  {order.status === 'completed' && order.price && (
                    <div className="my-order-price">
                      <span>{order.price} TL</span>
                      <span className={order.isPaid ? 'paid-tag' : 'unpaid-tag'}>
                        {order.isPaid ? 'Ödendi' : 'Borç'}
                      </span>
                    </div>
                  )}
                </div>
              ))}
              {myOrders.length > 5 && (
                <div className="more-orders">... ve {myOrders.length - 5} sipariş daha</div>
              )}
            </div>
          </div>
        )}

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

