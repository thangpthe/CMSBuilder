# HƯỚNG DẪN SỬ DỤNG GIT & GITHUB
## Dự án CMSBuilder – Quy trình làm việc dành cho thành viên

---

# PHẦN I. THÔNG TIN REPOSITORY VÀ PHÂN CÔNG BRANCH

## 1. Repository của dự án

- GitHub Repository: https://github.com/thangpthe/CMSBuilder
- Branch tích hợp: `develop`
- Branch ổn định: `main`

## 2. Phân công branch cho từng thành viên

Mỗi thành viên được phân công một branch riêng để làm việc.

| Thành viên | Branch được phân công |
|---|---|
| Phùng Thế Thăng – Team Leader | `feature/thang` |
| Đỗ Huy Đạt | `feature/dat` |
| Nguyễn Nguyên Vũ | `feature/vu` |
| Tạ Thị Thủy | `feature/thuy` |
| Nguyễn Quang Anh | `feature/quang-anh` |

**Quy định bắt buộc:**

1. Mỗi thành viên chỉ làm việc trên branch cá nhân được phân công.
2. Không push trực tiếp code lên `main` hoặc `develop`.
3. Không tự ý sửa code thuộc phần việc của thành viên khác nếu chưa trao đổi.
4. Mọi thay đổi muốn đưa vào `develop` phải thông qua Pull Request (PR).
5. Team Leader chịu trách nhiệm kiểm tra và merge PR vào `develop`.
6. Không tự ý sử dụng `git push --force`.

## 3. Mô hình hoạt động của Git

```text
main
  |
  | (nhánh ổn định, chỉ cập nhật khi hoàn thiện)
  |
develop
  |
  |---------------------------------------
  |          |          |        |        |
feature/   feature/   feature/ feature/ feature/
thang      dat        vu       thuy    quang-anh
```

Tất cả branch `feature/*` đều được tạo từ `develop`.

Luồng làm việc:

`develop` → `feature cá nhân` → `commit` → `push` → `Pull Request` → `develop`.

---

# PHẦN II. TẢI SOURCE CODE TỪ GITHUB

## BƯỚC 1. Cài đặt Git

Nếu máy tính chưa có Git:

1. Truy cập: https://git-scm.com/downloads
2. Tải Git phiên bản phù hợp với Windows.
3. Cài đặt theo thiết lập mặc định.
4. Mở PowerShell và kiểm tra:

```powershell
git --version
```

Nếu xuất hiện phiên bản Git, nghĩa là cài đặt thành công.

## BƯỚC 2. Cấu hình thông tin Git

Mỗi thành viên cần cấu hình tên và email cá nhân.

Ví dụ:

```powershell
git config --global user.name "Do Huy Dat"
git config --global user.email "email-cua-ban@example.com"
```

Thay tên và email bằng thông tin cá nhân tương ứng.

Kiểm tra:

```powershell
git config --global --list
```

Lưu ý: Email nên là email đã đăng ký hoặc được xác minh trên GitHub nếu muốn các commit được liên kết với tài khoản GitHub.

## BƯỚC 3. Clone repository về máy

Mở PowerShell tại thư mục muốn lưu source code.

Ví dụ:

```powershell
cd D:\Campuslink\MockProject
```

Chạy lệnh:

```powershell
git clone https://github.com/thangpthe/CMSBuilder.git
```

Sau khi clone thành công, máy tính sẽ có thư mục:

```text
MockProject/
└── CMSBuilder/
    ├── .git/
    ├── .gitignore
    ├── backend/
    └── frontend/
```

Trong đó:

- `.git`: Lưu thông tin quản lý phiên bản và kết nối repository.
- `backend`: Source code FastAPI.
- `frontend`: Source code React.

**Lưu ý:** Không chạy `git init` trong thư mục vừa clone. Repository đã được khởi tạo sẵn.

## BƯỚC 4. Kiểm tra các branch từ GitHub

