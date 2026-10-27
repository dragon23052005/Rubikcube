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
  cachedCases=repository.findAll().stream().sorted(Comparator.comparing((AlgorithmCase c)->c.method).thenComparingInt(c->c.number)).toList();
  snapshot=cachedCases.stream().map(AlgorithmDto::from).toList();
 }
 public List<AlgorithmDto> snapshot(){return snapshot;}
 public AlgorithmCase get(String id){return repository.findById(id).orElseThrow(()->new NoSuchElementException("Không tìm thấy công thức"));}
 public List<AlgorithmCase> all(){return cachedCases;}
 public Map<String,Long> counts(){Map<String,Long> result=new LinkedHashMap<>(); for(var c:all())result.merge(c.method,1L,Long::sum);return result;}
}
