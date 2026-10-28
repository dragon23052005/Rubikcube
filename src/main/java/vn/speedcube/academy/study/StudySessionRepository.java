package vn.speedcube.academy.study;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;
import java.util.*;
public interface StudySessionRepository extends JpaRepository<StudySession,String>{
 Optional<StudySession> findByIdAndUserId(String id,String userId);
 List<StudySession> findByUserIdAndPhaseNotOrderByCreatedAtDesc(String userId,StudySession.Phase phase,Pageable page);
}
