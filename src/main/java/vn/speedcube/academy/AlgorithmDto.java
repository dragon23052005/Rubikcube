package vn.speedcube.academy;
import java.util.List;
public record AlgorithmDto(String id,String puzzle,String method,int number,String name,String category,String algorithm,List<String> alternatives,List<String> images,List<String> imageTransforms,String recognition,String description,String sourceUrl,String verificationStatus,ReferenceDto reference){
 public static AlgorithmDto from(AlgorithmCase c){return new AlgorithmDto(c.id,c.puzzle,c.method,c.number,c.name,c.category,c.algorithm,c.getAlternatives(),c.getImages(),c.getImageTransforms(),c.recognition,c.description,c.sourceUrl,c.verificationStatus,ReferenceDto.from(c.reference));}
}
