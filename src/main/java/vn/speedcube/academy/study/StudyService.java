package vn.speedcube.academy.study;
import vn.speedcube.academy.account.*;
import vn.speedcube.academy.catalog.CatalogService;
import vn.speedcube.academy.catalog.model.AlgorithmCase;
import vn.speedcube.academy.progress.*;
import vn.speedcube.academy.roadmap.RoadmapService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.data.domain.PageRequest;
import java.time.*;
import java.util.*;
@Service
public class StudyService {
 public enum Mode { SMART, NEW, WEAK }
 public record Memory(String algorithmId,String level,int attempts,int correct,int wrong,int hard,int box,long dueAt,long lastAt,Long averageRecognitionMs){}
 public record Result(String algorithmId,StudySchedule.Outcome outcome,long recognitionMs){}
 public record Session(String id,String phase,String puzzle,String method,String mode,List<String> caseIds,int nextIndex,long createdAt,List<Result> results){}
 public record AttemptInput(@jakarta.validation.constraints.NotBlank @jakarta.validation.constraints.Size(max=36) String eventId,@jakarta.validation.constraints.NotBlank @jakarta.validation.constraints.Size(max=255) String algorithmId,@jakarta.validation.constraints.NotNull StudySchedule.Outcome outcome,@jakarta.validation.constraints.Min(0) @jakarta.validation.constraints.Max(1800000) long recognitionMs,@jakarta.validation.constraints.Size(max=36) String sessionId,@jakarta.validation.constraints.Min(0) Integer sessionIndex){}
 public record Saved(Memory memory,ProgressService.View progress,Session session){}
 public record Day(String date,long attempts,long correct,long wrong){}
 public record Stats(int totalCases,int practicedCases,int stableCases,int learningCases,int unfamiliarCases,int dueCases,int weakCases,int newCases,long attempts,long correct,long wrong,long hard,int accuracy,Long averageRecognitionMs,List<Memory> mistakes,List<Day> days,List<Session> activeSessions){}
 private final CatalogService catalog;private final AccountRepository accounts;private final ProgressService progress;
 private final CaseMemoryRepository memories;private final StudySessionRepository sessions;private final StudyAttemptRepository attempts;private final RoadmapService roadmaps;private final Clock clock;
 public StudyService(CatalogService c,AccountRepository a,ProgressService p,CaseMemoryRepository m,StudySessionRepository s,StudyAttemptRepository t,RoadmapService r,Clock k){catalog=c;accounts=a;progress=p;memories=m;sessions=s;attempts=t;roadmaps=r;clock=k;}
 private ResponseStatusException bad(String message){return new ResponseStatusException(HttpStatus.BAD_REQUEST,message);}
 private List<String> ids(StudySession s){return List.of(s.caseIds.split(","));}
 private StudySession owned(String id,String user){return sessions.findByIdAndUserId(id,user).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Không tìm thấy buổi học của bạn"));}
 private List<AlgorithmCase> scope(String puzzle,String method){
  var all=catalog.all();
  if(!puzzle.isBlank()&&all.stream().noneMatch(c->c.puzzle.equals(puzzle)))throw bad("Loại Rubik không hợp lệ");
  if(!method.isBlank()&&all.stream().noneMatch(c->c.method.equals(method)&&(puzzle.isBlank()||c.puzzle.equals(puzzle))))throw bad("Phương pháp không thuộc loại Rubik này");
  return all.stream().filter(c->!c.algorithm.isBlank()&&(puzzle.isBlank()||c.puzzle.equals(puzzle))&&(method.isBlank()||c.method.equals(method))).toList();
 }
 public Memory view(CaseMemory m){return new Memory(m.algorithmId,StudySchedule.level(m),m.attemptCount,m.correctCount,m.wrongCount,m.hardCount,m.boxLevel,m.nextReviewAt,m.lastReviewedAt,m.measuredCount==0?null:m.totalRecognitionMs/m.measuredCount);}
 private Session view(StudySession s){return new Session(s.id,s.phase.name(),s.puzzle,s.method,s.mode,ids(s),s.nextIndex,s.createdAt,attempts.findBySessionIdAndUserIdOrderBySessionIndex(s.id,s.userId).stream().map(a->new Result(a.algorithmId,a.outcome,a.recognitionMs)).toList());}
 public Session get(String user,String id){return view(owned(id,user));}
 private boolean weak(CaseMemory m,ProgressService.View p){return (p!=null&&p.review())||(m!=null&&(m.lastOutcome==StudySchedule.Outcome.HARD||(m.wrongCount>0&&m.boxLevel<3)));}
 private Map<String,CaseMemory> memoryMap(String user){Map<String,CaseMemory> out=new HashMap<>();memories.findByUserId(user).forEach(m->out.put(m.algorithmId,m));return out;}
 private Map<String,ProgressService.View> progressMap(String user){Map<String,ProgressService.View> out=new HashMap<>();progress.list(user).forEach(p->out.put(p.algorithmId(),p));return out;}
 @Transactional public Session create(Account user,String puzzle,String method,Mode mode,int size){
  if(size<3||size>5||mode==null)throw bad("Mỗi buổi chọn từ 3 đến 5 case");
  var candidates=scope(puzzle,method);var memory=memoryMap(user.id);var known=progressMap(user.id);long now=clock.millis();
  Set<String> recommended=new HashSet<>();if(method.isBlank()&&user.level==Account.Level.BEGINNER)roadmaps.plan(user).stages().forEach(s->recommended.addAll(s.caseIds()));
  var pool=candidates.stream().filter(c->{var m=memory.get(c.id);var p=known.get(c.id);return switch(mode){case WEAK->weak(m,p);case NEW->m==null&&(p==null||!p.learned());case SMART->true;};})
   .filter(c->recommended.isEmpty()||memory.containsKey(c.id)||(known.containsKey(c.id)&&(known.get(c.id).learned()||known.get(c.id).review()))||recommended.contains(c.id))
   .sorted(Comparator.<AlgorithmCase>comparingInt(c->{var m=memory.get(c.id);if(m!=null&&m.nextReviewAt<=now)return 0;if(weak(m,known.get(c.id)))return 1;if(m==null&&(known.get(c.id)==null||!known.get(c.id).learned()))return 2;return m==null?3:4;})
    .thenComparingLong(c->{var m=memory.get(c.id);return m==null?0:m.nextReviewAt;}).thenComparing((AlgorithmCase c)->{var m=memory.get(c.id);return m==null?0:-m.wrongCount;}).thenComparing(c->c.method).thenComparingInt(c->c.number)).limit(size).map(c->c.id).toList();
  if(pool.isEmpty())throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,"Chưa có case trong phạm vi này. Hãy đổi phương pháp hoặc chọn Ôn thông minh");
  var session=new StudySession();session.userId=user.id;session.puzzle=puzzle;session.method=method;session.mode=mode.name();session.caseIds=String.join(",",pool);session.createdAt=now;return view(sessions.saveAndFlush(session));
 }
 @Transactional public Session begin(String user,String id){accounts.lockForStudy(user).orElseThrow();var s=owned(id,user);if(s.phase==StudySession.Phase.LEARN){s.phase=StudySession.Phase.QUIZ;sessions.saveAndFlush(s);}return view(s);}
 private Saved response(String user,StudyAttempt a){var m=memories.findById(user+":"+a.algorithmId).orElseThrow();var p=progress.list(user).stream().filter(v->v.algorithmId().equals(a.algorithmId)).findFirst().orElseThrow();return new Saved(view(m),p,a.sessionId==null?null:view(owned(a.sessionId,user)));}
 @Transactional public Saved record(String user,AttemptInput input){
  if(input.eventId()==null||!input.eventId().matches("[a-fA-F0-9-]{36}"))throw bad("Mã lượt luyện không hợp lệ");
  try{UUID.fromString(input.eventId());}catch(IllegalArgumentException e){throw bad("Mã lượt luyện không hợp lệ");}
  if(input.outcome()==null||input.recognitionMs()<0||input.recognitionMs()>1800000)throw bad("Kết quả hoặc thời gian không hợp lệ");
  accounts.lockForStudy(user).orElseThrow();
  var prior=attempts.findById(input.eventId());
  if(prior.isPresent()){
   var old=prior.get();if(!old.userId.equals(user)||!old.algorithmId.equals(input.algorithmId())||old.outcome!=input.outcome()||old.recognitionMs!=input.recognitionMs()||!Objects.equals(old.sessionId,input.sessionId())||!Objects.equals(old.sessionIndex,input.sessionIndex()))throw new ResponseStatusException(HttpStatus.CONFLICT,"Lượt luyện đã được ghi với nội dung khác");
   return response(user,old);
  }
  AlgorithmCase c;try{c=catalog.get(input.algorithmId());}catch(NoSuchElementException e){throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Không tìm thấy case");}
  if(c.algorithm.isBlank())throw bad("Case chưa có công thức không được dùng để luyện");
  StudySession session=null;
  if(input.sessionId()!=null){session=owned(input.sessionId(),user);if(session.phase!=StudySession.Phase.QUIZ||!Objects.equals(input.sessionIndex(),session.nextIndex)||!ids(session).get(session.nextIndex).equals(c.id))throw new ResponseStatusException(HttpStatus.CONFLICT,"Buổi học đã chuyển sang case khác. Hãy tải lại để tiếp tục");}
  else if(input.sessionIndex()!=null)throw bad("Không có buổi học tương ứng");
  long now=clock.millis();var m=memories.findById(user+":"+c.id).orElseGet(()->{var n=new CaseMemory();n.id=user+":"+c.id;n.userId=user;n.algorithmId=c.id;return n;});
  StudySchedule.apply(m,input.outcome(),input.recognitionMs(),now);memories.saveAndFlush(m);
  var savedProgress=progress.put(user,c.id,input.outcome()==StudySchedule.Outcome.GOOD,null,input.outcome()!=StudySchedule.Outcome.GOOD);
  var attempt=new StudyAttempt();attempt.id=input.eventId();attempt.userId=user;attempt.algorithmId=c.id;attempt.outcome=input.outcome();attempt.recognitionMs=input.recognitionMs();attempt.createdAt=now;attempt.studyDate=Instant.ofEpochMilli(now).atZone(StudySchedule.ZONE).toLocalDate().toString();attempt.sessionId=input.sessionId();attempt.sessionIndex=input.sessionIndex();attempts.saveAndFlush(attempt);
  if(session!=null){session.nextIndex++;if(session.nextIndex==ids(session).size()){session.phase=StudySession.Phase.COMPLETE;session.finishedAt=now;}sessions.saveAndFlush(session);}
  return new Saved(view(m),savedProgress,session==null?null:view(session));
 }
 public Stats stats(Account user,String puzzle,String method){
  var cases=scope(puzzle,method);Set<String> scopeIds=new HashSet<>();cases.forEach(c->scopeIds.add(c.id));var map=memoryMap(user.id);var known=progressMap(user.id);var rows=map.values().stream().filter(m->scopeIds.contains(m.algorithmId)).toList();long now=clock.millis();
  long total=rows.stream().mapToLong(m->m.attemptCount).sum(),good=rows.stream().mapToLong(m->m.correctCount).sum(),wrong=rows.stream().mapToLong(m->m.wrongCount).sum(),hard=rows.stream().mapToLong(m->m.hardCount).sum(),measured=rows.stream().mapToLong(m->m.measuredCount).sum(),recognition=rows.stream().mapToLong(m->m.totalRecognitionMs).sum();
  int stable=(int)rows.stream().filter(m->StudySchedule.level(m).equals("STABLE")).count(),unfamiliar=(int)rows.stream().filter(m->StudySchedule.level(m).equals("UNFAMILIAR")).count();
  var mistakes=rows.stream().filter(m->m.wrongCount>0||m.hardCount>0).sorted(Comparator.<CaseMemory>comparingDouble(m->-(double)(m.wrongCount+m.hardCount)/m.attemptCount).thenComparingInt(m->-m.wrongCount).thenComparingLong(m->m.lastReviewedAt)).limit(10).map(this::view).toList();
  LocalDate today=LocalDate.now(clock.withZone(StudySchedule.ZONE));Map<String,Day> days=new LinkedHashMap<>();for(int i=13;i>=0;i--){String d=today.minusDays(i).toString();days.put(d,new Day(d,0,0,0));}
  if(!scopeIds.isEmpty())for(var d:attempts.daily(user.id,scopeIds,today.minusDays(13).toString(),StudySchedule.Outcome.GOOD,StudySchedule.Outcome.AGAIN))days.put(d.getStudyDate(),new Day(d.getStudyDate(),d.getAttempts(),d.getCorrect(),d.getWrong()));
  var active=sessions.findByUserIdAndPhaseNotOrderByCreatedAtDesc(user.id,StudySession.Phase.COMPLETE,PageRequest.of(0,3)).stream().map(this::view).toList();
  return new Stats(cases.size(),rows.size(),stable,rows.size()-stable-unfamiliar,unfamiliar,(int)rows.stream().filter(m->m.nextReviewAt<=now).count(),(int)cases.stream().filter(c->weak(map.get(c.id),known.get(c.id))).count(),(int)cases.stream().filter(c->!map.containsKey(c.id)&&(known.get(c.id)==null||!known.get(c.id).learned())).count(),total,good,wrong,hard,total==0?0:(int)(good*100/total),measured==0?null:recognition/measured,mistakes,List.copyOf(days.values()),active);
 }
}
