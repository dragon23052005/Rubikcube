package vn.speedcube.academy.progress;
import jakarta.persistence.*;
@Entity @Table(indexes=@Index(name="idx_learning_owner",columnList="user_id"))
public class LearningProgress {
 @Id public String id;
 @Column(name="user_id") public String userId;
 @Version public Long version;
 public String algorithmId;
 public boolean learned, favorite, review;
 public long updatedAt;
 public LearningProgress(){}
}
