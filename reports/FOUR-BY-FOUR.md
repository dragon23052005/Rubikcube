# Rubik 4×4

Nguồn truy cập 28/10/2026:

- https://jperm.net/4x4 — quy trình Yau cơ bản, flipping, OLL/PLL parity, sửa tâm.
- https://jperm.net/4x4/faster — Yau, 3–2–3, cross, half centers, parity tricks, look ahead.
- https://jperm.net/algs/4x4/oll — nhập toàn bộ 27 case và 11 biến thể.
- https://jperm.net/algs/4x4/pll — nhập toàn bộ 22 case.
- https://www.cubeskills.com/uploads/pdf/tutorials/useful-last-2-edges-algorithms-4x4.pdf — 5 ví dụ, 2 biến thể cho case đầu. Ảnh VisualCube Conrad Rider, trích theo vị trí trong PDF.

Thêm 57 mục, 13 công thức thay thế, 57 ảnh PNG. Tổng thư viện 575 mục, 574 công thức chính có nội dung, 58 biến thể, 4 loại Rubik. Basic lặp lại hai parity có trong bộ nâng cao để cung cấp phạm vi luyện tập riêng; số mục không phải số chuỗi duy nhất.

Đường dẫn `/4x4` có 10 phần học từ Reduction/Yau cơ bản đến nâng cao, ký hiệu, nguồn và liên kết sang OLL/PLL 3×3 thường. Không tuyên bố 27 OLL parity thay thế 57 OLL thường, hoặc 22 PLL parity thay thế 21 PLL thường. PDF L2E ghi rõ các ví dụ là tập con, không phải toàn bộ trạng thái.

Importer đối chiếu từng tên case với hàng DOM nguồn, kiểm tra công thức hiển thị khớp mặc định, tách O+ và O-, thay [*] theo đúng bộ OLL/PLL trước khi lưu. Không sửa dữ liệu cũ hoặc tiến độ. Seed chỉ thêm ID còn thiếu và không nhân đôi khi khởi động lại.

Ảnh Basic dùng hình gốc tại vị trí flipping, OLL parity và ví dụ PLL parity của tutorial. Ảnh PLL Basic là ví dụ trạng thái parity; thao tác chỉ đổi parity, không cam kết giải ngay mọi trạng thái. Ảnh và công thức các bộ được đối chiếu nguồn, chưa xác minh bằng solver 4×4 độc lập.

Kiểm tra: 13 JUnit/Spring tests pass, gồm số lượng bộ, idempotent seed, mở rộng parity, nguồn, tệp ảnh và API/route 4×4; kiểm tra cú pháp JavaScript. Chạy bản UI thử bằng H2 memory tại 8081 để tránh cổng ứng dụng của người dùng.

Tái nhập: `python tools/import_jperm_4x4.py`. Snapshot JS/JSON/HTML và ảnh DOM nằm trong `sources/`. Hình L2E được cắt chính xác theo các ảnh trong PDF gốc, không ghép ảnh từ bộ khác. Quyền nội dung thuộc tác giả nguồn.
