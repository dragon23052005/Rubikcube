package vn.speedcube.academy;
import jakarta.persistence.*;
import java.util.*;
import com.fasterxml.jackson.annotation.*;
@Entity
public class AlgorithmCase {
 @Id public String id;
 public String puzzle, method, name, category, verificationStatus;
 public int number;
 @Column(length=4000) public String algorithm;
 @Column(length=4000) public String description;
 @Column(length=1000) public String sourceUrl;
 public String recognition;
 @OneToOne(cascade=CascadeType.ALL,orphanRemoval=true) public AlgorithmReference reference;
 @ManyToOne @JsonIgnore public AlgorithmSet algorithmSet;
 @OneToMany(cascade=CascadeType.ALL,orphanRemoval=true,fetch=FetchType.EAGER) @JoinColumn(name="case_id") @OrderColumn @JsonIgnore public List<AlgorithmImage> imageEntities=new ArrayList<>();
 @OneToMany(cascade=CascadeType.ALL,orphanRemoval=true,fetch=FetchType.EAGER) @JoinColumn(name="case_id") @OrderColumn @JsonIgnore public List<AlgorithmVariant> variantEntities=new ArrayList<>();
 @JsonGetter("images") public List<String> getImages(){return imageEntities.stream().map(i->i.localPath).toList();}
 @Transient @JsonIgnore private List<String> pendingTransforms=List.of();
 @JsonSetter("images") public void setImages(List<String> values){imageEntities=new ArrayList<>(values.stream().map(AlgorithmImage::new).toList());applyTransforms();}
 private void applyTransforms(){for(int i=0;i<imageEntities.size();i++)imageEntities.get(i).transform=i<pendingTransforms.size()?pendingTransforms.get(i):"";}
 @JsonSetter("imageTransforms") public void setImageTransforms(List<String> values){pendingTransforms=values==null?List.of():values;applyTransforms();}
 @JsonGetter("imageTransforms") public List<String> getImageTransforms(){return imageEntities.stream().map(i->i.transform==null?"":i.transform).toList();}
 @JsonGetter("alternatives") public List<String> getAlternatives(){return variantEntities.stream().map(i->i.notation).toList();}
 @JsonSetter("alternatives") public void setAlternatives(List<String> values){variantEntities=new ArrayList<>(values.stream().map(AlgorithmVariant::new).toList());}
 public AlgorithmCase() {}
}
