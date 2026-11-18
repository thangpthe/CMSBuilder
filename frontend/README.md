# CMSBuilder – Frontend

## 1. Giới thiệu

CMSBuilder là hệ thống quản lý và xây dựng trang nội dung đa phương tiện (CMS Page Builder).

Frontend được xây dựng bằng ReactJS, sử dụng Vite làm công cụ khởi tạo và chạy ứng dụng.

README này hướng dẫn các thành viên trong nhóm cài đặt môi trường và chạy frontend trên máy local.

## 2. Công nghệ sử dụng

| Công nghệ        | Phiên bản |
| ---------------- | --------- |
| React            | 18.2.0    |
| React DOM        | 18.2.0    |
| Vite             | 5.4.x     |
| React Router DOM | 6.28.x    |
| Axios            | 1.7.x     |

## 3. Yêu cầu môi trường

Trước khi chạy dự án, cần cài đặt:

- npm (được cài kèm Node.js).
- Git.
- Visual Studio Code hoặc IDE tương đương.

Kiểm tra phiên bản đã cài:

```bash
node -v
npm -v
git --version
```

Nếu Node.js chưa đúng phiên bản, cần cài đặt phiên bản phù hợp trước khi tiếp tục.

## 4. Tải source code

Nếu chưa có source code:

```bash
git clone <GITHUB_REPOSITORY_URL>
```

Di chuyển vào thư mục dự án:

```bash
cd <PROJECT_FOLDER>
```

Nếu frontend nằm trong thư mục `frontend`:

```bash
cd frontend
```

Nếu đã có source code trên máy, chỉ cần mở Terminal tại thư mục `frontend`.

## 5. Cài đặt dependencies

Chạy lệnh:

```bash
npm install
```

Lệnh này sẽ cài đặt các thư viện được khai báo trong `package.json`.

**Lưu ý:**

- Ưu tiên sử dụng `npm install` khi cài đặt lần đầu.
- Không tự ý xóa hoặc chỉnh sửa `package-lock.json`.
- Các thành viên nên sử dụng chung file `package-lock.json` để hạn chế khác biệt phiên bản thư viện.

## 6. Cấu hình môi trường

Tạo file `.env` trong thư mục `frontend` nếu dự án chưa có.

Ví dụ:

```env
VITE_API_URL=http://127.0.0.1:8000
```

Trong đó:

- `VITE_API_URL`: địa chỉ Backend API.
- `127.0.0.1:8000`: địa chỉ minh họa, cần thay đổi nếu Backend chạy ở địa chỉ hoặc cổng khác.

Nếu dự án có file `.env.example`, có thể sao chép:

```bash
cp .env.example .env
```

Trên Windows CMD:

```cmd
copy .env.example .env
```

**Lưu ý:** Không commit file `.env` chứa cấu hình cá nhân hoặc thông tin bí mật lên GitHub. Nên commit `.env.example` để các thành viên khác biết những biến môi trường cần khai báo.

## 7. Chạy frontend trên local

Sau khi cài đặt dependencies và cấu hình môi trường, chạy:

```bash
npm run dev
```

Nếu chạy thành công, Vite sẽ hiển thị địa chỉ truy cập, thường có dạng:

```text
Local: http://localhost:5173/
```

Mở trình duyệt và truy cập:

```text
http://localhost:5173/
```

Để dừng ứng dụng, nhấn:

```text
Ctrl + C
```

**Lưu ý:** Nếu Frontend cần gọi API, Backend cũng phải được khởi động và cấu hình đúng địa chỉ trong `.env`.

## 8. Các lệnh thường dùng

| Lệnh              | Chức năng                          |
| ----------------- | ---------------------------------- |
| `npm install`     | Cài đặt dependencies               |
| `npm run dev`     | Chạy ứng dụng ở chế độ development |
| `npm run build`   | Build ứng dụng                     |
| `npm run preview` | Xem thử bản build local            |
| `npm list`        | Kiểm tra các package đã cài        |

Kiểm tra phiên bản các thư viện chính:

```bash
npm list react react-dom vite react-router-dom axios
```

## 9. Build dự án

Để kiểm tra khả năng build của frontend:

```bash
npm run build
```

Nếu build thành công, Vite sẽ tạo thư mục:

```text
dist/
```

Có thể xem thử bản build bằng lệnh:

```bash
npm run preview
```

## 10. Cấu trúc thư mục

Cấu trúc thư mục frontend dự kiến:

```text
frontend/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── contexts/
│   ├── hooks/
│   ├── routes/
│   ├── utils/
│   ├── styles/
│   ├── App.jsx
│   └── main.jsx
├── .env
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
└── vite.config.js
```

Các thư mục có thể được bổ sung hoặc điều chỉnh trong quá trình phát triển.

## 11. Quy trình làm việc nhóm

Để hạn chế xung đột code, các thành viên cần tuân thủ Git Workflow của dự án.

### Bước 1: Cập nhật code mới nhất

```bash
git checkout develop
git pull origin develop
```

### Bước 2: Tạo branch làm việc

Ví dụ:

```bash
git checkout -b feature/frontend-login
```

