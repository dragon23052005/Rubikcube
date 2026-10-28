package vn.speedcube.academy.security.oauth;
import vn.speedcube.academy.account.Account;
import vn.speedcube.academy.account.AccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.*;
@Service
public class SocialAccounts {
 public static class Rejected extends RuntimeException {public final String code;public Rejected(String c){super(c);code=c;}}
 public record Identity(String provider,String subject,String email,boolean emailVerified,String name){}
 private final AccountRepository accounts;private final SocialIdentityRepository identities;private final PasswordEncoder passwords;
 public SocialAccounts(AccountRepository a,SocialIdentityRepository s,PasswordEncoder p){accounts=a;identities=s;passwords=p;}
 @Transactional public Account resolve(Identity identity,String linkAccountId){
  if(!Set.of("google","facebook").contains(identity.provider())||identity.subject()==null||identity.subject().isBlank()||identity.subject().length()>255)throw new Rejected("invalid_identity");
  var existing=identities.findByProviderAndSubject(identity.provider(),identity.subject());
  if(linkAccountId!=null){
   var target=accounts.findById(linkAccountId).orElseThrow(()->new Rejected("link_expired"));
   if(existing.isPresent()&&!existing.get().accountId.equals(target.id))throw new Rejected("identity_in_use");
   var linked=identities.findByAccountIdAndProvider(target.id,identity.provider());
   if(linked.isPresent()&&!linked.get().subject.equals(identity.subject()))throw new Rejected("provider_already_linked");
   if(existing.isEmpty())save(identity,target);
   return target;
  }
  if(existing.isPresent())return accounts.findById(existing.get().accountId).orElseThrow(()->new Rejected("invalid_identity"));
  if(identity.provider().equals("google")&&!identity.emailVerified())throw new Rejected("email_unverified");
  String email=identity.email()==null?"":identity.email().strip().toLowerCase(Locale.ROOT);
  if(email.length()>254||!email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"))throw new Rejected("email_missing");
  // Email alone never links identities, including a verified Google email.
  if(accounts.existsByEmail(email))throw new Rejected("email_exists");
  var account=new Account();account.email=email;
  String name=identity.name()==null?"":identity.name().strip();account.displayName=name.isBlank()?"Người chơi":name.substring(0,Math.min(60,name.length()));
  // No password chosen by the provider or client is accepted. This random secret is never exposed.
  account.passwordHash=passwords.encode(UUID.randomUUID().toString()+UUID.randomUUID());
  accounts.saveAndFlush(account);save(identity,account);return account;
 }
 private void save(Identity identity,Account account){var row=new SocialIdentity();row.provider=identity.provider();row.subject=identity.subject();row.accountId=account.id;identities.saveAndFlush(row);}
}
