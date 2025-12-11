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
  const [filter, setFilter] = useState('all'); // all, pending, completed
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
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

      await updateApartmentOrderStatus(orderId, data); // API update needed to accept object or changed signature
      await loadOrders();
      await loadStats();
      setSelectedOrder(null);
      setPrice('');
      setIsPaid(true);
    } catch (error) {
      alert('Durum güncellenirken hata oluştu: ' + (error.response?.data?.error || error.message));
    }
  };

  const openCompleteModal = (order) => {
    setSelectedOrder(order);
    setPrice('');
    setIsPaid(true);
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
      } catch (error) {
        alert('Sipariş silinirken hata oluştu: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'all' || order.status === filter;
    const matchesSearch = searchTerm === '' ||
      order.apartmentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderText.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
          <div className="stat-card">
            <div className="stat-value">{stats.totalOrders}</div>
            <div className="stat-label">Toplam Sipariş</div>
          </div>
          <div className="stat-card stat-pending">
            <div className="stat-value">{stats.pendingOrders}</div>
            <div className="stat-label">Bekleyen</div>
          </div>
          <div className="stat-card stat-completed">
            <div className="stat-value">{stats.completedOrders}</div>
            <div className="stat-label">Tamamlanan</div>
          </div>
          <div className="stat-card stat-apartments">
            <div className="stat-value">{stats.apartmentsWithPendingOrders}</div>
            <div className="stat-label">Bekleyen Daire</div>
          </div>
        </div>
      )}

      {/* Completion Modal */}
      {selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Sipariş Tamamlama</h3>
            <p><strong>Daire:</strong> {selectedOrder.apartmentNumber}</p>
            <p><strong>Sipariş:</strong> {selectedOrder.orderText}</p>

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
              <button className="submit-button" onClick={submitCompletion}>Kaydet ve Tamamla</button>
              <button className="cancel-button" onClick={() => setSelectedOrder(null)}>İptal</button>
            </div>
          </div>
        </div>
      )}

      <div className="filters-section">
        <div className="filter-buttons">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            Tümü ({orders.length})
          </button>
          <button
            className={filter === 'pending' ? 'active' : ''}
            onClick={() => setFilter('pending')}
          >
            Bekleyen ({orders.filter(o => o.status === 'pending').length})
          </button>
          <button
            className={filter === 'completed' ? 'active' : ''}
            onClick={() => setFilter('completed')}
          >
            Tamamlanan ({orders.filter(o => o.status === 'completed').length})
          </button>
        </div>
        <input
          type="text"
          placeholder="🔍 Daire numarası veya sipariş ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="orders-list">
        {filteredOrders.length === 0 ? (
          <div className="empty-state">
            <p>📭 Henüz sipariş bulunmuyor</p>
          </div>
        ) : (
          filteredOrders.map(order => {
            const statusBadge = getStatusBadge(order.status);
            return (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-apartment">
                    <span className="apartment-icon">🏠</span>
                    <span className="apartment-number">Daire {order.apartmentNumber}</span>
                  </div>
                  <span className={`status-badge ${statusBadge.class}`}>
                    {statusBadge.text}
                  </span>
                </div>

                <div className="order-content">
                  {order.isTrashCollection && (
                    <div className="trash-badge">
                      🗑️ ÇÖP ALMA - Kapı çalınmayacak
                    </div>
                  )}
                  {order.orderType && (
                    <div className={`order-type-badge order-type-${order.orderType}`}>
                      {order.orderType === 'morning' && '🌅 Sabah Siparişi'}
                      {order.orderType === 'lunch' && '🍽️ Öğlen Siparişi'}
                      {order.orderType === 'evening' && '🌆 Akşam Siparişi'}
                    </div>
                  )}
                  {order.orderTimeMessage && (
                    <p className="order-time-message">📌 {order.orderTimeMessage}</p>
                  )}
                  <p className="order-text">{order.orderText}</p>
                  {order.contactInfo && (
                    <p className="order-contact">📞 {order.contactInfo}</p>
                  )}

                  {/* Payment Info Display */}
                  {order.status === 'completed' && order.price && (
                    <div className={`payment-info ${order.isPaid ? 'payment-paid' : 'payment-debt'}`}>
                      <span className="payment-amount">💰 {order.price} TL</span>
                      <span className="payment-status">
                        {order.isPaid ? '✅ Ödendi' : '❌ ÖDENMEDİ (Borç)'}
                      </span>
                    </div>
                  )}

                  <p className="order-date">
                    📅 {format(new Date(order.createdAt), 'dd.MM.yyyy HH:mm')}
                  </p>
                </div>

                <div className="order-actions">
                  {order.status === 'pending' && (
                    <>
                      <button
                        className="action-button action-complete"
                        onClick={() => openCompleteModal(order)}
                      >
                        ✅ Tamamla
                      </button>
                      <button
                        className="action-button action-cancel"
                        onClick={() => handleStatusChange(order.id, 'cancelled')}
                      >
                        ❌ İptal
                      </button>
                    </>
                  )}
                  {order.status === 'completed' && (
                    <button
                      className="action-button action-pending"
                      onClick={() => handleStatusChange(order.id, 'pending')}
                    >
                      ⏳ Beklemeye Al
                    </button>
                  )}
                  <button
                    className="action-button action-delete"
                    onClick={() => handleDelete(order.id)}
                  >
                    🗑️ Sil
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default ApartmentManager;

