package vn.speedcube.academy.timer;
import jakarta.persistence.*;
@Entity @Table(name="timer_scramble")
public class TimerScramble {
 @Id public String id=java.util.UUID.randomUUID().toString();
 @Column(nullable=false) public String puzzle;
 @Column(nullable=false,length=2000) public String notation;
 @Column(nullable=false) public String generator="TNoodle 0.20.0";
 public long createdAt=System.currentTimeMillis();
}
