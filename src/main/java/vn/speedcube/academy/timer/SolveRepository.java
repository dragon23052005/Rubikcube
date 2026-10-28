package vn.speedcube.academy.timer;
import java.util.*;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
public interface SolveRepository extends JpaRepository<TimerSolve,String>{
 @org.springframework.data.jpa.repository.EntityGraph(attributePaths="scramble")
 List<TimerSolve> findByUserIdAndPuzzleAndDeletedFalseOrderByRecordedAtDescIdDesc(String userId,String puzzle,Pageable page);
 long countByUserIdAndPuzzleAndDeletedFalse(String userId,String puzzle);
 Optional<TimerSolve> findByIdAndUserId(String id,String userId);
}
