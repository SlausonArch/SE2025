import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AUTO_LOGOUT_TIME = 5 * 60 * 1000; 

function SessionManager({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    let timeoutId;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        localStorage.removeItem('currentUser');
        alert('오랜 시간 활동이 없어 자동 로그아웃되었습니다.');
        navigate('/login');
      }, AUTO_LOGOUT_TIME);
    };

    let remainingTime = AUTO_LOGOUT_TIME;
    const intervalId = setInterval(() => {
      remainingTime -= 1000;
      window.dispatchEvent(new CustomEvent('session-tick', { detail: remainingTime }));
    }, 1000);

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));

    resetTimer(); 

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [navigate]);

  return children;
}

export default SessionManager;
