from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import sqlite3
import hashlib
from jose import jwt
from datetime import datetime, timedelta
import os

app = FastAPI(title="레스토랑 예약 시스템")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 프로덕션에서는 특정 도메인으로 제한
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT 설정
SECRET_KEY = "your-secret-key-here"  # 프로덕션에서는 환경변수로 관리
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

security = HTTPBearer()

# 데이터베이스 초기화
def init_db():
    conn = sqlite3.connect('restaurant.db')
    cursor = conn.cursor()
    
    # 사용자 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            nickname TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # 테이블 정보
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tables (
            id INTEGER PRIMARY KEY,
            capacity INTEGER NOT NULL,
            table_type TEXT NOT NULL
        )
    ''')
    
    # 예약 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS reservations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            table_id INTEGER NOT NULL,
            reservation_date DATE NOT NULL,
            time_period TEXT NOT NULL,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            credit_card TEXT NOT NULL,
            guests INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (table_id) REFERENCES tables (id)
        )
    ''')
    
    # 테이블 데이터 초기화
    cursor.execute('SELECT COUNT(*) FROM tables')
    if cursor.fetchone()[0] == 0:
        tables_data = [
            (1, 4, '창가, 4명'), (2, 4, '창가, 4명'), (3, 4, '창가, 4명'), 
            (4, 4, '창가, 4명'), (5, 4, '창가, 4명'), (6, 4, '내부, 4명'),
            (7, 4, '방, 4명'), (8, 4, '방, 4명'), (9, 8, '창가, 8명'), (10, 8, '방, 8명')
        ]
        cursor.executemany('INSERT INTO tables (id, capacity, table_type) VALUES (?, ?, ?)', tables_data)
    
    conn.commit()
    conn.close()

# 앱 시작시 DB 초기화
init_db()

# Pydantic 모델들
class UserSignup(BaseModel):
    username: str
    nickname: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class ReservationCreate(BaseModel):
    table_id: int
    reservation_date: str
    time_period: str
    name: str
    phone: str
    credit_card: str
    guests: int

class ReservationResponse(BaseModel):
    id: int
    table_id: int
    reservation_date: str
    time_period: str
    name: str
    phone: str
    guests: int
    created_at: str

class TableInfo(BaseModel):
    id: int
    capacity: int
    table_type: str

# 유틸리티 함수들
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    return hash_password(password) == hashed

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="유효하지 않은 토큰입니다")
        return user_id
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="유효하지 않은 토큰입니다")

def get_db_connection():
    conn = sqlite3.connect('restaurant.db')
    conn.row_factory = sqlite3.Row
    return conn

# API 엔드포인트들
@app.get("/")
def read_root():
    return {"message": "레스토랑 예약 시스템 API에 오신 것을 환영합니다"}

@app.post("/auth/signup")
def signup(user: UserSignup):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # 중복 확인
        cursor.execute("SELECT id FROM users WHERE username = ? OR nickname = ?", 
                      (user.username, user.nickname))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="이미 존재하는 아이디 또는 닉네임입니다")
        
        # 사용자 생성
        hashed_password = hash_password(user.password)
        cursor.execute("INSERT INTO users (username, nickname, password) VALUES (?, ?, ?)",
                      (user.username, user.nickname, hashed_password))
        conn.commit()
        
        return {"message": "회원가입이 성공적으로 완료되었습니다"}
    
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="이미 존재하는 아이디 또는 닉네임입니다")
    finally:
        conn.close()

@app.post("/auth/login")
def login(user: UserLogin):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT id, username, nickname, password FROM users WHERE username = ?", 
                      (user.username,))
        db_user = cursor.fetchone()
        
        if not db_user or not verify_password(user.password, db_user['password']):
            raise HTTPException(status_code=401, detail="아이디 또는 비밀번호가 올바르지 않습니다")
        
        access_token = create_access_token({"user_id": db_user['id']})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": db_user['id'],
                "username": db_user['username'],
                "nickname": db_user['nickname']
            },
            "message": "로그인이 성공적으로 완료되었습니다"
        }
    finally:
        conn.close()

@app.get("/tables", response_model=List[TableInfo])
def get_tables():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT id, capacity, table_type FROM tables ORDER BY id")
        tables = cursor.fetchall()
        return [TableInfo(**dict(table)) for table in tables]
    except Exception as e:
        raise HTTPException(status_code=500, detail="테이블 정보를 불러오는 중 오류가 발생했습니다")
    finally:
        conn.close()

