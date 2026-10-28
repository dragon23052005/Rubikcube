# Ôn tập thông minh

Đăng nhập rồi mở `/study`. Chọn loại Rubik, phương pháp, chế độ và 3–5 case. Xem công thức trước khi bắt đầu kiểm tra; mỗi lượt có hình nhận diện, nút hiện đáp án và ba lựa chọn: chưa nhớ, nhớ một phần, đã nhớ. Buổi chưa hoàn thành có thể tiếp tục bằng URL riêng trên tài khoản sở hữu nó.

## Lịch ôn

- Chưa nhớ: ôn lại sau 10 phút, quay về bậc 0.
- Nhớ một phần: ôn lại sau 6 giờ, giảm bậc ghi nhớ.
- Đã nhớ đúng hạn: tăng bậc với khoảng cách 1, 3, 7, 14, 30 ngày.
- Trả lời lại sớm vẫn ghi nhận lượt học nhưng không tăng bậc hoặc đẩy lùi ngày ôn.
- Từ bậc 3 mới được tính là nhớ ổn định. Dấu đã thuộc cũ không tự tạo lịch sử luyện tập.

Chế độ thông minh ưu tiên case đến hạn, case yếu rồi case mới. Chế độ case yếu tập trung vào các case cần luyện hoặc từng sai và chưa ổn định. Khi không chọn phương pháp, case mới cho người bắt đầu lấy từ lộ trình phù hợp. Mỗi buổi không lặp cùng case.

## Thống kê và lưu trữ

`/study-stats` có bộ lọc loại Rubik/phương pháp, lượt học, tỷ lệ tự đánh giá đã nhớ, thời gian nhận diện trung bình, lịch sử 14 ngày và danh sách case hay sai. Thời gian nhận diện dừng khi hiện đáp án và tạm dừng khi tab ẩn; đây không phải thời gian thực hiện công thức hoặc kết quả solver.

MySQL lưu `case_memory`, `study_session`, `study_attempt` theo UUID người dùng. Ghi lượt trả lời, tiến độ và bước buổi học cùng transaction. Mã sự kiện chống đếm trùng khi gửi lại; kiểm tra chủ sở hữu và thứ tự câu hỏi ở server. Luyện tập thông thường cũng ghi nhận lịch ôn cho tài khoản đăng nhập; khách giữ cơ chế tiến độ cục bộ.

## Kiểm thử

48 test tổng cộng: 36 test cũ, 4 test lịch ôn, 8 test dịch vụ/API ôn tập. Bao gồm tăng bậc đúng hạn, trả lời sớm, gửi lại/concurrent duplicate, cách ly tài khoản, thứ tự buổi học, CSRF, giới hạn lộ trình và thống kê theo ngày Việt Nam. HTTP smoke trên MySQL thật đã hoàn tất buổi 3 case và xác nhận thống kê không tăng khi gửi lại sự kiện.
