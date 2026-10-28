package vn.speedcube.academy.timer;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
class ScrambleTests {
 @Test void allFivePuzzlesUseRealTnoodleAndProduceValidStateAndSvg()throws Exception{
  var repo=mock(ScrambleRepository.class);when(repo.saveAndFlush(any())).thenAnswer(a->a.getArgument(0));var service=new ScrambleService(repo);
  for(String code:new String[]{"2x2","3x3","4x4","5x5","sq1"}){
   var generated=service.generate(code,"test");var puzzle=ScrambleService.puzzle(code);
   var state=puzzle.getSolvedState().applyAlgorithm(generated.notation());
   assertThat(state).isNotEqualTo(puzzle.getSolvedState());assertThat(generated.svg()).contains("<svg");assertThat(generated.generator()).isEqualTo("TNoodle 0.20.0");
   if(code.equals("2x2"))assertThat(state.solveIn(3)).isNull();
   if(code.equals("sq1"))assertThatCode(()->state.applyAlgorithm("/")).doesNotThrowAnyException();
  }
  assertThat(ScrambleService.puzzle("4x4").getClass().getSimpleName()).isEqualTo("FourByFourCubePuzzle");
 }
 @Test void unsupportedPuzzleIsRejectedBeforeGeneration(){assertThatThrownBy(()->ScrambleService.puzzle("other")).isInstanceOf(org.springframework.web.server.ResponseStatusException.class);}
}
