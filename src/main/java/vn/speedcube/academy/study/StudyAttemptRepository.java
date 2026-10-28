package vn.speedcube.academy.study;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.*;
public interface StudyAttemptRepository extends JpaRepository<StudyAttempt,String>{
 List<StudyAttempt> findBySessionIdAndUserIdOrderBySessionIndex(String sessionId,String userId);
 interface Daily {String getStudyDate();long getAttempts();long getCorrect();long getWrong();}
 @Query("select a.studyDate as studyDate,count(a) as attempts,sum(case when a.outcome=:good then 1 else 0 end) as correct,sum(case when a.outcome=:again then 1 else 0 end) as wrong from StudyAttempt a where a.userId=:owner and a.algorithmId in :ids and a.studyDate>=:since group by a.studyDate order by a.studyDate")
 List<Daily> daily(@Param("owner") String owner,@Param("ids") Collection<String> ids,@Param("since") String since,@Param("good") StudySchedule.Outcome good,@Param("again") StudySchedule.Outcome again);
}
