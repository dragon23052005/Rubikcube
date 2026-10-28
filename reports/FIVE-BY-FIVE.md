# Rubik 5×5 — nguồn và kiểm tra

Nguồn truy cập ngày 28/10/2026:

- J Perm: https://jperm.net/5x5 và https://jperm.net/5x5/faster — Reduction, ghép tâm, ghép cạnh, flipping, edge parity, Free Slice, Yau5 và tối ưu big cubes.
- CubeSkills L2E: https://www.cubeskills.com/uploads/pdf/tutorials/last-2-edges-algorithms-5x5.pdf — đủ 12 trường hợp: 4 không parity, 8 parity. Ba trường hợp không parity có biến thể góc nhìn.
- CubeSkills L2C: https://www.cubeskills.com/uploads/pdf/tutorials/last-2-centers-algorithms-5x5.pdf — 19 trường hợp cần công thức; hình Solved không đưa vào luyện tập. Điều kiện: khối tâm 2×3 đã giải ở mặt trước.

31 mục nhận diện, 31 hình PNG, 3 biến thể. Hai thao tác cơ bản J Perm hiển thị và sao chép tại `/5x5#basic`, không đếm thêm thành case có hình. Thư viện tổng: 606 mục, 605 công thức chính có nội dung, 61 biến thể, 5 loại Rubik.

Ảnh nguồn là VisualCube của Conrad Rider, được ghi công trong PDF CubeSkills. Importer cắt ảnh theo vùng ảnh PDF và đọc công thức ngay phía dưới trong cùng cột; hai trang đều được kiểm tra bằng bản render. Không nhập logo, hình mô tả cách trình bày, hay hình Solved vào catalog.

`sources/5x5-import-manifest.json` lưu trang, vị trí, vùng ảnh, văn bản gốc, chuỗi đã chuẩn hóa khoảng trắng và SHA256 ảnh. Giữ dấu prime/nửa vòng từ nguồn. `[z' y']` là đổi hướng cầm cần thực hiện trước biến thể, không phải thao tác tùy chọn. M ở 5×5 chỉ lớp chính giữa, khác M trong bộ 4×4.

Frontend: dashboard và sidebar có 5×5; chọn phương pháp, lọc, phân trang, ảnh, detail, Copy, đánh dấu, practice và progress dùng ID `5x5-*` độc lập. Trang `/5x5` có 9 phần học, liên kết video chính xác theo trang J Perm, hai công thức cơ bản có nút Copy, bảng ký hiệu và nguồn. Giải thích không có PLL parity 4×4 sau reduction 5×5 đúng.

Kiểm thử:

- 14 JUnit/Spring tests đạt: seed không trùng khi gọi lại, nguồn/ảnh, số lượng bộ mới/cũ, API/pagination và route `/5x5`.
- 5 Python tests đạt: nguồn/manifest/ảnh; ký hiệu/inverse; bảo toàn 150 sticker; L2C giữ khối tâm 2×3 ở F và tâm ngoài U/F; L2E giữ tâm đồng màu sau phép xoay toàn khối; inverse L2E chỉ để lại tối đa hai tredge chưa ghép.
- Mô hình kiểm tra các bất biến của giai đoạn, không xác nhận toàn bộ màu pixel ảnh và không phải solver 5×5 hoàn chỉnh.
- JavaScript syntax và HTTP smoke: đạt. UI desktop: guide, toast Copy, L2C phân trang 12+7, ảnh L2E, ký hiệu, đáp án Practice đúng bộ 5×5; không thấy ảnh hỏng/tràn ngang.

Nhập lại bằng Python có `pdfplumber` và renderer: `python tools/import_cubeskills_5x5.py`. Kiểm tra mô hình: `python tools/test_5x5.py` (chỉ thư viện chuẩn Python, dùng phép quay vector trong `pll_cube.py`). Runtime website không cần các công cụ này.

Không đổi ID hoặc ghi đè tiến độ các bộ cũ. Server kiểm tra dùng H2 memory ở 8081 và được dừng sau khi kiểm tra; không thay cổng 8080 của người dùng.
