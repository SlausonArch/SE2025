import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CheckReservation = () => {
  const [reservations, setReservations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('reservations')) || [];
    setReservations(data);
  }, []);

  const handleCancel = (index) => {
    const reservation = reservations[index];

    const dateString = reservation.timeSlot.split(' ')[0]; // YYYY-MM-DD
    const reservationDate = new Date(dateString);
    const now = new Date();

    const isToday =
      reservationDate.getFullYear() === now.getFullYear() &&
      reservationDate.getMonth() === now.getMonth() &&
      reservationDate.getDate() === now.getDate();

    if (isToday) {
      alert('예약 당일에는 취소할 수 없습니다.');
      return;
    }

    const confirmCancel = window.confirm('정말 예약을 취소하시겠습니까?');
    if (!confirmCancel) return;

    const updated = [...reservations];
    updated.splice(index, 1);
    setReservations(updated);
    localStorage.setItem('reservations', JSON.stringify(updated));
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>예약 확인</h2>

      <button onClick={() => navigate(-1)} style={styles.backIcon}>⬅</button>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>테이블 번호</th>
              <th>예약 시간</th>
              <th>이름</th>
              <th>전화번호</th>
              <th>인원수</th>
              <th>예약취소</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((r, i) => (
              <tr key={i} style={{ height: '50px' }}>
                <td>{r.tableId}</td>
                <td>{r.timeSlot}</td>
                <td>{r.name || ''}</td>
                <td>{r.phone || ''}</td>
                <td>{r.people ? `${r.people}명` : '-'}</td>
                <td>
                  <button style={styles.cancelBtn} onClick={() => handleCancel(i)}>취소</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: 'white',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    padding: '2rem',
    borderRadius: '10px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  title: {
    marginBottom: '1rem',
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  backIcon: {
    position: 'fixed',
    top: '1.2rem',
    left: '1.2rem',
    fontSize: '1.5rem',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    zIndex: 1000,
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    margin: '0 auto',
    borderCollapse: 'collapse',
    minWidth: '800px',
  },
  cancelBtn: {
    padding: '5px 10px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default CheckReservation;
