package vn.speedcube.academy;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.client.registration.*;
import org.springframework.security.oauth2.core.*;
import java.util.*;
import java.net.URI;
/** Empty configuration keeps password login working without contacting providers at startup. */
@Component
public class SocialClients implements ClientRegistrationRepository,Iterable<ClientRegistration> {
 private final Map<String,ClientRegistration> clients=new LinkedHashMap<>();
 public SocialClients(@Value("${academy.oauth.base-url:http://localhost:8080}") String base,
  @Value("${academy.oauth.google.client-id:}") String googleId,@Value("${academy.oauth.google.client-secret:}") String googleSecret,
  @Value("${academy.oauth.facebook.client-id:}") String facebookId,@Value("${academy.oauth.facebook.client-secret:}") String facebookSecret,
  @Value("${academy.oauth.facebook.graph-version:}") String version){
  boolean google=!googleId.isBlank()&&!googleSecret.isBlank();
  boolean facebook=!facebookId.isBlank()&&!facebookSecret.isBlank()&&version.matches("v\\d+\\.\\d+");
  if(!google&&!facebook)return;
  URI uri=URI.create(base);
  if(uri.getHost()==null||uri.getUserInfo()!=null||uri.getQuery()!=null||uri.getFragment()!=null||(!uri.getPath().isEmpty()&&!uri.getPath().equals("/"))||!("https".equals(uri.getScheme())||("http".equals(uri.getScheme())&&Set.of("localhost","127.0.0.1").contains(uri.getHost()))))throw new IllegalArgumentException("APP_BASE_URL cần là origin HTTPS hoặc localhost HTTP, không kèm đường dẫn");
  String origin=base.replaceAll("/+$","");
  if(google)clients.put("google",ClientRegistration.withRegistrationId("google").clientId(googleId).clientSecret(googleSecret).clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC).authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE).redirectUri(origin+"/login/oauth2/code/google").scope("openid","profile","email").authorizationUri("https://accounts.google.com/o/oauth2/v2/auth").tokenUri("https://oauth2.googleapis.com/token").jwkSetUri("https://www.googleapis.com/oauth2/v3/certs").issuerUri("https://accounts.google.com").userInfoUri("https://openidconnect.googleapis.com/v1/userinfo").userNameAttributeName("sub").clientName("Google").build());
  if(facebook)clients.put("facebook",ClientRegistration.withRegistrationId("facebook").clientId(facebookId).clientSecret(facebookSecret).clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_POST).authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE).redirectUri(origin+"/login/oauth2/code/facebook").scope("public_profile","email").authorizationUri("https://www.facebook.com/"+version+"/dialog/oauth").tokenUri("https://graph.facebook.com/"+version+"/oauth/access_token").userInfoUri("https://graph.facebook.com/"+version+"/me?fields=id,name,email").userNameAttributeName("id").clientName("Facebook").build());
 }
 public ClientRegistration findByRegistrationId(String id){return clients.get(id);}
 public Iterator<ClientRegistration> iterator(){return clients.values().iterator();}
 public boolean enabled(){return !clients.isEmpty();}
 public List<Map<String,Object>> status(){return List.of(Map.of("id","google","name","Google","enabled",clients.containsKey("google")),Map.of("id","facebook","name","Facebook","enabled",clients.containsKey("facebook")));}
}
