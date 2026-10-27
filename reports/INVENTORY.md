# Kiểm kê CubeZone — 27/10/2026

## Phạm vi và cách đếm

Đã khảo sát menu Algorithms, Methods, Tools, Articles và trang in ZB F2L. Bản HTML được lưu trong `sources/`; SHA-256 trong `data-audit.json`. Thuật toán chính, biến thể và hướng dẫn được đếm riêng. Hình nguồn giữ nguyên hướng, không tự thay màu hay suy đoán trạng thái.

“Đối chiếu nguồn” chỉ có nghĩa là chuỗi công thức được tìm thấy trong nguồn và hình được lấy từ ô/bảng tương ứng. **Chưa có xác minh bằng bộ giải độc lập. Không tuyên bố dữ liệu được kiểm chứng toán học hoàn toàn.**

| Rubik | Method | Expected từ nguồn | Imported mục nhận diện | Đối chiếu có công thức | Thiếu công thức |
|---|---|---:|---:|---:|---:|
| 3×3 | OLL | 57 | 57 | 57 | 0 |
| 3×3 | PLL | 21 | 21 | 21 | 0 |
| 3×3 | COLL | 40 | 40 | 40 | 0 |
| 3×3 | ZB F2L | 306 | 306 | 305 | 1 |
| Square-1 | CO | 5 ví dụ minh họa | 5 | 5 | 0 |
| Square-1 | EO | 7 | 7 | 7 | 0 |
| Square-1 | CP | 8 mục minh họa | 8 | 8 | 0 |
| Square-1 | EP | 54 hàng thuật toán | 54 | 54 | 0 |
| Square-1 | Middle / Equator | 3 | 3 | 3 | 0 |
| **Tổng** | | **501** | **501** | **500** | **1** |

3×3: 424 vị trí case, 423 có công thức. Square-1: 77 mục minh họa/case có công thức. Không diễn giải 77 là một bộ chuẩn Square-1 độc lập theo các thư viện khác.

## Ô nguồn trống

- URL: https://cubezone.be/conF2L1.html
- Vị trí: ConF2L_1, hàng hình thứ hai, cột thứ ba (case thứ 6 của nhóm).
- ID nội bộ: `zb-f2l-6`.
- HTML có hình nhưng `<td></td>` ở ô công thức. Trang in cũng cần được xem như bản nguồn tham khảo, không dùng để suy diễn công thức.
- Giữ mục trong thư viện với `SOURCE_EMPTY`; nút sao chép bị vô hiệu hóa; không đưa vào Practice Mode.
- Không thêm chuỗi động tác giả, không tuyên bố nhập đủ 306 công thức có nội dung.

## Phân loại Square-1

- **Cube Shape:** 29 hình dạng một tầng; 90 tổ hợp hai tầng theo phân tích nguồn. Đây là hướng dẫn hình học, không có 90 chuỗi giải trong HTML. 29 hình được nhập riêng tại trang hướng dẫn, không cộng vào case thuật toán.
- **CO:** nguồn gọi là bước trực giác, minh họa 5 tình huống; không gọi đây là bộ CO đầy đủ theo chuẩn khác.
- **CP:** phần tổng quan nói 5 công thức cơ bản; trang bước 4 trình bày 8 mục hình/công thức gồm các tình huống đối xứng. Báo cáo đếm 8 mục nguồn, không quảng cáo 8 công thức cơ bản độc lập.
- **Parity:** không tìm thấy trang parity riêng trong menu. Các nhóm EP có hoán vị lẻ. Không nhân đôi chúng thành một bộ case mới.
- **Middle:** 3 mục: đổi tầng, lật tầng giữa, kết hợp hai thao tác.

## ZB F2L

12 nhóm ConU/SepU × 16 = 192; 3 InsertE × 16 = 48; 3 InsertC × 16 = 48; 3 ConF2L × 6 = 18. Tổng 306 vị trí. Thứ tự nội bộ theo nhóm/tài liệu, không phải hệ đánh số của WCA.

## Nội dung bổ sung đã phát hiện

| Nội dung | Kiểm kê | Cách triển khai |
|---|---:|---|
| Cross một màu | 102 scramble–solution | Trang `/cross`, từng bài có đáp án nguồn |
| Cross hai màu đối diện | 3.672 scramble–solution | Trang `/cross`, tách bộ dữ liệu |
| Cross color neutral | 40 scramble–solution | Trang `/cross`, nhiều lời giải theo mặt |
| XCross study | Bài nghiên cứu phân phối số bước | Liên kết tham khảo; không giả thành bộ case |
| ImageCube | Công cụ tạo ảnh 3×3 | Không coi là bộ thuật toán |
| ImageRevenge | Công cụ tạo ảnh 4×4 | Không suy ra tồn tại bộ công thức 4×4 |
| ZB F2L printable | Bản in của các nhóm trên | Không nhập trùng |

Tổng bài tập nghiên cứu riêng: **3.814**, không cộng vào 501 case nhận diện.

## Biến thể, trùng lặp, hình ảnh

- 25 biến thể bổ sung, lưu riêng với thuật toán chính.
- Công thức trùng giữa case/nhóm được báo trong `data-audit.json`, giữ nguyên vì có thể là đối xứng hoặc cùng chuỗi giải cho trạng thái khác. Không tự xóa case theo chuỗi công thức.
- 615 lượt tham chiếu hình cho case; 29 hình Cube Shape riêng. Ảnh được lưu cục bộ, lazy load và chỉ render 12 thẻ mỗi trang.
- Không có lỗi tải hình trong lần nhập cuối. Kiểm thử kiểm tra magic bytes PNG/GIF và sự tồn tại của mọi tham chiếu.
- Quyền nội dung/ảnh gốc thuộc Lars Vandenbergh. ImageCube cho phép sử dụng công cụ theo trang của tác giả; không suy rộng thành giấy phép tái phân phối toàn bộ ảnh/nội dung. Chưa xuất bản công khai dự án.

## Kết luận dữ liệu

Ứng dụng sử dụng đủ mục nguồn đã kiểm kê, nhưng **còn 1 ô công thức trống tại nguồn và chưa có kiểm chứng bằng solver**. Không báo dữ liệu đạt trạng thái hoàn chỉnh/xác minh tuyệt đối.
