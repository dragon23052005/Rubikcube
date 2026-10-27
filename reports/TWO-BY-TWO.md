# Rubik 2×2 — Ortega từ J Perm

Nguồn:

- OLL: https://www.jperm.net/algs/2x2oll
- PBL: https://www.jperm.net/algs/2x2pbl

## Dữ liệu

| Bộ | Case | Biến thể bổ sung | Ảnh nguồn |
|---|---:|---:|---:|
| 2×2 OLL | 7 | 2 | 7 |
| 2×2 PBL | 5 | 1 | 10 |
| Tổng bổ sung | 12 | 3 | 17 |

OLL: L, U, T, Pi, H, Antisune, Sune.

PBL: Adj U, Diag U, Adj/Adj, Adj/Diag, Diag/Diag.

Dữ liệu lưu ở `static/jperm-2x2.json`; ID có tiền tố `2x2-oll-` / `2x2-pbl-`. Phương pháp dùng tên `2×2 OLL` và `2×2 PBL` để không nhập nhằng với OLL 57 case của 3×3. Tổng catalog hiện tại: **518 mục, 517 có công thức, 45 biến thể bổ sung, 3 loại Rubik**.

## Hình và hướng quan sát

Ảnh PNG được lấy trực tiếp từ hàng case hiển thị trên J Perm. Công thức hiển thị của hàng được đối chiếu với công thức mặc định trong tệp JS nguồn. Các snapshot nằm trong `sources/jperm-2x2oll-images.json` và `sources/jperm-2x2pbl-images.json`.

PBL hiển thị hai hình. J Perm áp dụng `scaleX(-1)` cho hình thứ hai; ứng dụng giữ nguyên phép biến đổi này qua dữ liệu, database và API. Không bỏ mất phép lật gương hoặc gán nhầm góc nhìn trên/dưới. Hai hình giữ đúng thứ tự nguồn. Biến thể có thể dùng hướng cầm khác hình của công thức mặc định; trang chi tiết ghi chú và liên kết về nguồn.

Ảnh và nội dung thuộc J Perm, không tuyên bố quyền sở hữu/giấy phép tái phân phối.

## Tích hợp

- Thêm Rubik 2×2 trên sidebar, Dashboard và danh mục.
- `/api/puzzles` trả các loại Rubik từ DB; giao diện dùng danh sách này cho card và bộ lọc.
- OLL/PBL có tìm kiếm, chi tiết, biến thể, copy, yêu thích, đã thuộc, Previous/Next và Practice.
- Bootstrap chỉ thêm ID còn thiếu, không xóa/ghi đè các bộ cũ hoặc tiến độ.

## Kiểm thử

- 12 kiểm thử Java đạt; kiểm tra bộ mới, giữ riêng OLL 3×3, API, seed lặp không trùng và phép biến đổi hình đọc/lưu đúng.
- 4 kiểm thử Python mới: số lượng/ID, PNG 150×150 và phép lật gương, công thức mặc định khớp hàng nguồn, bất biến pha Ortega trên mô hình 24 sticker góc.
- Kiểm tra pha từ trạng thái đã giải cho thấy các chuỗi OLL giữ mặt D đồng màu; PBL giữ cả U/D đồng màu. Đây không phải xác minh toàn bộ ảnh/case bằng solver độc lập.
