# Dữ liệu tài khoản mẫu

Lệnh chủ động `tools/SeedDemoAccounts.java --apply` tạo các tài khoản chưa tồn tại trong MySQL đang cấu hình:

| Email | Vai trò | Trình độ | Rubik | Phút/ngày |
| --- | --- | --- | --- | --- |
| admin@speedcube.test | ADMIN | ADVANCED | 3×3 | 30 |
| beginner@speedcube.test | USER | BEGINNER | 3×3 | 10 |
| intermediate@speedcube.test | USER | INTERMEDIATE | 4×4 | 20 |
| advanced@speedcube.test | USER | ADVANCED | 5×5 | 30 |

Mật khẩu ngẫu nhiên riêng cho mỗi tài khoản được băm BCrypt cost 12 trong DB. Thông tin đăng nhập mới tạo chỉ ghi vào `config/demo-accounts.local.txt`, được Git bỏ qua. Mở file này để lấy mật khẩu rồi đăng nhập `/login`; tài khoản ADMIN mở được `/admin`.

Không tự chạy seed khi ứng dụng khởi động. Chạy lại bỏ qua email đã có, không đổi mật khẩu, vai trò hoặc tiến độ. Các hồ sơ mẫu chưa có kết quả học giả; người dùng đăng nhập và luyện tập để tạo tiến độ của mình.

Chạy từ thư mục dự án trong PowerShell:

```powershell
mvn package
.\tools\seed-demo-accounts.ps1
```

Đọc `DB_URL`, `DB_USER`, `DB_PASSWORD` từ biến môi trường hoặc file cấu hình local. Mặc định dùng MySQL localhost:3306/demotesting.

Script dùng Java 21 và ba thư viện có sẵn trong JAR ứng dụng sau khi build, không cần cài thêm thư viện seed.

## Kiểm chứng trên MySQL local

Đã tạo đủ 4 tài khoản và kiểm tra đăng nhập qua HTTP. ADMIN gọi được `/api/admin/users` và thấy 4 hồ sơ mẫu; cả 3 USER nhận 403 khi gọi API quản trị. Chạy seed lần hai tạo 0 tài khoản, giữ nguyên thông tin đăng nhập. File mật khẩu đã được xác nhận nằm trong danh sách Git bỏ qua.
