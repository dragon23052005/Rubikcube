package vn.speedcube.academy;
import org.junit.jupiter.api.*;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.*;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.core.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.*;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jose.jwk.*;
import com.nimbusds.jose.jwk.gen.RSAKeyGenerator;
import com.nimbusds.jwt.*;
import java.net.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;

/** Real authorization-code/token/user-info exchanges against a local provider, never live user accounts. */
@SpringBootTest(properties={"spring.datasource.url=jdbc:h2:mem:socialtests;MODE=PostgreSQL","spring.jpa.hibernate.ddl-auto=create-drop"})
@AutoConfigureMockMvc @Import(SocialLoginTests.Providers.class)
class SocialLoginTests {
 static final ObjectMapper JSON=new ObjectMapper();static final HttpServer SERVER;static final RSAKey KEY;static final String ISSUER;
 static volatile String subject,email,nonce;
 static {
  try {
   KEY=new RSAKeyGenerator(2048).keyID("qa-signing-key").generate();SERVER=HttpServer.create(new InetSocketAddress("127.0.0.1",0),0);ISSUER="http://127.0.0.1:"+SERVER.getAddress().getPort();
   SERVER.createContext("/jwks",e->reply(e,new JWKSet(KEY.toPublicJWK()).toJSONObject()));
   SERVER.createContext("/token/google",e->{try{
    var params=query(new String(e.getRequestBody().readAllBytes(),StandardCharsets.UTF_8));
    if(!"authorization_code".equals(params.get("grant_type")))throw new IllegalArgumentException();
    var claims=new JWTClaimsSet.Builder().issuer(ISSUER).audience("qa-google-client").subject(subject).issueTime(new Date()).expirationTime(new Date(System.currentTimeMillis()+300000)).claim("nonce","bad-nonce".equals(params.get("code"))?"invalid-nonce":nonce).claim("email",email).claim("email_verified",true).claim("name","Người học Google").claim("role","ADMIN").build();
    var jwt=new SignedJWT(new JWSHeader.Builder(JWSAlgorithm.RS256).keyID(KEY.getKeyID()).build(),claims);jwt.sign(new RSASSASigner(KEY));reply(e,Map.of("access_token","qa-google-token","token_type","Bearer","expires_in",300,"scope","openid profile email","id_token",jwt.serialize()));
   }catch(Exception failure){e.sendResponseHeaders(500,-1);e.close();}});
   SERVER.createContext("/userinfo/google",e->reply(e,Map.of("sub",subject,"email",email,"email_verified",true,"name","Người học Google")));
   SERVER.createContext("/token/facebook",e->reply(e,Map.of("access_token","qa-facebook-token","token_type","Bearer","expires_in",300)));
   SERVER.createContext("/userinfo/facebook",e->{Map<String,Object> data=new HashMap<>();data.put("id",subject);data.put("name","Người học Facebook");data.put("role","ADMIN");if(email!=null)data.put("email",email);reply(e,data);});
   SERVER.start();
  }catch(Exception e){throw new ExceptionInInitializerError(e);}
 }
 static void reply(HttpExchange exchange,Object value)throws IOException {byte[] data=JSON.writeValueAsBytes(value);exchange.getResponseHeaders().set("Content-Type","application/json");exchange.sendResponseHeaders(200,data.length);exchange.getResponseBody().write(data);exchange.close();}
 static Map<String,String> query(String text){Map<String,String> out=new HashMap<>();if(text!=null)for(String pair:text.split("&")){var parts=pair.split("=",2);out.put(URLDecoder.decode(parts[0],StandardCharsets.UTF_8),parts.length>1?URLDecoder.decode(parts[1],StandardCharsets.UTF_8):"");}return out;}
 @TestConfiguration static class Providers {
  @Bean @Primary SocialClients qaClients(){
   var google=ClientRegistration.withRegistrationId("google").clientId("qa-google-client").clientSecret("qa-server-only-secret").authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE).clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC).redirectUri("http://localhost/login/oauth2/code/google").scope("openid","profile","email").authorizationUri(ISSUER+"/authorize/google").tokenUri(ISSUER+"/token/google").issuerUri(ISSUER).jwkSetUri(ISSUER+"/jwks").userInfoUri(ISSUER+"/userinfo/google").userNameAttributeName("sub").clientName("Google").build();
   var facebook=ClientRegistration.withRegistrationId("facebook").clientId("qa-facebook-client").clientSecret("qa-server-only-secret").authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE).clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_POST).redirectUri("http://localhost/login/oauth2/code/facebook").scope("public_profile","email").authorizationUri(ISSUER+"/authorize/facebook").tokenUri(ISSUER+"/token/facebook").userInfoUri(ISSUER+"/userinfo/facebook").userNameAttributeName("id").clientName("Facebook").build();
   Map<String,ClientRegistration> map=Map.of("google",google,"facebook",facebook);
   return new SocialClients("http://localhost","","","","",""){
    public ClientRegistration findByRegistrationId(String id){return map.get(id);}
    public Iterator<ClientRegistration> iterator(){return map.values().iterator();}
    public boolean enabled(){return true;}
    public List<Map<String,Object>> status(){return List.of(Map.of("id","google","name","Google","enabled",true),Map.of("id","facebook","name","Facebook","enabled",true));}
   };
  }
 }
 @Autowired MockMvc mvc;@Autowired AccountRepository accounts;@Autowired SocialIdentityRepository identities;@Autowired SocialAccounts social;@Autowired PasswordEncoder passwords;@Autowired ProgressRepository progress;
 @BeforeEach void attributes(){subject="provider-"+UUID.randomUUID();email="social-"+UUID.randomUUID()+"@example.com";nonce="";}
 @AfterAll static void stop(){SERVER.stop(0);}
 record Start(MockHttpSession session,String state,String provider){}
 Start start(String provider,MockHttpSession session,String link)throws Exception {
  var request=get("/oauth2/authorization/"+provider).param("next","/progress");if(session!=null)request.session(session);if(link!=null)request.param("link",link);
  var result=mvc.perform(request).andExpect(status().is3xxRedirection()).andReturn();var params=query(URI.create(result.getResponse().getHeader("Location")).getRawQuery());nonce=params.get("nonce");assertThat(params.get("state")).isNotBlank();return new Start((MockHttpSession)result.getRequest().getSession(false),params.get("state"),provider);
 }
 MvcResult callback(Start start,String code)throws Exception {return mvc.perform(get("/login/oauth2/code/"+start.provider()).session(start.session()).param("code",code).param("state",start.state())).andExpect(status().is3xxRedirection()).andReturn();}
 Account local(){var a=new Account();a.email="local-"+UUID.randomUUID()+"@example.com";a.displayName="Người học có sẵn";a.passwordHash=passwords.encode("LocalPassword2026!");return accounts.saveAndFlush(a);}
 MockHttpSession passwordLogin(Account a)throws Exception {return (MockHttpSession)mvc.perform(post("/api/auth/login").with(csrf()).param("email",a.email).param("password","LocalPassword2026!")).andExpect(status().isOk()).andReturn().getRequest().getSession(false);}
 String link(MockHttpSession session,String provider)throws Exception {String body=mvc.perform(post("/api/account/social/"+provider+"/link").session(session).with(csrf())).andExpect(status().isOk()).andReturn().getResponse().getContentAsString();return query(URI.create(JSON.readTree(body).get("redirect").asText()).getRawQuery()).get("link");}
 @Test void googleOidcCodeExchangeCreatesUserAndPreservesProgressOnReturn()throws Exception {
  var start=start("google",null,null);String oldId=start.session().getId();var result=callback(start,"valid-code");assertThat(result.getResponse().getRedirectedUrl()).isEqualTo("/progress");var session=(MockHttpSession)result.getRequest().getSession(false);assertThat(session.getId()).isNotEqualTo(oldId);
  var account=accounts.findByEmail(email).orElseThrow();assertThat(account.role).isEqualTo(Account.Role.USER);
  mvc.perform(get("/api/auth/me").session(session)).andExpect(jsonPath("$.user.id").value(account.id)).andExpect(jsonPath("$.user.role").value("USER"));
  mvc.perform(get("/api/admin/users").session(session)).andExpect(status().isForbidden());
  mvc.perform(put("/api/progress/oll-1").session(session).with(csrf()).contentType("application/json").content("{\"learned\":true}")).andExpect(status().isOk());
  var again=callback(start("google",null,null),"valid-code");var newSession=(MockHttpSession)again.getRequest().getSession(false);
  mvc.perform(get("/api/progress").session(newSession)).andExpect(jsonPath("$[0].learned").value(true));assertThat(identities.findByProviderAndSubject("google",subject).orElseThrow().accountId).isEqualTo(account.id);
 }
 @Test void facebookAuthorizationCodeCreatesOnlyUserRole()throws Exception {
  var result=callback(start("facebook",null,null),"valid-code");var session=(MockHttpSession)result.getRequest().getSession(false);
  mvc.perform(get("/api/auth/me").session(session)).andExpect(jsonPath("$.authenticated").value(true)).andExpect(jsonPath("$.user.role").value("USER"));
  assertThat(identities.findByProviderAndSubject("facebook",subject)).isPresent();
 }
 @Test void verifiedGoogleEmailDoesNotAutoLinkExistingPasswordAccount()throws Exception {
  var a=local();email=a.email;var result=callback(start("google",null,null),"valid-code");assertThat(result.getResponse().getRedirectedUrl()).isEqualTo("/login?socialError=email_exists");assertThat(identities.findByProviderAndSubject("google",subject)).isEmpty();assertThat(accounts.findByEmail(email).orElseThrow().id).isEqualTo(a.id);
  mvc.perform(get("/api/progress")).andExpect(status().isUnauthorized());
 }
 @Test void explicitFacebookLinkKeepsExistingIdProgressAndSupportsMissingEmail()throws Exception {
  var a=local();var session=passwordLogin(a);
  mvc.perform(put("/api/progress/pll-4").session(session).with(csrf()).contentType("application/json").content("{\"learned\":true}")).andExpect(status().isOk());
  email=null;var result=callback(start("facebook",session,link(session,"facebook")),"valid-code");assertThat(result.getResponse().getRedirectedUrl()).isEqualTo("/account?social=linked");var linked=(MockHttpSession)result.getRequest().getSession(false);
  mvc.perform(get("/api/auth/me").session(linked)).andExpect(jsonPath("$.user.id").value(a.id));mvc.perform(get("/api/progress").session(linked)).andExpect(jsonPath("$[0].algorithmId").value("pll-4"));
  mvc.perform(get("/api/account/social").session(linked)).andExpect(jsonPath("$[1].linked").value(true));
 }
 @Test void identityAlreadyUsedCannotBeMovedAndOriginalSessionIsRestored()throws Exception {
  var owner=local();var target=local();var identity=new SocialIdentity();identity.provider="facebook";identity.subject=subject;identity.accountId=owner.id;identities.saveAndFlush(identity);
  var session=passwordLogin(target);var result=callback(start("facebook",session,link(session,"facebook")),"valid-code");assertThat(result.getResponse().getRedirectedUrl()).isEqualTo("/account?socialError=identity_in_use");
  mvc.perform(get("/api/auth/me").session((MockHttpSession)result.getRequest().getSession(false))).andExpect(jsonPath("$.user.id").value(target.id));assertThat(identities.findByProviderAndSubject("facebook",subject).orElseThrow().accountId).isEqualTo(owner.id);
 }
 @Test void invalidStateOrGoogleNonceDoesNotCreateAccount()throws Exception {
  var start=start("google",null,null);mvc.perform(get("/login/oauth2/code/google").session(start.session()).param("code","valid-code").param("state","wrong-state")).andExpect(redirectedUrl("/login?socialError=cancelled_or_failed"));assertThat(identities.findByProviderAndSubject("google",subject)).isEmpty();
  var result=callback(start("google",null,null),"bad-nonce");assertThat(result.getResponse().getRedirectedUrl()).isEqualTo("/login?socialError=cancelled_or_failed");assertThat(identities.findByProviderAndSubject("google",subject)).isEmpty();
 }
 @Test void newFacebookWithoutEmailIsRejectedAndLinkRequiresRecentCsrfAuthenticatedSession()throws Exception {
  email=null;var result=callback(start("facebook",null,null),"valid-code");assertThat(result.getResponse().getRedirectedUrl()).isEqualTo("/login?socialError=email_missing");
  var session=passwordLogin(local());mvc.perform(post("/api/account/social/google/link").session(session)).andExpect(status().isForbidden());session.setAttribute("ACADEMY_AUTH_AT",System.currentTimeMillis()-700000);
  mvc.perform(post("/api/account/social/google/link").session(session).with(csrf())).andExpect(status().isConflict());
 }
 @Test void safeRedirectsAndOptionalCredentialsDoNotExposeSecretsOrBreakPasswordLogin()throws Exception {
  assertThat(SocialFlows.safeNext("//evil.example/path")).isEqualTo("/roadmap");assertThat(SocialFlows.safeNext("https://evil.example")).isEqualTo("/roadmap");assertThat(SocialFlows.safeNext("/\\evil.example")).isEqualTo("/roadmap");assertThat(SocialFlows.safeNext("/practice?stage=3x3-starter-pll")).isEqualTo("/practice?stage=3x3-starter-pll");
  var empty=new SocialClients("http://localhost:8080","","","","","");assertThat(empty.enabled()).isFalse();assertThat(empty.findByRegistrationId("google")).isNull();
  String json=mvc.perform(get("/api/auth/providers")).andExpect(status().isOk()).andReturn().getResponse().getContentAsString();assertThat(json).contains("Google","Facebook").doesNotContain("qa-server-only-secret","clientSecret","clientId");
 }
 @Test void socialServiceRejectsUnverifiedGoogleAndNeverReplacesExistingProviderLink(){
  assertThatThrownBy(()->social.resolve(new SocialAccounts.Identity("google",subject,email,false,"Tên"),null)).isInstanceOf(SocialAccounts.Rejected.class);
  var a=local();social.resolve(new SocialAccounts.Identity("google",subject,email,true,"Tên"),a.id);
  assertThatThrownBy(()->social.resolve(new SocialAccounts.Identity("google","another-sub",email,true,"Tên"),a.id)).isInstanceOf(SocialAccounts.Rejected.class);
 }
}
