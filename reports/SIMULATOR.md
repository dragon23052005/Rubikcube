# Mô phỏng công thức 3D

Trang chi tiết từng case có **Xem xoay 3D** ở công thức chính và các biến thể. Chọn công thức, nhấn mở mô phỏng rồi phát. Có tạm dừng, phát lại, về đầu, bước trước/sau, thanh chọn vị trí, chọn trực tiếp động tác và tốc độ 0,25×–1,5×. Kéo mô hình để đổi góc nhìn. Không tự phát; chuyển tab sẽ tạm dừng.

Nút **Toàn màn hình** (biểu tượng phóng to cạnh tiêu đề) mở riêng khung mô phỏng với toàn bộ điều khiển. Nhấn nút thu nhỏ hoặc Esc để quay lại, giữ bước hiện tại. Renderer dùng cả chiều rộng và chiều cao thực tế nên mô hình tự đổi kích thước khi phóng to/thu nhỏ. Trình duyệt không hỗ trợ Fullscreen API có giao diện phủ toàn trang dự phòng, giới hạn focus trong khung và khôi phục focus khi đóng.

## Phạm vi và độ chính xác

Quy ước màu của toàn bộ engine là **U vàng / D trắng**. Bảng màu đặt U vàng/D trắng; engine còn căn hướng tâm tại trạng thái bắt đầu bằng cách chọn hướng của trạng thái đích đã giải. Cách này xử lý cả công thức có wide/slice turn và x/y/z, không sửa chuỗi công thức hoặc lật trục U/D. Nút về đầu cũng khôi phục góc nhìn mặc định. Các bước xoay toàn khối x/y/z trong công thức vẫn được thực hiện bình thường.

- 2×2, 3×3, 4×4, 5×5 dùng cubing.js 0.66.1. Mỗi công thức được parse và kiểm tra với mô hình đúng kích thước trước khi dựng hình.
- Trạng thái đầu là công thức đảo áp dụng lên trạng thái đã giải. Vì nhiều case chỉ mô tả một phần khối, sticker ngoài phần nhận diện có thể khác ảnh nguồn. Giữ hướng cầm của công thức đã chọn; các biến thể có thể có hướng khác nhau.
- `M` trong bộ 4×4 được chuyển thành `2-3Lw`: cả hai lớp giữa theo chiều L. `M` trên 5×5 vẫn là một lớp chính giữa. Tiền tố `[z' y']` ở nguồn 5×5 là xoay toàn khối, được giữ nguyên thứ tự.
- Square-1 dùng bộ dựng Three.js riêng: góc 60°, cạnh 30°, xoay tầng trên/dưới theo chiều nhìn trực diện từng tầng, lát cắt 180°. Dựng ngược từ hai tầng dạng vuông với căn chỉnh kết thúc phù hợp; chỉ nhận chuỗi có tất cả lát cắt hợp lệ, không cắt xuyên góc. Với cube shape và các giai đoạn khác EP, màu là minh họa; không chứng nhận toàn khối được giải bởi công thức chỉ xử lý một giai đoạn. EP được kiểm chứng riêng bên dưới.
- Case trống công thức ở nguồn không có mô phỏng. Mô phỏng động tác, chưa hướng dẫn fingertrick hoặc chuyển động bàn tay.

## Code và tải tài nguyên

- `static/simulator.js`, `static/simulator.css`: giao diện điều khiển.
- `ui/simulator-engine.mjs`: bộ nối cubing.js.
- Engine khối thường đưa chính đối tượng 3D của cubing.js vào canvas Three.js riêng để hoạt động trong trình duyệt nhúng; vẫn giữ nguyên mô hình trạng thái và chuyển động của thư viện.
- `ui/square1-engine.mjs`, `ui/simulator-notation.mjs`: hình học và kiểm tra Square-1, chuẩn hóa ký hiệu theo nguồn.
- `tools/build-simulator.mjs`: đóng gói esbuild, chia module; output tại `static/vendor/simulator/`. Tài nguyên phục vụ cục bộ, không gọi CDN khi xem case; chỉ tải engine 3D khi người học mở mô phỏng.

```powershell
npm ci
npm run build:simulator
node --test tools/test-simulator.mjs
npm run check
```

File build được lưu trong repository để Java build không cần Node. cubing.js dùng MPL-2.0 hoặc GPL-3.0-or-later; source và giấy phép được ghi tại thư mục vendor. Three.js dùng MIT. API thử nghiệm của cubing.js được khóa theo phiên bản để tránh thay đổi ngoài ý muốn.

## Kiểm thử

9 test Node kiểm tra đủ 606 case, 666 công thức không trống tính cả biến thể, tính nghịch đảo, ký hiệu M theo kích thước, tiền tố hướng cầm, 5 silhouette Cube Shape theo ảnh tham chiếu và bảo toàn mảnh/không chồng lấn các tầng Square-1. Kiểm tra mô hình không thay thế kiểm chứng công thức của nguồn bằng solver độc lập.

48 test Java đã đạt. UI QA trên cổng 8081 đã xác nhận hình 3D của cả 5 loại Rubik, chuyển PLL sang Cách 2 J Perm, phát tới bước 10/10 và khối đã giải, bước 5×5 và lát cắt Square-1, phát/tạm dừng Square-1. Ảnh kiểm chứng: `simulator-pll-qa.png`. Chưa kiểm thử trên thiết bị di động thật.

## Square-1 EP: hoàn thành sáu mặt

EP dùng một trạng thái đích đã giải cố định, căn thẳng hai tầng và tầng giữa. Trạng thái đầu được dựng bằng nghịch đảo đúng công thức nguồn, không thêm động tác hoặc đổi màu khi kết thúc. Các màu mặt bên được gán theo mặt phẳng của sticker ở vị trí gốc, thay cho góc cực vốn chia sai màu trong cùng một mặt. Các giai đoạn khác vẫn giữ cách chọn căn chỉnh hợp lệ riêng.

`tools/Square1EpOracle.java` tạo 54 trạng thái tham chiếu bằng TNoodle 0.20.0. `tools/test-square1-ep.mjs` đối chiếu hoán vị 24 ô và hướng tầng giữa, kiểm tra SHA-256 công thức, rồi kiểm tra màu và diện tích cả sáu mặt trên chính mesh Three.js ở bước cuối. Không sửa công thức nguồn. Tổng cộng 11 test mô phỏng đạt.

## Sửa hướng khởi đầu

Trước đây chỉ đảo màu trắng/vàng nên công thức dựng ngược có `l`, `r`, `M` hoặc xoay toàn khối vẫn có thể hiện tâm xanh trên. `ui/simulator-orientation.mjs` xét 24 hướng của khối, chọn hướng đích để tâm ở bước đầu về vị trí chuẩn. Với 5×5 ưu tiên tâm cố định; 4×4 đối chiếu toàn bộ khối tâm. 9 test mô phỏng đã đạt, gồm hồi quy Aa Perm cả hai cách và các công thức 4×4.

QA EP: phát toàn bộ EP #3 trên trình duyệt tới 11/11, sáu mặt hoàn thành; ảnh square1-ep-solved-qa.png. Build đóng gói thành công. MySQL không chạy lúc QA nên dùng H2 tạm, không thay đổi cấu hình MySQL.
