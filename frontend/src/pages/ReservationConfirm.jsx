import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ReservationConfirm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { tableId, timeSlot, capacity } = location.state || {};

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    creditCard: '',
    guests: 1,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newReservation = {
      tableId,
      timeSlot,
      name: formData.name,
      phone: formData.phone,
      creditCard: formData.creditCard,
      guests: formData.guests,
    };

    const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
    reservations.push(newReservation);
    localStorage.setItem('reservations', JSON.stringify(reservations));

    alert('예약이 완료되었습니다!');
    navigate('/home');
  };


  if (!tableId || !timeSlot) {
    return <p>잘못된 접근입니다. 홈으로 돌아가세요.</p>;
  }

  return (
    <div style={styles.container}>
      <h2>예약 정보 입력</h2>
      <p>Table {tableId} - {timeSlot}</p>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          name="name"
          placeholder="이름"
          value={formData.name}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          type="tel"
          name="phone"
          placeholder="전화번호"
          value={formData.phone}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          type="text"
          name="creditCard"
          placeholder="신용카드 번호"
          value={formData.creditCard}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <select
          name="guests"
          value={formData.guests}
          onChange={handleChange}
          required
          style={styles.input}
        >
          {[...Array(capacity)].map((_, i) => (
            <option key={i + 1} value={i + 1}>{i + 1}명</option>
          ))}
        </select>
        <button type="submit" style={styles.button}>예약 완료</button>
      </form>
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
    textAlign: 'center',
    padding: '2rem',
    borderRadius: '10px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    maxWidth: '400px',
    margin: '0 auto',
  },
  input: {
    padding: '0.8rem',
    fontSize: '1rem',
    borderRadius: '5px',
    border: '1px solid #ccc',
  },
  button: {
    padding: '0.8rem',
    fontSize: '1rem',
    borderRadius: '5px',
    border: 'none',
    backgroundColor: '#4eaaff',
    color: 'white',
    cursor: 'pointer',
  },
};

export default ReservationConfirm;
