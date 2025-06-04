import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ReservationConfirm from './pages/ReservationConfirm';
import ReserveForm from './pages/ReserveForm';
import CheckReservation from './pages/CheckReservation';
import SessionManager from './SessionManager';

function App() {
  return (
    <Router>
      <SessionManager>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/home" element={<Home />} />
          <Route path="/confirm" element={<ReservationConfirm />} />
          <Route path="/reserve" element={<ReserveForm />} />
          <Route path="/check" element={<CheckReservation />} />
        </Routes>
      </SessionManager>
    </Router>
  );
}

export default App;
