package vn.speedcube.academy;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.annotation.PostConstruct;
import java.util.*;
@Service
public class CatalogService {
 private final CaseRepository repository; private final ObjectMapper mapper; private final PuzzleRepository puzzles; private final SetRepository sets;
 private List<AlgorithmDto> snapshot=List.of();
 private List<AlgorithmCase> cachedCases=List.of();
 public CatalogService(CaseRepository r,ObjectMapper m,PuzzleRepository p,SetRepository s){repository=r;mapper=m;puzzles=p;sets=s;}
 @PostConstruct @Transactional public void seed() throws Exception {
  try(var input=new ClassPathResource("static/data.json").getInputStream()){
   List<AlgorithmCase> data=mapper.readValue(input,new TypeReference<List<AlgorithmCase>>(){});
   if(repository.count()==0){
    var cube=puzzles.save(new PuzzleType("3x3","Rubik 3×3"));var sq=puzzles.save(new PuzzleType("sq1","Square-1"));
    Map<String,AlgorithmSet> mapping=new HashMap<>();
    for(var c:data){if(!mapping.containsKey(c.method))mapping.put(c.method,sets.save(new AlgorithmSet(c.method,c.puzzle.equals("sq1")?sq:cube)));c.algorithmSet=mapping.get(c.method);}
    repository.saveAll(data);
   }
  }
  for(String supplement:List.of("user-cases.json","jperm-2x2.json","jperm-4x4.json","cubeskills-5x5.json")){
  try(var input=new ClassPathResource("static/"+supplement).getInputStream()){
   List<AlgorithmCase> additions=mapper.readValue(input,new TypeReference<List<AlgorithmCase>>(){});
   for(var c:additions){
    if(repository.existsById(c.id))continue;
    var puzzle=puzzles.findById(c.puzzle).orElseGet(()->puzzles.save(new PuzzleType(c.puzzle,c.puzzle.equals("2x2")?"Rubik 2×2":c.puzzle.equals("4x4")?"Rubik 4×4":c.puzzle.equals("5x5")?"Rubik 5×5":c.puzzle)));
    var set=sets.findById(c.method).orElseGet(()->sets.save(new AlgorithmSet(c.method,puzzle)));
    c.algorithmSet=set;repository.save(c);
   }
  }
  }
  try(var input=new ClassPathResource("static/pll-references.json").getInputStream()){
   List<AlgorithmReference> references=mapper.readValue(input,new TypeReference<List<AlgorithmReference>>(){});
   for(var ref:references){
    var c=repository.findById(ref.id).orElseThrow();
    // Updating a source reference must preserve the existing case and progress IDs.
    if(c.reference==null)c.reference=ref;
    else {c.reference.provider=ref.provider;c.reference.caseName=ref.caseName;c.reference.algorithm=ref.algorithm;c.reference.imagePath=ref.imagePath;c.reference.sourceUrl=ref.sourceUrl;c.reference.relation=ref.relation;c.reference.category=ref.category;}
    c.name=ref.caseName+" Perm";
    if(ref.relation.equals("ALTERNATIVE_SEQUENCE")&&!c.getAlternatives().contains(ref.algorithm))c.variantEntities.add(new AlgorithmVariant(ref.algorithm));
    repository.save(c);
   }
  }
  cachedCases=repository.findAll().stream().sorted(Comparator.comparing((AlgorithmCase c)->c.method).thenComparingInt(c->c.number)).toList();
  snapshot=cachedCases.stream().map(AlgorithmDto::from).toList();
 }
 public List<AlgorithmDto> snapshot(){return snapshot;}
 public List<Map<String,Object>> puzzleSummary(){return puzzles.findAll().stream().map(p->Map.<String,Object>of("id",p.id,"name",p.name,"count",cachedCases.stream().filter(c->c.puzzle.equals(p.id)).count())).toList();}
 public AlgorithmCase get(String id){return repository.findById(id).orElseThrow(()->new NoSuchElementException("Không tìm thấy công thức"));}
 public List<AlgorithmCase> all(){return cachedCases;}
 public Map<String,Long> counts(){Map<String,Long> result=new LinkedHashMap<>(); for(var c:all())result.merge(c.method,1L,Long::sum);return result;}
}
