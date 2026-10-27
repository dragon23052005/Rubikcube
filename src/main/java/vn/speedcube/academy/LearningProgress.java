package vn.speedcube.academy;
import jakarta.persistence.*;
@Entity
public class LearningProgress {
 @Id public String id;
 public String algorithmId;
 public boolean learned, favorite, review;
 public long updatedAt;
 public LearningProgress(){}
}
