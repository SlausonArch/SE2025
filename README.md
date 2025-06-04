# 2025 Software Engineering Project

> 졸업작품 프로젝트 - 예약 시스템

## 📦 프로젝트 개요

본 프로젝트는 React와 FastAPI를 활용한 웹 기반 예약 시스템입니다.  
사용자는 프론트엔드를 통해 정보를 입력하고, FastAPI 백엔드에서 이를 처리하여 예약 결과를 제공합니다.

---

## 🛠️ 기술 스택

| 구성 요소 | 기술 |
|-----------|------|
| 프론트엔드 | React 19, Vite, MUI, React Router |
| 백엔드 | Python 3.11, FastAPI, Uvicorn |
| 데이터베이스 | SQLite (개발용) |
| 배포/환경 | Docker, Docker Compose |
| 기타 도구 | VS Code, GitHub |

---

## 📁 디렉토리 구조

```bash
2025SE/
├── backend/              # FastAPI 백엔드
│   ├── main.py
│   └── requirements.txt
├── frontend/             # React 프론트엔드
│   ├── src/
│   └── package.json
├── docker-compose.yml    # 전체 앱 구성
├── Dockerfile.backend    # 백엔드용 Dockerfile
├── Dockerfile.frontend   # 프론트엔드용 Dockerfile
└── README.md


실행 방법
1. Docker로 실행 (윈도우에 Docker Desktop 사전 설치 필요, 실행시 Docker Desktop이 실행되고 있어야 함)
docker compose up --build

프론트엔드: http://localhost:5173

백엔드 API: http://localhost:8000

API 문서
http://localhost:8000/docs
=======
