package vn.speedcube.academy.study;
import vn.speedcube.academy.account.AccountService;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.security.Principal;
@RestController @RequestMapping("/api/study")
public class StudyController {
 private final StudyService study;private final AccountService accounts;
 public StudyController(StudyService s,AccountService a){study=s;accounts=a;}
 public record Create(@NotNull @Size(max=20) String puzzle,@NotNull @Size(max=100) String method,@NotNull StudyService.Mode mode,@Min(3) @Max(5) int size){}
 @GetMapping("/stats") public Object stats(Principal p,@RequestParam(defaultValue="") String puzzle,@RequestParam(defaultValue="") String method){return study.stats(accounts.current(p),puzzle,method);}
 @PostMapping("/sessions") public Object create(Principal p,@Valid @RequestBody Create r){return study.create(accounts.current(p),r.puzzle(),r.method(),r.mode(),r.size());}
 @GetMapping("/sessions/{id}") public Object session(Principal p,@PathVariable String id){return study.get(accounts.current(p).id,id);}
 @PostMapping("/sessions/{id}/begin") public Object begin(Principal p,@PathVariable String id){return study.begin(accounts.current(p).id,id);}
 @PostMapping("/attempts") public Object attempt(Principal p,@Valid @RequestBody StudyService.AttemptInput input){return study.record(accounts.current(p).id,input);}
}
