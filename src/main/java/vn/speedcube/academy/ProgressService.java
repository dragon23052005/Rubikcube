package vn.speedcube.academy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import jakarta.validation.constraints.*;
import java.util.*;
@Service
public class ProgressService {
 private final ProgressRepository repository;private final CatalogService catalog;
 public ProgressService(ProgressRepository p,CatalogService c){repository=p;catalog=c;}
 public record View(String algorithmId,boolean learned,boolean favorite,boolean review,long updatedAt){}
 public record Entry(@NotBlank String algorithmId,boolean learned,boolean favorite,boolean review){}
 public static View view(LearningProgress p){return new View(p.algorithmId,p.learned,p.favorite,p.review,p.updatedAt);}
 public List<View> list(String userId){return repository.findByUserId(userId).stream().map(ProgressService::view).toList();}
 private void validate(String id,boolean learned,boolean review){
  var c=catalog.get(id);
  if((learned&&review)||(c.algorithm.isBlank()&&(learned||review)))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Trạng thái học không hợp lệ cho case này");
 }
 @Transactional public View put(String userId,String id,Boolean learned,Boolean favorite,Boolean review){
  if(learned==null&&favorite==null&&review==null)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Chưa chọn trạng thái cần cập nhật");
  var p=repository.findById(userId+":"+id).orElseGet(LearningProgress::new);
  if(learned!=null){p.learned=learned;if(learned&&review==null)p.review=false;}
  if(review!=null){p.review=review;if(review&&learned==null)p.learned=false;}
  if(favorite!=null)p.favorite=favorite;
  validate(id,p.learned,p.review);
  p.id=userId+":"+id;p.userId=userId;p.algorithmId=id;p.updatedAt=System.currentTimeMillis();return view(repository.saveAndFlush(p));
 }
 @Transactional public List<View> merge(String userId,List<Entry> entries){
  // Validate the complete batch before writing. An import cannot claim another user's rows.
  for(var e:entries){if(e==null)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Mục tiến độ không hợp lệ");validate(e.algorithmId(),e.learned(),e.review());}
  Map<String,LearningProgress> existing=new HashMap<>();repository.findByUserId(userId).forEach(p->existing.put(p.algorithmId,p));
  for(var e:entries){var p=existing.computeIfAbsent(e.algorithmId(),k->{var n=new LearningProgress();n.id=userId+":"+k;n.userId=userId;n.algorithmId=k;return n;});p.learned|=e.learned();p.favorite|=e.favorite();p.review=!p.learned&&(p.review||e.review());p.updatedAt=System.currentTimeMillis();}
  repository.saveAllAndFlush(existing.values());return existing.values().stream().map(ProgressService::view).toList();
 }
}
