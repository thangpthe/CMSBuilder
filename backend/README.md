# CMSBuilder Backend

Backend sử dụng Python 3.12, FastAPI, SQLAlchemy và SQLite.
Chạy các lệnh dưới đây bằng Git Bash trên Windows, từ thư mục backend.

## Thiết lập lần đầu

```bash
py -3.12 -m venv .venv
source .venv/Scripts/activate
python -m pip install -r requirements.txt
cp .env.example .env
```

File `.env` chứa biến `DATABASE_URL`. Cấu hình mẫu sử dụng file SQLite
`cmsbuilder.db` trong thư mục `backend`.

## Khởi chạy Backend

Mỗi khi mở Git Bash mới, chạy từ thư mục `backend`:

```bash
source .venv/Scripts/activate
set -a
source .env
set +a
python -m uvicorn app.main:app --reload
```

- Kiểm tra API tại http://127.0.0.1:8000/health. Kết quả mong đợi là `{"status":"ok"}`.
- Mở Swagger UI tại http://127.0.0.1:8000/docs.
- Nhấn Ctrl + C trong Git Bash để dừng server.

## Kiểm tra SQLite

Sau khi dừng server, chạy trong cùng cửa sổ Git Bash:

```bash
python - <<'PY'
from sqlalchemy import text
from app.db.session import engine

with engine.connect() as connection:
    print(connection.scalar(text("SELECT 1")))
PY
```

Kết quả mong đợi là `1`.
