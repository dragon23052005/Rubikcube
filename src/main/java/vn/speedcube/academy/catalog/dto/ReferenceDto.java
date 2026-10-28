package vn.speedcube.academy.catalog.dto;
import vn.speedcube.academy.catalog.model.AlgorithmReference;
public record ReferenceDto(String provider,String caseName,String algorithm,String imagePath,String sourceUrl,String relation){
 public static ReferenceDto from(AlgorithmReference r){return r==null?null:new ReferenceDto(r.provider,r.caseName,r.algorithm,r.imagePath,r.sourceUrl,r.relation);}
}
