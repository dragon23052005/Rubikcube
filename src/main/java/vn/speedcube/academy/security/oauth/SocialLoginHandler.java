package vn.speedcube.academy.security.oauth;
import vn.speedcube.academy.account.Account;
import vn.speedcube.academy.account.AccountRepository;
import org.springframework.stereotype.Component;
import org.springframework.security.core.*;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.*;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.authentication.*;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.util.*;
@Component
public class SocialLoginHandler implements AuthenticationSuccessHandler,AuthenticationFailureHandler {
 private final SocialAccounts social;private final SocialFlows flows;private final AccountRepository accounts;
 public SocialLoginHandler(SocialAccounts s,SocialFlows f,AccountRepository a){social=s;flows=f;accounts=a;}
 private void establish(Account account,String provider,HttpServletRequest request,HttpServletResponse response,boolean freshAuthentication){
  var principal=new DefaultOAuth2User(List.of(new SimpleGrantedAuthority("ROLE_"+account.role.name())),Map.of("academy_email",account.email,"academy_id",account.id),"academy_email");
  var local=new OAuth2AuthenticationToken(principal,principal.getAuthorities(),provider);
  var context=SecurityContextHolder.createEmptyContext();context.setAuthentication(local);SecurityContextHolder.setContext(context);new HttpSessionSecurityContextRepository().saveContext(context,request,response);if(freshAuthentication)request.getSession().setAttribute("ACADEMY_AUTH_AT",System.currentTimeMillis());
 }
 @Override public void onAuthenticationSuccess(HttpServletRequest request,HttpServletResponse response,Authentication authentication)throws IOException {
  var flow=flows.take(request);String provider=authentication instanceof OAuth2AuthenticationToken token?token.getAuthorizedClientRegistrationId():"";
  try{
   if(flow==null||!flow.provider().equals(provider)||!(authentication.getPrincipal() instanceof OAuth2User remote))throw new SocialAccounts.Rejected("session_expired");
   String subject,email,name;boolean verified=false;
   if(provider.equals("google")){
    if(!(remote instanceof OidcUser oidc))throw new SocialAccounts.Rejected("invalid_identity");subject=oidc.getSubject();email=oidc.getEmail();name=oidc.getFullName();verified=Boolean.TRUE.equals(oidc.getEmailVerified());
   }else{subject=remote.getAttribute("id");email=remote.getAttribute("email");name=remote.getAttribute("name");}
   var account=social.resolve(new SocialAccounts.Identity(provider,subject,email,verified,name),flow.accountId());establish(account,provider,request,response,true);
   response.sendRedirect(flow.accountId()==null?flow.next():"/account?social=linked");
  }catch(SocialAccounts.Rejected rejected){failed(request,response,flow,provider,rejected.code);}catch(RuntimeException failure){failed(request,response,flow,provider,"unable_to_sign_in");}
 }
 private void failed(HttpServletRequest request,HttpServletResponse response,SocialFlows.Flow flow,String provider,String code)throws IOException {
  SecurityContextHolder.clearContext();
  if(flow!=null&&flow.accountId()!=null){var account=accounts.findById(flow.accountId());if(account.isPresent()){establish(account.get(),provider,request,response,false);response.sendRedirect("/account?socialError="+code);return;}}
  var session=request.getSession(false);if(session!=null)session.invalidate();response.sendRedirect("/login?socialError="+code);
 }
 @Override public void onAuthenticationFailure(HttpServletRequest request,HttpServletResponse response,org.springframework.security.core.AuthenticationException exception)throws IOException {
  var flow=flows.take(request);failed(request,response,flow,flow==null?"google":flow.provider(),"cancelled_or_failed");
 }
}
