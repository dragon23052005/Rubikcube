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

Mở http://localhost:8080. Cấu hình mặc định dùng MySQL tại `localhost:3306/demotesting`. Mật khẩu cục bộ được đọc từ `config/database-local.properties` (không đưa vào Git). Khách có thể học ngay với localStorage. Đăng ký/đăng nhập để lưu hồ sơ, tiến độ và lộ trình trong DB theo từng tài khoản.

## MySQL

Cần MySQL đang chạy ở cổng 3306 và database `demotesting`. Bản cấu hình trên máy hiện tại đã kết nối thành công. Ở máy mới, sao chép `config/database-local.example.properties` thành `config/database-local.properties`, đặt mật khẩu riêng trong file này hoặc đặt biến môi trường `DB_PASSWORD`.

Cấu hình mặc định (không chứa mật khẩu):

```properties
spring.datasource.url=${DB_URL:jdbc:mysql://localhost:3306/demotesting?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Ho_Chi_Minh}
spring.datasource.username=${DB_USER:root}
spring.datasource.password=${DB_PASSWORD:}
spring.jpa.hibernate.ddl-auto=update
```

Nếu database chưa có, tạo một lần:

```sql
CREATE DATABASE IF NOT EXISTS demotesting CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Có thể dùng MySQL đã cài sẵn. Tùy chọn Docker: đặt `DB_PASSWORD` trong `.env`, chạy `docker compose up -d mysql`; không chạy thêm container nếu cổng 3306 đang do MySQL cục bộ sử dụng. `.env` được Compose đọc, còn Java đọc `config/database-local.properties` hoặc biến môi trường tiến trình. Chạy Java từ thư mục dự án để đọc đúng file cấu hình riêng.

Driver MySQL Connector/J được quản lý bởi Spring Boot. Không hard-code dialect để các kiểm thử H2 vẫn hoạt động. Trước khi triển khai production, dùng tài khoản DB phù hợp và migration schema được quản lý thay cho `ddl-auto=update`.

Dữ liệu H2 cũ ở `var/academy.mv.db` không bị xóa hoặc tự chuyển sang MySQL. Nếu trước đây đã có tài khoản học thật trong H2, cần chuyển dữ liệu riêng để giữ UUID/tài khoản và tiến độ cũ. Dữ liệu khách trên trình duyệt vẫn có thể nhập vào tài khoản như trước.

## Build và kiểm thử

```powershell
.\mvnw.cmd clean package
java -jar target/academy-1.0.0.jar
```

Hoặc trên Linux/macOS:

```bash
./mvnw clean package
```

JAR: `target/academy-1.0.0.jar`. Có 36 kiểm thử JUnit/Spring Boot cho số lượng nguồn, ảnh, ký hiệu Square-1, API/phân trang, cách ly tiến độ theo tài khoản, CSRF, session đăng nhập và phân quyền, các trang và bộ bài tập nghiên cứu. 36 kiểm thử tự động dùng H2 tương thích SQL; ngoài ra đã kiểm tra ứng dụng với MySQL thật trên máy này. Xem reports/MYSQL.md.

## Chức năng

- Dashboard, danh mục Rubik và trang chọn phương pháp.
- Thư viện tìm tức thì theo tên/số/chuỗi công thức, lọc Rubik/phương pháp/nhóm/trạng thái và sắp xếp độ dài chuỗi ký hiệu.
- Grid 3 cột desktop thông thường, 4 cột màn hình lớn, 2 cột mobile; render 12 case/trang. Drawer bộ lọc trên mobile.
- Chi tiết: ảnh gốc, công thức chính, 61 biến thể bổ sung, copy, đã thuộc, đã lưu, Previous/Next, giải thích ký hiệu riêng từng Rubik.
- Practice: chọn phạm vi, random case, ẩn/hiện đáp án, ghi nhận đã thuộc/cần luyện; không chọn case nguồn trống.
- Phím tắt: `/` tìm kiếm; `Space` hiện đáp án; `1` đã thuộc; `2` cần luyện; `→` bỏ qua. Không chiếm phím khi nhập/chọn dữ liệu.
- Tiến độ theo tài khoản và phương pháp; lộ trình riêng theo trình độ, Rubik và mục tiêu học. Xuất/nhập JSON, nhập dữ liệu khách, tiếp tục bằng tài khoản trên thiết bị khác.
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
| CS bổ sung từ ảnh tham chiếu | 5 |
| 2×2 OLL / PBL | 7 / 5 |
| 4×4 Basic / L2E / OLL parity / PLL parity | 3 / 5 / 27 / 22 |
| 5×5 L2E / L2C | 12 / 19 |
| Tổng mục nhận diện | **606** |
| Có công thức chính | **605** |
| Biến thể bổ sung | **61** (25 gốc + 17 PLL + 3 cho 2×2 + 13 cho 4×4 + 3 cho 5×5) |

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
| `GET /api/progress` | Tiến độ tài khoản đã đăng nhập |
| `PUT /api/progress/{id}` | JSON `{ "learned": true, "favorite": false, "review": false }` |

API phân trang tối đa 100 mục. Khách dùng localStorage; khi đăng nhập, giao diện đọc/ghi tiến độ theo tài khoản trong DB, có thể tiếp tục trên thiết bị khác. Các API ghi dùng CSRF token và session cookie. Snapshot catalog được đọc từ DB lúc khởi động và giữ trong bộ nhớ; frontend chỉ render ảnh theo trang, không tải hàng trăm hình cùng lúc. Bộ bài tập Cross chỉ tải khi vào trang đó.

## Cấu trúc

- `src/main/java/vn/speedcube/academy`: ứng dụng, controller/service/repository, DTO, entity Rubik, tài khoản, tiến độ và chặng học.
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

Khi chạy trong container, đặt `DB_URL` trỏ tới host/service MySQL phù hợp thay vì localhost của container. Đã kiểm tra MySQL cài sẵn trên máy; chưa chạy kiểm tra Docker MySQL. Chi tiết: `reports/MYSQL.md` và `reports/TESTING.md`.

## Cube Shape mới từ ảnh tham chiếu

Đã bổ sung 5 case CS với 6 hình SVG mới, có mặt trong thư viện, chi tiết, luyện tập và tiến độ. Xem [bảng công thức và phạm vi kiểm chứng](reports/CUBESHAPE.md). `user-cases.json` tự chèn các ID chưa có khi khởi động, giữ nguyên dữ liệu/tiến độ cũ. `python tools/test_cubeshape.py` chạy kiểm tra hình dạng. Màu SVG phân biệt góc/cạnh, không thể hiện màu sticker.

## PLL kết hợp J Perm

21 case PLL giữ nguyên ID và công thức CubeZone. Thêm 21 ảnh J Perm; 4 case trùng chuỗi chỉ thêm hình, 17 case khác có Cách 2 với ảnh/hướng cầm riêng. [Báo cáo ghép nguồn](reports/PLL-JPERM.md). `python tools/test_pll_matching.py` kiểm tra ghép theo trạng thái; `pll-references.json` tự cập nhật tham chiếu khi khởi động mà không nhân đôi biến thể.

## Rubik 2×2 — Ortega

Nguồn J Perm: 7 OLL và 5 PBL, với 17 ảnh nguồn và 3 công thức thay thế. PBL có hai hình; hình thứ hai giữ phép lật gương như nguồn. Dữ liệu `jperm-2x2.json` được chèn bổ sung theo ID, không đụng tiến độ cũ. Bộ lọc, Dashboard, chi tiết và luyện tập đọc các loại Rubik từ `/api/puzzles`. Chạy `python tools/test_jperm_2x2.py` để kiểm tra nguồn, ảnh và bất biến pha Ortega.

## Rubik 4×4

Mở `/4x4` để học Reduction/Yau, ghép tâm, ghép cạnh 3–2–3, half centers và parity. Thư viện có 3 mục Basic, 5 L2E CubeSkills (2 biến thể), đủ 27 OLL parity J Perm (11 biến thể) và 22 PLL parity J Perm. Tích hợp ảnh, Copy, tìm kiếm, luyện tập và tiến độ. Xem [nguồn và phạm vi](reports/FOUR-BY-FOUR.md). Đây là bộ parity bổ sung cho OLL/PLL thường; phần ghép tâm/cạnh còn cần học trực giác.

## Rubik 5×5

Mở `/5x5` để học ghép tâm, ghép cạnh, Reduction, Free Slice và edge parity từ J Perm. Nhập đủ 12 L2E CubeSkills và 19 L2C cần công thức khi khối tâm 2×3 ở F đã giải; có ảnh nguồn, 3 biến thể, Copy, tìm kiếm và Practice. Hai thao tác cơ bản có nút Copy riêng ở trang hướng dẫn. Xem [nguồn và kiểm thử 5×5](reports/FIVE-BY-FIVE.md).

## Đăng nhập, phân quyền và lộ trình

Mở `/register` để tạo tài khoản. `/account` chọn trình độ (mới bắt đầu / đã biết giải / nâng cao), loại Rubik và mục tiêu phút/ngày. `/roadmap` hiển thị chặng học và luyện đúng tập case của chặng. Các dấu đã thuộc, cần luyện, yêu thích và chặng đã hoàn thành được lưu trong DB theo tài khoản. Khách vẫn học được; có nút nhập tiến độ khách vào tài khoản khi người dùng chủ động chọn.

Vai trò `USER` chỉ đọc/ghi dữ liệu của mình; `ADMIN` có trang `/admin` xem tiến độ người học. Không có tài khoản hoặc mật khẩu admin mặc định. Đặt `ACADEMY_ADMIN_EMAIL` và `ACADEMY_ADMIN_PASSWORD` cho **email mới** để bootstrap một lần. Chi tiết cấu hình, lưu trữ, giới hạn và kiểm thử: [AUTHENTICATION.md](reports/AUTHENTICATION.md).

Mật khẩu băm BCrypt, session HttpOnly/SameSite, CSRF trên các thao tác ghi, giới hạn thử đăng nhập. Với HTTPS production đặt `SESSION_COOKIE_SECURE=true`. Chưa có xác minh email hoặc chức năng quên mật khẩu qua email.

## Đăng nhập Google / Facebook

Đã tích hợp OAuth2/OIDC và liên kết vào tài khoản hiện có để giữ tiến độ. Nút chỉ bật khi có cấu hình dịch vụ. Google cần `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`; Facebook cần `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET`, `FACEBOOK_GRAPH_VERSION`. Đặt `APP_BASE_URL` đúng origin đã đăng ký và restart. Hướng dẫn callback, cấu hình console và liên kết an toàn: [SOCIAL-LOGIN.md](reports/SOCIAL-LOGIN.md). Không gửi khóa bí mật qua chat hoặc commit vào Git.

36 kiểm thử đã đạt, gồm luồng OAuth dùng nhà cung cấp cục bộ. Chưa thử Google/Facebook thật vì chưa có app credentials của chủ dự án.
