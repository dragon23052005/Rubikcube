package vn.speedcube.academy.study;
import java.time.*;
public final class StudySchedule {
 public enum Outcome { AGAIN, HARD, GOOD }
 public static final ZoneId ZONE=ZoneId.of("Asia/Ho_Chi_Minh");
 private static final int[] DAYS={1,3,7,14,30};
 private StudySchedule(){}
 public static void apply(CaseMemory memory,Outcome outcome,long recognitionMs,long now){
  boolean scheduled=memory.attemptCount==0||now>=memory.nextReviewAt;
  memory.attemptCount++;memory.lastOutcome=outcome;memory.lastReviewedAt=now;
  if(recognitionMs>0){memory.totalRecognitionMs+=recognitionMs;memory.measuredCount++;}
  switch(outcome){
   case AGAIN->{memory.wrongCount++;memory.boxLevel=0;memory.nextReviewAt=now+Duration.ofMinutes(10).toMillis();}
   case HARD->{memory.hardCount++;memory.boxLevel=Math.min(1,Math.max(0,memory.boxLevel-1));memory.nextReviewAt=now+Duration.ofHours(6).toMillis();}
   case GOOD->{memory.correctCount++;if(scheduled){memory.boxLevel=Math.min(5,memory.boxLevel+1);memory.nextReviewAt=now+Duration.ofDays(DAYS[memory.boxLevel-1]).toMillis();}}
  }
 }
 public static String level(CaseMemory m){return m.lastOutcome==Outcome.AGAIN?"UNFAMILIAR":m.boxLevel>=3?"STABLE":"LEARNING";}
}
