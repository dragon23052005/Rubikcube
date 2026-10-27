package vn.speedcube.academy;
import jakarta.persistence.*;
@Entity public class AlgorithmSet {
 @Id public String id; public String name;
 @ManyToOne(optional=false) public PuzzleType puzzleType;
 public AlgorithmSet(){} public AlgorithmSet(String id,PuzzleType p){this.id=id;this.name=id;this.puzzleType=p;}
}
