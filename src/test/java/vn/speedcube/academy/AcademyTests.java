package vn.speedcube.academy;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ClassPathResource;
import java.util.*;
import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
@SpringBootTest(properties={"spring.datasource.url=jdbc:h2:mem:testdb;MODE=PostgreSQL","spring.jpa.hibernate.ddl-auto=create-drop"})
@AutoConfigureMockMvc
class AcademyTests {
 @Autowired CatalogService catalog; @Autowired MockMvc mvc; @Autowired ObjectMapper mapper;
 @Test void twoByTwoHasIndependentMethodsAndSourceImageTransforms() throws Exception {
  assertThat(catalog.counts()).containsEntry("2×2 OLL",7L).containsEntry("2×2 PBL",5L).containsEntry("OLL",57L);
  var rows=catalog.all().stream().filter(c->c.puzzle.equals("2x2")).toList();assertThat(rows).hasSize(12);
  for(var c:rows){assertThat(c.sourceUrl).startsWith("https://www.jperm.net/algs/2x2");assertThat(c.reference).isNull();if(c.method.equals("2×2 PBL")){assertThat(c.getImages()).hasSize(2);assertThat(c.getImageTransforms()).containsExactly("","scaleX(-1)");}else assertThat(c.getImages()).hasSize(1);}
  catalog.seed();assertThat(catalog.all()).hasSize(518);assertThat(catalog.all().stream().mapToInt(c->c.getAlternatives().size()).sum()).isEqualTo(45);
  mvc.perform(get("/api/algorithms").param("puzzle","2x2")).andExpect(jsonPath("$.total").value(12));
  mvc.perform(get("/api/algorithms/search").param("q","2x2")).andExpect(jsonPath("$.total").value(12));
  mvc.perform(get("/api/algorithms/2x2-pbl-adj-adj")).andExpect(jsonPath("$.imageTransforms[1]").value("scaleX(-1)"));
  mvc.perform(get("/api/puzzles")).andExpect(jsonPath("$.length()").value(3));
 }
 @Test void imageTransformDeserializationDoesNotDependOnJsonFieldOrder() throws Exception {
  var c=mapper.readValue("{\"imageTransforms\":[\"\",\"scaleX(-1)\"],\"images\":[\"/a.png\",\"/b.png\"]}",AlgorithmCase.class);
  assertThat(c.getImageTransforms()).containsExactly("","scaleX(-1)");
 }
 @Test void jpermReferencesKeepPrimaryAndPairAlternativeWithItsImage() throws Exception {
  var originals=mapper.readTree(new ClassPathResource("static/data.json").getInputStream());
  for(var row:originals){if(!row.get("method").asText().equals("PLL"))continue;var c=catalog.get(row.get("id").asText());assertThat(c.algorithm).isEqualTo(row.get("algorithm").asText());assertThat(c.reference).isNotNull();assertThat(new ClassPathResource("static"+c.reference.imagePath).exists()).isTrue();if(c.reference.relation.equals("ALTERNATIVE_SEQUENCE"))assertThat(c.getAlternatives()).contains(c.reference.algorithm);else assertThat(c.getAlternatives()).isEmpty();}
  assertThat(catalog.all().stream().filter(c->c.reference!=null&&c.reference.relation.equals("SAME_SEQUENCE")).count()).isEqualTo(4);
  int variants=catalog.all().stream().mapToInt(c->c.getAlternatives().size()).sum();catalog.seed();assertThat(catalog.all().stream().mapToInt(c->c.getAlternatives().size()).sum()).isEqualTo(variants);
  mvc.perform(get("/api/algorithms/pll-1")).andExpect(jsonPath("$.name").value("Aa Perm")).andExpect(jsonPath("$.reference.provider").value("J Perm"));
  mvc.perform(get("/api/algorithms/pll-12")).andExpect(jsonPath("$.reference.caseName").value("T")).andExpect(jsonPath("$.alternatives.length()").value(0));
 }
 @Test void cubeShapeSupplementLoadsAndDoesNotDuplicateOnRestart() throws Exception {
  assertThat(catalog.counts()).containsEntry("CS",5L);
  catalog.seed();assertThat(catalog.counts()).containsEntry("CS",5L);assertThat(catalog.all()).hasSize(518);
  mvc.perform(get("/api/algorithms").param("method","CS")).andExpect(jsonPath("$.total").value(5));
  mvc.perform(get("/api/algorithms/cs-5")).andExpect(jsonPath("$.algorithm").value("/ (-4,0) / (5,4) / (2,-3) / (-5,-4) / (6,-3) /"));
 }
 @Test void sourceCountsAreExact(){assertThat(catalog.counts()).containsEntry("OLL",57L).containsEntry("PLL",21L).containsEntry("COLL",40L).containsEntry("ZB F2L",306L).containsEntry("CO",5L).containsEntry("EO",7L).containsEntry("CP",8L).containsEntry("EP",54L).containsEntry("Middle",3L);assertThat(catalog.all()).hasSize(518);}
 @Test void eachCaseHasSourceImageAndValidNotation() throws Exception {
  Set<String> ids=new HashSet<>();
  for(var c:catalog.all()){
   assertThat(ids.add(c.id)).isTrue();assertThat(c.sourceUrl).startsWith(c.method.equals("CS")?"/references/":c.puzzle.equals("2x2")?"https://www.jperm.net/":"https://cubezone.be/");if(!c.id.equals("zb-f2l-6"))assertThat(c.algorithm).isNotBlank();assertThat(c.getImages()).isNotEmpty();
   for(String img:c.getImages()){assertThat(img).startsWith("/images/");try(var in=new ClassPathResource("static"+img).getInputStream()){byte[] b=in.readNBytes(4);assertThat(b.length).isEqualTo(4);assertThat((b[0]=='G'&&b[1]=='I')||(b[0]==(byte)0x89&&b[1]=='P')||(b[0]=='<'&&b[1]=='s'&&b[2]=='v'&&b[3]=='g')).isTrue();}}
   if(c.puzzle.equals("sq1"))assertThat(c.algorithm).matches("[\\s/(),0-9\\-]+" );
   assertThat(c.verificationStatus).isEqualTo(c.method.equals("CS")?"USER_REFERENCE_SHAPE_CHECKED":c.id.equals("zb-f2l-6")?"SOURCE_EMPTY":"SOURCE_MATCHED");
  }
 }
 @Test void apiSearchPaginationAndErrors() throws Exception {
  mvc.perform(get("/api/algorithms").param("method","OLL").param("size","12")).andExpect(status().isOk()).andExpect(jsonPath("$.total").value(57)).andExpect(jsonPath("$.items.length()").value(12));
  mvc.perform(get("/api/algorithms/search").param("q","NO_SUCH_CASE_999")).andExpect(jsonPath("$.total").value(0));
  mvc.perform(get("/api/algorithms/oll-1")).andExpect(status().isOk()).andExpect(jsonPath("$.images[0]").isNotEmpty());
  mvc.perform(get("/api/algorithms/missing")).andExpect(status().isNotFound());
  mvc.perform(get("/api/algorithms").param("size","1000")).andExpect(status().isBadRequest());
  mvc.perform(get("/api/catalog")).andExpect(jsonPath("$.length()").value(518));
 }
 @Test void progressIsIsolatedBySession() throws Exception {
  var session=new org.springframework.mock.web.MockHttpSession();
  mvc.perform(put("/api/progress/oll-1").session(session).contentType("application/json").content("{\"learned\":true,\"favorite\":true,\"review\":false}")).andExpect(status().isOk());
  mvc.perform(get("/api/progress").session(session)).andExpect(jsonPath("$[0].learned").value(true));
  mvc.perform(get("/api/progress").session(new org.springframework.mock.web.MockHttpSession())).andExpect(jsonPath("$.length()").value(0));
  mvc.perform(put("/api/progress/oll-1").contentType("application/json").content("{\"learned\":true,\"review\":true}")).andExpect(status().isBadRequest());
 }
 @Test void errorPagesHaveAccessibleVietnameseContent() throws Exception {
  mvc.perform(get("/error").accept("text/html").requestAttr(jakarta.servlet.RequestDispatcher.ERROR_STATUS_CODE,404)).andExpect(status().isNotFound()).andExpect(view().name("error/404"));
  mvc.perform(get("/error").accept("text/html").requestAttr(jakarta.servlet.RequestDispatcher.ERROR_STATUS_CODE,500)).andExpect(status().isInternalServerError()).andExpect(view().name("error/500"));
 }
 @Test void pagesRender() throws Exception {for(String url:List.of("/","/puzzles","/methods","/algorithms","/algorithms/oll-1","/practice","/favorites","/progress","/guide","/cross"))mvc.perform(get(url)).andExpect(status().isOk()).andExpect(view().name("index"));}
 @Test void researchExercisesAreSeparateAndComplete() throws Exception {
  try(var in=new ClassPathResource("static/research.json").getInputStream()){var sets=mapper.readTree(in);assertThat(sets.size()).isEqualTo(3);int[] expected={102,3672,40};for(int i=0;i<3;i++){var items=sets.get(i).get("items");assertThat(items.size()).isEqualTo(expected[i]);for(var item:items){assertThat(item.get("scramble").asText()).isNotBlank();assertThat(item.get("solutions").size()).isGreaterThan(0);}}}
 }
 @Test void cubeShapeIsSeparateFromAlgorithmCases() throws Exception {
  try(var in=new ClassPathResource("static/shapes.json").getInputStream()){var shapes=mapper.readTree(in);assertThat(shapes.size()).isEqualTo(29);for(var shape:shapes)assertThat(new ClassPathResource("static"+shape.get("image").asText()).exists()).isTrue();}
 }
}
