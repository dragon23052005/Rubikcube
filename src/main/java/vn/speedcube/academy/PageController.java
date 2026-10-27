package vn.speedcube.academy;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
@Controller
public class PageController {
 private final CatalogService catalog;
 public PageController(CatalogService catalog){this.catalog=catalog;}
 @GetMapping({"/","/puzzles","/methods","/algorithms","/practice","/progress","/favorites","/guide","/cross"}) public String app(){return "index";}
 @GetMapping("/algorithms/{id}") public String detail(@org.springframework.web.bind.annotation.PathVariable String id){
  try{catalog.get(id);}catch(java.util.NoSuchElementException e){throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND);}
  return "index";
 }
}
