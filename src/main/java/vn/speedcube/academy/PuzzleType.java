package vn.speedcube.academy;
import jakarta.persistence.*;
@Entity public class PuzzleType {
 @Id public String id; public String name;
 public PuzzleType(){} public PuzzleType(String id,String name){this.id=id;this.name=name;}
}
