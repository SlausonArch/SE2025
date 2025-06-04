import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    nickname: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const users = JSON.parse(localStorage.getItem('users')) || [];

    const usernameExists = users.some((u) => u.username === formData.username);
    const nicknameExists = users.some((u) => u.nickname === formData.nickname);

    if (usernameExists) {
      setError('이미 존재하는 아이디입니다.');
      return;
    }

    if (nicknameExists) {
      setError('이미 존재하는 닉네임입니다.');
      return;
    }

    users.push(formData);
    localStorage.setItem('users', JSON.stringify(users));
    alert('회원가입이 완료되었습니다!');
    navigate('/login');
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
        />
        <input
          name="nickname"
          placeholder="닉네임"
          value={formData.nickname}
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
        <button type="submit" style={styles.button}>가입하기</button>
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
    fontSize: '2rem', // ⬅ 글씨 크기 키움
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
    padding: '1.2rem',          // ⬅ 입력창 크기 (패딩) 키움
    fontSize: '1.25rem',        // ⬅ 입력 텍스트 크기 키움
    borderRadius: '8px',        // ⬅ 모서리도 약간 키움
    border: '1px solid #ccc',
  },
  button: {
    padding: '1.2rem',
    fontSize: '1.25rem',        // ⬅ 버튼 텍스트 크기 키움
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#4eaaff',
    color: 'white',
    cursor: 'pointer',
  },
  loginLink: {
    marginTop: '1.5rem',
    color: 'black',             // 검은색으로 변경 가능
    fontSize: '1.1rem',         // ⬅ 안내 텍스트 크기 키움
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
