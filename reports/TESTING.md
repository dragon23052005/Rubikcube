# Kết quả kiểm tra — 27/10/2026

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
