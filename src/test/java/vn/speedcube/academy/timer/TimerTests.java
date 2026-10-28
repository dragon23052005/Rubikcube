package vn.speedcube.academy.timer;
import vn.speedcube.academy.account.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import java.util.*;
import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
@SpringBootTest(properties={"spring.datasource.url=jdbc:h2:mem:timer;DB_CLOSE_DELAY=-1","spring.datasource.username=sa","spring.datasource.password=","spring.jpa.hibernate.ddl-auto=create-drop","ACADEMY_ADMIN_EMAIL=","ACADEMY_ADMIN_PASSWORD="})
@AutoConfigureMockMvc
class TimerTests {
 @Autowired TimerService service;@Autowired AccountService accounts;@Autowired ScrambleRepository scrambles;@Autowired SolveRepository solves;@Autowired MockMvc mvc;
 AccountService.View user(){return accounts.register(new AccountService.Registration(UUID.randomUUID()+"@timer.test","Timer QA","TimerPassword2026!"));}
 TimerScramble scramble(){var s=new TimerScramble();s.puzzle="3x3";s.notation="R U R' U' F2";return scrambles.saveAndFlush(s);}
 TimerService.Input input(String scramble){return new TimerService.Input(UUID.randomUUID().toString(),scramble,12349L,15000L,TimerSolve.Penalty.NONE,System.currentTimeMillis());}
 @Test void retriesDoNotDuplicateAndHistoryContainsTheStoredScramble(){var u=user();var s=scramble();var request=input(s.id);var first=service.save(u.id(),request);var retry=service.save(u.id(),request);assertThat(first.id()).isEqualTo(retry.id());assertThat(first.elapsedMs()).isEqualTo(12340);assertThat(first.scramble()).isEqualTo(s.notation);assertThat(solves.countByUserIdAndPuzzleAndDeletedFalse(u.id(),"3x3")).isEqualTo(1);}
 @Test void ownershipIsCheckedForReplayAndUpdates(){var a=user();var b=user();var request=input(scramble().id);var saved=service.save(a.id(),request);assertThatThrownBy(()->service.save(b.id(),request)).isInstanceOf(org.springframework.web.server.ResponseStatusException.class);assertThatThrownBy(()->service.change(b.id(),saved.id(),new TimerService.Change(TimerSolve.Penalty.DNF,false,saved.version()))).isInstanceOf(org.springframework.web.server.ResponseStatusException.class);assertThat(solves.countByUserIdAndPuzzleAndDeletedFalse(b.id(),"3x3")).isZero();}
 @Test void penaltiesSoftDeleteUndoAndStaleVersionAreHandled(){var u=user();var saved=service.save(u.id(),input(scramble().id));var changed=service.change(u.id(),saved.id(),new TimerService.Change(TimerSolve.Penalty.PLUS2,false,saved.version()));assertThat(changed.penalty()).isEqualTo(TimerSolve.Penalty.PLUS2);assertThatThrownBy(()->service.change(u.id(),saved.id(),new TimerService.Change(TimerSolve.Penalty.NONE,false,saved.version()))).isInstanceOf(org.springframework.web.server.ResponseStatusException.class);var removed=service.change(u.id(),saved.id(),new TimerService.Change(changed.penalty(),true,changed.version()));assertThat(solves.countByUserIdAndPuzzleAndDeletedFalse(u.id(),"3x3")).isZero();service.change(u.id(),saved.id(),new TimerService.Change(removed.penalty(),false,removed.version()));assertThat(solves.countByUserIdAndPuzzleAndDeletedFalse(u.id(),"3x3")).isEqualTo(1);}
 @Test void changedReplayAndNonexistentScrambleAreRejected(){var u=user();var request=input(scramble().id);service.save(u.id(),request);assertThatThrownBy(()->service.save(u.id(),new TimerService.Input(request.id(),request.scrambleId(),9999L,null,TimerSolve.Penalty.NONE,request.recordedAt()))).isInstanceOf(org.springframework.web.server.ResponseStatusException.class);assertThatThrownBy(()->service.save(u.id(),input(UUID.randomUUID().toString()))).isInstanceOf(org.springframework.web.server.ResponseStatusException.class);}
 @Test void httpProtectsPersonalResultsAndValidatesRequests()throws Exception{
  mvc.perform(get("/timer")).andExpect(status().isOk());mvc.perform(get("/api/timer/solves")).andExpect(status().isUnauthorized());
  mvc.perform(post("/api/timer/scramble").contentType("application/json").content("{\"puzzle\":\"3x3\"}")).andExpect(status().isForbidden());
  mvc.perform(post("/api/timer/scramble").with(csrf()).contentType("application/json").content("{\"puzzle\":\"bad\"}")).andExpect(status().isBadRequest());
  var u=user();var session=(org.springframework.mock.web.MockHttpSession)mvc.perform(post("/api/auth/login").with(csrf()).param("email",u.email()).param("password","TimerPassword2026!")).andReturn().getRequest().getSession(false);
  mvc.perform(get("/api/timer/solves").session(session)).andExpect(status().isOk()).andExpect(jsonPath("$.items.length()").value(0)).andExpect(header().string("Cache-Control","no-store"));
  mvc.perform(get("/api/timer/solves").session(session).header("X-Academy-Account",UUID.randomUUID().toString())).andExpect(status().isConflict());
  mvc.perform(post("/api/timer/solves").session(session).with(csrf()).contentType("application/json").content("{}")).andExpect(status().isBadRequest());
 }
}
