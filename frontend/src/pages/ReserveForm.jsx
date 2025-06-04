import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ReserveForm.css';

const tables = [
  { id: 1, capacity: 4 }, { id: 2, capacity: 4 }, { id: 3, capacity: 4 }, { id: 4, capacity: 4 }, { id: 5, capacity: 4 },
  { id: 6, capacity: 4 }, { id: 7, capacity: 4 }, { id: 8, capacity: 4 }, { id: 9, capacity: 8 }, { id: 10, capacity: 8 },
];

const generateReservationMap = () => {
  const map = {};
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    ['점심', '저녁'].forEach((time) => {
      tables.forEach((table) => {
        const key = `${table.id}-${dateStr} ${time}`;
        map[key] = 'available';
      });
    });
  }
  return map;
};

const getStatusColor = (status) => {
  switch (status) {
    case 'available': return '#4caf50';
    case 'pending': return '#ff9800';
    case 'booked': return '#f44336';
    default: return '#9e9e9e';
  }
};

const ReserveForm = () => {
  const navigate = useNavigate();
  const [reservationMap, setReservationMap] = useState(generateReservationMap());
  const [date, setDate] = useState('');
  const [timePeriod, setTimePeriod] = useState('점심');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [card, setCard] = useState('');
  const [people, setPeople] = useState(1);
  const [showModal, setShowModal] = useState(false);

  // ✅ 예약 내역을 반영하여 예약 상태 업데이트
  useEffect(() => {
    const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
    const updatedMap = generateReservationMap();
    reservations.forEach(({ tableId, timeSlot }) => {
      const key = `${tableId}-${timeSlot}`;
      updatedMap[key] = 'booked';
    });
    setReservationMap(updatedMap);
  }, []);

  const handleSelect = (tableId) => {
    if (isSubmitting) return;
    setSelectedTable(tableId);
  };

  const handleSubmitReservation = () => {
    if (!name || !phone || !card || people < 1) {
      alert('모든 정보를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    const timeSlot = `${date} ${timePeriod}`;
    const key = `${selectedTable}-${timeSlot}`;

    if (reservationMap[key] === 'available') {
      const reservation = { tableId: selectedTable, timeSlot, name, phone, card, people, timestamp: new Date().toISOString() };
      const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
      reservations.push(reservation);
      localStorage.setItem('reservations', JSON.stringify(reservations));

      // 예약 상태 업데이트
      setReservationMap((prev) => ({ ...prev, [key]: 'booked' }));
      setShowModal(true);
      setSelectedTable(null);
      setName(''); setPhone(''); setCard(''); setPeople(1);
    } else {
      alert('예약할 수 없는 테이블입니다.');
    }

    setIsSubmitting(false);
  };

  const handleModalConfirm = () => {
    setShowModal(false);
    navigate('/home');
  };

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
          <p>Table {selectedTable} / {tables.find(t => t.id === selectedTable).capacity}인</p>
          <input type="text" placeholder="이름" value={name} onChange={(e) => setName(e.target.value)} className="input" />
          <input type="text" placeholder="전화번호" value={phone} onChange={(e) => setPhone(e.target.value)} className="input" />
          <input type="text" placeholder="카드번호" value={card} onChange={(e) => setCard(e.target.value)} className="input" />
          <select value={people} onChange={(e) => setPeople(Number(e.target.value))} className="input">
            {[...Array(tables.find(t => t.id === selectedTable).capacity)].map((_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}명</option>
            ))}
          </select>
          <div>
            <button onClick={handleSubmitReservation} className="submitButton">예약하기</button>
            <button onClick={() => setSelectedTable(null)} className="cancelButton">취소</button>
          </div>
        </div>
      ) : (
        date ? (
          <div>
            <h3>테이블 예약 상태</h3>
            <div className="tableList">
              {tables.map((table) => {
                const key = `${table.id}-${date} ${timePeriod}`;
                const status = reservationMap[key];
                return (
                  <button
                    key={table.id}
                    onClick={() => handleSelect(table.id)}
                    className="tableButton"
                    style={{ backgroundColor: getStatusColor(status), cursor: status === 'available' ? 'pointer' : 'not-allowed' }}
                    disabled={status !== 'available' || isSubmitting}
                  >
                    Table {table.id} ({table.capacity}인)
                    <div className="statusText">
                      {status === 'available' ? '예약 가능' : status === 'booked' ? '예약 완료' : '예약 진행 중'}
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