Di chuyển vào thư mục dự án:

```powershell
cd CMSBuilder
```

Cập nhật danh sách branch:

```powershell
git fetch origin
```

Xem toàn bộ branch:

```powershell
git branch -a
```

Kết quả dự kiến:

```text
  remotes/origin/develop
  remotes/origin/main
  remotes/origin/feature/dat
  remotes/origin/feature/quang-anh
  remotes/origin/feature/thang
  remotes/origin/feature/thuy
  remotes/origin/feature/vu
```

---

# PHẦN III. CHUYỂN SANG BRANCH CÁ NHÂN

Mỗi thành viên phải checkout đúng branch được phân công.

## 1. Phùng Thế Thăng

```powershell
git switch --track origin/feature/thang
```

## 2. Đỗ Huy Đạt

```powershell
git switch --track origin/feature/dat
```

## 3. Nguyễn Nguyên Vũ

```powershell
git switch --track origin/feature/vu
```

## 4. Tạ Thị Thủy

```powershell
git switch --track origin/feature/thuy
```

## 5. Nguyễn Quang Anh

```powershell
git switch --track origin/feature/quang-anh
```

Các lệnh trên tạo branch local và thiết lập theo dõi branch tương ứng trên GitHub.

**Lưu ý:** Mỗi thành viên chỉ chạy lệnh dành cho branch của mình.

Kiểm tra branch hiện tại:

```powershell
git branch
```

Ví dụ đối với Đỗ Huy Đạt:

```text
  develop
* feature/dat
  main
```

Dấu `*` cho biết branch hiện tại.

Nếu branch local đã tồn tại từ trước, dùng:

```powershell
git switch feature/dat
```

Thay `feature/dat` bằng branch của thành viên tương ứng.

---

# PHẦN IV. CÀI ĐẶT MÔI TRƯỜNG CHẠY DỰ ÁN

Repository có cả Frontend và Backend. Thành viên cần cài đặt môi trường theo phần việc của mình.

## A. Cài đặt Backend

### Bước 1. Cài Python 3.12

Kiểm tra:

```powershell
py -3.12 --version
```

Nếu chưa có Python 3.12, có thể cài bằng:

```powershell
winget install -e --id Python.Python.3.12
```

Sau khi cài đặt, mở lại PowerShell và kiểm tra.

### Bước 2. Di chuyển vào Backend

```powershell
cd backend
```

### Bước 3. Tạo môi trường ảo

```powershell
py -3.12 -m venv .venv
```

### Bước 4. Kích hoạt môi trường ảo

```powershell
.\.venv\Scripts\Activate.ps1
```

Nếu bị lỗi Execution Policy:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

Sau đó kích hoạt lại:

```powershell
.\.venv\Scripts\Activate.ps1
```

Khi thành công, đầu dòng PowerShell sẽ xuất hiện `(.venv)`.

### Bước 5. Cài đặt thư viện

