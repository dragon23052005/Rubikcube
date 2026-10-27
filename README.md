# Speedcube Academy

Ứng dụng học Rubik tiếng Việt bằng **Java 21, Spring Boot 3.4, JPA, Thymeleaf, Tailwind CSS và JavaScript ES6**. Không dùng React/Vue/Angular. Giao diện mới theo hướng Modern Minimalist Dashboard: Indigo, Inter, Lucide, sáng/tối và responsive.

## Chạy nhanh

Cần **JDK 21**, đặt `JAVA_HOME` trỏ đúng JDK. Maven Wrapper tự tải Maven 3.9.9 khi chạy lần đầu.

Windows PowerShell:

```powershell
$env:JAVA_HOME='C:\Program Files\Java\jdk-21.0.10'
$env:PATH="$env:JAVA_HOME\bin;$env:PATH"
.\mvnw.cmd spring-boot:run
```

Linux/macOS:

```bash
./mvnw spring-boot:run
```

Mở http://localhost:8080. Chế độ mặc định dùng H2 lưu trên đĩa tại `var/academy` để chạy ngay bằng một lệnh. Tiến độ giao diện lưu bằng localStorage; không cần tài khoản.

## PostgreSQL

1. Tạo `.env` với `DB_PASSWORD` do bạn chọn (không commit).
2. Chạy `docker compose up -d postgres`.
3. Đặt biến môi trường cho ứng dụng, rồi chạy Maven Wrapper:

```powershell
$env:DB_URL='jdbc:postgresql://localhost:5432/academy'
$env:DB_USER='academy'
$env:DB_PASSWORD='mat-khau-ban-da-dat-trong-env'
.\mvnw.cmd spring-boot:run
```

File `.env` được Compose đọc; Spring Boot sử dụng biến môi trường của tiến trình, vì vậy vẫn cần đặt các biến trên. JPA tạo/cập nhật schema khi khởi động. Không dùng H2 cho triển khai nhiều người dùng. Trước khi triển khai production cần thay `ddl-auto=update` bằng migration được kiểm soát.

## Build và kiểm thử

```powershell
.\mvnw.cmd clean package
java -jar target/academy-1.0.0.jar
```

Hoặc trên Linux/macOS:

```bash
./mvnw clean package
```

JAR: `target/academy-1.0.0.jar`. Có 8 kiểm thử JUnit/Spring Boot cho số lượng nguồn, ảnh, ký hiệu Square-1, API/phân trang, cách ly tiến độ theo session, các trang và bộ bài tập nghiên cứu. Kiểm thử mặc định dùng H2 ở chế độ PostgreSQL; đây không phải kiểm thử PostgreSQL thật.

## Chức năng

- Dashboard, danh mục Rubik và trang chọn phương pháp.
- Thư viện tìm tức thì theo tên/số/chuỗi công thức, lọc Rubik/phương pháp/nhóm/trạng thái và sắp xếp độ dài chuỗi ký hiệu.
- Grid 3 cột desktop thông thường, 4 cột màn hình lớn, 2 cột mobile; render 12 case/trang. Drawer bộ lọc trên mobile.
- Chi tiết: ảnh gốc, công thức chính, 25 biến thể bổ sung, copy, đã thuộc, đã lưu, Previous/Next, giải thích ký hiệu riêng từng Rubik.
- Practice: chọn phạm vi, random case, ẩn/hiện đáp án, ghi nhận đã thuộc/cần luyện; không chọn case nguồn trống.
- Phím tắt: `/` tìm kiếm; `Space` hiện đáp án; `1` đã thuộc; `2` cần luyện; `→` bỏ qua. Không chiếm phím khi nhập/chọn dữ liệu.
- Tiến độ theo phương pháp, xuất/nhập JSON để sao lưu hoặc chuyển thiết bị.
- Tìm kiếm toàn thư viện với gợi ý tức thì; ghi nhớ theme/bộ lọc; toast; empty state; skeleton chỉ trong lúc tải; focus rõ; drawer hỗ trợ Escape/Tab; reduced motion.
- 29 hình Cube Shape trên trang hướng dẫn; 3.814 bài tập Cross tại `/cross`.
- Trang lỗi 404/500 đồng bộ thiết kế. Không tạo endpoint cố tình gây lỗi 500 ở production.

## Dữ liệu và giới hạn còn lại

Xem [kiểm kê chi tiết](reports/INVENTORY.md) và [báo cáo kiểm tra tự động](reports/data-audit.json).

| Loại | Đã nhập |
|---|---:|
| OLL | 57 |
| PLL | 21 |
| COLL | 40 |
| ZB F2L | 306 vị trí, **305 có công thức** |
| Square-1 CO / EO / CP / EP / Middle | 5 / 7 / 8 / 54 / 3 |
| Tổng mục nhận diện | **501** |
| Có công thức chính | **500** |
| Biến thể bổ sung | **25** |

