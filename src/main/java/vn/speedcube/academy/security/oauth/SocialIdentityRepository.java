package vn.speedcube.academy.security.oauth;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface SocialIdentityRepository extends JpaRepository<SocialIdentity,String> {
 Optional<SocialIdentity> findByProviderAndSubject(String provider,String subject);
 Optional<SocialIdentity> findByAccountIdAndProvider(String accountId,String provider);
 List<SocialIdentity> findByAccountId(String accountId);
}
