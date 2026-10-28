package vn.speedcube.academy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;
@Service
public class RoadmapService {
 private final CatalogService catalog;private final ProgressService progress;private final StageRepository completions;
 public RoadmapService(CatalogService c,ProgressService p,StageRepository s){catalog=c;progress=p;completions=s;}
 public record Stage(String id,String title,String description,String href,String method,List<String> caseIds,boolean manual,int learned,int total,boolean complete){}
 public record Plan(AccountService.View user,List<Stage> stages,int completed,int total,int percent,String nextStageId,int learnedCases,int reviewCases){}
 private Stage lesson(Account a,String key,String title,String description,String href){return new Stage(a.focusPuzzle+"-"+key,title,description,href,"",List.of(),true,0,1,false);}
 private Stage cases(Account a,String key,String title,String description,String method,List<String> ids){
  var available=catalog.all().stream().filter(c->c.puzzle.equals(a.focusPuzzle)&&c.method.equals(method)&&!c.algorithm.isBlank()&&(ids.isEmpty()||ids.contains(c.id))).map(c->c.id).toList();
  return new Stage(a.focusPuzzle+"-"+key,title,description,"/algorithms?method="+java.net.URLEncoder.encode(method,java.nio.charset.StandardCharsets.UTF_8),method,available,false,0,available.size(),false);
 }
 private Stage cases(Account a,String key,String title,String method){return cases(a,key,title,"Luyện nhận diện và đánh dấu những case đã nhớ. Chỉ case có công thức được tính vào tiến độ.",method,List.of());}
 private List<Stage> stages(Account a){
  List<Stage> s=new ArrayList<>();boolean beginner=a.level==Account.Level.BEGINNER,advanced=a.level==Account.Level.ADVANCED;
  String guide=switch(a.focusPuzzle){case "4x4"->"/4x4";case "5x5"->"/5x5";default->"/guide";};
  s.add(lesson(a,"foundation","Nền tảng & hướng cầm","Đọc ký hiệu và thực hiện đúng các thao tác theo hướng nhìn của hình. Đánh dấu sau khi đã thực hành.",guide));
  switch(a.focusPuzzle){
   case "3x3"->{
    if(beginner){s.add(lesson(a,"first-solve","Hoàn thành lần giải đầu","Thực hành phương pháp cơ bản trước khi học toàn bộ CFOP. Bài học có video từng bước từ J Perm.","https://jperm.net/3x3"));s.add(cases(a,"starter-pll","Làm quen 5 PLL thường gặp","Bắt đầu với Ua, Ub, H, Z và T. Luyện trong đúng phạm vi của chặng.","PLL",List.of("pll-4","pll-5","pll-6","pll-7","pll-12")));}
    else {s.add(cases(a,"pll","Hoàn thiện 21 PLL","PLL"));s.add(cases(a,"oll","Hoàn thiện 57 OLL","OLL"));}
    if(advanced){s.add(cases(a,"coll","Mở rộng COLL","COLL"));s.add(cases(a,"zb-f2l","F2L nâng cao & định hướng cạnh","ZB F2L"));}
   }
   case "2x2"->{s.add(cases(a,"oll","Định hướng mặt trên — Ortega","2×2 OLL"));s.add(cases(a,"pbl","Hoán vị hai tầng — Ortega","2×2 PBL"));if(!beginner)s.add(lesson(a,"efficiency","Nhận diện nhanh và giảm đổi hướng","Luyện toàn bài Ortega liền mạch; tự đánh giá khi chuyển được giữa các bước mà không dừng lâu. Thư viện hiện chưa có bộ CLL/EG.","/practice?method=2%C3%972%20PBL"));}
   case "4x4"->{s.add(cases(a,"basic","Ghép cạnh & hai parity cơ bản","4×4 Basic"));if(!beginner){s.add(cases(a,"l2e","Hai cạnh cuối","4×4 L2E"));s.add(lesson(a,"yau","Yau & ghép cạnh 3–2–3","Thực hành thứ tự Yau và giữ cross trong khi ghép các cạnh còn lại.","/4x4"));}if(advanced){s.add(cases(a,"oll","OLL parity nâng cao","4×4 OLL"));s.add(cases(a,"pll","PLL parity nâng cao","4×4 PLL"));}}
   case "5x5"->{
    if(beginner)s.add(cases(a,"starter-edges","Ghép cạnh cơ bản & edge parity","4 trường hợp không parity và 1 trường hợp edge parity cơ bản.","5×5 L2E",List.of("5x5-l2e-1","5x5-l2e-2","5x5-l2e-3","5x5-l2e-4","5x5-l2e-5")));
    else {s.add(cases(a,"l2c","Hai tâm cuối — khối 2×3 ở F","5×5 L2C"));s.add(cases(a,"l2e","Hoàn thiện 12 trường hợp hai cạnh cuối","5×5 L2E"));s.add(lesson(a,"free-slice","Free Slice & nhìn trước","Thực hành ghép tám cạnh đầu bằng Free Slice rồi trả tâm và hoàn thành bốn cạnh cuối.","/5x5"));}
    if(advanced)s.add(lesson(a,"efficiency","Tối ưu tâm và toàn bài","Ghi lại các đoạn dừng, luyện nhận diện wing tiếp theo và giảm đổi hướng cầm. Hoàn thành khi thực hiện được quy trình liền mạch.","/5x5"));
   }
   case "sq1"->{s.add(cases(a,"cube-shape","Đưa về Cube Shape","CS"));if(beginner){s.add(cases(a,"co","Đưa góc về đúng tầng","CO"));s.add(cases(a,"eo","Đưa cạnh về đúng tầng","EO"));}else{s.add(cases(a,"cp","Hoán vị góc","CP"));s.add(cases(a,"ep","Hoán vị cạnh & parity","EP"));s.add(cases(a,"middle","Xử lý tầng giữa","Middle"));}if(advanced)s.add(lesson(a,"efficiency","Nhận diện và nối bước","Tập nhận diện từ nhiều hướng, giữ đúng hướng hình trước mỗi công thức và giảm khoảng dừng giữa các bước.","/guide#square1"));}
   default->throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Loại Rubik không được hỗ trợ");
  }
  return s;
 }
 public Plan plan(Account a){
  var learned=new HashSet<String>();int review=0;for(var p:progress.list(a.id)){if(p.learned())learned.add(p.algorithmId());if(p.review())review++;}
  var manual=new HashSet<String>();completions.findByUserId(a.id).forEach(c->manual.add(c.stageId));
  var rows=stages(a).stream().map(s->{int done=s.manual()?(manual.contains(s.id())?1:0):(int)s.caseIds().stream().filter(learned::contains).count();return new Stage(s.id(),s.title(),s.description(),s.href(),s.method(),s.caseIds(),s.manual(),done,s.total(),s.total()>0&&done==s.total());}).toList();
  int done=(int)rows.stream().filter(Stage::complete).count();return new Plan(AccountService.view(a),rows,done,rows.size(),rows.isEmpty()?0:done*100/rows.size(),rows.stream().filter(s->!s.complete()).map(Stage::id).findFirst().orElse(""),learned.size(),review);
 }
 @Transactional public Plan complete(Account a,String stageId,boolean complete){
  var stage=stages(a).stream().filter(s->s.id().equals(stageId)).findFirst().orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Chặng học không có trong lộ trình hiện tại"));
  if(!stage.manual())throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Tiến độ chặng này được tính từ các case đã thuộc");
  String id=a.id+":"+stageId;
  if(complete){var c=new StageCompletion();c.id=id;c.userId=a.id;c.stageId=stageId;c.completedAt=System.currentTimeMillis();completions.saveAndFlush(c);}else completions.deleteById(id);
  return plan(a);
 }
}
