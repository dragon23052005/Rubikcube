# Bấm giờ và scramble

Mở `/timer` hoặc **Bấm giờ & Scramble** trên thanh điều hướng. Hỗ trợ 2×2, 3×3, 4×4, 5×5 và Square-1.

## Cách dùng

1. Chọn loại Rubik, xáo từ trạng thái đã giải bằng chuỗi đang hiển thị. Theo quy ước scramble WCA: trắng trên, xanh lá trước. Hình 2D TNoodle giúp kiểm tra trạng thái sau xáo.
2. Nếu bật inspection, nhấn Space hoặc chạm vùng đồng hồ để bắt đầu inspection.
3. Giữ Space hoặc vùng đồng hồ ít nhất 0,55 giây; khi hiện **Sẵn sàng**, thả để bắt đầu tính thời gian giải. Thời gian giữ vẫn nằm trong inspection.
4. Nhấn Space hoặc chạm đồng hồ để dừng. Esc trong khi đang giải ghi DNF. Scramble mới được tạo cho lượt tiếp theo.

Thời gian đo bằng `performance.now()`, không cộng dồn theo số frame. Rời tab không tạm dừng lượt giải; mất focus khi đang giữ sẽ hủy trạng thái giữ để tránh tự bắt đầu ngoài ý muốn. Không có thao tác pause giữa lượt giải.

## Inspection và thống kê

- Dưới 15.000 ms: không có phạt inspection.
- Từ đúng 15.000 đến dưới 17.000 ms: cộng 2 giây.
- Từ đúng 17.000 ms mà chưa bắt đầu: DNF, lưu một lượt và chuyển sang scramble mới.
- Nút +2 trong lịch sử là phạt bổ sung, cộng dồn với phạt inspection. DNF luôn ưu tiên. Bấm lại để bỏ phạt bổ sung; phạt inspection vẫn được giữ.
- Thời gian lẻ được cắt xuống phần trăm giây. ao5 bỏ một kết quả tốt nhất và một tệ nhất; một DNF được bỏ như kết quả tệ nhất, hai DNF làm ao5 thành DNF.
- ao12 là chỉ số luyện tập: lấy 12 lượt gần nhất, bỏ một kết quả ở mỗi đầu rồi lấy trung bình. Không gọi ao12 là thể thức thi WCA. Các trung bình được làm tròn đến phần trăm giây.

Nguồn quy tắc: [WCA A4d](https://www.worldcubeassociation.org/regulations/#A4d), [WCA 9f8–9f9](https://www.worldcubeassociation.org/regulations/#9f8), bản quy định hiện hành ngày 01/04/2026 đã được đối chiếu khi triển khai.

## Bộ sinh scramble

Backend dùng artifact Maven Central `org.worldcubeassociation.tnoodle:lib-scrambles:0.20.0`, không sửa thuật toán của thư viện. Dùng `PuzzleRegistry.TWO`, `THREE`, `FOUR`, `FIVE`, `SQ1`; 4×4 dùng `FOUR`, không dùng bộ random-turn `FOUR_FAST`. `generateScramble()` gọi cơ chế `generateWcaScramble` của TNoodle. Không tự ghép chuỗi move ngẫu nhiên hay chọn lại theo độ dễ.

- [TNoodle-lib của WCA](https://github.com/thewca/tnoodle-lib), giấy phép GPL-3.0; source và giấy phép có tại repository này.
- [Metadata artifact Maven Central](https://repo.maven.apache.org/maven2/org/worldcubeassociation/tnoodle/lib-scrambles/maven-metadata.xml).
- [Quy định WCA về scramble](https://www.worldcubeassociation.org/regulations/#4b).

Website là công cụ luyện tập sử dụng thư viện TNoodle, không phải bản phát hành TNoodle được chứng nhận cho tổ chức giải. Kết quả bàn phím/chạm và tự đánh giá phạt không phải kết quả thi đấu WCA. Muốn tổ chức giải chính thức cần quy trình, thiết bị và chương trình scramble chính thức hiện hành của WCA.

Giới hạn bộ sinh: tối đa hai tác vụ cùng lúc, giới hạn 60 yêu cầu/phút/IP trong một tiến trình, bảng IP có giới hạn kích thước. Khi bận trả 429 và cho thử lại, không dùng scramble giả. TNoodle có tài nguyên logback mặc định tắt root logging; dự án dùng `logback-spring.xml` riêng để giữ log ứng dụng.

## Lưu trữ

- `timer_scramble`: ID, loại Rubik, chuỗi và phiên bản nguồn thực sự do backend tạo.
- `timer_solve`: UUID lượt, chủ tài khoản, scramble tham chiếu, thời gian gốc, inspection, phạt bổ sung, thời điểm, version và cờ ẩn.
- API không tin chuỗi scramble do client gửi; chỉ nhận ID scramble có trong DB. Thời gian do trình duyệt tự báo, không phải hệ thống chống gian lận hoặc bảng xếp hạng được chứng thực.
- Gửi lại cùng UUID/payload không nhân đôi lượt. Payload xung đột bị từ chối; không đọc/sửa lượt của tài khoản khác. Cập nhật kiểm tra version để tránh ghi đè từ tab cũ. CSRF và kiểm tra UUID tài khoản áp dụng cho API.
- Tài khoản giữ toàn bộ lịch sử trong MySQL. UI, thống kê và CSV hiện dùng tối đa 200 lượt gần nhất của từng loại Rubik; query có giới hạn và fetch scramble cùng lượt để tránh N+1.
- Khách giữ tối đa 200 lượt/loại Rubik trong localStorage. Dữ liệu khách không tự nhập vào tài khoản.
- Kết quả đang chờ mạng nằm ở outbox riêng theo UUID tài khoản trên thiết bị. Lần mở lại thử gửi tiếp; chỉ báo đã đồng bộ sau khi server xác nhận.
- Ẩn lượt là soft delete, có nút hoàn tác; lượt ẩn không tính thống kê. CSV xuất đúng các lượt đang xem, gồm thời gian gốc, inspection, phạt và scramble.

## API và code

- Public, có CSRF: `POST /api/timer/scramble` với `{puzzle}`.
- Đăng nhập: `GET /api/timer/solves?puzzle=3x3`, `POST /api/timer/solves`, `PUT /api/timer/solves/{id}`.
- Package Java: `vn.speedcube.academy.timer`.
- Frontend: `timer.js`, `timer.css`, `timer-core.mjs`. Core tách khỏi DOM để kiểm tra state machine và phép tính.
- Kiểm tra: `npm run test:timer`, `npm run check`, `mvn test`.

55 test Java và 8 test đồng hồ Node đã đạt. Kiểm tra thực tế trên MySQL: sinh đủ 5 loại scramble, đăng nhập, lưu và gửi lại lượt, đổi phạt, ẩn/hoàn tác. UI QA kiểm tra giữ/thả Space, inspection, lưu khách và tài khoản, điều chỉnh +2 và hoàn tác. Chi tiết bổ sung tại TESTING.md.
