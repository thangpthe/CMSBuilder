# CMSBuilder – Nền Tảng Xây Dựng Trang Nội Dung Đa Phương Tiện

> **Dự án Mock Project**: Hệ thống CMS No-Code / Low-Code kéo thả trực quan cho phép biên tập, quản lý và xuất bản trang đích đa phương tiện tốc độ cao.

---

## 📌 Mục lục

1. [Tổng quan dự án](#1-tổng-quan-dự-án)
2. [Kiến trúc hệ thống & Công nghệ](#2-kiến-trúc-hệ-thống--công-nghệ)
3. [Các tính năng & Cải tiến trọng tâm (Sprint 1)](#3-các-tính-năng--cải-tiến-trọng-tâm-sprint-1)
4. [Hướng dẫn cài đặt & Khởi chạy Local](#4-hướng-dẫn-cài-đặt--khởi-chạy-local)
5. [Cấu trúc thư mục](#5-cấu-trúc-thư-mục)
6. [Danh sách API chính](#6-danh-sách-api-chính)
7. [Quy trình Git & Phân công Branch](#7-quy-trình-git--phân-công-branch)
8. [Gợi ý tên Commit](#8-gợi-ý-tên-commit)

---

## 1. Tổng quan dự án

**CMSBuilder** giải quyết bài toán biên tập và xuất bản nội dung web tĩnh truyền thống bằng mô hình khối linh hoạt (**Block-based Page Builder**). Người dùng có thể:

- Soạn thảo văn bản đa cấp độ (H1, H2, H3, đoạn văn, trích dẫn).
- Tải lên hình ảnh trực tiếp hoặc liên kết URL ảnh ngoài.
- Nhúng video trực quan từ YouTube hoặc đường dẫn trực tiếp.
- Kéo thả, sắp xếp thứ tự khối tự do và xuất bản công khai tức thời.
- Người xem công khai có thể đọc bài viết với trải nghiệm biên tập số hiện đại (tiến trình đọc, phóng to ảnh, khám phá các bài viết từ cộng đồng).

---

## 2. Kiến trúc hệ thống & Công nghệ

### Frontend

- **Framework**: React 18.2 + TypeScript + Vite 5.4.
- **Routing**: React Router DOM v6 (kèm cờ tương thích `v7_startTransition` và `v7_relativeSplatPath`).
- **Icons**: `lucide-react` (đồng bộ toàn bộ hệ thống quản trị, builder và trang 404) & `react-icons/fi` (trang bài viết công khai).
- **Styling**: Pure CSS Variables Design System (`theme.css`, `styles.css`) tuân thủ chuẩn WCAG AA/AAA, hỗ trợ co giãn responsive 360px – 1920px.

### Backend

- **Framework**: Python 3.12 + FastAPI + Uvicorn.
- **ORM / Database**: SQLAlchemy 2.0 + PostgreSQL (kết nối qua driver `psycopg` nhắm tới Neon Cloud / PostgreSQL Local).
- **Bảo mật & Xác thực**: OAuth2 Password Flow + JWT Bearer Token + Passlib (bcrypt).
- **CORS**: Cấu hình mở rộng hỗ trợ toàn bộ các origin localhost và 127.0.0.1 động.

---

## 3. Các tính năng & Cải tiến trọng tâm (Sprint 1)

### 🔹 Tác vụ cốt lõi Page Builder

- **TASK PB-01 (Sửa lỗi lưu trang khi Video Block rỗng)**:
  - Cho phép lưu bản nháp ngay cả khi Video Block chưa nhập URL.
  - Tự động bỏ qua Video Block rỗng khi gửi lên Backend, không làm mất nội dung các khối khác.
  - Bổ sung validation URL YouTube chính xác.
- **TASK PB-02 (Loại bỏ ảnh placeholder 1x1 rác)**:
  - Xóa bỏ cơ chế tự động tạo và upload file ảnh PNG 1x1 giả lập.
  - Chỉ tạo bản ghi Media khi người dùng thực sự tải file ảnh lên.
  - Hỗ trợ lưu trữ và hiển thị URL ảnh bên ngoài mà không làm rác Database.
- **TASK PB-03 (Đồng bộ khối nguyên tử - Atomic Block Sync)**:
  - Xây dựng cơ chế đồng bộ danh sách khối thông qua transaction duy nhất: thêm mới, cập nhật và xóa khối không còn dùng.
  - Cập nhật ngay ID thực từ server vào Frontend, ngăn chặn hoàn toàn hiện tượng nhân bản khối trùng lặp khi người dùng bấm Lưu nhiều lần.

### 🔹 Xác thực, Phân quyền & Profile

- Phân luồng điều hướng sau đăng nhập theo đúng vai trò người dùng:
  - `system_admin`: Tự động điều hướng về Bảng điều khiển (`/dashboard`).
  - `page_admin`: Điều hướng về danh sách quản lý trang (`/pages`).
- Sửa lỗi `401 Unauthorized` khi Đăng xuất: Token được truyền linh hoạt và backend xử lý token hết hạn an toàn.
- **Bảo mật thông tin hiển thị**: Loại bỏ việc in công khai role của user trên Header, Sidebar, Topbar và trang 404; chỉ hiển thị Username và Avatar viết tắt.

### 🔹 Trực quan hóa & Trải nghiệm xem trang công khai (Public Page)

- Endpoint công khai `GET /api/public/pages` phục vụ dữ liệu tất cả các trang đã xuất bản từ **toàn bộ người dùng** trong hệ thống (Cross-user feed).
- Tra cứu trang không phân biệt chữ hoa/chữ thường theo `slug` hoặc ID.
- **UI/UX ProMax**:
  - Thanh tiến trình đọc (Reading Progress Bar) gradient ở đỉnh màn hình.
  - Thanh công cụ đọc nhanh nổi: Thích bài viết, Lưu trữ, Tùy biến cỡ chữ (A/A+/A++), Nút cuộn lên đầu trang.
  - Lightbox phóng to ảnh toàn màn hình với nền kính mờ khi nhấp vào hình ảnh.
  - Thẻ tác giả xác thực hiển thị tên tác giả thực tế từ cơ sở dữ liệu.
  - Ngăn trượt (Drawer) và Lưới bài viết cộng đồng chuyển trang mượt mà không reload (`pushState`).

### 🔹 Trang 404 & Bản nháp tối giản (PublicNotFoundView)

- Thiết kế tối giản, loại bỏ các chi tiết thừa thãi và trùng lặp.
- Đồng bộ 100% icon `lucide-react`, thanh header `.global-header`, logo `/logo.svg` và font chữ `Inter` với toàn hệ thống.
- **Nút "Quay lại trang trước"**: Sử dụng `navigate(-1)` của React Router, **giữ nguyên 100% trạng thái đăng nhập, token và context** của user mà không bị tải lại trang.

---

## 4. Hướng dẫn cài đặt & Khởi chạy Local

### Yêu cầu tiên quyết

- **Node.js**: >= 18.x
- **Python**: 3.12.x
- **Git**

---

### Bước 1. Khởi chạy Backend

1. Mở terminal tại thư mục `backend`:

   ```bash
   cd backend
   ```

2. Tạo và kích hoạt môi trường ảo Python:
   - **Windows (PowerShell)**:
     ```powershell
     python -m venv .venv
     .\.venv\Scripts\Activate.ps1
     ```
   - **Linux / macOS**:
     ```bash
     python3.12 -m venv .venv
     source .venv/bin/activate
     ```

3. Cài đặt các thư viện phụ thuộc:

   ```bash
   pip install -r requirements.txt
   ```

4. Cấu hình biến môi trường:
   Sao chép `.env.example` thành `.env` và cấu hình chuỗi kết nối PostgreSQL:

   ```ini
   DATABASE_URL=postgresql+psycopg://user:password@localhost:5432/cmsbuilder
   SECRET_KEY=your-super-secret-jwt-key
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=1440
   ```

5. Khởi động server FastAPI:

   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

   - Swagger API Docs: `http://127.0.0.1:8000/docs`
   - Health check: `http://127.0.0.1:8000/health`

---

### Bước 2. Khởi chạy Frontend

1. Mở terminal tại thư mục `frontend`:

   ```bash
   cd frontend
   ```

2. Cài đặt dependencies:

   ```bash
   npm install
   ```

3. Cấu hình biến môi trường:
   Tạo file `.env` (hoặc `.env.local`):

   ```ini
   VITE_API_URL=http://127.0.0.1:8000
   ```

4. Khởi chạy dev server:

   ```bash
   npm run dev
   ```

   Ứng dụng sẽ khả dụng tại `http://localhost:5173`.

5. Kiểm tra build sản phẩm:
   ```bash
   npm run build
   ```

---

## 5. Cấu trúc thư mục

```text
CMSBuilder/
├── backend/
│   ├── app/
│   │   ├── core/           # Cấu hình config, security, auth token
│   │   ├── db/             # Kết nối SQLAlchemy engine & session
│   │   ├── models/         # Khai báo models (User, Page, ContentBlock, Media)
│   │   ├── routers/        # API endpoints (auth, pages, blocks, media, public_pages)
│   │   ├── schemas/        # Pydantic schemas validation
│   │   ├── services/       # Xử lý nghiệp vụ logic (page_service, block_sync...)
│   │   └── main.py         # Entry point FastAPI & cấu hình CORS
│   ├── uploads/            # Thư mục lưu trữ media ảnh tải lên
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── public/             # Tài nguyên tĩnh, favicon, logo.svg
│   ├── src/
│   │   ├── components/     # Layout, Sidebar, Topbar, Page Builder Block Editors
│   │   ├── contexts/       # AuthContext quản lý phiên đăng nhập
│   │   ├── hooks/          # useAuth, custom hooks
│   │   ├── pages/          # LoginPage, PageBuilderPage, PageListPage, DashboardPage, PublicPage
│   │   ├── routes/         # AppRoutes, ProtectedRoute
│   │   ├── services/       # api client axios, authService, blockService, pageApi
│   │   ├── styles/         # theme.css, admin styles
│   │   └── main.tsx        # React root & BrowserRouter tương thích v7
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
└── README.md
```

---

## 6. Danh sách API chính

| Phương thức | Đường dẫn                  | Quyền        | Mô tả                                                       |
| ----------- | -------------------------- | ------------ | ----------------------------------------------------------- |
| `POST`      | `/api/auth/login`          | Công khai    | Đăng nhập nhận JWT Token & thông tin người dùng             |
| `GET`       | `/api/auth/me`             | Bearer Token | Lấy thông tin user hiện tại đang đăng nhập                  |
| `POST`      | `/api/auth/logout`         | Tùy chọn     | Đăng xuất an toàn khỏi phiên làm việc                       |
| `GET`       | `/api/pages`               | Người dùng   | Lấy danh sách trang thuộc quyền sở hữu                      |
| `POST`      | `/api/pages`               | Người dùng   | Khởi tạo trang mới                                          |
| `PUT`       | `/api/pages/{id}`          | Người dùng   | Cập nhật thông tin trang (tiêu đề, slug, mô tả, trạng thái) |
| `PUT`       | `/api/pages/{id}/blocks`   | Người dùng   | **Đồng bộ nguyên tử** danh sách Content Blocks              |
| `POST`      | `/api/media/upload`        | Người dùng   | Tải lên tập tin hình ảnh thực tế                            |
| `GET`       | `/api/public/pages`        | Công khai    | Lấy danh sách toàn bộ trang đã xuất bản trên hệ thống       |
| `GET`       | `/api/public/pages/{slug}` | Công khai    | Xem nội dung chi tiết bài viết công khai theo slug/id       |

---

## 7. Quy trình Git & Phân công Branch

### Phân công nhánh làm việc

| Thành viên       | Vai trò     | Branch phân công |
| ---------------- | ----------- | ---------------- |
| Phùng Thế Thăng  | Team Leader | `feature/thang`  |
| Đỗ Huy Đạt       | Thành viên  | `feature/dat`    |
| Nguyễn Nguyên Vũ | Thành viên  | `feature/vu`     |
| Tạ Thị Thủy      | Thành viên  | `feature/thuy`   |

### Quy tắc làm việc

1. Toàn bộ tính năng phát triển trên nhánh `feature/<ten-thanh-vien>`.
2. Không push trực tiếp lên nhánh `main` hoặc `develop`.
3. Tích hợp code thông qua Pull Request (PR) gửi vào `develop`.
4. Không commit các file nhạy cảm: `.env`, `.venv/`, `node_modules/`, `dist/`.

---

_© 2026 CMSBuilder Team. All rights reserved._
