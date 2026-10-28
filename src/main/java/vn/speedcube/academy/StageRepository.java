package vn.speedcube.academy;
import org.springframework.data.jpa.repository.JpaRepository;
public interface StageRepository extends JpaRepository<StageCompletion,String>{java.util.List<StageCompletion> findByUserId(String userId);}
