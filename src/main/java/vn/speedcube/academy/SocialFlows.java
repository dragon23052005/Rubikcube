package vn.speedcube.academy;
import org.springframework.stereotype.Component;
import org.springframework.security.oauth2.client.web.*;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.security.oauth2.core.*;
import jakarta.servlet.http.*;
import java.util.*;
@Component
public class SocialFlows implements OAuth2AuthorizationRequestResolver {
 public record Flow(String provider,String accountId,String next,long createdAt) implements java.io.Serializable{}
 private static final String FLOWS="academy.social.flows",PENDING="academy.social.pending";
 private final DefaultOAuth2AuthorizationRequestResolver delegate;
 public SocialFlows(SocialClients clients){delegate=new DefaultOAuth2AuthorizationRequestResolver(clients,"/oauth2/authorization");}
 public String link(HttpSession session,String provider,String accountId){
  String nonce=UUID.randomUUID().toString();synchronized(session){session.setAttribute(PENDING,Map.of("nonce",nonce,"flow",new Flow(provider,accountId,"/account",System.currentTimeMillis())));}return "/oauth2/authorization/"+provider+"?link="+nonce;
 }
 public static String safeNext(String next){
  if(next==null||next.length()>2000||next.contains("\\")||next.contains("\r")||next.contains("\n"))return "/roadmap";
  try{var uri=java.net.URI.create(next);if(uri.isAbsolute()||uri.getRawAuthority()!=null||!next.startsWith("/"))return "/roadmap";String path=uri.getPath();if(Set.of("/","/roadmap","/account","/progress","/practice","/favorites","/admin","/algorithms").contains(path)||path.matches("/algorithms/[a-z0-9-]+"))return next;}catch(IllegalArgumentException ignored){}
  return "/roadmap";
 }
 @SuppressWarnings("unchecked") private Map<String,Flow> flows(HttpSession session){var map=(Map<String,Flow>)session.getAttribute(FLOWS);if(map==null){map=new LinkedHashMap<>();session.setAttribute(FLOWS,map);}return map;}
 private OAuth2AuthorizationRequest remember(HttpServletRequest request,OAuth2AuthorizationRequest auth,String provider){
  if(auth==null)return null;
  var session=request.getSession();Flow flow=new Flow(provider,null,safeNext(request.getParameter("next")),System.currentTimeMillis());
  synchronized(session){
   String nonce=request.getParameter("link");
   if(nonce!=null){var pending=session.getAttribute(PENDING);session.removeAttribute(PENDING);if(!(pending instanceof Map<?,?> p)||!nonce.equals(p.get("nonce"))||!(p.get("flow") instanceof Flow intent)||!intent.provider().equals(provider)||System.currentTimeMillis()-intent.createdAt()>600000)throw new OAuth2AuthenticationException(new OAuth2Error("invalid_link_request"));flow=intent;}
   var map=flows(session);map.entrySet().removeIf(e->System.currentTimeMillis()-e.getValue().createdAt()>600000);while(map.size()>=8)map.remove(map.keySet().iterator().next());map.put(auth.getState(),flow);
  }
  return auth;
 }
 public OAuth2AuthorizationRequest resolve(HttpServletRequest request){var auth=delegate.resolve(request);String provider=auth==null?"":String.valueOf(auth.getAttributes().get("registration_id"));return remember(request,auth,provider);}
 public OAuth2AuthorizationRequest resolve(HttpServletRequest request,String registrationId){return remember(request,delegate.resolve(request,registrationId),registrationId);}
 public Flow take(HttpServletRequest request){var session=request.getSession(false);if(session==null)return null;synchronized(session){var flow=flows(session).remove(request.getParameter("state"));return flow!=null&&System.currentTimeMillis()-flow.createdAt()<=600000?flow:null;}}
}
