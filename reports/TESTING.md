# Kết quả kiểm tra — 27/10/2026

## Cập nhật 2×2 — Ortega

12 kiểm thử Java đạt, gồm kiểm tra 7 OLL/5 PBL tách khỏi OLL 3×3, giữ phép lật gương PBL sau khi lưu/đọc DB và xử lý thứ tự thuộc tính JSON. 4 kiểm thử Python mới đạt cho dữ liệu nguồn, ảnh PNG, số lượng/ID và bất biến pha trên mô hình 24 sticker góc. Catalog hiện có 518 mục, 517 có công thức chính, 45 biến thể.

Đã kiểm tra trực tiếp trên trình duyệt: danh mục 2×2 có hai phương pháp; lọc PBL hiện 5 case, chuyển OLL hiện 7 case; ảnh thứ hai PBL có đúng `scaleX(-1)`; Practice chọn đúng Rubik 2×2 và hiện công thức khi mở đáp án. HTTP smoke check đạt trên bản chạy mới. Ảnh bàn giao: `2x2-pbl.png`.

## Cập nhật PLL — J Perm

Bản cập nhật đạt 10 kiểm thử Java và 4 kiểm thử Python cho mô hình 3×3/ghép PLL. Cả 21 case ghép một-một; 4 chuỗi trùng, 17 chuỗi khác được thêm làm Cách 2. Không ghi đè công thức chính hoặc ID tiến độ. 21 ảnh lấy từ hàng case đang hiển thị ở J Perm, công thức của hàng được đối chiếu với dữ liệu nguồn.

Đã kiểm tra bản đang phục vụ tại localhost: 21 PLL, 21 tham chiếu, 17 biến thể mới. Trình duyệt xác nhận Aa hiển thị Cách 1 và Cách 2 với ảnh/hướng cầm riêng, nút copy báo thành công; T dùng ảnh J Perm và không tạo biến thể trùng. Thư viện hiện đúng tên case và liên kết Cách 2. Ảnh kiểm tra: `pll-jperm-way2.png`.

## Cập nhật Cube Shape từ ảnh tham chiếu

Bản mới vượt qua **9 kiểm thử Java** (thêm kiểm tra seed CS không bị nhân đôi và API đủ 5 case) và **4 kiểm thử Python về mô hình hình dạng**. Tổng catalog hiện là 506; kiểm kê CubeZone gốc bên dưới vẫn là 501. Năm công thức bổ sung đều dùng lát cắt hợp lệ và đưa hai tầng về dạng vuông trong mô hình hình dạng. Xem `CUBESHAPE.md`; đây không phải xác minh màu/hoán vị.

- Java: Oracle JDK 21.0.10.
- Maven Wrapper 3.9.9: `clean package` **BUILD SUCCESS**.
- JUnit / Spring Boot: **8 kiểm thử, 0 lỗi, 0 thất bại**. Xem `target/surefire-reports/vn.speedcube.academy.AcademyTests.txt` sau khi build.
- `npm run check`: JavaScript hợp lệ.
- `npm run build:css`: Tailwind CSS biên dịch thành công.
- Bản JAR chạy tại `http://localhost:8080`; HTTP smoke check vượt qua 10 trang chính, catalog/phân trang API và 2 đường dẫn lỗi 404 với nội dung HTML đúng.
- `python tools/audit_data.py`: 501 mục, 500 có công thức chính, 25 biến thể, 615 lượt tham chiếu hình, 447 ảnh case riêng; không có lỗi đối chiếu chuỗi nguồn hoặc ảnh bị thiếu.
- 29 ảnh Cube Shape và 3 bộ bài tập Cross: 102 / 3.672 / 40, được kiểm tra riêng.

## Phạm vi kiểm thử Java

1. Đếm đúng từng phương pháp và tổng 501 vị trí nguồn.
2. Kiểm tra ID, URL nguồn, hình PNG/GIF, ký hiệu Square-1, trạng thái nguồn trống.
3. API tìm kiếm, phân trang, chi tiết, lỗi và catalog.
4. Tiến độ API được cách ly theo session; không chấp nhận đồng thời “đã thuộc” và “cần luyện”.
5. Các trang ứng dụng trả đúng view.
6. 29 hình Cube Shape tồn tại.
7. Toàn bộ 3.814 bài nghiên cứu có scramble và lời giải nguồn.
8. View lỗi HTML 404 và 500 hoạt động.

## Kiểm tra trình duyệt

Đã trực tiếp kiểm tra Dashboard sáng/tối; thư viện OLL; sao chép và đọc lại clipboard; lưu/bỏ lưu; đánh dấu/bỏ đánh dấu đã học; tìm kiếm không có kết quả; trang chi tiết; chuyển sang luyện tập; Space hiện đáp án; phím 1 ghi nhận và chuyển lượt; tiến độ được lưu sau khi chuyển trang; hình Cube Shape mở đủ 29; hiện đáp án Cross và chuyển bộ color neutral.

Responsive được kiểm tra bằng khung trình duyệt con rộng **390px**, gồm lưới 2 cột và mở/đóng drawer bộ lọc. Đây không phải kiểm thử trên thiết bị iOS/Android thật. Đã sửa sidebar ẩn để không còn nằm trong thứ tự Tab, thêm vòng focus và Escape cho drawer, tăng vùng chạm.

