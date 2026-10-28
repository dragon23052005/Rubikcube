# Tài khoản, phân quyền và lộ trình

## Chức năng

- `/register`, `/login`: đăng ký, đăng nhập bằng email/mật khẩu. Đăng ký chỉ cấp `USER`; không thể truyền `role` hay `userId` để nâng quyền.
- `/account`: tên hiển thị, trình độ, loại Rubik tập trung, mục tiêu 5–120 phút/ngày; đăng xuất; nhập tiến độ khách theo lựa chọn rõ ràng của người dùng.
- `/roadmap`: lộ trình riêng cho Beginner / Intermediate / Advanced trên 3×3, 2×2, 4×4, 5×5 và Square-1. Chặng lý thuyết/thực hành được tự xác nhận; chặng thuật toán tự tính từ case đã thuộc. Có trạng thái chặng tiếp theo và Practice đúng tập con của chặng.
- `/progress`, `/favorites`, Practice và thẻ công thức: khi đã đăng nhập, đọc/ghi dữ liệu từ DB theo tài khoản. Khách vẫn có thể khám phá và học với localStorage.
- `/admin`: chỉ `ADMIN` được xem danh sách phân trang và tiến độ/lộ trình người học. Người chơi không được đọc hoặc ghi tiến độ của tài khoản khác.

Vai trò bảo vệ quyền truy cập; trình độ chỉ thay đổi khuyến nghị học. Người chơi vẫn được xem toàn bộ thư viện. 2×2 nâng cao không giả lập bộ CLL/EG chưa có dữ liệu. Mục tiêu phút/ngày là mục tiêu cá nhân, không phải bộ đếm thời gian thực hành.

## Tạo quản trị viên

Không có mật khẩu admin mặc định. Trước lần chạy đầu, đặt hai biến môi trường bằng thông tin do người vận hành chọn:

```powershell
$env:ACADEMY_ADMIN_EMAIL='admin@tenmien-cua-ban.vn'
$adminSecret=Read-Host 'Mật khẩu admin (ít nhất 10 ký tự, tối đa 72 byte UTF-8)' -AsSecureString
$env:ACADEMY_ADMIN_PASSWORD=[System.Net.NetworkCredential]::new('', $adminSecret).Password
.\mvnw.cmd spring-boot:run
```

Dùng **email mới**. Bootstrap chỉ tạo tài khoản chưa tồn tại; không tự nâng quyền hoặc đổi mật khẩu của tài khoản có sẵn khi khởi động lại. Sau khi tạo, có thể bỏ hai biến khỏi cấu hình chạy; tài khoản đã được lưu trong DB. Với IntelliJ, đặt biến môi trường trong Run Configuration, không đưa mật khẩu vào Git.

## Lưu trữ và dữ liệu cũ

- `academy_accounts`: ID UUID, email chuẩn hóa/unique, mật khẩu băm BCrypt cost 12, vai trò và hồ sơ học tập.
- `learning_progress`: thêm `user_id` và version; khóa tiến độ dùng ID tài khoản + ID case. Dữ liệu cá nhân không phụ thuộc session ID.
- `stage_completion`: bài thực hành đã hoàn thành, theo người học và ID chặng.
- Hồ sơ, tiến độ và chặng đã hoàn thành còn nguyên sau khi khởi động lại hoặc đăng nhập bằng phiên khác. Session đăng nhập có thể phải tạo lại sau khi server restart.
- Dữ liệu progress API cũ theo session không tự động nhận chủ sở hữu. Tiến độ thật mà giao diện cũ lưu trong `sca-progress` được giữ nguyên ở chế độ khách. Người dùng vào `/account`, chọn **Nhập vào tài khoản của tôi** nếu đó là dữ liệu của mình. Nhập thành công mới xóa bản khách đang chờ gắn tài khoản trên thiết bị này.
- Import được kiểm tra cả batch trước khi ghi, hợp nhất theo hướng giữ case đã thuộc và favorite, không nhận owner hoặc timestamp do client gửi. Không tự động chép dữ liệu máy dùng chung vào một tài khoản mới.
- Tiến độ tài khoản không dùng localStorage làm nguồn chính; chỉ lịch sử xem case được lưu cục bộ theo namespace UUID. Lịch sử xem chưa đồng bộ đa thiết bị.
- Cập nhật trạng thái là cập nhật từng trường: thêm favorite ở một phiên không xóa learned được lưu ở phiên khác. UI chỉ báo thành công khi server xác nhận. Nếu mất mạng, không giả vờ đã lưu.