```powershell
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

### Bước 6. Tạo file cấu hình môi trường

Nếu dự án có `.env.example`:

```powershell
Copy-Item .env.example .env
```

Mở file `.env` và cấu hình các giá trị theo hướng dẫn của nhóm Backend.

Không commit hoặc push file `.env` lên GitHub.

### Bước 7. Chạy Backend

```powershell
python -m uvicorn app.main:app --reload
```

Kiểm tra:

- API: http://127.0.0.1:8000
- Swagger UI: http://127.0.0.1:8000/docs

Để dừng server: nhấn `Ctrl + C`.

## B. Cài đặt Frontend

### Bước 1. Cài Node.js 22

Kiểm tra:

```powershell
node -v
npm -v
```

Yêu cầu Node.js 22 theo cấu hình dự án.

### Bước 2. Mở cửa sổ PowerShell mới

Di chuyển vào thư mục Frontend:

```powershell
cd D:\Campuslink\MockProject\CMSBuilder\frontend
```

### Bước 3. Cài đặt thư viện

```powershell
npm ci
```

Nên sử dụng `npm ci` khi repository có `package-lock.json` để cài dependency theo lockfile.

### Bước 4. Tạo file cấu hình môi trường

Nếu có `.env.example`:

```powershell
Copy-Item .env.example .env
```

Cấu hình địa chỉ Backend theo hướng dẫn của nhóm.

### Bước 5. Chạy Frontend

```powershell
npm run dev
```

Mở địa chỉ Vite hiển thị trong terminal, thông thường là:

http://localhost:5173

Để dừng server: nhấn `Ctrl + C`.

---

# PHẦN V. QUY TRÌNH LÀM VIỆC HẰNG NGÀY

Đây là phần quan trọng nhất. Thành viên phải tuân thủ quy trình này mỗi ngày để hạn chế xung đột code.

## BƯỚC 1. Kiểm tra branch hiện tại

```powershell
git branch
```

Đảm bảo đang ở branch cá nhân.

Ví dụ:

```text
* feature/dat
  develop
  main
```

Nếu chưa đúng:

```powershell
git switch feature/dat
```

## BƯỚC 2. Cập nhật dữ liệu từ GitHub

```powershell
git fetch origin
```

Lệnh này cập nhật thông tin các branch trên GitHub về máy tính, không tự động thay đổi source code đang làm.

## BƯỚC 3. Đồng bộ code mới nhất từ develop

Khi Team Leader đã merge code mới vào `develop`, các thành viên cần cập nhật về branch cá nhân.

Đang đứng ở branch cá nhân, chạy:

```powershell
git merge origin/develop
```

Ví dụ Đỗ Huy Đạt:

```powershell
git switch feature/dat
git fetch origin
git merge origin/develop
```

Nếu Git thông báo `Already up to date` thì branch cá nhân đã có đầy đủ thay đổi mới nhất từ `develop`.

Nếu xuất hiện conflict, không xóa hoặc ghi đè code một cách tùy tiện. Thành viên cần xử lý xung đột, kiểm tra lại chức năng và commit kết quả.

## BƯỚC 4. Tiến hành lập trình

Thành viên chỉ chỉnh sửa phần việc được phân công.

Ví dụ:

```text
CMSBuilder/
├── backend/
│   ├── app/
│   └── requirements.txt
│
└── frontend/
    ├── src/
    └── package.json
