package vn.speedcube.academy.catalog.model;
import jakarta.persistence.*;
@Entity
public class AlgorithmReference {
 @Id public String id;
 public String provider,caseName,imagePath,sourceUrl,relation,category;
 @Column(length=4000) public String algorithm;
 public AlgorithmReference(){}
}
