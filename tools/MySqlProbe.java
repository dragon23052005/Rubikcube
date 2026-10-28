import java.sql.*;
import java.nio.file.*;
import java.util.*;
/** Local connection/schema check; reads the ignored password config, never prints credentials. */
public class MySqlProbe {
 public static void main(String[] args)throws Exception {
  var settings=new Properties();var file=Path.of("config/database-local.properties");
  if(Files.exists(file))try(var reader=Files.newBufferedReader(file)){settings.load(reader);}
  String password=System.getenv("DB_PASSWORD");if(password==null)password=settings.getProperty("DB_PASSWORD","");
  String url="jdbc:mysql://localhost:3306/?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Ho_Chi_Minh";
  try(var connection=DriverManager.getConnection(url,"root",password)){
   System.out.println("Server: "+connection.getMetaData().getDatabaseProductName()+" "+connection.getMetaData().getDatabaseProductVersion());
   boolean exists=false;try(var result=connection.getMetaData().getCatalogs()){while(result.next())if(result.getString(1).equals("demotesting"))exists=true;}
   System.out.println("demotesting exists: "+exists);
   if(!exists&&Arrays.asList(args).contains("--prepare")){try(var statement=connection.createStatement()){statement.executeUpdate("CREATE DATABASE IF NOT EXISTS demotesting CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");}exists=true;System.out.println("Created demotesting (existing databases untouched).");}
   if(exists){try(var statement=connection.prepareStatement("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = ?")){statement.setString(1,"demotesting");try(var result=statement.executeQuery()){result.next();System.out.println("Table count: "+result.getInt(1));}}}
   if(Arrays.asList(args).contains("--verify-qa")||Arrays.asList(args).contains("--cleanup-qa")){
    connection.setCatalog("demotesting");var qa=new Properties();try(var reader=Files.newBufferedReader(Path.of("var/mysql-qa.properties"))){qa.load(reader);}
    String id=qa.getProperty("id"),email=qa.getProperty("email");UUID.fromString(id);
    if(!email.matches("mysql-qa-[a-f0-9-]{36}@example\\.test"))throw new IllegalStateException("Unexpected QA owner");
    try(var statement=connection.prepareStatement("SELECT focus_puzzle,level,daily_minutes,password_hash FROM academy_accounts WHERE id=? AND email=?")){
     statement.setString(1,id);statement.setString(2,email);try(var result=statement.executeQuery()){if(!result.next()||!result.getString(1).equals("5x5")||!result.getString(2).equals("ADVANCED")||result.getInt(3)!=20||!result.getString(4).startsWith("$2"))throw new IllegalStateException("QA profile/hash verification failed");}
    }
    try(var statement=connection.prepareStatement("SELECT COUNT(*) FROM learning_progress WHERE user_id=? AND algorithm_id='oll-1' AND learned=true AND favorite=true")){statement.setString(1,id);try(var result=statement.executeQuery()){result.next();if(result.getInt(1)!=1)throw new IllegalStateException("QA progress verification failed");}}
    System.out.println("Verified profile and learned/favorite directly in MySQL.");
    if(Arrays.asList(args).contains("--cleanup-qa")){
     connection.setAutoCommit(false);
     try{
      for(String table:List.of("timer_solve","study_attempt","study_session","case_memory","learning_progress","stage_completion","social_identities")){
       try(var tables=connection.getMetaData().getTables("demotesting",null,table,new String[]{"TABLE"})){if(!tables.next())continue;}
       String owner=table.equals("social_identities")?"account_id":"user_id";
       try(var statement=connection.prepareStatement("DELETE FROM "+table+" WHERE "+owner+"=?")){statement.setString(1,id);statement.executeUpdate();}
      }
      try(var statement=connection.prepareStatement("DELETE FROM academy_accounts WHERE id=? AND email=?")){statement.setString(1,id);statement.setString(2,email);if(statement.executeUpdate()!=1)throw new IllegalStateException("QA owner mismatch");}
      connection.commit();System.out.println("Removed only disposable QA account and its own records.");
     }catch(Exception e){connection.rollback();throw e;}
    }
   }
  }
 }
}
