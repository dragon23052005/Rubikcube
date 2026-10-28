package vn.speedcube.academy.timer;
import vn.speedcube.academy.account.AccountService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
@RestController @RequestMapping("/api/timer")
public class TimerController {
 private final ScrambleService scrambles;private final TimerService timer;private final AccountService accounts;
 public TimerController(ScrambleService s,TimerService t,AccountService a){scrambles=s;timer=t;accounts=a;}
 public record Request(@NotBlank @Size(max=8) String puzzle){}
 @PostMapping("/scramble") public Object scramble(@Valid @RequestBody Request request,HttpServletRequest http){return scrambles.generate(request.puzzle(),http.getRemoteAddr());}
 @GetMapping("/solves") public Object history(Principal user,@RequestParam(defaultValue="3x3") String puzzle){return timer.history(accounts.current(user).id,puzzle);}
 @PostMapping("/solves") public Object save(Principal user,@Valid @RequestBody TimerService.Input input){return timer.save(accounts.current(user).id,input);}
 @PutMapping("/solves/{id}") public Object change(Principal user,@PathVariable String id,@Valid @RequestBody TimerService.Change input){return timer.change(accounts.current(user).id,id,input);}
}