```

Nếu được giao Backend thì ưu tiên chỉnh sửa trong `backend/`.

Nếu được giao Frontend thì ưu tiên chỉnh sửa trong `frontend/`.

Không tự ý sửa các file cấu hình chung hoặc phần code của người khác nếu chưa thống nhất với Team Leader.

## BƯỚC 5. Kiểm tra các file đã thay đổi

```powershell
git status
```

Kiểm tra nội dung thay đổi:

```powershell
git diff
```

Nếu có file không được phép đưa lên GitHub như `.env`, `.venv`, `node_modules`, database cá nhân, cần kiểm tra và loại bỏ khỏi vùng stage trước khi commit.

## BƯỚC 6. Đưa code vào vùng chuẩn bị commit

Khuyến nghị chỉ stage phần việc của mình.

Ví dụ Backend:

```powershell
git add backend/
```

Ví dụ Frontend:

```powershell
git add frontend/
```

Nếu thay đổi nhiều file dùng chung và đã kiểm tra toàn bộ:

```powershell
git add -A
```

Kiểm tra lại:

```powershell
git status
```

## BƯỚC 7. Commit code

Sử dụng thông điệp commit rõ ràng, mô tả đúng nội dung công việc.

Ví dụ:

```powershell
git commit -m "feat: implement page management API"
```

Một số quy ước commit:

| Prefix | Ý nghĩa |
|---|---|
| `feat:` | Thêm chức năng |
| `fix:` | Sửa lỗi |
| `docs:` | Cập nhật tài liệu |
| `style:` | Điều chỉnh giao diện/định dạng |
| `refactor:` | Tái cấu trúc code |
| `test:` | Bổ sung hoặc sửa kiểm thử |
| `chore:` | Công việc cấu hình, bảo trì |

Ví dụ:

```powershell
git commit -m "feat: add text block component"
git commit -m "fix: correct page update API"
git commit -m "docs: update backend setup guide"
```

## BƯỚC 8. Push code lên branch cá nhân

Ví dụ đối với Đỗ Huy Đạt:

```powershell
git push origin feature/dat
```

Các thành viên khác sử dụng branch tương ứng:

```powershell
git push origin feature/thang
git push origin feature/vu
git push origin feature/thuy
git push origin feature/quang-anh
```

Không push code lên `develop` hoặc `main`.

---

# PHẦN VI. TẠO PULL REQUEST ĐỂ MERGE CODE VÀO DEVELOP

Sau khi hoàn thành một chức năng hoặc một nhóm công việc, thành viên tạo Pull Request.

## BƯỚC 1. Push code lên branch cá nhân

Ví dụ:

```powershell
git push origin feature/dat
```

## BƯỚC 2. Mở GitHub

Truy cập:

https://github.com/thangpthe/CMSBuilder

Chọn mục **Pull requests**.

Nhấn **New pull request**.

## BƯỚC 3. Chọn branch

Thiết lập:

- Base: `develop`
- Compare: `feature/dat`

Ví dụ:

```text
base: develop
compare: feature/dat
```

Đối với các thành viên khác, chọn branch cá nhân tương ứng.

## BƯỚC 4. Viết nội dung Pull Request

Ví dụ:

**Title:**

```text
feat: implement page management
```

**Description:**

```text
## Nội dung thực hiện
- Xây dựng chức năng quản lý trang.
- Bổ sung API tạo trang.
- Bổ sung API cập nhật trang.
- Bổ sung API xóa trang.

## Kiểm thử
- Đã kiểm tra API bằng Postman.
- Đã kiểm tra dữ liệu trả về.
- Không phát hiện lỗi trong phạm vi đã kiểm thử.

