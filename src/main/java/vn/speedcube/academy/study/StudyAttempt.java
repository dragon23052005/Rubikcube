package vn.speedcube.academy.study;
import jakarta.persistence.*;
@Entity @Table(indexes=@Index(name="idx_attempt_owner_date",columnList="user_id,study_date"),uniqueConstraints=@UniqueConstraint(columnNames={"session_id","session_index"}))
public class StudyAttempt {
 @Id @Column(length=36) public String id;
 @Column(name="user_id",nullable=false) public String userId;
 @Column(nullable=false) public String algorithmId;
 @Enumerated(EnumType.STRING) @Column(nullable=false) public StudySchedule.Outcome outcome;
 public long recognitionMs,createdAt;
 @Column(name="study_date",nullable=false,length=10) public String studyDate;
 @Column(name="session_id",length=36) public String sessionId;
 @Column(name="session_index") public Integer sessionIndex;
 public StudyAttempt(){}
}
