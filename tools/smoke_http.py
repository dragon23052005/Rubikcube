from urllib.request import urlopen,Request
from urllib.error import HTTPError
import json,sys
base=sys.argv[1].rstrip('/') if len(sys.argv)>1 else 'http://localhost:8080'
for path in ['/','/puzzles','/methods?puzzle=sq1','/algorithms?method=OLL','/algorithms/oll-1','/practice','/progress','/favorites','/guide','/cross','/4x4','/methods?puzzle=4x4','/algorithms/4x4-l2e-1','/5x5','/methods?puzzle=5x5','/algorithms/5x5-l2e-1']:
 with urlopen(base+path) as r:assert r.status==200;assert 'Speedcube Academy' in r.read().decode()
 print('OK',path)
with urlopen(base+'/api/catalog') as r: data=json.load(r);assert len(data)==606
with urlopen(base+'/api/algorithms?method=OLL&size=12') as r:
 result=json.load(r);assert result['total']==57 and len(result['items'])==12
for path in ['/missing-page','/algorithms/nonexistent-case']:
 try:urlopen(Request(base+path,headers={'Accept':'text/html'}));raise AssertionError('Expected 404')
 except HTTPError as e:assert e.code==404;assert 'Trang này chưa' in e.read().decode()
 print('OK 404',path)
print('HTTP smoke checks passed')
