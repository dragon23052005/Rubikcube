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
