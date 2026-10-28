import com.fasterxml.jackson.databind.*;
import org.worldcubeassociation.tnoodle.scrambles.PuzzleRegistry;
import java.nio.file.*;
import java.security.MessageDigest;
import java.util.*;
import java.util.regex.*;

/** Independent TNoodle reference for EP initial permutations; not part of the UI. */
public class Square1EpOracle {
 static int turn(int n){int value=Math.floorMod(n,12);return value>6?value-12:value;}
 public static void main(String[] args)throws Exception{
  var mapper=new ObjectMapper();var source=mapper.readTree(Path.of("src/main/resources/static/data.json").toFile());
  var puzzle=PuzzleRegistry.SQ1.getScrambler();var results=new ArrayList<Object>();
  for(var c:source){if(!c.path("method").asText().equals("EP"))continue;
   String alg=c.path("algorithm").asText();var tokens=new ArrayList<String>();var forward=new ArrayList<String>();
   var matches=Pattern.compile("/|\\((-?\\d+),(-?\\d+)\\)").matcher(alg);
   while(matches.find()){
    tokens.add(matches.group().equals("/")?"/":"("+turn(-Integer.parseInt(matches.group(1)))+","+turn(-Integer.parseInt(matches.group(2)))+")");
    forward.add(matches.group().equals("/")?"/":"("+turn(Integer.parseInt(matches.group(1)))+","+turn(Integer.parseInt(matches.group(2)))+")");
   }
   Collections.reverse(tokens);var initial=puzzle.getSolvedState().applyAlgorithm(String.join(" ",tokens));
   // Public debug representation is stable in the pinned TNoodle 0.20.0.
   String state=initial.toString();var pieces=mapper.readTree(state.substring(state.indexOf('[')));
   var solved=initial.applyAlgorithm(String.join(" ",forward));if(!solved.equals(puzzle.getSolvedState()))throw new IllegalStateException(c.path("id").asText());
   String hash=HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(alg.getBytes(java.nio.charset.StandardCharsets.UTF_8)));
   results.add(Map.of("id",c.path("id").asText(),"algorithmSha256",hash,"pieces",pieces,"middleFlipped",state.startsWith("sliceSolved: false")));
  }
  var output=Path.of("src/test/resources/square1-ep-oracle.json");Files.createDirectories(output.getParent());
  mapper.writerWithDefaultPrettyPrinter().writeValue(output.toFile(),Map.of("generator","TNoodle 0.20.0","cases",results));
  System.out.println("Verified "+results.size()+" EP algorithms against TNoodle; wrote "+output);
 }
}
