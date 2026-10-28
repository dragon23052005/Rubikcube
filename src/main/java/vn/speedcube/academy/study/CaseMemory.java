package vn.speedcube.academy.study;
import jakarta.persistence.*;
@Entity @Table(indexes=@Index(name="idx_memory_owner_due",columnList="user_id,next_review_at"))
public class CaseMemory {
 @Id public String id;
 @Column(name="user_id",nullable=false) public String userId;
 @Column(nullable=false) public String algorithmId;
 @Version public Long version;
 public int boxLevel,attemptCount,correctCount,wrongCount,hardCount,measuredCount;
 public long totalRecognitionMs,lastReviewedAt,nextReviewAt;
 @Enumerated(EnumType.STRING) public StudySchedule.Outcome lastOutcome;
 public CaseMemory(){}
}
