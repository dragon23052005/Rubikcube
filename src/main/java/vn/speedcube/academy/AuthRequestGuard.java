package vn.speedcube.academy;
import org.springframework.web.filter.OncePerRequestFilter;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.util.*;
/** Bounded in-process rate limit. Forwarded IP headers are intentionally not trusted. */
public class AuthRequestGuard extends OncePerRequestFilter {
 private final Map<String,long[]> requests=new HashMap<>();
 private synchronized boolean allowed(String ip){
  long now=System.currentTimeMillis(),window=15*60*1000;
  requests.entrySet().removeIf(e->now-e.getValue()[0]>window);
  var row=requests.get(ip);
  if(row==null){if(requests.size()>=10000)return false;row=new long[]{now,0};requests.put(ip,row);}
  return ++row[1]<=30;
 }
 @Override protected void doFilterInternal(HttpServletRequest req,HttpServletResponse res,FilterChain chain)throws ServletException,IOException {
  String path=req.getRequestURI();
  if(path.startsWith("/api/auth/")||path.startsWith("/api/account")||path.startsWith("/api/progress")||path.startsWith("/api/roadmap")||path.startsWith("/api/admin"))res.setHeader("Cache-Control","no-store");
  if(req.getMethod().equals("POST")&&(path.equals("/api/auth/login")||path.equals("/api/auth/register"))){
   if(req.getContentLengthLong()>16384){res.sendError(413);return;}
   if(!allowed(req.getRemoteAddr())){res.setStatus(429);res.setHeader("Retry-After","900");res.setContentType("application/json;charset=UTF-8");res.getWriter().write("{\"message\":\"Quá nhiều lần thử. Vui lòng thử lại sau 15 phút\"}");return;}
   if(path.equals("/api/auth/login")){String password=req.getParameter("password");if(password!=null&&password.getBytes(java.nio.charset.StandardCharsets.UTF_8).length>72){res.setStatus(401);res.setContentType("application/json;charset=UTF-8");res.getWriter().write("{\"message\":\"Email hoặc mật khẩu không đúng\"}");return;}}
  }
  chain.doFilter(req,res);
 }
}
