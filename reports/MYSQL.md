# Chuyển sang MySQL — 28/10/2026

Ứng dụng mặc định kết nối `jdbc:mysql://localhost:3306/demotesting?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Ho_Chi_Minh`, username `root`, `spring.jpa.hibernate.ddl-auto=update` theo yêu cầu. Mật khẩu đã được đặt trong `config/database-local.properties`, được Git bỏ qua; không ghi vào source hoặc JAR.

Thêm driver chính thức `com.mysql:mysql-connector-j` do Spring Boot quản lý, bỏ driver PostgreSQL. Giữ H2 để kiểm thử tự động và hỗ trợ việc đọc dữ liệu cũ khi cần. Không ép dialect/driver toàn cục, vì URL của kiểm thử được ghi đè thành H2.

## Xác nhận thực tế

- Kết nối thành công MySQL **8.0.36** tại localhost:3306 bằng thông tin được cung cấp.
- Database `demotesting` đã có sẵn, ban đầu 0 bảng. Không tạo lại hoặc xóa database.
- Khởi động ứng dụng thật với MySQL tại cổng QA 8081: tạo **10 bảng**, nạp **606 case**.
- Kiểm tra HTTP thật: đăng ký/đăng nhập, lưu hồ sơ 5×5/Advanced, learned/favorite, hoàn thành chặng, đăng xuất và đăng nhập lại. PASS.
- Kiểm tra JDBC trực tiếp bằng kết nối riêng xác nhận hồ sơ, hash mật khẩu và learned/favorite đã được commit vào MySQL.
- Sau kiểm tra chỉ xóa tài khoản QA UUID/email riêng và các bản ghi thuộc tài khoản đó trong một transaction; dữ liệu Rubik được giữ lại.
- Maven package: **36 tests, 0 failures**. Bộ tự động vẫn dùng H2, không gọi đó là toàn bộ test chạy trên MySQL; kiểm tra MySQL thật ở trên là bước riêng.

## Vận hành

Chạy từ thư mục dự án để file `config/database-local.properties` được đọc. Biến môi trường `DB_PASSWORD`, `DB_USER`, `DB_URL` có thể ghi đè cấu hình riêng. Máy khác sao chép `config/database-local.example.properties` và nhập mật khẩu của máy đó; không copy secret vào Git.

`compose.yaml` chuyển sang MySQL 8.4 với volume riêng; đây là lựa chọn thay cho MySQL đã cài sẵn. Không bật container vào cổng 3306 đang được MySQL hiện tại sử dụng. Không chạy hoặc thay đổi dịch vụ MySQL hệ thống trong quá trình kiểm tra này.

Dữ liệu H2 cũ ở `var/academy.mv.db` vẫn còn và không được tự động chuyển. Tài khoản/UUID/progress trong H2 nếu đã có cần được migrate riêng, tránh gộp hoặc ghi đè người học. Tiến độ khách trên trình duyệt có thể nhập chủ động vào tài khoản.

Công cụ: `tools/MySqlProbe.java` kiểm tra server/database; `tools/mysql_http_smoke.py` tạo tài khoản thử qua HTTP; probe có chế độ verify/cleanup chỉ chấp nhận QA owner có UUID/email đúng mẫu và dùng prepared statements. Không in mật khẩu.
