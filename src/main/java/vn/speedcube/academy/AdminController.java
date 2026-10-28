package vn.speedcube.academy;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;
@RestController @RequestMapping("/api/admin")
public class AdminController {
 private final AccountRepository accounts;private final ProgressRepository progress;private final RoadmapService roadmaps;
 public AdminController(AccountRepository a,ProgressRepository p,RoadmapService r){accounts=a;progress=p;roadmaps=r;}
 @GetMapping("/users") public Object users(@RequestParam(defaultValue="0") int page){
  if(page<0||page>100000)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Trang không hợp lệ");
  var users=accounts.findAll(PageRequest.of(page,20,Sort.by(Sort.Direction.DESC,"createdAt").and(Sort.by("id"))));
  Map<String,Long> counts=new HashMap<>();if(!users.isEmpty())progress.learnedCounts(users.stream().map(a->a.id).toList()).forEach(c->counts.put(c.getUserId(),c.getLearned()));
  return Map.of("items",users.getContent().stream().map(a->Map.of("user",AccountService.view(a),"learned",counts.getOrDefault(a.id,0L))).toList(),"page",page,"pages",users.getTotalPages(),"total",users.getTotalElements());
 }
 @GetMapping("/users/{id}") public Object detail(@PathVariable String id){
  var a=accounts.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Không tìm thấy người học"));
  return Map.of("roadmap",roadmaps.plan(a),"progress",progress.findByUserId(id).stream().map(ProgressService::view).toList());
 }
}
