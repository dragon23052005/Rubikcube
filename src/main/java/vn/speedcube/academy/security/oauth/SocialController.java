package vn.speedcube.academy.security.oauth;
import vn.speedcube.academy.account.AccountService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import jakarta.servlet.http.HttpSession;
import java.security.Principal;
import java.util.*;
@RestController
public class SocialController {
 private final SocialClients clients;private final SocialIdentityRepository identities;private final SocialFlows flows;private final AccountService accounts;
 public SocialController(SocialClients c,SocialIdentityRepository i,SocialFlows f,AccountService a){clients=c;identities=i;flows=f;accounts=a;}
 @GetMapping("/api/auth/providers") public Object providers(){return clients.status();}
 @GetMapping("/api/account/social") public Object linked(Principal p){var account=accounts.current(p);var linked=identities.findByAccountId(account.id).stream().map(i->i.provider).collect(java.util.stream.Collectors.toSet());return clients.status().stream().map(c->Map.of("id",c.get("id"),"name",c.get("name"),"enabled",c.get("enabled"),"linked",linked.contains(c.get("id")))).toList();}
 @PostMapping("/api/account/social/{provider}/link") public Object link(Principal p,HttpSession session,@PathVariable String provider){
  if(clients.findByRegistrationId(provider)==null)throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"Phương thức này chưa được quản trị viên bật");
  var account=accounts.current(p);Object stamp=session.getAttribute("ACADEMY_AUTH_AT");
  if(!(stamp instanceof Long time)||System.currentTimeMillis()-time>600000)throw new ResponseStatusException(HttpStatus.CONFLICT,"Vui lòng đăng xuất rồi đăng nhập lại trước khi liên kết (yêu cầu phiên đăng nhập trong 10 phút gần đây)");
  return Map.of("redirect",flows.link(session,provider,account.id));
 }
}
