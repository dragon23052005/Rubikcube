package vn.speedcube.academy;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.*;
@RestController @RequestMapping("/api")
public class ApiController {
 private final CatalogService catalog; private final ProgressRepository progress;
 public ApiController(CatalogService c,ProgressRepository p){catalog=c;progress=p;}
 @GetMapping("/catalog") public Object catalog(){return catalog.snapshot();}
 @GetMapping("/puzzles") public Object puzzles(){return catalog.puzzleSummary();}
 @GetMapping("/methods") public Object methods(){return catalog.counts();}
 @GetMapping({"/algorithms","/algorithms/search"}) public Object list(@RequestParam(defaultValue="") String q,@RequestParam(defaultValue="") String puzzle,@RequestParam(defaultValue="") String method,@RequestParam(defaultValue="") String category,@RequestParam(defaultValue="0") @Min(0) int page,@RequestParam(defaultValue="24") @Min(1) @Max(100) int size,@RequestParam(defaultValue="number") String sort){
  if(page<0||size<1||size>100)throw new IllegalArgumentException("Phân trang không hợp lệ");
  String query=q.toLowerCase(Locale.ROOT);
  var stream=catalog.all().stream().filter(c->(puzzle.isBlank()||c.puzzle.equals(puzzle))&&(method.isBlank()||c.method.equals(method))&&(category.isBlank()||c.category.equals(category))&&(c.name+" "+c.puzzle+" "+c.number+" "+c.algorithm+" "+c.method+" "+String.join(" ",c.getAlternatives())).toLowerCase(Locale.ROOT).contains(query));
  var items=(sort.equals("length")?stream.sorted(Comparator.comparingInt(c->c.algorithm.length())):stream).toList();
  return Map.of("items",items.stream().skip((long)page*size).limit(size).map(AlgorithmDto::from).toList(),"total",items.size(),"page",page,"size",size);
 }
 @GetMapping("/algorithms/statistics") public Object stats(){return Map.of("total",catalog.all().size(),"methods",catalog.counts(),"sourceMatched",catalog.all().stream().filter(c->c.verificationStatus.equals("SOURCE_MATCHED")).count(),"shapeChecked",catalog.all().stream().filter(c->c.verificationStatus.equals("USER_REFERENCE_SHAPE_CHECKED")).count(),"sourceEmpty",catalog.all().stream().filter(c->c.algorithm.isBlank()).map(c->c.id).toList(),"solverVerified",0);}
 @GetMapping("/algorithms/{id}") public Object detail(@PathVariable String id){return AlgorithmDto.from(catalog.get(id));}
 public record ProgressRequest(boolean learned,boolean favorite,boolean review){
  @AssertTrue(message="Case đã thuộc không đồng thời ở trạng thái cần luyện") public boolean isConsistent(){return !(learned&&review);}
 }
 @GetMapping("/progress") public Object progress(HttpSession session){return progress.findByIdStartingWith(session.getId()+":");}
 @PutMapping("/progress/{id}") public Object put(@PathVariable String id,@Valid @RequestBody ProgressRequest request,HttpSession session){catalog.get(id);var p=new LearningProgress();p.id=session.getId()+":"+id;p.algorithmId=id;p.learned=request.learned();p.favorite=request.favorite();p.review=request.review();p.updatedAt=System.currentTimeMillis();return progress.save(p);}
 @ExceptionHandler(NoSuchElementException.class) public ResponseEntity<?> missing(Exception e){return ResponseEntity.status(404).body(Map.of("message",e.getMessage()));}
 @ExceptionHandler(IllegalArgumentException.class) public ResponseEntity<?> invalid(Exception e){return ResponseEntity.badRequest().body(Map.of("message",e.getMessage()));}
}
