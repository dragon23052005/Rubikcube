package vn.speedcube.academy;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.security.Principal;
import java.util.*;
@RestController @RequestMapping("/api/progress")
public class ProgressController {
 private final AccountService accounts;private final ProgressService progress;
 public ProgressController(AccountService a,ProgressService p){accounts=a;progress=p;}
 public record Status(Boolean learned,Boolean favorite,Boolean review){@AssertTrue public boolean isConsistent(){return !(Boolean.TRUE.equals(learned)&&Boolean.TRUE.equals(review));}}
 public record ImportRequest(@NotNull @Size(max=1000) @Valid List<ProgressService.Entry> entries){}
 @GetMapping public Object list(Principal p){return progress.list(accounts.current(p).id);}
 @PutMapping("/{id}") public Object put(Principal p,@PathVariable String id,@Valid @RequestBody Status r){return progress.put(accounts.current(p).id,id,r.learned(),r.favorite(),r.review());}
 @PostMapping("/import") public Object merge(Principal p,@Valid @RequestBody ImportRequest r){return progress.merge(accounts.current(p).id,r.entries());}
 @ExceptionHandler(NoSuchElementException.class) public org.springframework.http.ResponseEntity<?> missing(){return org.springframework.http.ResponseEntity.status(404).body(Map.of("message","Không tìm thấy công thức"));}
}