Tên branch nên thể hiện chức năng đang thực hiện:

```text
feature/frontend-login
feature/page-management
feature/page-builder
feature/public-page
fix/login-validation
```

### Bước 3: Thực hiện công việc

Sau khi hoàn thành một phần chức năng, kiểm tra ứng dụng trên local trước khi commit.

### Bước 4: Commit code

```bash
git add .
git commit -m "feat: implement login page"
```

### Bước 5: Push branch lên GitHub

```bash
git push origin feature/frontend-login
```

### Bước 6: Tạo Pull Request

- Tạo Pull Request từ branch cá nhân vào `develop`.
- Mô tả rõ chức năng đã thực hiện.
- Chờ thành viên phụ trách review.
- Chỉ merge sau khi đã kiểm tra và thống nhất.

**Quy định:** Không phát triển trực tiếp trên branch `main`. Không tự ý merge code chưa được review.

## 12. Xử lý lỗi thường gặp

### Lỗi 1: `npm install` thất bại

Thử kiểm tra phiên bản Node.js và npm:

```bash
node -v
npm -v
```

Nếu vẫn gặp lỗi, có thể thử cài đặt lại dependencies:

```bash
npm install
```

### Lỗi 2: Cổng 5173 đã được sử dụng

Vite có thể tự chuyển sang cổng khác, ví dụ:

```text
http://localhost:5174/
```

Truy cập đúng địa chỉ được hiển thị trong Terminal.

### Lỗi 3: Frontend không kết nối được Backend

Kiểm tra:

- Backend đã được khởi động chưa.
- Địa chỉ `VITE_API_URL` trong file `.env` đã chính xác chưa.
- Backend đã cấu hình CORS cho địa chỉ Frontend chưa.
- API endpoint có đúng với tài liệu thống nhất giữa Frontend và Backend không.

Sau khi thay đổi file `.env`, cần khởi động lại Vite.

### Lỗi 4: Không tìm thấy package hoặc module

Chạy:

```bash
npm install
```

Nếu vừa thêm package mới, kiểm tra package đã được khai báo trong `package.json` chưa.

---

## 13. Hoàn tất

Sau khi thực hiện đầy đủ các bước trên, thành viên có thể chạy CMSBuilder Frontend trên máy local.

Lệnh chạy nhanh:

```bash
cd frontend
npm install
npm run dev
```

Địa chỉ truy cập mặc định:

```text
http://localhost:5173/
```

**Lưu ý:** Mỗi thành viên cần cập nhật source code mới nhất từ branch `develop` trước khi bắt đầu công việc.

# HƯỚNG DẪN SỬ DỤNG GIT VÀ LÀM VIỆC NHÓM

## Dự án CMSBuilder

### 1. Quy định chung

Nhóm sử dụng GitHub để quản lý source code theo mô hình:

- `main`: Chứa phiên bản ổn định của dự án.
- `develop`: Chứa code mới nhất đã được tích hợp của toàn nhóm.
- `feature/<ten-thanh-vien>`: Branch làm việc riêng của từng thành viên.

Mỗi thành viên được cấp một branch riêng. Thành viên chỉ code và push code lên branch của mình, không push trực tiếp lên `main` hoặc `develop`.

### 2. Danh sách branch của các thành viên

| Thành viên       | Branch được sử dụng |
| ---------------- | ------------------- |
| Phùng Thế Thăng  | `feature/thang`     |
| Đỗ Huy Đạt       | `feature/dat`       |
| Nguyễn Nguyên Vũ | `feature/vu`        |
| Tạ Thị Thủy      | `feature/thuy`      |
| Nguyễn Quang Anh | `feature/quang-anh` |

### 3. Lần đầu tiên lấy source code về máy

Mỗi thành viên thực hiện các bước sau:

**Bước 1: Clone repository**

Nếu chưa có source code trên máy:

```
git clone <GITHUB_REPOSITORY_URL>
```

Di chuyển vào thư mục dự án:

```
cd <PROJECT_FOLDER>
```

**Bước 2: Lấy danh sách branch mới nhất**

```
git fetch origin
```

**Bước 3: Chuyển sang branch cá nhân**

Ví dụ thành viên Đỗ Huy Đạt:

```
git switch --track origin/feature/dat
```

Các thành viên khác thay tên branch tương ứng.

**Bước 4: Lấy code mới nhất từ develop**

```
git merge origin/develop
```

Sau bước này, thành viên có source code từ `develop` và đang đứng trên branch cá nhân của mình.

**Bước 5: Cài đặt dependencies**

Đối với Frontend:

```
cd frontend
npm install
npm run dev
```

Đối với Backend, thực hiện theo README hướng dẫn chạy Backend của dự án.

### 4. Quy trình làm việc hằng ngày

Mỗi khi bắt đầu một buổi làm việc, thành viên thực hiện:

**Bước 1: Chuyển sang branch cá nhân**

Ví dụ:

```
git switch feature/dat
```

**Bước 2: Lấy code mới nhất từ GitHub**

```
git fetch origin
git merge origin/develop
```

Mục đích: Cập nhật những chức năng mà các thành viên khác đã hoàn thành và được tích hợp vào `develop`.

