-- 데이터베이스 초기화 스크립트
-- 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    nickname TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 테이블 정보
CREATE TABLE IF NOT EXISTS tables (
    id INTEGER PRIMARY KEY,
    capacity INTEGER NOT NULL,
    table_type TEXT NOT NULL
);

-- 예약 테이블
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
);

-- 테이블 데이터 삽입
INSERT OR IGNORE INTO tables (id, capacity, table_type) VALUES 
(1, 4, '창가, 4명'),
(2, 4, '창가, 4명'),
(3, 4, '창가, 4명'),
(4, 4, '창가, 4명'),
(5, 4, '창가, 4명'),
(6, 4, '내부, 4명'),
(7, 4, '방, 4명'),
(8, 4, '방, 4명'),
(9, 8, '창가, 8명'),
(10, 8, '방, 8명');
