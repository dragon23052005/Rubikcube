package vn.speedcube.academy.timer;
import java.util.*;
import java.util.concurrent.Semaphore;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.worldcubeassociation.tnoodle.scrambles.*;
@Service
public class ScrambleService {
 public static final Set<String> PUZZLES=Set.of("2x2","3x3","4x4","5x5","sq1");
 private final ScrambleRepository rows;
 private final Semaphore capacity=new Semaphore(2);
 private final Map<String,long[]> requests=new HashMap<>();
 public record Generated(String id,String puzzle,String notation,String generator,String svg,long createdAt){}
 public ScrambleService(ScrambleRepository rows){this.rows=rows;}
 public static Puzzle puzzle(String code){return switch(code){case "2x2"->PuzzleRegistry.TWO.getScrambler();case "3x3"->PuzzleRegistry.THREE.getScrambler();case "4x4"->PuzzleRegistry.FOUR.getScrambler();case "5x5"->PuzzleRegistry.FIVE.getScrambler();case "sq1"->PuzzleRegistry.SQ1.getScrambler();default->throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Loại Rubik không hợp lệ");};}
 private synchronized void limit(String ip){
  long now=System.currentTimeMillis();requests.entrySet().removeIf(e->now-e.getValue()[0]>60_000);
  var usage=requests.get(ip);if(usage==null){if(requests.size()>=5000)throw busy();usage=new long[]{now,0};requests.put(ip,usage);}
  if(++usage[1]>60)throw busy();
 }
 private static ResponseStatusException busy(){return new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,"Bộ sinh scramble đang bận. Vui lòng thử lại sau vài giây.");}
 public Generated generate(String code,String ip){
  if(!PUZZLES.contains(code))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Loại Rubik không hợp lệ");limit(ip);
  if(!capacity.tryAcquire())throw busy();
  try{
   Puzzle p=puzzle(code);String notation,svg;
   // Serialize a puzzle's random generator; use FOUR, never FOUR_FAST.
   synchronized(p){notation=p.generateScramble();svg=p.drawScramble(notation,null).toString();}
   var row=new TimerScramble();row.puzzle=code;row.notation=notation;rows.saveAndFlush(row);
   return new Generated(row.id,code,notation,row.generator,svg,row.createdAt);
  }catch(InvalidScrambleException e){throw new IllegalStateException("TNoodle generated an invalid scramble",e);}
  finally{capacity.release();}
 }
}
