package vn.speedcube.academy;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.*;
import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;

@SpringBootTest(properties={"spring.datasource.url=jdbc:h2:mem:securitytests;MODE=PostgreSQL","spring.jpa.hibernate.ddl-auto=create-drop"})
@AutoConfigureMockMvc
class AccountSecurityTests {
 @Autowired MockMvc mvc;@Autowired ObjectMapper mapper;@Autowired AccountRepository accounts;@Autowired PasswordEncoder passwords;
 @Autowired ProgressRepository progress;@Autowired RoadmapService roadmaps;
 private Account account(String prefix){var a=new Account();a.email=prefix+UUID.randomUUID()+"@example.com";a.displayName="Người học thử";a.passwordHash=passwords.encode("ValidPassword2026!");return accounts.saveAndFlush(a);}
 private MockHttpSession login(Account a)throws Exception {
  return (MockHttpSession)mvc.perform(post("/api/auth/login").with(csrf()).param("email",a.email.toUpperCase(Locale.ROOT)).param("password","ValidPassword2026!")).andExpect(status().isOk()).andReturn().getRequest().getSession(false);
 }
 @Test void registrationHashesPasswordAndCannotAssignAdminRole()throws Exception {
  String email="New"+UUID.randomUUID()+"@Example.com";
  var body=mapper.writeValueAsString(Map.of("email",email,"displayName","Học viên","password","StrongPassword2026!","role","ADMIN","userId","attacker"));
  mvc.perform(post("/api/auth/register").with(csrf()).contentType("application/json").content(body)).andExpect(status().isCreated()).andExpect(jsonPath("$.role").value("USER")).andExpect(jsonPath("$.passwordHash").doesNotExist());
  var saved=accounts.findByEmail(email.toLowerCase(Locale.ROOT)).orElseThrow();assertThat(saved.role).isEqualTo(Account.Role.USER);assertThat(saved.passwordHash).doesNotContain("StrongPassword2026!");assertThat(passwords.matches("StrongPassword2026!",saved.passwordHash)).isTrue();
  mvc.perform(post("/api/auth/register").with(csrf()).contentType("application/json").content(body)).andExpect(status().isConflict());
 }
 @Test void invalidRegistrationAndCsrfAreRejected()throws Exception {
  mvc.perform(post("/api/auth/register").contentType("application/json").content("{}")).andExpect(status().isForbidden());
  mvc.perform(post("/api/auth/register").with(csrf()).contentType("application/json").content("{\"email\":\"bad\",\"displayName\":\"A\",\"password\":\"short\"}")).andExpect(status().isBadRequest());
  mvc.perform(post("/api/auth/register").with(csrf()).contentType("application/json").content(mapper.writeValueAsString(Map.of("email","long@example.com","displayName","Tên hợp lệ","password","ấ".repeat(30))))).andExpect(status().isBadRequest());
  mvc.perform(post("/api/auth/login").param("email","x@example.com").param("password","secret")).andExpect(status().isForbidden());
 }
 @Test void loginChangesSessionAndLogoutInvalidatesAuthentication()throws Exception {
  var a=account("login");var old=new MockHttpSession();String oldId=old.getId();
  var session=(MockHttpSession)mvc.perform(post("/api/auth/login").session(old).with(csrf()).param("email",a.email).param("password","ValidPassword2026!")).andExpect(status().isOk()).andReturn().getRequest().getSession(false);
  assertThat(session.getId()).isNotEqualTo(oldId);
  mvc.perform(get("/api/auth/me").session(session)).andExpect(jsonPath("$.authenticated").value(true)).andExpect(jsonPath("$.user.id").value(a.id)).andExpect(jsonPath("$.user.passwordHash").doesNotExist()).andExpect(header().string("Cache-Control","no-store"));
  mvc.perform(post("/api/auth/logout").session(session)).andExpect(status().isForbidden());
  mvc.perform(post("/api/auth/logout").session(session).with(csrf())).andExpect(status().isNoContent());assertThat(session.isInvalid()).isTrue();
  mvc.perform(get("/api/auth/me")).andExpect(jsonPath("$.authenticated").value(false));
 }
 @Test void wrongPasswordDoesNotAuthenticate()throws Exception {
  var a=account("wrong");mvc.perform(post("/api/auth/login").with(csrf()).param("email",a.email).param("password","incorrect")).andExpect(status().isUnauthorized()).andExpect(jsonPath("$.message").value("Email hoặc mật khẩu không đúng"));
 }
 @Test void progressBelongsToAccountAcrossSessionsAndCannotTargetAnotherOwner()throws Exception {
  var a=account("alice");var b=account("bob");var sa=login(a);var sb=login(b);
  mvc.perform(put("/api/progress/pll-4").session(sa).with(csrf()).contentType("application/json").content(mapper.writeValueAsString(Map.of("learned",true,"favorite",true,"review",false,"userId",b.id)))).andExpect(status().isOk()).andExpect(jsonPath("$.userId").doesNotExist());
  mvc.perform(get("/api/progress").session(sb)).andExpect(jsonPath("$.length()").value(0));
  mvc.perform(get("/api/progress").session(login(a))).andExpect(jsonPath("$[0].algorithmId").value("pll-4")).andExpect(jsonPath("$[0].learned").value(true));
  assertThat(progress.findByUserId(a.id)).hasSize(1);assertThat(progress.findByUserId(b.id)).isEmpty();
  mvc.perform(put("/api/progress/pll-4").session(sa).contentType("application/json").content("{\"learned\":false}")).andExpect(status().isForbidden());
  mvc.perform(put("/api/progress/pll-4").session(sa).with(csrf()).contentType("application/json").content("{\"learned\":true,\"review\":true}")).andExpect(status().isBadRequest());
 }
 @Test void importIsAtomicAndNeverDowngradesKnownCases()throws Exception {
  var a=account("import");var session=login(a);
  mvc.perform(put("/api/progress/oll-1").session(session).with(csrf()).contentType("application/json").content("{\"learned\":true}")).andExpect(status().isOk());
  mvc.perform(post("/api/progress/import").session(session).with(csrf()).contentType("application/json").content("{\"entries\":[{\"algorithmId\":\"oll-1\",\"review\":true,\"favorite\":true}]}" )).andExpect(status().isOk()).andExpect(jsonPath("$[0].learned").value(true)).andExpect(jsonPath("$[0].review").value(false)).andExpect(jsonPath("$[0].favorite").value(true));
  mvc.perform(post("/api/progress/import").session(session).with(csrf()).contentType("application/json").content("{\"entries\":[{\"algorithmId\":\"oll-2\",\"learned\":true},{\"algorithmId\":\"missing\",\"learned\":true}]}" )).andExpect(status().isNotFound());assertThat(progress.findByUserId(a.id)).hasSize(1);
  mvc.perform(put("/api/progress/zb-f2l-6").session(session).with(csrf()).contentType("application/json").content("{\"learned\":true}")).andExpect(status().isBadRequest());
 }
 @Test void profileRoadmapAndManualStagesArePersonalAndPersist()throws Exception {
  var a=account("plan");var b=account("otherplan");var session=login(a);
  mvc.perform(put("/api/account/profile").session(session).with(csrf()).contentType("application/json").content("{\"displayName\":\"Speedcuber\",\"level\":\"ADVANCED\",\"focusPuzzle\":\"5x5\",\"dailyMinutes\":30}")).andExpect(status().isOk()).andExpect(jsonPath("$.role").value("USER"));
  mvc.perform(get("/api/roadmap").session(session)).andExpect(jsonPath("$.user.focusPuzzle").value("5x5")).andExpect(jsonPath("$.total").value(5)).andExpect(jsonPath("$.stages[1].total").value(19));
  mvc.perform(put("/api/roadmap/stages/5x5-foundation").session(session).with(csrf()).contentType("application/json").content("{\"completed\":true}")).andExpect(status().isOk()).andExpect(jsonPath("$.completed").value(1));
  mvc.perform(get("/api/roadmap").session(login(a))).andExpect(jsonPath("$.stages[0].complete").value(true));
  mvc.perform(get("/api/roadmap").session(login(b))).andExpect(jsonPath("$.completed").value(0));
  mvc.perform(put("/api/roadmap/stages/5x5-l2c").session(session).with(csrf()).contentType("application/json").content("{\"completed\":true}")).andExpect(status().isBadRequest());
  mvc.perform(put("/api/account/profile").session(session).with(csrf()).contentType("application/json").content("{\"displayName\":\"Valid\",\"level\":\"ADMIN\",\"focusPuzzle\":\"9x9\",\"dailyMinutes\":0}")).andExpect(status().isBadRequest());
 }
 @Test void beginnerPracticeStageIsARealSubsetAndUpdatesFromLearnedCases()throws Exception {
  var a=account("starter");var session=login(a);
  var plan=roadmaps.plan(a);var stage=plan.stages().stream().filter(s->!s.manual()).findFirst().orElseThrow();assertThat(stage.caseIds()).hasSize(5).contains("pll-12");
  for(String id:stage.caseIds())mvc.perform(put("/api/progress/"+id).session(session).with(csrf()).contentType("application/json").content("{\"learned\":true}")).andExpect(status().isOk());
  assertThat(roadmaps.plan(a).stages().get(2).complete()).isTrue();
 }
 @Test void onlyAdminCanInspectUsersAndNoPasswordIsReturned()throws Exception {
  var user=account("user");var admin=account("admin");admin.role=Account.Role.ADMIN;accounts.saveAndFlush(admin);
  mvc.perform(get("/api/admin/users")).andExpect(status().isUnauthorized());
  mvc.perform(get("/api/admin/users").session(login(user))).andExpect(status().isForbidden());
  mvc.perform(get("/api/admin/users/"+admin.id).session(login(user))).andExpect(status().isForbidden());
  var session=login(admin);
  String json=mvc.perform(get("/api/admin/users").session(session)).andExpect(status().isOk()).andReturn().getResponse().getContentAsString();assertThat(json).doesNotContain("passwordHash","$2a$");
  mvc.perform(get("/api/admin/users/"+user.id).session(session)).andExpect(status().isOk()).andExpect(jsonPath("$.roadmap.user.id").value(user.id));
 }
 @Test void changingFavoriteDoesNotEraseLearningSavedFromAnotherSession()throws Exception {
  var a=account("partial");var one=login(a);var two=login(a);
  mvc.perform(put("/api/progress/oll-1").session(one).with(csrf()).contentType("application/json").content("{\"learned\":true}")).andExpect(status().isOk());
  mvc.perform(put("/api/progress/oll-1").session(two).with(csrf()).contentType("application/json").content("{\"favorite\":true}")).andExpect(status().isOk()).andExpect(jsonPath("$.learned").value(true)).andExpect(jsonPath("$.favorite").value(true));
 }
 @Test void staleAccountTabCannotWriteOrReadAfterAccountSwitch()throws Exception {
  var a=account("oldtab");var b=account("newtab");var session=login(b);
  mvc.perform(put("/api/progress/oll-1").session(session).with(csrf()).header("X-Academy-Account",a.id).contentType("application/json").content("{\"learned\":true}")).andExpect(status().isConflict()).andExpect(header().string("X-Academy-Account-Mismatch","true"));
  mvc.perform(get("/api/progress").session(session).header("X-Academy-Account",a.id)).andExpect(status().isConflict());assertThat(progress.findByUserId(b.id)).isEmpty();
 }
 @Test void authenticationRequestsAreRateLimited()throws Exception {
  var guard=new AuthRequestGuard();int[] allowed={0};
  for(int i=0;i<31;i++){
   var request=new org.springframework.mock.web.MockHttpServletRequest("POST","/api/auth/login");request.setRemoteAddr("192.0.2.10");var response=new org.springframework.mock.web.MockHttpServletResponse();
   guard.doFilter(request,response,(r,s)->allowed[0]++);
   if(i==30)assertThat(response.getStatus()).isEqualTo(429);
  }
  assertThat(allowed[0]).isEqualTo(30);
 }
 @Test void adminBootstrapHasNoDefaultAndNeverPromotesExistingUsersOrResetsPasswords() {
  var boot=new AdminBootstrap(accounts,passwords);
  org.springframework.test.util.ReflectionTestUtils.setField(boot,"email","bootstrap"+UUID.randomUUID()+"@example.com");
  org.springframework.test.util.ReflectionTestUtils.setField(boot,"password","BootstrapPassword2026!");
  boot.run(new org.springframework.boot.DefaultApplicationArguments());
  String email=(String)org.springframework.test.util.ReflectionTestUtils.getField(boot,"email");var admin=accounts.findByEmail(email).orElseThrow();assertThat(admin.role).isEqualTo(Account.Role.ADMIN);String hash=admin.passwordHash;
  org.springframework.test.util.ReflectionTestUtils.setField(boot,"password","DifferentPassword2026!");boot.run(new org.springframework.boot.DefaultApplicationArguments());assertThat(accounts.findByEmail(email).orElseThrow().passwordHash).isEqualTo(hash);
  var user=account("existing");org.springframework.test.util.ReflectionTestUtils.setField(boot,"email",user.email);boot.run(new org.springframework.boot.DefaultApplicationArguments());assertThat(accounts.findById(user.id).orElseThrow().role).isEqualTo(Account.Role.USER);
  org.springframework.test.util.ReflectionTestUtils.setField(boot,"password","          ");assertThatThrownBy(()->boot.run(new org.springframework.boot.DefaultApplicationArguments())).isInstanceOf(IllegalStateException.class);
 }
}
