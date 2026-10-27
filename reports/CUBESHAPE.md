# Cube Shape bổ sung từ ảnh người dùng

Bộ `CS` có 5 case riêng, không cộng vào kiểm kê CubeZone gốc 501 mục. Tổng thư viện sau bổ sung: **506 mục, 505 có công thức**.

| ID | Hình tầng trên / tầng dưới | Công thức từ ảnh |
|---|---|---|
| cs-1 | 7–1 / Star | `/ (2,-2) / (-3,-4) / (4,-3) / (-5,-4) / (6,-3) /` |
| cs-2 | 8 / Star | `/ (-2,-4) / (-1,-2) / (-3,-3) /` |
| cs-3 | 6–2 / Star | `/ (-4,-2) / (-1,4) / (-3,0) /` |
| cs-4 | 4–4 / Star | `/ (2,2) / (0,-1) / (3,3) /` |
| cs-5 | 5–3 / Star | `/ (-4,0) / (5,4) / (2,-3) / (-5,-4) / (6,-3) /` |

Ảnh 3 và 4 trong yêu cầu đầu trùng nhau nên chỉ nhập một case. Các ảnh tham chiếu gốc được giữ trong `static/references/`, có liên kết trên trang chi tiết. Ảnh có thể chứa khung hình video của bên thứ ba; không tuyên bố cấp phép lại video.

## Hình SVG mới

Sáu tệp SVG gốc: 5 hình tầng trên và 1 hình Star dùng chung, không cắt lấy biểu đồ mờ từ screenshot. Các mảnh cạnh chiếm 30°, góc chiếm 60°. Hình giữ đúng hướng như ảnh tham chiếu; màu Indigo chỉ dùng phân biệt loại mảnh, không đại diện màu sticker.

Pattern từ vị trí 12 giờ theo chiều kim đồng hồ (`C` = góc, `E` = cạnh):

- 7–1: `CECEEEEEEE`
- 8: `CEEEEEEEEC`
- 6–2: `EEECEECEEE`
- 4–4: `EECEEEECEE`
- 5–3: `ECEEECEEEE`
- Star: `CCCCCC`

## Kiểm tra hình dạng

`tools/check_user_cubeshape.py` dùng 12 đơn vị góc mỗi tầng, mảnh góc chiếm 2 đơn vị. Mỗi lát cắt cần có ranh giới mảnh ở cả hai đầu; không cho phép cắt qua mảnh góc. Với tầng dưới nhìn từ dưới, phép lát cắt đổi nửa tầng và đảo thứ tự như phản chiếu hình học. Năm chuỗi đều hợp lệ và kết thúc với mỗi tầng gồm 4 góc/4 cạnh xen kẽ, tức hai tầng vuông.

`python tools/test_cubeshape.py`: 4 kiểm thử gồm cả 5 chuỗi, bảo toàn mảnh, phép xoay/nghịch đảo và từ chối lát cắt qua góc.

Trạng thái `USER_REFERENCE_SHAPE_CHECKED` chỉ xác nhận **hình dạng**, không xác nhận định hướng màu hoặc hoán vị. Không giả danh dữ liệu CubeZone hay kiểm chứng đầy đủ bằng solver.

## Nâng cấp dữ liệu hiện có

`user-cases.json` tách riêng bộ gốc. Khi khởi động, ứng dụng chỉ chèn ID bổ sung chưa có, không xóa dữ liệu cũ hay tiến độ. Thư viện, bộ lọc, chi tiết, luyện tập và tiến độ đều nhận phương pháp CS từ catalog DB.
