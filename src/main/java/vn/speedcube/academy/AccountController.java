package vn.speedcube.academy;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.web.csrf.CsrfToken;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.Map;
@RestController
public class AccountController {
 private final AccountService accounts;
 public AccountController(AccountService a){accounts=a;}
 @GetMapping("/api/auth/csrf") public Object csrf(CsrfToken token){return Map.of("token",token.getToken(),"headerName",token.getHeaderName());}
 @GetMapping("/api/auth/me") public Object me(Principal p){return p==null?Map.of("authenticated",false):Map.of("authenticated",true,"user",AccountService.view(accounts.current(p)));}
 @PostMapping("/api/auth/register") @ResponseStatus(org.springframework.http.HttpStatus.CREATED) public Object register(@Valid @RequestBody AccountService.Registration r){return accounts.register(r);}
 @PutMapping("/api/account/profile") public Object profile(Principal p,@Valid @RequestBody AccountService.Profile r){return accounts.update(p,r);}
}
