import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.security.SecureRandom;
import java.sql.*;
import java.util.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/** Explicit, local demo-data command. Never promotes or resets an existing account. */
public class SeedDemoAccounts {
 record Demo(String email,String name,String role,String level,String puzzle,int minutes) {}
 public static void main(String[] args) throws Exception {
  if(!List.of(args).contains("--apply"))throw new IllegalArgumentException("Use --apply to insert demo accounts.");
  var config=new Properties();var configFile=Path.of("config/database-local.properties");
  if(Files.exists(configFile))try(var reader=Files.newBufferedReader(configFile)){config.load(reader);}
  String url=value(config,"DB_URL","jdbc:mysql://localhost:3306/demotesting?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Ho_Chi_Minh");
  var demos=List.of(
   new Demo("admin@speedcube.test","Quan tri vien demo","ADMIN","ADVANCED","3x3",30),
   new Demo("beginner@speedcube.test","Nguoi moi hoc","USER","BEGINNER","3x3",10),
   new Demo("intermediate@speedcube.test","Nguoi choi trung cap","USER","INTERMEDIATE","4x4",20),
   new Demo("advanced@speedcube.test","Speedcuber nang cao","USER","ADVANCED","5x5",30));
  var encoder=new BCryptPasswordEncoder(12);var random=new SecureRandom();
  var lines=new ArrayList<String>();lines.add("Local demo accounts — created "+java.time.Instant.now());
  lines.add("Login: http://localhost:8080/login | Admin: http://localhost:8080/admin");
  int created=0;
  try(var db=DriverManager.getConnection(url,value(config,"DB_USER","root"),value(config,"DB_PASSWORD",""))){
   db.setAutoCommit(false);
   try {
    for(var demo:demos){
     try(var exists=db.prepareStatement("SELECT id FROM academy_accounts WHERE email=?")){
      exists.setString(1,demo.email());try(var rows=exists.executeQuery()){if(rows.next()){System.out.println("Skipped existing: "+demo.email());continue;}}
     }
     byte[] bytes=new byte[18];random.nextBytes(bytes);String password=Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
     try(var insert=db.prepareStatement("INSERT INTO academy_accounts (id,email,display_name,password_hash,role,level,focus_puzzle,daily_minutes,created_at) VALUES (?,?,?,?,?,?,?,?,?)")){
      insert.setString(1,UUID.randomUUID().toString());insert.setString(2,demo.email());insert.setString(3,demo.name());
      insert.setString(4,encoder.encode(password));insert.setString(5,demo.role());insert.setString(6,demo.level());
      insert.setString(7,demo.puzzle());insert.setInt(8,demo.minutes());insert.setLong(9,System.currentTimeMillis());insert.executeUpdate();
     }
     lines.add(demo.email()+" | "+demo.role()+" | "+password);created++;
    }
    // Save generated credentials locally before committing; never put them in SQL or source control.
    if(created>0){var out=Path.of("config/demo-accounts.local.txt");Files.createDirectories(out.getParent());Files.write(out,lines,StandardCharsets.UTF_8,StandardOpenOption.CREATE,StandardOpenOption.APPEND);}
    db.commit();
   }catch(Exception failure){db.rollback();throw failure;}
  }
  System.out.println("Created "+created+" accounts. Credentials: config/demo-accounts.local.txt (Git ignored).");
 }
 static String value(Properties config,String key,String fallback){String env=System.getenv(key);return env!=null?env:config.getProperty(key,fallback);}
}