## Ghi chú
- Các nội dung cần hỗ trợ hoặc vấn đề còn tồn tại.
```

## BƯỚC 5. Chờ Team Leader kiểm tra

Team Leader sẽ:

1. Kiểm tra nội dung code.
2. Kiểm tra chức năng.
3. Kiểm tra các thay đổi có ảnh hưởng phần khác không.
4. Yêu cầu chỉnh sửa nếu cần.
5. Merge Pull Request vào `develop` khi đạt yêu cầu.

Thành viên không tự ý merge PR nếu chưa được phân quyền hoặc chưa có sự đồng ý của Team Leader.

---

# PHẦN VII. ĐỒNG BỘ SAU KHI PULL REQUEST ĐƯỢC MERGE

Sau khi PR của thành viên được merge vào `develop`, các thành viên khác cần cập nhật source mới.

Ví dụ đối với Đỗ Huy Đạt:

```powershell
git switch feature/dat
git fetch origin
git merge origin/develop
```

Kiểm tra:

```powershell
git status
```

Nếu không có lỗi, thành viên tiếp tục công việc.

**Lưu ý:** Chỉ merge `origin/develop` vào branch cá nhân. Không chuyển sang `main` để lấy code trong quy trình phát triển thông thường.

---

# PHẦN VIII. XỬ LÝ CÁC LỖI GIT THƯỜNG GẶP

## 1. Lỗi chưa cấu hình user.name hoặc user.email

Chạy:

```powershell
git config --global user.name "Ten Cua Ban"
git config --global user.email "email-cua-ban@example.com"
```

Sau đó commit lại.

## 2. Lỗi branch chưa tồn tại ở local

Chạy:

```powershell
git fetch origin
git branch -a
```

Nếu branch có trên remote:

```powershell
git switch --track origin/feature/dat
```

Thay bằng branch của thành viên.

## 3. Lỗi push bị từ chối do remote có commit mới

Không dùng `git push --force`.

Thực hiện:

```powershell
git fetch origin
git merge origin/feature/dat
```

Giải quyết conflict nếu có, sau đó:

```powershell
git push origin feature/dat
```

## 4. Lỗi merge conflict

Khi Git thông báo conflict:

1. Mở file bị conflict trong VS Code.
2. Xem các đoạn có dấu `<<<<<<<`, `=======`, `>>>>>>>`.
3. Trao đổi với thành viên liên quan để thống nhất nội dung.
4. Chỉnh sửa và xóa các dấu conflict.
5. Kiểm tra lại code.

Sau đó:

```powershell
git add .
git commit -m "fix: resolve merge conflicts"
```

## 5. Đã sửa nhầm trên develop

Nếu đã sửa code nhưng chưa commit, không nên tự ý xóa thay đổi.

Thông báo Team Leader để được hướng dẫn chuyển phần thay đổi sang branch cá nhân an toàn.

---

# PHẦN IX. QUY TẮC BẮT BUỘC CỦA NHÓM

| STT | Quy định |
|---|---|
| 1 | Mỗi thành viên làm việc trên branch cá nhân. |
| 2 | Trước khi lập trình phải kiểm tra branch hiện tại. |
| 3 | Thường xuyên `git fetch origin` và đồng bộ `origin/develop`. |
| 4 | Commit theo từng chức năng hoặc nhóm công việc nhỏ. |
| 5 | Commit message phải rõ ràng. |
| 6 | Chỉ push lên branch cá nhân. |
| 7 | Không push trực tiếp lên `main` và `develop`. |
| 8 | Mọi thay đổi vào `develop` phải thông qua Pull Request. |
| 9 | Không commit file `.env`, `.venv`, `node_modules` và dữ liệu cá nhân. |
| 10 | Không sử dụng `git push --force` khi chưa được Team Leader cho phép. |

## Những lệnh cần nhớ hằng ngày

```powershell
# 1. Kiểm tra branch
git branch

# 2. Lấy thông tin mới nhất từ GitHub
git fetch origin

# 3. Đồng bộ develop vào branch cá nhân
git merge origin/develop

# 4. Kiểm tra thay đổi
git status

# 5. Stage code
git add backend/
# hoặc
git add frontend/

# 6. Commit
git commit -m "feat: mô tả chức năng"

# 7. Push lên branch cá nhân
git push origin feature/ten-thanh-vien
```

---

# PHẦN X. CHECKLIST TRƯỚC KHI KẾT THÚC MỖI NGÀY

- [ ] Đang làm việc đúng branch cá nhân.
- [ ] Đã cập nhật code mới nhất từ `develop` khi cần.
- [ ] Đã kiểm tra và chạy thử phần code vừa thực hiện.
- [ ] Đã kiểm tra `git status`.
- [ ] Không đưa file cấu hình bí mật lên GitHub.
- [ ] Đã commit code với nội dung rõ ràng.
- [ ] Đã push code lên branch cá nhân.
- [ ] Đã cập nhật tiến độ công việc cho Team Leader.

---

**KẾT LUẬN**

Toàn bộ thành viên thống nhất sử dụng mô hình Git Branching của CMSBuilder:

- `main`: nhánh ổn định.
- `develop`: nhánh tích hợp source code.
- `feature/thang`: Phùng Thế Thăng.
- `feature/dat`: Đỗ Huy Đạt.
- `feature/vu`: Nguyễn Nguyên Vũ.
- `feature/thuy`: Tạ Thị Thủy.
- `feature/quang-anh`: Nguyễn Quang Anh.

Mục tiêu là đảm bảo source code được quản lý tập trung, hạn chế ghi đè code, giảm xung đột khi làm việc nhóm và giúp Team Leader kiểm soát chất lượng trước khi tích hợp.
