package vn.speedcube.academy.roadmap;
import vn.speedcube.academy.account.AccountService;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
@RestController @RequestMapping("/api/roadmap")
public class RoadmapController {
 private final AccountService accounts;private final RoadmapService roadmaps;
 public RoadmapController(AccountService a,RoadmapService r){accounts=a;roadmaps=r;}
 public record Completion(boolean completed){}
 @GetMapping public Object plan(Principal p){return roadmaps.plan(accounts.current(p));}
 @PutMapping("/stages/{id}") public Object complete(Principal p,@PathVariable String id,@RequestBody Completion c){return roadmaps.complete(accounts.current(p),id,c.completed());}
}
