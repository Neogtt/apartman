import React, { useState, useEffect } from 'react';
import {
  getApartmentOrders,
  updateApartmentOrderStatus,
  deleteApartmentOrder,
  getApartmentStats
} from '../utils/api';
import { format } from 'date-fns';
import './ApartmentManager.css';

function ApartmentManager() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [viewMode, setViewMode] = useState('active'); // 'active' | 'past'
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [selectedOrder, setSelectedOrder] = useState(null); // For completion OR viewing details
  const [debtModalOpen, setDebtModalOpen] = useState(false);

  // Completion form state
  const [price, setPrice] = useState('');
  const [isPaid, setIsPaid] = useState(true);

  useEffect(() => {
    loadOrders();
    loadStats();
    // Her 30 saniyede bir güncelle
    const interval = setInterval(() => {
      loadOrders();
      loadStats();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      const response = await getApartmentOrders();
      setOrders(response.data || []);
    } catch (error) {
      console.error('Siparişler yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await getApartmentStats();
      setStats(response.data);
    } catch (error) {
      console.error('İstatistikler yüklenemedi:', error);
    }
  };

  const handleStatusChange = async (orderId, newStatus, orderPrice = null, orderIsPaid = null) => {
    try {
      const data = { status: newStatus };
      if (orderPrice !== null) data.price = orderPrice;
      if (orderIsPaid !== null) data.isPaid = orderIsPaid;

      await updateApartmentOrderStatus(orderId, data);
      await loadOrders();
      await loadStats();
      setSelectedOrder(null);
      setPrice('');
      setIsPaid(true);
    } catch (error) {
      alert('Durum güncellenirken hata oluştu: ' + (error.response?.data?.error || error.message));
    }
  };

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setPrice('');
    setIsPaid(true); // Default to paid
  };

  const submitCompletion = () => {
    if (!price) {
      alert('Lütfen tutar giriniz');
      return;
    }
    handleStatusChange(selectedOrder.id, 'completed', price, isPaid);
  };

  const handleDelete = async (orderId) => {
    if (window.confirm('Bu siparişi silmek istediğinizden emin misiniz?')) {
      try {
        await deleteApartmentOrder(orderId);
        await loadOrders();
        await loadStats();
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(null);
        }
      } catch (error) {
        alert('Sipariş silinirken hata oluştu: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  // Filter Logic
  const filteredOrders = orders.filter(order => {
    // View Mode Filter
    let matchesMode = false;
    if (viewMode === 'active') {
      matchesMode = order.status === 'pending';
    } else {
      matchesMode = order.status === 'completed' || order.status === 'cancelled';
    }

    // Search Filter
    const matchesSearch = searchTerm === '' ||
      order.apartmentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderText.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesMode && matchesSearch;
  });

  // Debt Calculation Logic
  const getDebtStats = () => {
    const debtMap = {};
    let totalDebt = 0;
    let debtorCount = 0;

    orders.forEach(order => {
      if (order.status === 'completed' && order.price && !order.isPaid) {
        const apt = order.apartmentNumber;
        if (!debtMap[apt]) {
          debtMap[apt] = 0;
          debtorCount++;
        }
        const amount = parseFloat(order.price) || 0;
        debtMap[apt] += amount;
        totalDebt += amount;
      }
    });

    return { debtMap, totalDebt, debtorCount };
  };

  const debtInfo = getDebtStats();

  // Payment Logic
  const [paymentAmounts, setPaymentAmounts] = useState({});

  const handlePaymentAmountChange = (apt, value) => {
    setPaymentAmounts(prev => ({
      ...prev,
      [apt]: value
    }));
  };

  const handleFullPayment = async (apt) => {
    if (!window.confirm(`Daire ${apt} için tüm borcu kapatmak istiyor musunuz?`)) return;

    const aptOrders = orders.filter(o =>
      o.apartmentNumber === apt &&
      o.status === 'completed' &&
      o.price &&
      !o.isPaid
    );

    try {
      for (const order of aptOrders) {
        await updateApartmentOrderStatus(order.id, { isPaid: true });
      }
      alert(`Daire ${apt} için tüm borçlar ödendi.`);
      await loadOrders();
      await loadStats();
    } catch (error) {
      alert('Ödeme işlemi sırasında hata oluştu.');
      console.error(error);
    }
  };

  const handlePartialPayment = async (apt) => {
    const amount = parseFloat(paymentAmounts[apt]);
    if (!amount || amount <= 0) {
      alert('Geçerli bir tutar giriniz.');
      return;
    }

    if (!window.confirm(`Daire ${apt} için ${amount} TL ödeme almak istiyor musunuz?`)) return;

    // Find unpaid orders, sort by date (oldest first)
    // Assuming createdAt is ISO string
    let aptOrders = orders.filter(o =>
      o.apartmentNumber === apt &&
      o.status === 'completed' &&
      o.price &&
      !o.isPaid
    ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    let remaining = amount;
    let updatedCount = 0;

    try {
      for (const order of aptOrders) {
        if (remaining <= 0) break;

        const orderPrice = parseFloat(order.price);

        if (remaining >= orderPrice) {
          // Fully pay this order
          await updateApartmentOrderStatus(order.id, { isPaid: true });
          remaining -= orderPrice;
          updatedCount++;
        } else {
          // Partial pay this order (Update price)
          // We update the price to be the remaining debt
          const newPrice = orderPrice - remaining;
          await updateApartmentOrderStatus(order.id, { price: newPrice });
          remaining = 0;
          updatedCount++;
        }
      }

      alert(`Ödeme alındı. ${updatedCount} işlem güncellendi.`);
      setPaymentAmounts(prev => ({ ...prev, [apt]: '' }));
      await loadOrders();
      await loadStats();
    } catch (error) {
      alert('Ödeme işlemi sırasında hata oluştu.');
      console.error(error);
    }
  };


  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: 'Bekliyor', class: 'status-pending' },
      completed: { text: 'Tamamlandı', class: 'status-completed' },
      cancelled: { text: 'İptal', class: 'status-cancelled' }
    };
    return badges[status] || badges.pending;
  };

  if (loading) {
    return (
      <div className="apartment-manager-container">
        <div className="loading">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="apartment-manager-container">
      <div className="apartment-manager-header">
        <h1>🏢 Apartman Görevlisi Paneli</h1>
        <button onClick={() => { loadOrders(); loadStats(); }} className="refresh-button">
          🔄 Yenile
        </button>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card stat-pending">
            <div className="stat-value">{stats.pendingOrders}</div>
            <div className="stat-label">Bekleyen Sipariş</div>
          </div>

          <div
            className="stat-card stat-debt clickable-stat"
            onClick={() => setDebtModalOpen(true)}
          >
            <div className="stat-value">{debtInfo.debtorCount}</div>
            <div className="stat-label">Borçlu Daire</div>
            <div className="stat-sublabel">Toplam: {debtInfo.totalDebt} TL</div>
          </div>
        </div>
      )}

      {/* Debt List Modal */}
      {debtModalOpen && (
        <div className="modal-overlay" onClick={() => setDebtModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>💰 Borçlu Daireler</h3>
            {Object.keys(debtInfo.debtMap).length === 0 ? (
              <p>Borçlu daire bulunmamaktadır.</p>
            ) : (
              <ul className="debt-list">
                {Object.entries(debtInfo.debtMap).map(([apt, amount]) => (
                  <li key={apt} className="debt-item-container">
                    <div className="debt-item-header">
                      <span className="debt-apt">Daire {apt}</span>
                      <span className="debt-amount negative">{parseFloat(amount).toFixed(2)} TL</span>
                    </div>
                    <div className="debt-actions-row">
                      <input
                        type="number"
                        className="debt-input"
                        placeholder="Tutar"
                        value={paymentAmounts[apt] || ''}
                        onChange={(e) => handlePaymentAmountChange(apt, e.target.value)}
                      />
                      <button
                        className="btn-pay"
                        onClick={() => handlePartialPayment(apt)}
                        disabled={!paymentAmounts[apt]}
                      >
                        Öde
                      </button>
                      <button
                        className="btn-pay-all"
                        onClick={() => handleFullPayment(apt)}
                      >
                        Tamamını Öde
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="modal-actions">
              <button className="cancel-button" onClick={() => setDebtModalOpen(false)}>Kapat</button>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail / Completion Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Daire {selectedOrder.apartmentNumber}</h3>
              <span className={`status-badge ${getStatusBadge(selectedOrder.status).class}`}>
                {getStatusBadge(selectedOrder.status).text}
              </span>
            </div>

            <div className="modal-body-content">
              {/* Detailed Order Info - Visible for all statuses */}
              {selectedOrder.isTrashCollection && (
                <div className="trash-badge">
                  ⛔️ KAPIYI ÇALMA (Çöp Yok / İstemiyor)
                </div>
              )}

              {selectedOrder.orderType && (
                <div className={`order-type-badge order-type-${selectedOrder.orderType}`}>
                  {selectedOrder.orderType === 'morning' && '🌅 Sabah Siparişi'}
                  {selectedOrder.orderType === 'lunch' && '🍽️ Öğlen Siparişi'}
                  {selectedOrder.orderType === 'evening' && '🌆 Akşam Siparişi'}
                </div>
              )}

              {selectedOrder.orderTimeMessage && (
                <p className="order-time-message">📌 {selectedOrder.orderTimeMessage}</p>
              )}

              <p className="modal-order-text">{selectedOrder.orderText}</p>

              {selectedOrder.contactInfo && (
                <p className="order-contact">📞 {selectedOrder.contactInfo}</p>
              )}

              <p className="order-date">
                📅 {format(new Date(selectedOrder.createdAt), 'dd.MM.yyyy HH:mm')}
              </p>

              {/* Payment Amount Display & Calculation */}
              {selectedOrder.paymentAmount ? (
                <div className="payment-note-display">
                  <span className="payment-note-label">💵 Bırakılan Tutar:</span>
                  <span className="payment-note-value">{selectedOrder.paymentAmount} TL</span>

                  {price && (
                    <div className={`payment-calculation ${parseFloat(selectedOrder.paymentAmount) - parseFloat(price) >= 0 ? 'change-positive' : 'change-negative'}`}>
                      {parseFloat(selectedOrder.paymentAmount) - parseFloat(price) >= 0
                        ? `💰 Para Üstü: ${(parseFloat(selectedOrder.paymentAmount) - parseFloat(price)).toFixed(2)} TL`
                        : `⚠️ Borç: ${(parseFloat(price) - parseFloat(selectedOrder.paymentAmount)).toFixed(2)} TL`
                      }
                    </div>
                  )}
                </div>
              ) : (
                <div className="payment-warning-display">
                  ⚠️ Sipariş için ödeme tutarı girilmedi
                </div>
              )}

              <hr />
              {selectedOrder.status === 'pending' && (
                <div className="completion-form">
                  <h4>Siparişi Tamamla</h4>
                  <div className="form-group">
                    <label>Tutar (TL):</label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="Örn: 50"
                      autoFocus
                    />
                  </div>

                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={isPaid}
                        onChange={(e) => setIsPaid(e.target.checked)}
                      />
                      Ödeme Peşin Alındı
                    </label>
                  </div>
                  {!isPaid && <p className="debt-warning">⚠️ Bu tutar dairenin borcuna yazılacak.</p>}

                  <div className="modal-actions">
                    <button className="submit-button" onClick={submitCompletion}>✅ Tamamla</button>
                    <button className="delete-button" onClick={() => handleStatusChange(selectedOrder.id, 'cancelled')}>❌ İptal Et</button>
                  </div>
                </div>
              )}

              {/* Past View Info */}
              {selectedOrder.status === 'completed' && (
                <div className="past-order-info">
                  <hr />
                  <p><strong>Tutar:</strong> {selectedOrder.price} TL</p>
                  <p><strong>Durum:</strong> {selectedOrder.isPaid ? '✅ Ödendi' : '❌ Borç Yazıldı'}</p>

                  <div className="modal-actions">
                    <button className="action-pending" onClick={() => handleStatusChange(selectedOrder.id, 'pending')}>↩️ Geri Al (Beklemeye)</button>
                    <button className="action-delete" onClick={() => handleDelete(selectedOrder.id)}>🗑️ Sil</button>
                  </div>
                </div>
              )}

              {selectedOrder.status === 'cancelled' && (
                <div className="modal-actions">
                  <button className="action-delete" onClick={() => handleDelete(selectedOrder.id)}>🗑️ Sil</button>
                </div>
              )}

            </div>

            <button className="close-modal-btn" onClick={() => setSelectedOrder(null)}>Kapat</button>
          </div>
        </div>
      )
      }

      <div className="view-tabs">
        <button
          className={`tab-button ${viewMode === 'active' ? 'active' : ''}`}
          onClick={() => setViewMode('active')}
        >
          📋 Güncel Siparişler
        </button>
        <button
          className={`tab-button ${viewMode === 'past' ? 'active' : ''}`}
          onClick={() => setViewMode('past')}
        >
          🗄️ Geçmiş Siparişler
        </button>
      </div>

      <div className="filters-section">
        <input
          type="text"
          placeholder="🔍 Daire numarası ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className={`orders-grid ${viewMode}`}>
        {filteredOrders.length === 0 ? (
          <div className="empty-state">
            <p>📭 {viewMode === 'active' ? 'Bekleyen sipariş yok' : 'Geçmiş sipariş bulunamadı'}</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div
              key={order.id}
              className={`mini-order-card ${order.status}`}
              onClick={() => openOrderDetails(order)}
            >
              <div className="mini-card-icon">🏠</div>
              <div className="mini-card-content">
                <span className="mini-card-apt">Daire {order.apartmentNumber}</span>
                {viewMode === 'past' && (
                  <span className="mini-card-date">
                    {format(new Date(order.createdAt), 'dd.MM HH:mm')}
                  </span>
                )}
              </div>
              <div className="mini-card-arrow">👉</div>
            </div>
          ))
        )}
      </div>
    </div >
  );
}

export default ApartmentManager;