**Bước 3: Thực hiện task được phân công**

- Chỉ làm những task được giao trong Sprint Backlog.
- Hạn chế chỉnh sửa file thuộc phạm vi phụ trách của thành viên khác.
- Nếu cần chỉnh sửa file dùng chung, phải trao đổi với người đang phụ trách file đó.
- Kiểm tra chức năng trước khi commit.

**Bước 4: Commit code**

Ví dụ:

```
git add .
git commit -m "feat: implement page management"
```

Quy ước commit:

| Prefix     | Ý nghĩa                       | Ví dụ                            |
| ---------- | ----------------------------- | -------------------------------- |
| `feat`     | Thêm chức năng                | `feat: implement login`          |
| `fix`      | Sửa lỗi                       | `fix: resolve login error`       |
| `docs`     | Cập nhật tài liệu             | `docs: update frontend README`   |
| `style`    | Chỉnh sửa giao diện/định dạng | `style: update dashboard layout` |
| `refactor` | Tái cấu trúc code             | `refactor: organize components`  |
| `test`     | Bổ sung kiểm thử              | `test: add login tests`          |
| `chore`    | Cấu hình, công việc kỹ thuật  | `chore: update dependencies`     |

**Bước 5: Push code lên branch cá nhân**

```
git push origin feature/dat
```

Thay `feature/dat` bằng branch của thành viên tương ứng.

### 5. Quy trình đưa code lên develop

Sau khi hoàn thành task:

1. Thành viên push code lên branch cá nhân.
2. Truy cập repository trên GitHub.
3. Chọn Pull Requests.
4. Nhấn New Pull Request.
5. Chọn:
   - Base: `develop`
   - Compare: branch cá nhân của mình.
6. Viết mô tả chức năng đã hoàn thành.
7. Tạo Pull Request và thông báo Team Leader.
8. Team Leader kiểm tra, review và merge nếu đạt yêu cầu.

**Không tự ý merge Pull Request nếu chưa được Team Leader đồng ý.**

### 6. Sau khi code được merge vào develop

Khi một thành viên khác đã merge code vào `develop`, những thành viên còn lại cần cập nhật branch cá nhân trước khi tiếp tục làm việc:

```
git fetch origin
git merge origin/develop
```

Lệnh trên cần được thực hiện khi đang đứng ở branch cá nhân.

Nếu có xung đột (conflict), không tự ý xóa hoặc ghi đè code của thành viên khác. Hãy thông báo Team Leader để cùng xử lý.

### 7. Các nguyên tắc bắt buộc

1. Không code trực tiếp trên `main` hoặc `develop`.
2. Không push trực tiếp lên `develop`.
3. Mỗi thành viên chỉ push lên branch được phân công.
4. Luôn cập nhật code từ `develop` trước khi bắt đầu task.
5. Không commit file `.env` chứa thông tin cá nhân hoặc bí mật.
6. Không tự ý xóa, đổi tên branch hoặc sửa lịch sử Git của người khác.
7. Phải kiểm tra code trước khi push.
8. Mọi code muốn tích hợp vào dự án đều phải thông qua Pull Request.

### 8. Bảng lệnh Git cần nhớ

| Mục đích                 | Lệnh                          |
| ------------------------ | ----------------------------- |
| Kiểm tra branch hiện tại | `git branch`                  |
| Chuyển branch cá nhân    | `git switch feature/dat`      |
| Lấy thông tin mới nhất   | `git fetch origin`            |
| Cập nhật từ develop      | `git merge origin/develop`    |
| Kiểm tra thay đổi        | `git status`                  |
| Thêm file vào commit     | `git add .`                   |
| Commit code              | `git commit -m "feat: ..."`   |
| Push code                | `git push origin feature/dat` |

### 9. Quy trình tóm tắt

**Mỗi thành viên chỉ cần nhớ:**

```
# 1. Chuyển sang branch cá nhân
git switch feature/dat

# 2. Lấy thông tin mới nhất
git fetch origin

# 3. Cập nhật code từ develop
git merge origin/develop

# 4. Code và kiểm tra chức năng

# 5. Commit
git add .
git commit -m "feat: ten-chuc-nang"

# 6. Push lên branch cá nhân
git push origin feature/dat
```

Sau đó tạo Pull Request từ branch cá nhân vào `develop`.

**Mục tiêu:** Giữ `main` ổn định, dùng `develop` làm nơi tích hợp code và mỗi thành viên phát triển độc lập trên branch riêng. Nhóm thống nhất chỉ có Team Leader chịu trách nhiệm review và merge code vào `develop`.

## 3. Một lưu ý mình muốn bạn thống nhất trước khi gửi nhóm

Có hai tình huống khác nhau:

- Lần đầu: Thành viên clone repository, checkout branch cá nhân và lấy code từ `develop`.
- Những lần tiếp theo: Chỉ cần `fetch` và `merge origin/develop` khi đang ở branch cá nhân.

Đặc biệt, nếu một thành viên đang có code chưa commit thì phải commit hoặc lưu lại trước khi merge để tránh mất thay đổi.
