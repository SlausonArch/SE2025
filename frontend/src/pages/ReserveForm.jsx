import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reservationsAPI, tablesAPI, getCurrentUser } from '../utils/api';
import './ReserveForm.css';

const ReserveForm = () => {
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);
  const [reservationStatus, setReservationStatus] = useState({});
  const [date, setDate] = useState('');
  const [timePeriod, setTimePeriod] = useState('점심');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [card, setCard] = useState('');
  const [people, setPeople] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 사용자 인증 확인
    const user = getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }

    // 테이블 정보 로드
    loadTables();
  }, [navigate]);

  useEffect(() => {
    // 날짜와 시간이 선택되면 예약 상태 로드
    if (date && timePeriod) {
      loadReservationStatus();
    }
  }, [date, timePeriod]);

  const loadTables = async () => {
    try {
      const tablesData = await tablesAPI.getAll();
      setTables(tablesData);
    } catch (error) {
      console.error('테이블 정보 로드 실패:', error);
      alert('테이블 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadReservationStatus = async () => {
    try {
      const statusData = await reservationsAPI.getStatus(date, timePeriod);
      setReservationStatus(statusData.status);
    } catch (error) {
      console.error('예약 상태 로드 실패:', error);
      setReservationStatus({});
    }
  };

  const getStatusColor = (tableId) => {
    const status = reservationStatus[tableId];
    switch (status) {
      case 'available': return '#4caf50';
      case 'booked': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const getStatusText = (tableId) => {
    const status = reservationStatus[tableId];
    switch (status) {
      case 'available': return '예약 가능';
      case 'booked': return '예약 완료';
      default: return '확인 중';
    }
  };

  const handleSelect = (tableId) => {
    if (isSubmitting || reservationStatus[tableId] !== 'available') return;
    setSelectedTable(tableId);
  };

  const handleSubmitReservation = async () => {
    if (!name || !phone || !card || people < 1) {
      alert('모든 정보를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const reservationData = {
        table_id: selectedTable,
        reservation_date: date,
        time_period: timePeriod,
        name,
        phone,
        credit_card: card,
        guests: people
      };

      await reservationsAPI.create(reservationData);
      
      // 예약 상태 업데이트
      setReservationStatus(prev => ({
        ...prev,
        [selectedTable]: 'booked'
      }));
      
      setShowModal(true);
      setSelectedTable(null);
      setName(''); 
      setPhone(''); 
      setCard(''); 
      setPeople(1);
    } catch (error) {
      console.error('예약 실패:', error);
      alert(error.message || '예약에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalConfirm = () => {
    setShowModal(false);
    navigate('/home');
  };

  if (loading) {
    return <div className="container">로딩 중...</div>;
  }

  return (
    <div className="container">
      <button onClick={() => navigate(-1)} className="backIcon">⬅</button>
      <h2>예약 날짜 및 시간 선택</h2>
      <div className="datetime-select">
        <input
          type="date"
          value={date}
          onChange={(e) => {
            const selected = new Date(e.target.value);
            const today = new Date();
            const maxDate = new Date();
            today.setHours(0, 0, 0, 0);
            maxDate.setDate(today.getDate() + 30);
            maxDate.setHours(0, 0, 0, 0);
            selected.setHours(0, 0, 0, 0);

            if (selected < today || selected > maxDate) {
              alert('예약 날짜는 오늘부터 30일 이내여야 합니다.');
              return;
            }

            setDate(e.target.value);
          }}
          className="input"
        />
        <select value={timePeriod} onChange={(e) => setTimePeriod(e.target.value)} className="input">
          <option value="점심">점심</option>
          <option value="저녁">저녁</option>
        </select>
      </div>

      {selectedTable ? (
        <div className="formBox">
          <h3>예약 정보 입력</h3>
          <p>Table {selectedTable} / {tables.find(t => t.id === selectedTable)?.capacity}인</p>
          <input 
            type="text" 
            placeholder="이름" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            className="input" 
          />
          <input 
            type="text" 
            placeholder="전화번호" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
            className="input" 
          />
          <input 
            type="text" 
            placeholder="카드번호" 
            value={card} 
            onChange={(e) => setCard(e.target.value)} 
            className="input" 
          />
          <select 
            value={people} 
            onChange={(e) => setPeople(Number(e.target.value))} 
            className="input"
          >
            {[...Array(tables.find(t => t.id === selectedTable)?.capacity || 1)].map((_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}명</option>
            ))}
          </select>
          <div>
            <button 
              onClick={handleSubmitReservation} 
              className="submitButton"
              disabled={isSubmitting}
            >
              {isSubmitting ? '예약 중...' : '예약하기'}
            </button>
            <button onClick={() => setSelectedTable(null)} className="cancelButton">취소</button>
          </div>
        </div>
      ) : (
        date ? (
          <div>
            <h3>테이블 예약 상태</h3>
            <div className="tableList">
              {tables.map((table) => {
                const isAvailable = reservationStatus[table.id] === 'available';
                return (
                  <button
                    key={table.id}
                    onClick={() => handleSelect(table.id)}
                    className="tableButton"
                    style={{ 
                      backgroundColor: getStatusColor(table.id), 
                      cursor: isAvailable ? 'pointer' : 'not-allowed' 
                    }}
                    disabled={!isAvailable || isSubmitting}
                  >
                    Table {table.id} ({table.capacity}인)
                    <div className="statusText">
                      {getStatusText(table.id)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <p>날짜를 선택해주세요.</p>
        )
      )}

      {showModal && (
        <div className="modalOverlay">
          <div className="modal">
            <p className="modalText">✅ 예약이 완료되었습니다!</p>
            <button onClick={handleModalConfirm} className="modalButton">확인</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReserveForm;