@app.post("/reservations")
def create_reservation(reservation: ReservationCreate, user_id: int = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # 테이블 존재 확인
        cursor.execute("SELECT capacity FROM tables WHERE id = ?", (reservation.table_id,))
        table = cursor.fetchone()
        if not table:
            raise HTTPException(status_code=404, detail="존재하지 않는 테이블입니다")
        
        if reservation.guests > table['capacity']:
            raise HTTPException(status_code=400, detail="선택한 테이블의 수용 인원을 초과했습니다")
        
        # 중복 예약 확인
        cursor.execute("""
            SELECT id FROM reservations 
            WHERE table_id = ? AND reservation_date = ? AND time_period = ?
        """, (reservation.table_id, reservation.reservation_date, reservation.time_period))
        
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="해당 시간에 이미 예약된 테이블입니다")
        
        # 예약 생성
        cursor.execute("""
            INSERT INTO reservations 
            (user_id, table_id, reservation_date, time_period, name, phone, credit_card, guests)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (user_id, reservation.table_id, reservation.reservation_date, 
              reservation.time_period, reservation.name, reservation.phone, 
              reservation.credit_card, reservation.guests))
        
        conn.commit()
        return {"message": "예약이 성공적으로 완료되었습니다", "reservation_id": cursor.lastrowid}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="예약 처리 중 오류가 발생했습니다")
    finally:
        conn.close()

@app.get("/reservations", response_model=List[ReservationResponse])
def get_user_reservations(user_id: int = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT id, table_id, reservation_date, time_period, name, phone, guests, created_at
            FROM reservations 
            WHERE user_id = ?
            ORDER BY reservation_date, time_period
        """, (user_id,))
        
        reservations = cursor.fetchall()
        return [ReservationResponse(**dict(res)) for res in reservations]
    except Exception as e:
        raise HTTPException(status_code=500, detail="예약 내역을 불러오는 중 오류가 발생했습니다")
    finally:
        conn.close()

@app.delete("/reservations/{reservation_id}")
def cancel_reservation(reservation_id: int, user_id: int = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # 예약 존재 및 소유권 확인
        cursor.execute("""
            SELECT reservation_date FROM reservations 
            WHERE id = ? AND user_id = ?
        """, (reservation_id, user_id))
        
        reservation = cursor.fetchone()
        if not reservation:
            raise HTTPException(status_code=404, detail="존재하지 않는 예약이거나 취소 권한이 없습니다")
        
        # 당일 취소 방지
        reservation_date = datetime.strptime(reservation['reservation_date'], '%Y-%m-%d').date()
        today = datetime.now().date()
        
        if reservation_date <= today:
            raise HTTPException(status_code=400, detail="예약 당일에는 취소할 수 없습니다")
        
        # 예약 삭제
        cursor.execute("DELETE FROM reservations WHERE id = ?", (reservation_id,))
        conn.commit()
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="취소할 예약을 찾을 수 없습니다")
        
        return {"message": "예약이 성공적으로 취소되었습니다"}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="예약 취소 중 오류가 발생했습니다")
    finally:
        conn.close()

@app.get("/reservations/status")
def get_reservation_status(date: str, time_period: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # 날짜 형식 검증
        try:
            datetime.strptime(date, '%Y-%m-%d')
        except ValueError:
            raise HTTPException(status_code=400, detail="올바르지 않은 날짜 형식입니다 (YYYY-MM-DD)")
        
        if time_period not in ['점심', '저녁']:
            raise HTTPException(status_code=400, detail="시간대는 '점심' 또는 '저녁'이어야 합니다")
        
        cursor.execute("""
            SELECT table_id FROM reservations 
            WHERE reservation_date = ? AND time_period = ?
        """, (date, time_period))
        
        reserved_tables = [row['table_id'] for row in cursor.fetchall()]
        
        cursor.execute("SELECT id FROM tables")
        all_tables = [row['id'] for row in cursor.fetchall()]
        
        status = {}
        for table_id in all_tables:
            status[table_id] = "booked" if table_id in reserved_tables else "available"
        
        return {
            "status": status,
            "message": f"{date} {time_period} 시간대의 예약 현황입니다"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="예약 현황을 불러오는 중 오류가 발생했습니다")
    finally:
        conn.close()

# 헬스 체크 엔드포인트
@app.get("/health")
def health_check():
    return {
        "status": "정상",
        "message": "서버가 정상적으로 작동 중입니다",
        "timestamp": datetime.now().isoformat()
    }

# 서버 정보 엔드포인트
@app.get("/info")
def server_info():
    return {
        "service": "레스토랑 예약 시스템",
        "version": "1.0.0",
        "description": "FastAPI와 SQLite를 사용한 레스토랑 테이블 예약 관리 시스템",
        "endpoints": {
            "인증": ["/auth/signup", "/auth/login"],
            "테이블": ["/tables"],
            "예약": ["/reservations", "/reservations/status"],
            "시스템": ["/health", "/info"]
        }
    }

if __name__ == "__main__":
    import uvicorn
    print("🍽️  레스토랑 예약 시스템 서버를 시작합니다...")
    print("📍 서버 주소: http://localhost:8000")
    print("📖 API 문서: http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000)
