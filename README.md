CMSBuilder
CMSBuilder là hệ thống quản lý và xuất bản nội dung web theo mô hình block-based page builder. Người dùng có thể tạo trang, xây dựng nội dung từ các khối văn bản/hình ảnh/video, xem trước, lưu bản nháp và xuất bản trang để truy cập công khai.
---
1. Tổng quan
CMSBuilder hướng đến việc đơn giản hóa quy trình tạo và quản lý các trang nội dung mà không cần viết mã HTML/CSS trực tiếp.
Các chức năng chính
Đăng nhập bằng username hoặc email và mật khẩu.
Phân quyền theo vai trò `system_admin` và `page_admin`.
Tạo, xem danh sách, chỉnh sửa và xóa trang.
Quản lý thông tin trang: tiêu đề, mô tả, slug và trạng thái.
Xây dựng nội dung bằng các loại Content Block:
Text: nội dung văn bản.
Image: tải ảnh lên và gắn ảnh vào trang.
Video: nhập đường dẫn video được Backend kiểm tra định dạng.
Chỉnh sửa, nhân bản, xóa và sắp xếp thứ tự các khối nội dung.
Xem trước trang theo các kích thước giao diện.
Lưu trang và nội dung vào PostgreSQL.
Xuất bản hoặc hủy xuất bản trang.
Cung cấp trang công khai và danh sách các trang đã xuất bản.
Quản lý phiên đăng nhập bằng JWT Bearer Token.
Trạng thái trang
Trạng thái	Ý nghĩa
`draft`	Bản nháp, chỉ người có quyền truy cập trang mới quản lý được.
`published`	Đã xuất bản và có thể được truy cập qua API công khai.
Mỗi trang có một `slug` duy nhất để tạo đường dẫn truy cập công khai.
---
2. Công nghệ sử dụng
Frontend
Công nghệ	Vai trò
React 18	Xây dựng giao diện người dùng.
TypeScript	Kiểm soát kiểu dữ liệu trong mã nguồn Frontend.
Vite 5	Dev server và công cụ build.
React Router DOM 6	Điều hướng và bảo vệ các route.
Axios	Gửi HTTP request tới Backend API.
lucide-react, react-icons	Bộ biểu tượng giao diện.
CSS	Xây dựng giao diện và bố cục responsive.
Backend
Công nghệ	Vai trò
Python 3.12	Ngôn ngữ lập trình Backend.
FastAPI	Xây dựng REST API.
Uvicorn	ASGI server chạy ứng dụng FastAPI.
Pydantic 2	Kiểm tra và tuần tự hóa dữ liệu request/response.
SQLAlchemy 2	ORM và thao tác cơ sở dữ liệu.
Alembic	Quản lý database migrations.
PostgreSQL	Cơ sở dữ liệu quan hệ.
Psycopg 3	PostgreSQL driver.
PyJWT	Tạo và xác minh JWT.
pwdlib + Argon2	Băm và xác minh mật khẩu.
Pillow	Kiểm tra/đọc định dạng ảnh.
python-multipart	Xử lý upload file.
python-dotenv	Đọc cấu hình từ file `.env`.
Database và môi trường triển khai
Database sử dụng: PostgreSQL.
Dự án có thể kết nối PostgreSQL local hoặc PostgreSQL được quản lý trên cloud, ví dụ Neon.
Không commit thông tin kết nối, mật khẩu hoặc JWT secret lên Git.
File upload ảnh được lưu trong thư mục Backend và thông tin file được quản lý trong bảng `media`.
---
3. Kiến trúc tổng quan
CMSBuilder được tổ chức theo mô hình Frontend – Backend – Database:
```text
┌──────────────────────────┐
│        Frontend          │
│     React + TypeScript   │
│                          │
│  Page Builder / Admin    │
│  Public Page / Login     │
└────────────┬─────────────┘
             │ HTTP / JSON
             │ JWT Bearer Token
             ▼
┌──────────────────────────┐
│         Backend          │
│       FastAPI            │
│                          │
│  Routers                 │
│  Schemas                 │
│  Services                │
│  Models                  │
└────────────┬─────────────┘
             │ SQLAlchemy
             ▼
┌──────────────────────────┐
│       PostgreSQL         │
│                          │
│  users                   │
│  pages                   │
│  content_blocks          │
│  media                   │
│  revoked_tokens          │
└──────────────────────────┘
```
Luồng hoạt động cơ bản
Người dùng đăng nhập trên Frontend.
Backend xác thực thông tin và trả về JWT access token.
Frontend gửi token trong header `Authorization: Bearer <token>` khi gọi các API cần xác thực.
Người dùng tạo hoặc chỉnh sửa trang và các Content Block.
Backend kiểm tra quyền sở hữu, validate dữ liệu và lưu thông tin vào PostgreSQL.
Khi xuất bản, trang chuyển sang trạng thái `published`.
Người xem truy cập nội dung đã xuất bản thông qua Public Pages API.
---
4. Cấu trúc thư mục
```text
CMSBuilder/
├── backend/
│   ├── app/
│   │   ├── core/             # Cấu hình và bảo mật
│   │   ├── db/               # SQLAlchemy engine, session và Base
│   │   ├── models/           # User, Page, ContentBlock, Media...
│   │   ├── routers/          # Các nhóm REST API
│   │   ├── schemas/          # Pydantic request/response schemas
│   │   ├── services/         # Xử lý nghiệp vụ
│   │   └── main.py           # Khởi tạo FastAPI, CORS và routers
│   ├── alembic/
│   │   └── versions/         # Các phiên bản database migration
│   ├── scripts/              # Script hỗ trợ
│   ├── uploads/               # File media được upload
│   ├── requirements.txt
│   ├── alembic.ini
│   └── .env                   # Tự tạo, không commit
│
├── frontend/
│   ├── public/                # Tài nguyên tĩnh
│   ├── src/
│   │   ├── components/        # Thành phần giao diện dùng lại
│   │   ├── contexts/          # React contexts
│   │   ├── hooks/             # Custom hooks
│   │   ├── pages/             # Các trang ứng dụng
│   │   ├── routes/            # Khai báo và bảo vệ routes
│   │   ├── services/           # API clients và service
│   │   ├── types/              # TypeScript types
│   │   ├── utils/              # Hàm tiện ích
│   │   └── main.tsx            # Entry point
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```
---
5. Yêu cầu môi trường
Cài đặt các công cụ sau trước khi chạy dự án:
Git
Python 3.12
Node.js (khuyến nghị phiên bản LTS tương thích với Vite 5)
npm
PostgreSQL hoặc tài khoản PostgreSQL cloud (ví dụ Neon)
Kiểm tra phiên bản:
```bash
git --version
python --version
node --version
npm --version
```
---
6. Cài đặt và chạy dự án
Mở hai terminal riêng biệt: một terminal cho Backend và một terminal cho Frontend.
6.1. Clone repository
```bash
git clone https://github.com/thangpthe/CMSBuilder.git
cd CMSBuilder
```
Chuyển sang nhánh phát triển:
```bash
git switch develop
git pull origin develop
```
6.2. Cấu hình và chạy Backend
Bước 1: Tạo môi trường ảo
Tại thư mục gốc dự án:
```powershell
cd backend
python -m venv .venv
```
Kích hoạt trên Windows PowerShell:
```powershell
.\.venv\Scripts\Activate.ps1
```
Trên macOS/Linux:
```bash
source .venv/bin/activate
```
Bước 2: Cài đặt thư viện
```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```
Bước 3: Tạo file cấu hình `backend/.env`
Tạo file `.env` trong thư mục `backend` với nội dung mẫu:
```env
DATABASE_URL=postgresql+psycopg://DB_USER:DB_PASSWORD@DB_HOST:5432/DB_NAME?sslmode=require
JWT_SECRET_KEY=REPLACE_WITH_A_LONG_RANDOM_SECRET
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```
Thay các giá trị `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_NAME` bằng thông tin PostgreSQL của môi trường đang sử dụng.
Lưu ý:
`DATABASE_URL` phải là connection string PostgreSQL tương thích với driver `psycopg`.
Với Neon, sử dụng connection string do Neon cung cấp và giữ các tham số SSL cần thiết.
`JWT_SECRET_KEY` phải là chuỗi bí mật đủ mạnh, không để trống và không dùng giá trị mẫu khi triển khai thật.
Không chia sẻ hoặc commit file `.env`.
`CORS_ORIGINS` là danh sách origin Frontend được phép truy cập, phân tách bằng dấu phẩy. Backend hiện đã cấu hình sẵn một số origin localhost phục vụ phát triển.
Bước 4: Chạy database migrations
Đảm bảo PostgreSQL đang hoạt động và `DATABASE_URL` chính xác, sau đó chạy tại thư mục `backend`:
```bash
alembic upgrade head
```
Kiểm tra migration hiện tại:
```bash
alembic current
```
Bước 5: Khởi động Backend
```bash
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
Backend mặc định chạy tại:
API base URL: `http://127.0.0.1:8000`
Swagger UI: `http://127.0.0.1:8000/docs`
ReDoc: `http://127.0.0.1:8000/redoc`
Health check: `http://127.0.0.1:8000/health`
6.3. Cấu hình và chạy Frontend
Mở terminal thứ hai, tại thư mục gốc dự án:
```bash
cd frontend
npm install
```
Tạo file `frontend/.env.local`:
```env
VITE_API_URL=http://127.0.0.1:8000
```
Khởi động Vite:
```bash
npm run dev
```
Frontend mặc định chạy tại:
```text
http://localhost:5173
```
Các lệnh hữu ích:
```bash
# Chạy môi trường phát triển
npm run dev

# Kiểm tra TypeScript và build production
npm run build

# Kiểm tra TypeScript
npm run lint

# Chạy thử bản build production ở local
npm run preview
```
---
7. Các nhóm API
Tài liệu API đầy đủ và schema request/response được cung cấp tự động tại `/docs` khi Backend đang chạy.
Authentication
Method	Endpoint	Mô tả
`POST`	`/api/auth/login`	Đăng nhập bằng username/email và mật khẩu.
`GET`	`/api/auth/me`	Lấy thông tin người dùng hiện tại.
`POST`	`/api/auth/logout`	Đăng xuất và xử lý thu hồi token.
Users
Method	Endpoint	Mô tả
`GET`	`/api/users`	Lấy danh sách người dùng; yêu cầu vai trò `system_admin`.
Pages
Method	Endpoint	Mô tả
`POST`	`/api/pages`	Tạo trang mới.
`GET`	`/api/pages`	Lấy danh sách trang của người dùng hiện tại.
`GET`	`/api/pages/{page_id}`	Lấy chi tiết trang và các Content Block.
`PUT`	`/api/pages/{page_id}`	Cập nhật thông tin trang.
`DELETE`	`/api/pages/{page_id}`	Xóa trang.
`POST`	`/api/pages/{page_id}/publish`	Xuất bản trang.
`POST`	`/api/pages/{page_id}/unpublish`	Hủy xuất bản trang.
Content Blocks
Method	Endpoint	Mô tả
`POST`	`/api/pages/{page_id}/blocks`	Tạo Content Block.
`GET`	`/api/pages/{page_id}/blocks`	Lấy danh sách Content Block.
`PUT`	`/api/pages/{page_id}/blocks/reorder`	Cập nhật thứ tự các khối.
`PUT`	`/api/pages/{page_id}/blocks/sync`	API đồng bộ danh sách khối trong một transaction ở Backend.
`PUT`	`/api/pages/{page_id}/blocks/{block_id}`	Cập nhật một Content Block.
`DELETE`	`/api/pages/{page_id}/blocks/{block_id}`	Xóa một Content Block.
Media
Method	Endpoint	Mô tả
`POST`	`/api/media/upload`	Upload hình ảnh.
`GET`	`/api/media`	Lấy danh sách media của người dùng hiện tại.
`GET`	`/api/media/{media_id}`	Lấy thông tin một media thuộc người dùng hiện tại.
Public Pages
Method	Endpoint	Mô tả
`GET`	`/api/public/pages`	Lấy danh sách trang đã xuất bản.
`GET`	`/api/public/pages/{slug}`	Lấy nội dung trang đã xuất bản theo slug.
Health
Method	Endpoint	Mô tả
`GET`	`/health`	Kiểm tra trạng thái hoạt động của API.
---
8. Dữ liệu và quy tắc nghiệp vụ chính
Các thực thể chính
Thực thể	Vai trò
`User`	Tài khoản, vai trò và trạng thái hoạt động của người dùng.
`Page`	Trang nội dung, chủ sở hữu, tiêu đề, mô tả, slug và trạng thái xuất bản.
`ContentBlock`	Khối nội dung thuộc một trang; gồm `text`, `image`, `video`.
`Media`	Thông tin file ảnh được tải lên và người sở hữu file.
`RevokedToken`	Lưu JWT ID đã bị thu hồi khi đăng xuất.
Quy tắc quyền truy cập
Các API quản trị yêu cầu JWT hợp lệ.
Người dùng chỉ truy cập và quản lý các trang thuộc quyền sở hữu của mình theo cơ chế hiện tại.
API danh sách người dùng yêu cầu vai trò `system_admin`.
Public Pages API không yêu cầu đăng nhập và chỉ trả về trang đã xuất bản.
Upload hình ảnh
Backend kiểm tra file ảnh trước khi lưu, bao gồm định dạng và nội dung ảnh. Theo triển khai hiện tại, luồng upload giới hạn các định dạng JPG/JPEG/PNG và dung lượng tối đa 5 MB.
---
9. Database migrations
Dự án sử dụng Alembic để quản lý thay đổi cấu trúc PostgreSQL.
Chạy toàn bộ migration mới nhất:
```bash
alembic upgrade head
```
Xem revision hiện tại:
```bash
alembic current
```
Xem lịch sử migration:
```bash
alembic history
```
Kiểm tra model có khác biệt với database schema hay không:
```bash
alembic check
```
Khi thay đổi SQLAlchemy models, cần tạo migration mới và review file migration trước khi áp dụng lên database dùng chung.
---
10. Quy trình Git đề xuất
Các nhánh đang được sử dụng trong quá trình phát triển:
Nhánh	Mục đích
`main`	Nhánh ổn định/release.
`develop`	Nhánh tích hợp tính năng.
`feature/thang`	Công việc của Thăng.
`feature/dat`	Công việc của Đạt.
`feature/vu`	Công việc của Vũ.
`feature/thuy`	Công việc của Thủy.
`feature/quang-anh`	Công việc của Quang Anh.
Quy trình làm việc:
Cập nhật nhánh `develop`.
Tạo hoặc chuyển sang nhánh feature được phân công.
Phát triển và kiểm tra thay đổi trên nhánh cá nhân.
Commit với nội dung rõ ràng.
Tạo Pull Request từ nhánh feature vào `develop`.
Review code, xử lý xung đột và kiểm tra trước khi merge.
Chỉ đưa phiên bản đã được xác nhận ổn định sang `main`.
Ví dụ:
```bash
git switch develop
git pull origin develop
git switch feature/<ten-thanh-vien>

# Sau khi hoàn thành và kiểm tra
git add .
git commit -m "feat: describe the change"
git push origin feature/<ten-thanh-vien>
```
Không commit các dữ liệu/cấu hình riêng tư như:
`.env`, `.env.local`
`.venv/`
`node_modules/`
`dist/`
File database local hoặc file upload chứa dữ liệu thực tế
---
11. Kiểm tra trước khi tạo Pull Request
Backend
```bash
# Đứng tại thư mục backend và kích hoạt virtual environment
python -m compileall app
alembic current
alembic check
```
Nếu dự án có test suite:
```bash
pytest
```
Frontend
```bash
# Đứng tại thư mục frontend
npm run lint
npm run build
```
Ngoài kiểm tra lệnh, cần kiểm thử luồng nghiệp vụ: đăng nhập, tạo trang, thêm/sửa/xóa/sắp xếp block, lưu và tải lại trang, upload ảnh, publish, unpublish và truy cập trang công khai.
---
12. Lưu ý bảo mật
Không đưa thông tin đăng nhập PostgreSQL, JWT secret hoặc token lên GitHub.
Không sử dụng mật khẩu mặc định hoặc JWT secret mẫu trong môi trường dùng chung/production.
Không lưu mật khẩu người dùng ở dạng văn bản thuần; Backend sử dụng cơ chế băm mật khẩu.
Các API quản trị phải gửi JWT Bearer Token.
Cần kiểm tra quyền sở hữu đối với Page và Media ở Backend; không dựa vào việc ẩn/hiện thành phần giao diện Frontend để bảo vệ dữ liệu.
Khi triển khai production, cần cấu hình CORS theo đúng domain thực tế, HTTPS, lưu trữ file phù hợp và quy trình backup PostgreSQL.
---
13. Đóng góp và báo lỗi
Khi báo lỗi hoặc gửi Pull Request, nên cung cấp:
Mô tả ngắn gọn vấn đề hoặc mục tiêu thay đổi.
Các bước tái hiện lỗi (nếu có).
Kết quả mong đợi và kết quả thực tế.
Ảnh chụp màn hình hoặc log liên quan, sau khi đã loại bỏ token và thông tin nhạy cảm.
Danh sách file hoặc module bị ảnh hưởng.
---
CMSBuilder — Block-based Content Management and Page Building.
