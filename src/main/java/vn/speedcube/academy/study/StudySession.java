package vn.speedcube.academy.study;
import jakarta.persistence.*;
@Entity @Table(indexes=@Index(name="idx_study_session_owner",columnList="user_id,created_at"))
public class StudySession {
 public enum Phase { LEARN, QUIZ, COMPLETE }
 @Id public String id=java.util.UUID.randomUUID().toString();
 @Column(name="user_id",nullable=false) public String userId;
 public String puzzle,method,mode;
 @Column(length=2000,nullable=false) public String caseIds;
 @Enumerated(EnumType.STRING) public Phase phase=Phase.LEARN;
 public int nextIndex;
 public long createdAt,finishedAt;
 public StudySession(){}
}
