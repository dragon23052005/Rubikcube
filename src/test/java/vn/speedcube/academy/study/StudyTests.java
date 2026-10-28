package vn.speedcube.academy.study;
import vn.speedcube.academy.account.*;
import vn.speedcube.academy.progress.*;
import org.junit.jupiter.api.*;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
@SpringBootTest(properties={"spring.datasource.url=jdbc:h2:mem:studytests;MODE=MySQL","spring.jpa.hibernate.ddl-auto=create-drop"})
@AutoConfigureMockMvc @Import(StudyTests.TimeConfig.class)
class StudyTests {
 static class MutableClock extends Clock {volatile Instant now=Instant.parse("2026-10-28T08:00:00Z");public ZoneId getZone(){return ZoneOffset.UTC;}public Clock withZone(ZoneId z){return Clock.fixed(now,z);}public Instant instant(){return now;}}
 @TestConfiguration static class TimeConfig {@Bean @Primary Clock testReviewClock(){return new MutableClock();}}
 @Autowired StudyService study;@Autowired AccountRepository accounts;@Autowired ProgressService progress;@Autowired CaseMemoryRepository memories;@Autowired StudyAttemptRepository attempts;@Autowired PasswordEncoder passwords;@Autowired Clock clock;@Autowired MockMvc mvc;
 @BeforeEach void resetClock(){((MutableClock)clock).now=Instant.parse("2026-10-28T08:00:00Z");}
 Account learner(){var a=new Account();a.email="study-"+UUID.randomUUID()+"@example.test";a.displayName="Học viên";a.passwordHash=passwords.encode("StudyPassword2026!");return accounts.saveAndFlush(a);}
 StudyService.AttemptInput grade(StudyService.Session session,int index,StudySchedule.Outcome outcome){return new StudyService.AttemptInput(UUID.randomUUID().toString(),session.caseIds().get(index),outcome,2200,session.id(),index);}
 @Test void smallSessionPersistsLearningPhaseAndThenCompletesInOrder(){
  var a=learner();var s=study.create(a,"3x3","PLL",StudyService.Mode.SMART,3);assertThat(s.caseIds()).hasSize(3).doesNotHaveDuplicates();assertThat(study.get(a.id,s.id()).phase()).isEqualTo("LEARN");
  assertThatThrownBy(()->study.record(a.id,grade(s,0,StudySchedule.Outcome.GOOD))).isInstanceOf(org.springframework.web.server.ResponseStatusException.class);assertThat(memories.findByUserId(a.id)).isEmpty();
  study.begin(a.id,s.id());for(int i=0;i<3;i++)study.record(a.id,grade(s,i,i==1?StudySchedule.Outcome.AGAIN:StudySchedule.Outcome.GOOD));
  var complete=study.get(a.id,s.id());assertThat(complete.phase()).isEqualTo("COMPLETE");assertThat(complete.results()).hasSize(3);assertThat(complete.nextIndex()).isEqualTo(3);
  var stats=study.stats(a,"3x3","PLL");assertThat(stats.attempts()).isEqualTo(3);assertThat(stats.correct()).isEqualTo(2);assertThat(stats.wrong()).isEqualTo(1);assertThat(stats.averageRecognitionMs()).isEqualTo(2200);assertThat(stats.activeSessions()).isEmpty();
 }
 @Test void retryIsIdempotentAndCannotRewriteTheGrade(){var a=learner();var s=study.create(a,"3x3","PLL",StudyService.Mode.NEW,3);study.begin(a.id,s.id());var input=grade(s,0,StudySchedule.Outcome.GOOD);study.record(a.id,input);study.record(a.id,input);assertThat(study.stats(a,"3x3","PLL").attempts()).isEqualTo(1);assertThat(study.get(a.id,s.id()).nextIndex()).isEqualTo(1);assertThatThrownBy(()->study.record(a.id,new StudyService.AttemptInput(input.eventId(),input.algorithmId(),StudySchedule.Outcome.AGAIN,input.recognitionMs(),input.sessionId(),input.sessionIndex()))).isInstanceOf(org.springframework.web.server.ResponseStatusException.class);}
 @Test void concurrentRetryAlsoCountsOnlyOnce()throws Exception {var a=learner();var input=new StudyService.AttemptInput(UUID.randomUUID().toString(),"pll-1",StudySchedule.Outcome.GOOD,3000,null,null);var pool=Executors.newFixedThreadPool(2);var ready=new CountDownLatch(2);var go=new CountDownLatch(1);try{Callable<StudyService.Saved> task=()->{ready.countDown();go.await();return study.record(a.id,input);};var one=pool.submit(task);var two=pool.submit(task);assertThat(ready.await(5,TimeUnit.SECONDS)).isTrue();go.countDown();one.get(15,TimeUnit.SECONDS);two.get(15,TimeUnit.SECONDS);assertThat(study.stats(a,"3x3","PLL").attempts()).isEqualTo(1);}finally{pool.shutdownNow();}}
 @Test void sessionsAndStatsAreIsolatedByOwner(){var a=learner();var b=learner();var s=study.create(a,"3x3","PLL",StudyService.Mode.NEW,3);study.begin(a.id,s.id());assertThatThrownBy(()->study.get(b.id,s.id())).isInstanceOf(org.springframework.web.server.ResponseStatusException.class);assertThatThrownBy(()->study.record(b.id,grade(s,0,StudySchedule.Outcome.GOOD))).isInstanceOf(org.springframework.web.server.ResponseStatusException.class);assertThat(study.stats(b,"3x3","PLL").attempts()).isZero();}
 @Test void dueAndWeakCasesArePrioritizedAndEarlyGoodCannotBecomeStable(){var a=learner();study.record(a.id,new StudyService.AttemptInput(UUID.randomUUID().toString(),"pll-21",StudySchedule.Outcome.AGAIN,4000,null,null));((MutableClock)clock).now=clock.instant().plusSeconds(601);var s=study.create(a,"3x3","PLL",StudyService.Mode.SMART,3);assertThat(s.caseIds().get(0)).isEqualTo("pll-21");assertThat(study.create(a,"3x3","PLL",StudyService.Mode.WEAK,5).caseIds()).containsExactly("pll-21");for(int i=0;i<4;i++)study.record(a.id,new StudyService.AttemptInput(UUID.randomUUID().toString(),"pll-21",StudySchedule.Outcome.GOOD,2000,null,null));assertThat(study.stats(a,"3x3","PLL").stableCases()).isZero();}
 @Test void beginnersReceiveRoadmapCasesAndManualMarksDoNotInventHistory(){var a=learner();progress.put(a.id,"pll-4",true,null,null);var s=study.create(a,"3x3","",StudyService.Mode.NEW,5);assertThat(s.caseIds()).isSubsetOf("pll-4","pll-5","pll-6","pll-7","pll-12").doesNotContain("pll-4");assertThat(study.stats(a,"3x3","PLL").attempts()).isZero();}
 @Test void dailyBucketsUseVietnameseDateAndEmptyFormulasAreExcluded(){var a=learner();((MutableClock)clock).now=Instant.parse("2026-10-27T18:30:00Z");study.record(a.id,new StudyService.AttemptInput(UUID.randomUUID().toString(),"pll-1",StudySchedule.Outcome.GOOD,1200,null,null));var stats=study.stats(a,"3x3","PLL");assertThat(stats.days().get(13).date()).isEqualTo("2026-10-28");assertThat(stats.days().get(13).attempts()).isEqualTo(1);assertThatThrownBy(()->study.record(a.id,new StudyService.AttemptInput(UUID.randomUUID().toString(),"zb-f2l-6",StudySchedule.Outcome.GOOD,1000,null,null))).isInstanceOf(org.springframework.web.server.ResponseStatusException.class);}
 @Test void httpRequiresAuthenticationCsrfAndValidScope()throws Exception {
  mvc.perform(get("/api/study/stats")).andExpect(status().isUnauthorized());var a=learner();var session=(org.springframework.mock.web.MockHttpSession)mvc.perform(post("/api/auth/login").with(csrf()).param("email",a.email).param("password","StudyPassword2026!")).andReturn().getRequest().getSession(false);
  mvc.perform(post("/api/study/sessions").session(session).contentType("application/json").content("{}")).andExpect(status().isForbidden());
  mvc.perform(post("/api/study/sessions").session(session).with(csrf()).contentType("application/json").content("{\"puzzle\":\"2x2\",\"method\":\"PLL\",\"mode\":\"SMART\",\"size\":3}")).andExpect(status().isBadRequest());
  mvc.perform(get("/api/study/stats").session(session)).andExpect(status().isOk()).andExpect(jsonPath("$.attempts").value(0)).andExpect(header().string("Cache-Control","no-store"));
  mvc.perform(get("/api/study/stats").session(session).header("X-Academy-Account",UUID.randomUUID().toString())).andExpect(status().isConflict());
 }
}
