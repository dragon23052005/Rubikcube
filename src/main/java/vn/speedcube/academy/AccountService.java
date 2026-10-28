package vn.speedcube.academy;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;
import jakarta.validation.constraints.*;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
@Service
public class AccountService {
 private final AccountRepository accounts;private final PasswordEncoder passwords;private final PuzzleRepository puzzles;
 public AccountService(AccountRepository a,PasswordEncoder p,PuzzleRepository r){accounts=a;passwords=p;puzzles=r;}
 public record Registration(@NotBlank @Email @Size(max=254) String email,@NotBlank @Size(min=2,max=60) String displayName,@NotBlank @Size(min=10,max=72) String password){}
 public record Profile(@NotBlank @Size(min=2,max=60) String displayName,@NotNull Account.Level level,@NotBlank String focusPuzzle,@Min(5) @Max(120) int dailyMinutes){}
 public record View(String id,String email,String displayName,Account.Role role,Account.Level level,String focusPuzzle,int dailyMinutes){}
 public static View view(Account a){return new View(a.id,a.email,a.displayName,a.role,a.level,a.focusPuzzle,a.dailyMinutes);}
 public Account current(java.security.Principal principal){if(principal==null)throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Vui lòng đăng nhập");return accounts.findByEmail(principal.getName().toLowerCase(Locale.ROOT)).orElseThrow(()->new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Phiên đăng nhập không còn hợp lệ"));}
 @Transactional public View register(Registration r){
  String email=r.email().trim().toLowerCase(Locale.ROOT),name=r.displayName().strip();
  if(name.length()<2||r.password().getBytes(StandardCharsets.UTF_8).length>72)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Tên cần ít nhất 2 ký tự; mật khẩu dài 10–72 byte UTF-8");
  if(accounts.existsByEmail(email))throw new ResponseStatusException(HttpStatus.CONFLICT,"Email đã được đăng ký");
  var a=new Account();a.email=email;a.displayName=name;a.passwordHash=passwords.encode(r.password());
  accounts.saveAndFlush(a);return view(a);
 }
 @Transactional public View update(java.security.Principal p,Profile r){
  if(!puzzles.existsById(r.focusPuzzle())||r.displayName().strip().length()<2)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Hồ sơ hoặc loại Rubik không hợp lệ");
  var a=current(p);a.displayName=r.displayName().strip();a.level=r.level();a.focusPuzzle=r.focusPuzzle();a.dailyMinutes=r.dailyMinutes();return view(accounts.save(a));
 }
}
