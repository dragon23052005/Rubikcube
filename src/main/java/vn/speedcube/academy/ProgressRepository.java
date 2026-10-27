package vn.speedcube.academy;
import org.springframework.data.jpa.repository.JpaRepository;
public interface ProgressRepository extends JpaRepository<LearningProgress,String>{java.util.List<LearningProgress> findByIdStartingWith(String prefix);}
