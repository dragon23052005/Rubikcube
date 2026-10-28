package vn.speedcube.academy.progress;
import org.springframework.data.jpa.repository.JpaRepository;
public interface ProgressRepository extends JpaRepository<LearningProgress,String>{
 java.util.List<LearningProgress> findByUserId(String userId);
 long countByUserIdAndLearnedTrue(String userId);
 interface LearnedCount {String getUserId();long getLearned();}
 @org.springframework.data.jpa.repository.Query("select p.userId as userId, count(p) as learned from LearningProgress p where p.userId in :ids and p.learned=true group by p.userId")
 java.util.List<LearnedCount> learnedCounts(@org.springframework.data.repository.query.Param("ids") java.util.Collection<String> ids);
}
