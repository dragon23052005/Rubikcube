package vn.speedcube.academy.timer;
import vn.speedcube.academy.account.AccountRepository;
import jakarta.validation.constraints.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.util.*;
@Service
public class TimerService {
 private final SolveRepository solves;private final ScrambleRepository scrambles;private final AccountRepository accounts;
 public TimerService(SolveRepository s,ScrambleRepository r,AccountRepository a){solves=s;scrambles=r;accounts=a;}
 public record Input(@NotBlank @Size(max=36) String id,@NotBlank @Size(max=36) String scrambleId,@Min(0) @Max(86_400_000) long elapsedMs,@Min(0) @Max(3_600_000) Long inspectionMs,@NotNull TimerSolve.Penalty penalty,@Min(0) long recordedAt){}
 public record Change(@NotNull TimerSolve.Penalty penalty,boolean deleted,@Min(0) long version){}
 public record View(String id,String puzzle,String scrambleId,String scramble,String generator,long elapsedMs,Long inspectionMs,TimerSolve.Penalty penalty,boolean deleted,long recordedAt,long version){}
 static View view(TimerSolve s){return new View(s.id,s.puzzle,s.scramble.id,s.scramble.notation,s.scramble.generator,s.elapsedMs,s.inspectionMs,s.penalty,s.deleted,s.recordedAt,s.version);}
 private static void uuid(String value){try{if(!UUID.fromString(value).toString().equals(value))throw new IllegalArgumentException();}catch(Exception e){throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Mã lượt bấm giờ không hợp lệ");}}
 @Transactional(readOnly=true) public Object history(String owner,String puzzle){
  if(!ScrambleService.PUZZLES.contains(puzzle))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Loại Rubik không hợp lệ");
  return Map.of("items",solves.findByUserIdAndPuzzleAndDeletedFalseOrderByRecordedAtDescIdDesc(owner,puzzle,PageRequest.of(0,200)).stream().map(TimerService::view).toList(),"total",solves.countByUserIdAndPuzzleAndDeletedFalse(owner,puzzle),"limit",200);
 }
 @Transactional public View save(String owner,Input input){
  uuid(input.id());uuid(input.scrambleId());
  accounts.lockForStudy(owner).orElseThrow(()->new ResponseStatusException(HttpStatus.UNAUTHORIZED));
  var existing=solves.findById(input.id());
  if(existing.isPresent()){
   var s=existing.get();if(!s.userId.equals(owner))throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Không tìm thấy lượt bấm giờ");
   if(!s.scramble.id.equals(input.scrambleId())||s.elapsedMs!=input.elapsedMs()/10*10||!Objects.equals(s.inspectionMs,input.inspectionMs())||s.recordedAt!=input.recordedAt())throw new ResponseStatusException(HttpStatus.CONFLICT,"Mã lượt bấm giờ đã được dùng cho kết quả khác");
   return view(s);
  }
  if(input.recordedAt()>System.currentTimeMillis()+300_000)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Thời điểm bấm giờ không hợp lệ");
  var scramble=scrambles.findById(input.scrambleId()).orElseThrow(()->new ResponseStatusException(HttpStatus.BAD_REQUEST,"Scramble không có trong hệ thống"));
  var s=new TimerSolve();s.id=input.id();s.userId=owner;s.puzzle=scramble.puzzle;s.scramble=scramble;s.elapsedMs=input.elapsedMs()/10*10;s.inspectionMs=input.inspectionMs();s.penalty=input.penalty();s.recordedAt=input.recordedAt();
  return view(solves.saveAndFlush(s));
 }
 @Transactional public View change(String owner,String id,Change input){
  accounts.lockForStudy(owner).orElseThrow(()->new ResponseStatusException(HttpStatus.UNAUTHORIZED));
  var s=solves.findByIdAndUserId(id,owner).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Không tìm thấy lượt bấm giờ"));
  if(s.version!=input.version())throw new ResponseStatusException(HttpStatus.CONFLICT,"Kết quả đã thay đổi ở tab khác. Vui lòng tải lại lịch sử.");
  s.penalty=input.penalty();s.deleted=input.deleted();return view(solves.saveAndFlush(s));
 }
}
