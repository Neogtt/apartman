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
                  <li key={apt} className="debt-item">
                    <span className="debt-apt">Daire {apt}</span>
                    <span className="debt-amount negative">{amount} TL</span>
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
              <p className="modal-order-text">{selectedOrder.orderText}</p>
              {selectedOrder.orderTimeMessage && (
                <p className="order-time-message">📌 {selectedOrder.orderTimeMessage}</p>
              )}
              <p className="order-date">
                📅 {format(new Date(selectedOrder.createdAt), 'dd.MM.yyyy HH:mm')}
              </p>

              {/* Active View Actions: Complete/Cancel */}
              {selectedOrder.status === 'pending' && (
                <div className="completion-form">
                  <hr />
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
      )}

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
    </div>
  );
}

export default ApartmentManager;

