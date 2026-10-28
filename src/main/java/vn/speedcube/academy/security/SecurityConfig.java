package vn.speedcube.academy.security;
import vn.speedcube.academy.account.AccountRepository;
import vn.speedcube.academy.security.oauth.NoStoredSocialTokens;
import vn.speedcube.academy.security.oauth.SocialClients;
import vn.speedcube.academy.security.oauth.SocialFlows;
import vn.speedcube.academy.security.oauth.SocialLoginHandler;
import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import jakarta.servlet.DispatcherType;
@Configuration
public class SecurityConfig {
 @Bean PasswordEncoder passwordEncoder(){return new BCryptPasswordEncoder(12);}
 @Bean UserDetailsService userDetailsService(AccountRepository accounts){return email->{
  var a=accounts.findByEmail(email.trim().toLowerCase(java.util.Locale.ROOT)).orElseThrow(()->new UsernameNotFoundException("Thông tin đăng nhập không hợp lệ"));
  return User.withUsername(a.email).password(a.passwordHash).roles(a.role.name()).build();
 };}
 @Bean SecurityFilterChain security(HttpSecurity http,AccountRepository accounts,SocialClients clients,SocialFlows flows,SocialLoginHandler socialHandler) throws Exception {
  http.authorizeHttpRequests(a->a.dispatcherTypeMatchers(DispatcherType.ERROR,DispatcherType.FORWARD).permitAll()
   .requestMatchers("/api/admin/**","/admin").hasRole("ADMIN")
   .requestMatchers("/api/timer/solves","/api/timer/solves/**","/api/progress/**","/api/progress","/api/roadmap/**","/api/roadmap","/api/account/**","/api/study/**","/account","/roadmap","/study","/study-stats").authenticated()
   .anyRequest().permitAll())
   .requestCache(c->c.disable())
   .exceptionHandling(e->e.authenticationEntryPoint((req,res,ex)->{if(req.getRequestURI().startsWith("/api/")){res.setStatus(401);res.setContentType("application/json;charset=UTF-8");res.getWriter().write("{\"message\":\"Vui lòng đăng nhập để tiếp tục\"}");}else res.sendRedirect("/login?next="+java.net.URLEncoder.encode(req.getRequestURI(),java.nio.charset.StandardCharsets.UTF_8));})
    .accessDeniedHandler((req,res,ex)->{if(!req.getRequestURI().startsWith("/api/")){res.sendError(403);return;}res.setStatus(403);res.setContentType("application/json;charset=UTF-8");res.getWriter().write("{\"message\":\"Bạn không có quyền hoặc phiên bảo mật đã hết hạn. Vui lòng tải lại trang\"}");}))
   .formLogin(f->f.loginPage("/login").loginProcessingUrl("/api/auth/login").usernameParameter("email")
    .successHandler((req,res,auth)->{req.getSession().setAttribute("ACADEMY_AUTH_AT",System.currentTimeMillis());res.setContentType("application/json");res.getWriter().write("{\"authenticated\":true}");})
    .failureHandler((req,res,ex)->{res.setStatus(401);res.setContentType("application/json;charset=UTF-8");res.getWriter().write("{\"message\":\"Email hoặc mật khẩu không đúng\"}");}).permitAll())
   .logout(l->l.logoutUrl("/api/auth/logout").invalidateHttpSession(true).clearAuthentication(true).deleteCookies("JSESSIONID")
    .logoutSuccessHandler((req,res,auth)->res.setStatus(204)))
   .addFilterBefore(new AuthRequestGuard(),UsernamePasswordAuthenticationFilter.class)
   .addFilterAfter(new AccountIdentityGuard(accounts),org.springframework.security.web.access.intercept.AuthorizationFilter.class);
  if(clients.enabled())http.oauth2Login(o->o.loginPage("/login").authorizationEndpoint(a->a.authorizationRequestResolver(flows)).authorizedClientRepository(new NoStoredSocialTokens()).successHandler(socialHandler).failureHandler(socialHandler));
  // Session authentication and CSRF protection remain enabled, including login/logout.
  return http.build();
 }
}
