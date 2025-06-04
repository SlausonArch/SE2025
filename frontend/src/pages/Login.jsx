import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(
      (u) => u.username === formData.username && u.password === formData.password
    );

    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));

      alert('로그인 성공!');
      navigate('/home');
    } else {
      setError('아이디 또는 비밀번호가 잘못되었습니다.');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>레스토랑 예약 시스템</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          name="username"
          placeholder="아이디"
          value={formData.username}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          name="password"
          type="password"
          placeholder="비밀번호"
          value={formData.password}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Log In</button>

        <div style={{ height: '1.5rem' }}>
          <p style={{ ...styles.error, visibility: error ? 'visible' : 'hidden' }}>
            {error || 'placeholder'}
          </p>
        </div>
      </form>

      <p style={styles.signupLink}>
        계정이 없으신가요?{' '}
        <Link to="/signup" style={styles.link}>회원가입</Link>
      </p>
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
    marginBottom: '2rem',
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: 'black',
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
    width: '100%',
    padding: '1.2rem',
    fontSize: '1.25rem',
    borderRadius: '8px',
    border: '1px solid #ccc',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '1.2rem',
    fontSize: '1.25rem',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#4eaaff',
    color: 'white',
    cursor: 'pointer',
    boxSizing: 'border-box',
  },
  signupLink: {
    marginTop: '2rem',
    fontSize: '1.1rem',
    color: '#black',
  },
  link: {
    textDecoration: 'none',
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    fontSize: '1.1rem',
    textAlign: 'center',
    margin: 0,
  },
};

export default Login;
