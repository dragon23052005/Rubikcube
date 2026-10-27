# PLL kết hợp CubeZone và J Perm

Nguồn bổ sung: https://www.jperm.net/algs/pll và tệp dữ liệu công khai `/lib/pll.js`.

## Kết quả

- Giữ nguyên **21 ID case**, công thức chính, ảnh CubeZone và tiến độ đã lưu.
- Ghép được **21/21 case** với tên chuẩn J Perm, không tạo thêm case PLL trùng.
- **4 case trùng chuỗi:** Jb, T, Y, Nb. Bỏ ngoặc nhóm thao tác, chuẩn hóa khoảng trắng và gộp các lượt xoay liên tiếp trên cùng mặt để so sánh. Dùng thêm ảnh J Perm cho công thức hiện tại; không chèn công thức trùng.
- **17 case khác chuỗi:** thêm thuật toán mặc định của J Perm thành “Cách 2”, đặt cạnh ảnh J Perm đúng hướng của cách đó. Giữ Cách 1 và hình gốc.
- Tổng catalog vẫn là **506 mục**; số biến thể tăng từ 25 lên **42** (17 bổ sung).

## Ghép theo trạng thái, không đoán theo thứ tự

`tools/pll_cube.py` là mô hình 54 sticker, dùng tọa độ nguyên; hỗ trợ mặt ngoài, wide moves, M/E/S và x/y/z. Trạng thái được chuẩn hóa theo tâm, AUF trước/sau và quay toàn khối quanh trục U. Chữ ký của 21 case J Perm đều khác nhau và ghép một-một với 21 công thức CubeZone. Báo cáo ánh xạ: `jperm-pll-matches.json`.

Kiểm tra mô hình gồm phép nghịch đảo, 4 lượt xoay về ban đầu, bảo toàn màu, phân rã wide/whole-cube moves, giữ F2L và định hướng U của các PLL, tính duy nhất của 21 cặp.

## Ảnh nguồn

21 ảnh PNG 150×150 được lấy trực tiếp từ hàng case hiển thị trên trang J Perm, không dựng ảnh ngẫu nhiên. Tên hàng, công thức hiển thị và trạng thái CSS được lưu tại `sources/jperm-pll-images.json`. Importer kiểm tra chuỗi công thức hiển thị trùng với công thức mặc định đã đọc; ảnh không có phép biến đổi CSS bị bỏ sót.

Các ảnh nằm tại `static/images/jperm/`. Ảnh của 17 cách khác chỉ được trình bày cùng công thức J Perm, có nhắc hướng cầm khác Cách 1; không tráo ảnh này làm hình nhận diện cho công thức CubeZone khi khác hướng.

Nội dung và ảnh J Perm được ghi nguồn, không tuyên bố quyền sở hữu hoặc giấy phép tái phân phối. Thư viện gốc CubeZone, bộ CS từ ảnh tham chiếu và nguồn J Perm được tách riêng trong dữ liệu.

## Tính ổn định

Bootstrap chèn/cập nhật tham chiếu theo ID hiện có. Khởi động lại không thêm biến thể trùng, không xóa dữ liệu/tiến độ. `data.json` gốc không bị viết đè. `pll-references.json` là lớp bổ sung độc lập.

Chạy kiểm tra:

```bash
python tools/test_pll_matching.py
./mvnw test
```
