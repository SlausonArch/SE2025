"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { reservationsAPI, getCurrentUser } from "../utils/api"

const CheckReservation = () => {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // 사용자 인증 확인
    const user = getCurrentUser()
    if (!user) {
      navigate("/login")
      return
    }

    loadReservations()
  }, [navigate])

  const loadReservations = async () => {
    try {
      const data = await reservationsAPI.getUserReservations()
      setReservations(data)
    } catch (error) {
      console.error("예약 조회 실패:", error)
      alert("예약 정보를 불러오는데 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (reservationId, reservationDate) => {
    try {
      const dateString = reservationDate // YYYY-MM-DD 형식
      const reservationDateObj = new Date(dateString)
      const now = new Date()

      const isToday =
        reservationDateObj.getFullYear() === now.getFullYear() &&
        reservationDateObj.getMonth() === now.getMonth() &&
        reservationDateObj.getDate() === now.getDate()

      if (isToday) {
        alert("예약 당일에는 취소할 수 없습니다.")
        return
      }

      const confirmCancel = window.confirm("정말 예약을 취소하시겠습니까?")
      if (!confirmCancel) return

      await reservationsAPI.cancel(reservationId)

      // 예약 목록에서 제거
      setReservations((prev) => prev.filter((r) => r.id !== reservationId))
      alert("예약이 취소되었습니다.")
    } catch (error) {
      console.error("예약 취소 실패:", error)
      alert(error.message || "예약 취소에 실패했습니다.")
    }
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>예약 확인</h2>
        <p>로딩 중...</p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>예약 확인</h2>

      <button onClick={() => navigate(-1)} style={styles.backIcon}>
        ⬅
      </button>

      <div style={styles.tableWrapper}>
        {reservations.length === 0 ? (
          <p>예약 내역이 없습니다.</p>
        ) : (
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
              {reservations.map((r) => (
                <tr key={r.id} style={{ height: "50px" }}>
                  <td>{r.table_id}</td>
                  <td>
                    {r.reservation_date} {r.time_period}
                  </td>
                  <td>{r.name || ""}</td>
                  <td>{r.phone || ""}</td>
                  <td>{r.guests ? `${r.guests}명` : "-"}</td>
                  <td>
                    <button style={styles.cancelBtn} onClick={() => handleCancel(r.id, r.reservation_date)}>
                      취소
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: {
    backgroundColor: "white",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    padding: "2rem",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  title: {
    marginBottom: "1rem",
    fontSize: "1.5rem",
    fontWeight: "bold",
  },
  backIcon: {
    position: "fixed",
    top: "1.2rem",
    left: "1.2rem",
    fontSize: "1.5rem",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    zIndex: 1000,
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    margin: "0 auto",
    borderCollapse: "collapse",
    minWidth: "800px",
  },
  cancelBtn: {
    padding: "5px 10px",
    backgroundColor: "#f44336",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
}

export default CheckReservation
