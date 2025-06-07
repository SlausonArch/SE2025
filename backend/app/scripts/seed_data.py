import sqlite3
import hashlib

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

# 데이터베이스 연결
conn = sqlite3.connect('restaurant.db')
cursor = conn.cursor()

# 테스트 사용자 추가
test_users = [
    ('testuser1', 'test1', 'password123'),
    ('testuser2', 'test2', 'password456'),
    ('admin', 'administrator', 'admin123')
]

for username, nickname, password in test_users:
    hashed_password = hash_password(password)
    try:
        cursor.execute(
            "INSERT INTO users (username, nickname, password) VALUES (?, ?, ?)",
            (username, nickname, hashed_password)
        )
        print(f"사용자 {username} 추가됨")
    except sqlite3.IntegrityError:
        print(f"사용자 {username}는 이미 존재함")

# 테스트 예약 추가
test_reservations = [
    (1, 1, '2025-06-07', '점심', '김붕이', '010-1234-5678', '1234-5678-9012-3456', 2),
    (1, 2, '2025-06-07', '저녁', '이붕이', '010-9876-5432', '9876-5432-1098-7654', 4),
    (2, 3, '2025-06-08', '점심', '박붕이', '010-5555-6666', '5555-6666-7777-8888', 3)
]

for user_id, table_id, date, time_period, name, phone, card, guests in test_reservations:
    try:
        cursor.execute("""
            INSERT INTO reservations 
            (user_id, table_id, reservation_date, time_period, name, phone, credit_card, guests)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (user_id, table_id, date, time_period, name, phone, card, guests))
        print(f"예약 추가됨: Table {table_id}, {date} {time_period}")
    except sqlite3.IntegrityError:
        print(f"예약 중복: Table {table_id}, {date} {time_period}")

conn.commit()
conn.close()
print("테스트 데이터 추가 완료!")
