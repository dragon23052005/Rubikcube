package vn.speedcube.academy.study;
import org.junit.jupiter.api.Test;
import java.time.Duration;
import static org.assertj.core.api.Assertions.*;
class StudyScheduleTests {
 @Test void firstRecallSchedulesTomorrowWithoutClaimingStableMemory(){var m=new CaseMemory();StudySchedule.apply(m,StudySchedule.Outcome.GOOD,2000,1000);assertThat(m.boxLevel).isEqualTo(1);assertThat(m.nextReviewAt).isEqualTo(1000+Duration.ofDays(1).toMillis());assertThat(StudySchedule.level(m)).isEqualTo("LEARNING");}
 @Test void earlyRepetitionsDoNotAdvanceSchedule(){var m=new CaseMemory();StudySchedule.apply(m,StudySchedule.Outcome.GOOD,2000,1000);long due=m.nextReviewAt;for(int i=0;i<10;i++)StudySchedule.apply(m,StudySchedule.Outcome.GOOD,1000,2000+i);assertThat(m.correctCount).isEqualTo(11);assertThat(m.boxLevel).isEqualTo(1);assertThat(m.nextReviewAt).isEqualTo(due);}
 @Test void threeOnTimeRecallsReachStableAndFailureResetsIt(){var m=new CaseMemory();StudySchedule.apply(m,StudySchedule.Outcome.GOOD,1000,1000);StudySchedule.apply(m,StudySchedule.Outcome.GOOD,1000,m.nextReviewAt);StudySchedule.apply(m,StudySchedule.Outcome.GOOD,1000,m.nextReviewAt);assertThat(StudySchedule.level(m)).isEqualTo("STABLE");long now=m.lastReviewedAt+1000;StudySchedule.apply(m,StudySchedule.Outcome.AGAIN,3000,now);assertThat(m.boxLevel).isZero();assertThat(m.nextReviewAt).isEqualTo(now+600000);assertThat(StudySchedule.level(m)).isEqualTo("UNFAMILIAR");}
 @Test void partialRecallSchedulesSixHoursAndDoesNotCountAsCorrect(){var m=new CaseMemory();m.boxLevel=4;StudySchedule.apply(m,StudySchedule.Outcome.HARD,4000,1000);assertThat(m.boxLevel).isEqualTo(1);assertThat(m.correctCount).isZero();assertThat(m.hardCount).isEqualTo(1);assertThat(m.nextReviewAt).isEqualTo(1000+Duration.ofHours(6).toMillis());}
}
