import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';

function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    nickname: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authAPI.signup(formData);
      alert('회원가입이 완료되었습니다!');
      navigate('/login');
    } catch (err) {
      setError(err.message || '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>회원가입</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          name="username"
          placeholder="아이디"
          value={formData.username}
          onChange={handleChange}
          required
          style={styles.input}
          disabled={loading}
        />
        <input
          name="nickname"
          placeholder="닉네임"
          value={formData.nickname}
          onChange={handleChange}
          required
          style={styles.input}
          disabled={loading}
        />
        <input
          name="password"
          type="password"
          placeholder="비밀번호"
          value={formData.password}
          onChange={handleChange}
          required
          style={styles.input}
          disabled={loading}
        />
        <button 
          type="submit" 
          style={{...styles.button, opacity: loading ? 0.7 : 1}}
          disabled={loading}
        >
          {loading ? '가입 중...' : '가입하기'}
        </button>
      </form>

      <p style={styles.loginLink}>
        이미 계정이 있으신가요?{' '}
        <span style={styles.link} onClick={() => navigate('/login')}>로그인</span>
      </p>

      {error && <p style={styles.error}>{error}</p>}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    margin: 0,
    backgroundColor: 'white',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
  },
  header: {
    marginBottom: '1rem',
    color: 'black',
    fontSize: '2rem',
    fontWeight: 'bold',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    maxWidth: '500px',
    width: '100%',
    margin: '0 auto',
  },
  input: {
    padding: '1.2rem',
    fontSize: '1.25rem',
    borderRadius: '8px',
    border: '1px solid #ccc',
  },
  button: {
    padding: '1.2rem',
    fontSize: '1.25rem',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#4eaaff',
    color: 'white',
    cursor: 'pointer',
  },
  loginLink: {
    marginTop: '1.5rem',
    color: 'black',
    fontSize: '1.1rem',
  },
  link: {
    textDecoration: 'none',
    cursor: 'pointer',
    color: '#4eaaff',
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginTop: '1rem',
    fontSize: '1.1rem',
  },
};

export default SignUp;
