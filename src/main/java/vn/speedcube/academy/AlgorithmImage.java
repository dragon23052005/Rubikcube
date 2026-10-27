package vn.speedcube.academy;
import jakarta.persistence.*;
@Entity public class AlgorithmImage {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
 @Column(nullable=false) public String localPath;
 public String transform;
 public AlgorithmImage(){} public AlgorithmImage(String s){localPath=s;}
}
