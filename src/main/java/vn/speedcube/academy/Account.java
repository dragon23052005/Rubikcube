package vn.speedcube.academy;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
@Entity @Table(name="academy_accounts",uniqueConstraints=@UniqueConstraint(columnNames="email"))
public class Account {
 public enum Role { USER, ADMIN }
 public enum Level { BEGINNER, INTERMEDIATE, ADVANCED }
 @Id public String id=java.util.UUID.randomUUID().toString();
 @Column(nullable=false,length=254) public String email;
 @Column(nullable=false,length=60) public String displayName;
 @JsonIgnore @Column(nullable=false,length=100) public String passwordHash;
 @Enumerated(EnumType.STRING) @Column(nullable=false) public Role role=Role.USER;
 @Enumerated(EnumType.STRING) @Column(nullable=false) public Level level=Level.BEGINNER;
 @Column(nullable=false) public String focusPuzzle="3x3";
 public int dailyMinutes=15;
 public long createdAt=System.currentTimeMillis();
 public Account(){}
}
