package vn.speedcube.academy;
import jakarta.persistence.*;
@Entity @Table(indexes=@Index(name="idx_stage_owner",columnList="user_id"))
public class StageCompletion {
 @Id public String id;
 @Column(name="user_id",nullable=false) public String userId;
 @Column(nullable=false) public String stageId;
 public long completedAt;
 public StageCompletion(){}
}