**Một ô nguồn trống:** ConF2L_1, vị trí 6 (`zb-f2l-6`). Ứng dụng giữ hình, hiển thị rõ nguồn trống, tắt copy và loại khỏi luyện tập. Không tự bịa công thức. Chưa xác minh các chuỗi bằng solver độc lập, do đó không triển khai mô phỏng xoay. Không tuyên bố đã hoàn chỉnh/xác minh toàn bộ dữ liệu.

Square-1 CO là ví dụ bước trực giác; CP có 8 mục minh họa cho 5 công thức cơ bản được nguồn giới thiệu. CS là hướng dẫn hình dạng, parity nằm trong các nhóm EP; không đếm trùng thành các bộ chuẩn giả định.

Ảnh và nội dung gốc thuộc Lars Vandenbergh/CubeZone. Mỗi case có URL nguồn; `sources/image-manifest.json` ánh xạ ảnh case về URL gốc. Tài nguyên được lưu cục bộ để tránh phụ thuộc hotlink. Dự án chưa được xuất bản; cần xác nhận quyền tái phân phối nội dung/ảnh trước khi phát hành công khai. Font Inter dùng OFL, Lucide dùng ISC.

## Nhập dữ liệu lại

Ứng dụng đã kèm dữ liệu/ảnh, không cần chạy importer để sử dụng. Công cụ dùng Python 3 và BeautifulSoup, tải HTML công khai theo trang đã phát hiện; không vượt cơ chế hạn chế truy cập.

```bash
python -m pip install -r requirements.txt
python tools/fetch_sources.py
python tools/import_cubezone.py
python tools/import_shapes.py
python tools/import_research.py
python tools/audit_data.py
```

`sources/` là snapshot đã lưu, fetcher dùng cache. Muốn cập nhật, lưu snapshot cũ trước và thay các tệp cần tải lại. Importer giữ nguyên số thứ tự nguồn, biến thể tách riêng và báo lỗi ảnh. Ảnh không hợp lệ không được thay bằng hình minh họa giả.

Cơ sở dữ liệu chỉ seed lúc trống để tránh ghi đè dữ liệu đã lưu. Khi thay snapshot, dùng database mới hoặc thực hiện migration/import có kiểm soát; không xóa database có tiến độ cần giữ.

## REST API

| Endpoint | Chức năng |
|---|---|
| `GET /api/puzzles` | Danh mục và số lượng từ dữ liệu DB |
| `GET /api/methods` | Phương pháp và số case |
| `GET /api/catalog` | Snapshot DTO của thư viện DB, tải một lần cho tìm kiếm tức thì |
| `GET /api/algorithms` | `q`, `puzzle`, `method`, `category`, `sort`, `page`, `size` |
| `GET /api/algorithms/search?q=...` | Tìm kiếm |
| `GET /api/algorithms/{id}` | Chi tiết |
| `GET /api/algorithms/statistics` | Tổng, nguồn đã đối chiếu, ô nguồn trống, tình trạng solver |
| `GET /api/progress` | Tiến độ API theo session |
| `PUT /api/progress/{id}` | JSON `{ "learned": true, "favorite": false, "review": false }` |

API phân trang tối đa 100 mục. Frontend chọn mô hình localStorage theo yêu cầu, không ngầm đồng bộ với session API. Không có đăng nhập/đồng bộ tài khoản nhiều thiết bị. Snapshot catalog được đọc từ DB lúc khởi động và giữ trong bộ nhớ; frontend chỉ render ảnh theo trang, không tải hàng trăm hình cùng lúc. Bộ bài tập Cross chỉ tải khi vào trang đó.

## Cấu trúc

- `src/main/java/vn/speedcube/academy`: ứng dụng, controller/service/repository, DTO và 6 entity chính.
- `src/main/resources/templates`: Thymeleaf shell và lỗi.
- `src/main/resources/static`: CSS, JavaScript, JSON seed, ảnh nguồn và tài nguyên font/icon cục bộ.
- `ui`: nguồn Tailwind và tài liệu giao diện phụ trợ.
- `tools`: nhập/kiểm kê dữ liệu.
- `reports`: kiểm kê, audit, kết quả kiểm thử.

## Chỉnh giao diện

CSS thiết kế ở `src/main/resources/static/app.css`; logic ở `app.js`. Tailwind utilities được biên dịch sẵn, Java build không cần Node. Khi đổi utility classes:

```bash
npm ci
npm run build:css
npm run check
```

## Docker

```bash
docker build -t speedcube-academy .
docker run --rm -p 8080:8080 -e DB_URL=jdbc:postgresql://host.docker.internal:5432/academy -e DB_USER=academy -e DB_PASSWORD=your-password speedcube-academy
```

Trên Linux hãy cấu hình địa chỉ PostgreSQL phù hợp với mạng container. Chưa xác nhận Docker/PostgreSQL runtime trên máy bàn giao vì Docker Engine hiện trả lỗi API 500. Kiểm thử Java, H2 và kiểm tra trình duyệt được ghi riêng trong `reports/TESTING.md`.
