import unittest
from collections import Counter
from check_user_cubeshape import patterns,algorithms,expand,rotate,legal,run
class CubeShapeTests(unittest.TestCase):
 def test_all_five_algorithms_reach_square_without_illegal_slices(self):
  for pattern,algorithm in zip(patterns,algorithms):
   with self.subTest(pattern=pattern):self.assertTrue(run(pattern,algorithm,-1,1,1,True))
 def test_all_states_have_eight_corners_and_eight_edges(self):
  for pattern in patterns:
   self.assertEqual(pattern.count('C')+6,8);self.assertEqual(pattern.count('E'),8)
   self.assertEqual(len(expand(pattern,'t')),12)
 def test_turns_preserve_pieces_and_have_inverses(self):
  for pattern in patterns:
   layer=expand(pattern,'t')
   for amount in range(-6,7):
    self.assertEqual(Counter(rotate(layer,amount)),Counter(layer))
    self.assertEqual(rotate(rotate(layer,amount),-amount),layer)
 def test_cut_cannot_split_a_corner(self):
  layer=expand('CCCCCC','b')
  self.assertTrue(legal(layer));self.assertFalse(legal(rotate(layer,1)))
if __name__=='__main__':unittest.main()
