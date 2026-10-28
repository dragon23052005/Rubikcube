# Cấu trúc Java

Code dùng cách chia package theo chức năng, bên dưới `vn.speedcube.academy`:

| Package | Trách nhiệm |
| --- | --- |
| `account` | Tài khoản, hồ sơ, đăng ký/đăng nhập bằng email |
| `admin` | Bootstrap quản trị viên và API quản trị |
| `catalog` | Nhập dữ liệu, truy vấn thư viện và API thuật toán |
| `catalog.model` | Entity loại Rubik, phương pháp, case, ảnh, biến thể và nguồn |
| `catalog.dto` | Dữ liệu trả về của thư viện |
| `catalog.repository` | Truy cập dữ liệu thư viện |
| `progress` | Đã thuộc, cần luyện và yêu thích theo tài khoản |
| `roadmap` | Lộ trình và trạng thái hoàn thành chặng |
| `study` | Buổi học ngắn, lịch ôn, lượt trả lời và thống kê |
| `timer` | Scramble TNoodle, lượt bấm giờ và lịch sử theo tài khoản |
| `security` | Phân quyền, kiểm tra tài khoản và bảo vệ request |
| `security.oauth` | Google/Facebook và liên kết danh tính |
| `config` | Các bean cấu hình dùng chung, gồm đồng hồ cho lịch ôn |
| `shared` | Xử lý lỗi API dùng chung |
| `web` | Điều hướng trang MVC |

`AcademyApplication` nằm tại package gốc để Spring quét được các package con. Test được đặt dưới cùng cây package với phần code tương ứng.

## Quy ước bổ sung code

- Chức năng mới đặt vào package chức năng của nó. Giữ controller, service và repository gần nhau khi chức năng nhỏ; tách các package con khi số lớp tăng như `catalog`.
- Controller nhận/kiểm tra request rồi gọi service; nghiệp vụ và transaction nằm ở service; truy vấn nằm ở repository.
- Dùng import rõ ràng khi gọi lớp thuộc chức năng khác. Tránh thêm lớp vào package gốc hoặc đưa nghiệp vụ vào `shared`.
- Tên entity và bảng dữ liệu được giữ khi chuyển package. Việc chia package không yêu cầu xóa hoặc tạo lại dữ liệu MySQL.

## Kiểm chứng

Sau khi di chuyển package và bổ sung ôn tập: Maven package đạt 48 test, không có lỗi. Ứng dụng khởi động với MySQL thật; API đăng nhập, tiến độ, lộ trình và ôn tập đã được kiểm tra.
