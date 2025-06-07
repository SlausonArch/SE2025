import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { removeToken, removeCurrentUser, getCurrentUser } from '../utils/api';
import './HomeLayout.css';

const TableLayout = () => {
  const navigate = useNavigate();
  const [remaining, setRemaining] = useState(null);
  const [user, setUser] = useState(null);

  const tables = [
    { id: 1, type: '창가, 4명' },
    { id: 2, type: '창가, 4명' },
    { id: 3, type: '창가, 4명' },
    { id: 4, type: '창가, 4명' },
    { id: 5, type: '창가, 4명' },
    { id: 6, type: '내부, 4명' },
    { id: 7, type: '방, 4명' },
    { id: 8, type: '방, 4명' },
    { id: 9, wide: true, type: '창가, 8명' },
    { id: 10, wide: true, type: '방, 8명' },
  ];

  useEffect(() => {
    // 사용자 정보 확인
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);

    // 세션 타이머 (30분)
    const sessionDuration = 30 * 60 * 1000; // 30분
    const startTime = Date.now();
    
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remainingTime = sessionDuration - elapsed;
      
      if (remainingTime <= 0) {
        handleLogout(true); // 자동 로그아웃
      } else {
        setRemaining(remainingTime);
        // 커스텀 이벤트 발생
        window.dispatchEvent(new CustomEvent('session-tick', { detail: remainingTime }));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleReserve = () => {
    navigate('/reserve');
  };

  const handleLogout = (isAutoLogout = false) => {
    const message = isAutoLogout ? '세션이 만료되어 자동 로그아웃됩니다.' : '로그아웃 하시겠습니까?';
    
    if (isAutoLogout || window.confirm(message)) {
      removeToken();
      removeCurrentUser();
      alert(isAutoLogout ? '세션이 만료되었습니다.' : '로그아웃 되었습니다.');
      navigate('/login');
    }
  };

  const handleCheckReservation = () => {
    navigate('/check');
  };

  useEffect(() => {
    const handleTick = (e) => {
      setRemaining(e.detail);
    };

    window.addEventListener('session-tick', handleTick);
    return () => window.removeEventListener('session-tick', handleTick);
  }, []);

  const formatTime = (ms) => {
    const sec = Math.floor(ms / 1000);
    const min = Math.floor(sec / 60);
    const remainingSec = sec % 60;
    return `${min}분 ${remainingSec < 10 ? '0' : ''}${remainingSec}초`;
  };

  if (!user) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="table-layout-container">
      <h2>식당 테이블 배치도</h2>
      <p style={{ color: 'gray', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
        환영합니다, {user.nickname}님!
      </p>
      {remaining !== null && (
        <p style={{ color: 'gray', fontSize: '0.9rem', marginBottom: '1rem' }}>
          자동 로그아웃까지 남은 시간: {formatTime(remaining)}
        </p>
      )}
      <div className="top-buttons">
        <button className="nav-button" onClick={handleCheckReservation}>예약 확인</button>
        <button className="nav-button" onClick={handleReserve}>예약하기</button>
        <button className="nav-button" onClick={() => handleLogout()}>로그아웃</button>
      </div>
      <div className="layout-wrapper">
        <div className="window-area top-window">창 문</div>
        <div className="layout-content">
          <div className="window-area side-window">창 문</div>
          <div className="table-grid">
            {tables.map((table) => (
              <div key={table.id} className={`table-box${table.wide ? ' wide' : ''}`}>
                <div className="tooltip-wrapper">
                  <p>Table {table.id}</p>
                  <span className="tooltip-text">{table.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableLayout;