Các dấu “đã học” và “yêu thích” được tạo trong lúc thử đã được hoàn nguyên. Ảnh Dashboard lưu tại `reports/dashboard.png`.

## Giới hạn

- Chưa kiểm chứng công thức/trạng thái bằng solver độc lập. `SOURCE_MATCHED` chỉ xác nhận đối chiếu nguồn.
- Một ô nguồn trống: `zb-f2l-6`; được giữ trong kiểm kê và loại khỏi luyện tập.
- Kiểm thử database thực hiện trên H2 chế độ PostgreSQL. Docker Engine trên máy trả lỗi API 500, nên **chưa chạy kiểm thử với PostgreSQL thật và chưa xác nhận Docker image runtime**.
- Chưa có kiểm thử tự động trình duyệt toàn bộ tổ hợp bộ lọc, nhập/xuất tiến độ hoặc từng case. Các chức năng này được triển khai; không tuyên bố đã kiểm thử hết mọi nút trên mọi thiết bị.
- Chưa thực hiện load test, kiểm tra WCAG chuyên dụng hoặc audit hiệu năng bằng Lighthouse.

## 4×4 — 28/10/2026

- Maven package: PASS, 13 tests, 0 failures.
- `python tools/test_4x4.py`: PASS, 2 tests (nguồn/bộ case, ký hiệu, ảnh PNG).
- JavaScript syntax và git diff check: PASS.
- UI trên H2 memory/8081: lộ trình 10 bước, 4 bộ, OLL 27 mục phân trang 12, 0 ảnh hỏng, không tràn ngang desktop; chi tiết L2E và biến thể đúng; nút Copy hiện toast thành công; Practice Basic hiện đúng đáp án. Không xác nhận nội dung clipboard bằng công cụ do API clipboard trả chuỗi rỗng trong browser này.
- Không chạy solver 4×4 độc lập hoặc PostgreSQL thật.
- Dừng server thử sau kiểm tra để tránh xung đột với ứng dụng người dùng.

## 5×5 — 28/10/2026

- Maven package: PASS, 14 tests, 0 failures.
- `python tools/test_5x5.py`: PASS, 5 tests, gồm mô hình 150 sticker và bất biến L2C/L2E.
- JavaScript syntax, HTTP smoke trên 8081 và git diff check: PASS.
- UI: 31 case, L2C phân trang 12+7, hình/công thức/biến thể, guide có Copy edge parity và toast, Practice hiện đáp án đúng bộ 5×5. Không có ảnh hỏng hoặc tràn ngang desktop trong các trang đã xem.
- Chưa kiểm tra đầy đủ tương đương màu pixel hình với trạng thái mô hình hoặc solver 5×5 hoàn chỉnh. Xem FIVE-BY-FIVE.md.

## Authentication, authorization & lộ trình — 28/10/2026

- Maven package: PASS, 27 tests (14 catalog + 13 tài khoản/bảo mật), 0 failures.
- BCrypt, CSRF login/logout/API ghi, thay session ID khi login, tách người dùng, cập nhật từng trường, import nguyên khối, chặng thực hành, giới hạn thử login, admin-only và chặn tab tài khoản cũ được kiểm tra.
- UI QA trên DB riêng/8081: đăng ký tự đăng nhập; lưu chặng; luyện đúng 5 PLL beginner; ghi nhận đã thuộc; chuyển hồ sơ sang 5×5 nâng cao, mục tiêu 25 phút; logout/login; admin xem danh sách và chặng người học; người chơi nhận trang 403.
- Đã restart server với cùng DB QA và đăng nhập lại: hồ sơ 5×5/Advanced/25 phút, case đã thuộc và tài khoản còn nguyên.
- UI nhập guest favorite vào tài khoản: PASS, xuất hiện đúng trong Favorites và không mất case đã thuộc cũ.
- Cú pháp JS và git diff check: PASS. Kiểm tra thực tế dùng H2 file; chưa kiểm tra PostgreSQL thật, email verification/recovery không triển khai.

## Google / Facebook — 28/10/2026

- Maven package: PASS, 36 tests, 0 failures (14 catalog, 13 auth, 9 OAuth).
- OAuth được kiểm tra bằng HTTP provider cục bộ: authorization code, token, user-info, Google RS256/JWKS và nonce/state; Facebook code flow; giữ tiến độ, không tự gộp email, liên kết chủ động và chặn identity đã có chủ.
- JavaScript syntax: PASS.
- Chưa thử Google/Meta trực tiếp vì chưa có app credentials. Lượt kiểm tra UI bị người dùng dừng; không ghi nhận xác nhận UI hoặc screenshot mới. Đã dừng server QA 8081 sau khi dọn dẹp.

## MySQL — 28/10/2026

- Maven package: PASS, 36 tests, 0 failures trên H2.
- MySQL thật 8.0.36, localhost:3306/demotesting: kết nối thành công; DB từ 0 lên 10 bảng, seed 606 case.
- HTTP trên ứng dụng dùng MySQL: register/login, profile, learned/favorite, roadmap completion, return login PASS. JDBC kết nối riêng xác nhận dữ liệu đã commit.
- Dọn duy nhất tài khoản QA và các bản ghi của UUID đó; giữ dữ liệu Rubik. File cấu hình mật khẩu được Git bỏ qua.
- Không migrate tự động H2 cũ; xem MYSQL.md.
