package vn.speedcube.academy.security;
import vn.speedcube.academy.account.Account;
import vn.speedcube.academy.account.AccountRepository;
import org.springframework.web.filter.OncePerRequestFilter;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;
/** Reject stale tabs after another tab logs into a different account. This header grants no access. */
public class AccountIdentityGuard extends OncePerRequestFilter {
 private final AccountRepository accounts;
 public AccountIdentityGuard(AccountRepository a){accounts=a;}
 @Override protected void doFilterInternal(HttpServletRequest req,HttpServletResponse res,FilterChain chain)throws ServletException,IOException {
  String expected=req.getHeader("X-Academy-Account"),path=req.getRequestURI();
  if(expected!=null&&req.getUserPrincipal()!=null&&(path.startsWith("/api/progress")||path.startsWith("/api/account")||path.startsWith("/api/roadmap")||path.startsWith("/api/timer")||path.startsWith("/api/study")||path.startsWith("/api/admin"))){
   var account=accounts.findByEmail(req.getUserPrincipal().getName());
   if(account.isEmpty()||!account.get().id.equals(expected)){
    res.setStatus(409);res.setHeader("X-Academy-Account-Mismatch","true");res.setContentType("application/json;charset=UTF-8");res.getWriter().write("{\"message\":\"Tài khoản đã thay đổi ở tab khác. Vui lòng tải lại trang trước khi tiếp tục\"}");return;
   }
  }
  chain.doFilter(req,res);
 }
}
