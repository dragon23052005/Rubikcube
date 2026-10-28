package vn.speedcube.academy.catalog.model;
import jakarta.persistence.*;
@Entity public class AlgorithmVariant {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
 @Column(length=4000,nullable=false) public String notation;
 public AlgorithmVariant(){} public AlgorithmVariant(String s){notation=s;}
}
