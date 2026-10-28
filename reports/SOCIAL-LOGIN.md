# Đăng nhập Google và Facebook

Đã tích hợp OAuth2/OIDC bằng Spring Security. Tính năng chỉ bật cho dịch vụ có đủ cấu hình; khi thiếu khóa, website vẫn chạy và đăng nhập email bình thường. Không có khóa hoặc tài khoản Google/Meta thật trong mã nguồn.

## Bật Google

1. Trong [Google Cloud Console](https://console.cloud.google.com/apis/credentials), cấu hình màn hình đồng ý và tạo OAuth client loại **Web application** cho dự án của bạn.
2. Thêm redirect URI chính xác:
   - Local: `http://localhost:8080/login/oauth2/code/google`
   - Server: `https://tenmien-cua-ban/login/oauth2/code/google`
3. Đặt biến môi trường cho tiến trình Java/Run Configuration của IntelliJ:

| Biến | Nội dung |
| --- | --- |
| `APP_BASE_URL` | Origin website, ví dụ `http://localhost:8080` hoặc `https://tenmien-cua-ban` |
| `GOOGLE_CLIENT_ID` | Client ID của Web application |
| `GOOGLE_CLIENT_SECRET` | Client secret; chỉ ở server |

4. Khởi động lại ứng dụng. Nút **Tiếp tục với Google** được bật trên `/login` và `/register`. Thực hiện các yêu cầu về test user, consent/publishing trong Google Console phù hợp với ứng dụng.

Google dùng các scope `openid profile email`; token ID được framework xác thực chữ ký, issuer, audience và nonce. Subject `sub` là định danh liên kết, không phải email. Chỉ tạo tài khoản mới khi Google xác nhận email.

## Bật Facebook

1. Tạo/cấu hình ứng dụng website với Facebook Login trong [Meta for Developers](https://developers.facebook.com/apps/).
2. Khai báo website và redirect URI chính xác:
   - Local: `http://localhost:8080/login/oauth2/code/facebook`
   - Server: `https://tenmien-cua-ban/login/oauth2/code/facebook`
3. Đặt:

| Biến | Nội dung |
| --- | --- |
| `APP_BASE_URL` | Cùng origin đã đăng ký với Meta |
| `FACEBOOK_CLIENT_ID` | App ID |
| `FACEBOOK_CLIENT_SECRET` | App secret; chỉ ở server |
| `FACEBOOK_GRAPH_VERSION` | Phiên bản Graph API được ứng dụng của bạn hỗ trợ, lấy từ Meta dashboard, đúng dạng `vNN.0` |

4. Cấu hình các quyền `public_profile`, `email` và đáp ứng những yêu cầu về chế độ ứng dụng, người thử nghiệm, privacy policy/data deletion mà Meta dashboard yêu cầu. Khởi động lại Java sau khi đặt biến.

Không tự đoán phiên bản Graph API: Facebook chỉ được bật khi có đủ App ID, App Secret và phiên bản hợp lệ. Nếu Meta không chấp nhận localhost HTTP trong cấu hình ứng dụng của bạn, dùng origin HTTPS dành cho phát triển và đăng ký cùng origin đó trong `APP_BASE_URL`.

Các endpoint Facebook được ghim vào phiên bản đã cấu hình: dialog OAuth, token và `/me?fields=id,name,email`. Chỉ dùng dữ liệu định danh, tên và email; không đọc bài viết, bạn bè hay ảnh riêng.

Không gửi Client Secret/App Secret qua chat hoặc commit vào Git. Đặt trong Environment variables của IntelliJ hoặc môi trường server. Tệp `.env` không được Spring Boot tự đọc trong cấu hình hiện tại; cần truyền biến vào tiến trình Java. Không tạo tệp chứa secret trong `src/main/resources` vì sẽ được đóng gói vào JAR.

Với HTTPS, đặt `SESSION_COOKIE_SECURE=true`. `APP_BASE_URL` là origin cố định, không lấy redirect URI từ Host/Forwarded header của request. HTTP chỉ cho phép localhost/127.0.0.1.

## Tài khoản đã có và tiến độ

- Đăng nhập xã hội mới tạo tài khoản `USER`. Vai trò không lấy từ claim Google/Facebook.
- Khi đã liên kết, mọi lần đăng nhập bằng provider/sub đó quay về cùng UUID người chơi. Email thay đổi ở provider không tự đổi chủ tiến độ.
- Email trùng tài khoản có sẵn **không tự gộp**, kể cả email Google đã verified. Đăng nhập tài khoản cũ bằng phương thức đang dùng, vào `/account`, chọn **Liên kết Google/Facebook**. Tiến độ, vai trò và lộ trình vẫn thuộc UUID cũ.
- Liên kết yêu cầu CSRF và phiên vừa đăng nhập trong 10 phút. Nonce liên kết chỉ được phát sau thao tác POST của chủ tài khoản; flow gắn với OAuth state, provider và session, hết hạn sau 10 phút.
- Không thể chuyển một Google/Facebook đã liên kết sang tài khoản khác hoặc ghi đè provider hiện có. Liên kết thất bại khôi phục phiên chủ tài khoản, không gộp hay xóa tiến độ.
- Facebook có thể không trả email. Khi chưa có liên kết, website hướng dẫn dùng email tạo tài khoản rồi chủ động liên kết Facebook; sau đó đăng nhập Facebook được mà không cần provider trả lại email.
- Không có nút hủy liên kết chưa triển khai, để tránh vô tình khóa tài khoản chỉ có một phương thức đăng nhập.

DB có bảng `social_identities`, unique theo `(provider, subject)` và `(account_id, provider)`. Tài khoản xã hội mới có secret ngẫu nhiên băm thay cho mật khẩu người dùng, không tiết lộ hoặc nhận mật khẩu từ provider. Access/refresh token được bỏ sau khi lấy user info, không lưu DB hoặc localStorage. Session chỉ giữ principal nội bộ và quyền từ DB.

## Kiểm thử và giới hạn xác nhận

36 kiểm thử Java đạt (27 sẵn có + 9 OAuth). Bộ OAuth có HTTP server nhà cung cấp cục bộ và khóa RSA chỉ tồn tại trong test, thực hiện thật luồng authorization code → token → user-info; Google ID token ký RS256 và JWKS, có kiểm tra nonce/state. Cả hai provider được kiểm tra tạo user, giữ tiến độ khi quay lại, không tự liên kết theo email, liên kết chủ động, chặn chiếm identity, thiếu email và giới hạn phiên mới đăng nhập. Không cần Internet hoặc thông tin người dùng thật cho các kiểm thử này.

Chưa kiểm tra đăng nhập Google/Facebook **trực tiếp** vì môi trường hiện chưa có khóa ứng dụng của chủ dự án. Nút phản ánh đúng trạng thái cấu hình, không giả lập thành công khi chưa bật. Cần kiểm tra lại với app credentials thật và callback/domain đã được đăng ký sau khi cấu hình.

Tài liệu chính: [Spring Security OAuth2 Login](https://docs.spring.io/spring-security/reference/servlet/oauth2/login/advanced.html), [Google OpenID Connect](https://developers.google.com/identity/openid-connect/openid-connect), [Meta login flow](https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow/). Nội dung dashboard/quy trình duyệt ứng dụng có thể thay đổi; cấu hình theo console hiện tại của nhà cung cấp.
