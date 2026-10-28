package vn.speedcube.academy.security.oauth;
import jakarta.persistence.*;
@Entity @Table(name="social_identities",uniqueConstraints={@UniqueConstraint(columnNames={"provider","subject"}),@UniqueConstraint(columnNames={"account_id","provider"})})
public class SocialIdentity {
 @Id public String id=java.util.UUID.randomUUID().toString();
 @Column(nullable=false,length=20) public String provider;
 @Column(nullable=false,length=255) public String subject;
 @Column(name="account_id",nullable=false,length=36) public String accountId;
 public long createdAt=System.currentTimeMillis();
 public SocialIdentity(){}
}