## Bảo vệ

Spring Security quản lý session, đổi session ID khi đăng nhập, CSRF cho mọi thao tác ghi (kể cả login/logout). Session cookie HttpOnly và SameSite=Lax. API cá nhân trả `Cache-Control: no-store`; mật khẩu/hash không được đưa vào DTO, trang admin hay localStorage. API admin bắt buộc vai trò server-side, không chỉ ẩn nút ở giao diện.

`X-Academy-Account` từ giao diện chỉ phát hiện tab cũ sau khi browser đổi tài khoản; header không cấp quyền và không thay thế principal. Khi UUID không khớp tài khoản của session, yêu cầu bị chặn 409 trước khi đọc/ghi dữ liệu.

Giới hạn 30 request login/register mỗi IP trong 15 phút, bộ nhớ giới hạn 10.000 IP. Đây là giới hạn trong một tiến trình; triển khai nhiều instance cần giới hạn ở gateway hoặc kho dùng chung. Không tin IP từ các forwarded header tùy ý.

Để chạy HTTPS production, đặt `SESSION_COOKIE_SECURE=true` và dùng MySQL cùng migration schema được quản lý. Giá trị false mặc định phục vụ localhost HTTP. Chưa triển khai xác minh email, quên/đặt lại mật khẩu qua email, MFA. Google/Facebook OAuth đã tích hợp và chỉ bật khi có app credentials; xem SOCIAL-LOGIN.md.

## API chính

| API | Quyền |
| --- | --- |
| GET `/api/auth/csrf`, GET `/api/auth/me` | Công khai |
| POST `/api/auth/register`, POST `/api/auth/login` | Công khai, yêu cầu CSRF |
| POST `/api/auth/logout` | Yêu cầu CSRF |
| PUT `/api/account/profile` | Đã đăng nhập |
| GET/PUT `/api/progress`, `/api/progress/{caseId}` | Chủ tài khoản hiện tại |
| POST `/api/progress/import` | Chủ tài khoản hiện tại, tối đa 1.000 mục |
| GET `/api/roadmap`, PUT `/api/roadmap/stages/{id}` | Chủ tài khoản hiện tại |
| GET `/api/admin/users`, `/api/admin/users/{id}` | ADMIN |

Nguồn triển khai: [Spring Security authentication persistence](https://docs.spring.io/spring-security/reference/servlet/authentication/persistence.html), [CSRF](https://docs.spring.io/spring-security/reference/servlet/exploits/csrf.html). Phiên bản dependency do Spring Boot 3.4.5 quản lý.

## Kiểm thử

36 JUnit/Spring tests, gồm 9 OAuth và 13 kiểm thử tài khoản/bảo mật: BCrypt và chống gán vai trò; validation/CSRF; session fixation; logout; sai mật khẩu; cách ly tài khoản và nhiều phiên; import nguyên khối; lộ trình riêng; tập con luyện tập; quyền admin; cập nhật từng trường; phát hiện tab cũ; rate limiting và bootstrap admin an toàn. Các bộ dữ liệu Rubik hiện tại vẫn được kiểm tra.

Kiểm tra UI bằng tài khoản QA và DB riêng ở cổng 8081: đăng ký và tự đăng nhập, hoàn thành bài thực hành, luyện 5 PLL của chặng beginner, đánh dấu đã thuộc, đổi sang 5×5 nâng cao, lưu hồ sơ, đăng xuất/đăng nhập và xem quản trị. Screenshot trong `reports/auth-*.png`. Không chứa mật khẩu QA trong mã production hoặc tài liệu.
