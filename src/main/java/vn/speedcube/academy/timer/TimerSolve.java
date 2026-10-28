package vn.speedcube.academy.timer;
import jakarta.persistence.*;
@Entity @Table(name="timer_solve",indexes=@Index(columnList="user_id,puzzle,recorded_at"))
public class TimerSolve {
 public enum Penalty { NONE, PLUS2, DNF }
 @Id public String id;
 @Version public long version;
 @Column(nullable=false) public String userId;
 @Column(nullable=false) public String puzzle;
 @ManyToOne(optional=false) public TimerScramble scramble;
 public long elapsedMs;
 public Long inspectionMs;
 @Enumerated(EnumType.STRING) @Column(nullable=false) public Penalty penalty=Penalty.NONE;
 public boolean deleted;
 public long recordedAt;
 public long savedAt=System.currentTimeMillis();
}
