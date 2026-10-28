package vn.speedcube.academy.admin;
import vn.speedcube.academy.account.Account;
import vn.speedcube.academy.account.AccountRepository;
import org.springframework.boot.*;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.nio.charset.StandardCharsets;
@Component
public class AdminBootstrap implements ApplicationRunner {
 private final AccountRepository accounts;private final PasswordEncoder passwords;
 @Value("${ACADEMY_ADMIN_EMAIL:}") private String email;
 @Value("${ACADEMY_ADMIN_PASSWORD:}") private String password;
 public AdminBootstrap(AccountRepository a,PasswordEncoder p){accounts=a;passwords=p;}
 public void run(ApplicationArguments args){
  if(email.isBlank()&&password.isBlank())return;
  if(!email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")||email.length()>254||password.isBlank()||password.length()<10||password.getBytes(StandardCharsets.UTF_8).length>72)throw new IllegalStateException("Cấu hình tài khoản admin không hợp lệ; email và mật khẩu 10–72 byte phải được cung cấp cùng nhau");
  String normalized=email.trim().toLowerCase(java.util.Locale.ROOT);
  // Never silently promote or reset an existing user's account on restart.
  if(accounts.existsByEmail(normalized))return;
  var a=new Account();a.email=normalized;a.displayName="Quản trị viên";a.passwordHash=passwords.encode(password);a.role=Account.Role.ADMIN;accounts.saveAndFlush(a);
 }
}
