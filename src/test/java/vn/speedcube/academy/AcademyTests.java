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
 @Test void sourceCountsAreExact(){assertThat(catalog.counts()).containsEntry("OLL",57L).containsEntry("PLL",21L).containsEntry("COLL",40L).containsEntry("ZB F2L",306L).containsEntry("CO",5L).containsEntry("EO",7L).containsEntry("CP",8L).containsEntry("EP",54L).containsEntry("Middle",3L);assertThat(catalog.all()).hasSize(501);}
 @Test void eachCaseHasSourceImageAndValidNotation() throws Exception {
  Set<String> ids=new HashSet<>();
  for(var c:catalog.all()){
   assertThat(ids.add(c.id)).isTrue();assertThat(c.sourceUrl).startsWith("https://cubezone.be/");if(!c.id.equals("zb-f2l-6"))assertThat(c.algorithm).isNotBlank();assertThat(c.getImages()).isNotEmpty();
   for(String img:c.getImages()){assertThat(img).startsWith("/images/source/");try(var in=new ClassPathResource("static"+img).getInputStream()){byte[] b=in.readNBytes(4);assertThat(b.length).isEqualTo(4);assertThat((b[0]=='G'&&b[1]=='I')||(b[0]==(byte)0x89&&b[1]=='P')).isTrue();}}
   if(c.puzzle.equals("sq1"))assertThat(c.algorithm).matches("[\\s/(),0-9\\-]+" );
   assertThat(c.verificationStatus).isEqualTo(c.id.equals("zb-f2l-6")?"SOURCE_EMPTY":"SOURCE_MATCHED");
  }
 }
 @Test void apiSearchPaginationAndErrors() throws Exception {
  mvc.perform(get("/api/algorithms").param("method","OLL").param("size","12")).andExpect(status().isOk()).andExpect(jsonPath("$.total").value(57)).andExpect(jsonPath("$.items.length()").value(12));
  mvc.perform(get("/api/algorithms/search").param("q","NO_SUCH_CASE_999")).andExpect(jsonPath("$.total").value(0));
  mvc.perform(get("/api/algorithms/oll-1")).andExpect(status().isOk()).andExpect(jsonPath("$.images[0]").isNotEmpty());
  mvc.perform(get("/api/algorithms/missing")).andExpect(status().isNotFound());
  mvc.perform(get("/api/algorithms").param("size","1000")).andExpect(status().isBadRequest());
  mvc.perform(get("/api/catalog")).andExpect(jsonPath("$.length()").value(501));
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
