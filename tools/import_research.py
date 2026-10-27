from urllib.request import urlopen
from bs4 import BeautifulSoup
from pathlib import Path
import re,json
root=Path(__file__).resolve().parents[1];base='https://cubezone.be/'
links=[]
for name in ['imagecube.html','imagerevenge.html','crossstudy.html','xcrossstudy.html','zbf2lprint.html']:
 data=urlopen(base+name,timeout=30).read();(root/'sources'/name).write_bytes(data)
 s=BeautifulSoup(data,'html.parser');found=[a['href'] for a in s.select('a[href]') if a['href'].endswith('.txt')];print(name,found);links+=found if name.endswith('study.html') else []
sets=[]
for link in dict.fromkeys(links):
 data=urlopen(base+link,timeout=30).read();(root/'sources'/Path(link).name).write_bytes(data)
 text=data.decode();items=[]
 # A research exercise can have one or more cross solutions.
 for block in re.split(r'(?=Scramble:)',text):
  lines=[x.strip() for x in block.splitlines() if x.strip()]
  if lines and lines[0].startswith('Scramble:'):items.append({'scramble':lines[0].split(':',1)[1].strip(),'solutions':lines[1:]})
 sets.append(dict(id=Path(link).stem,sourceUrl=base+link,items=items));print(link,len(items))
(root/'src/main/resources/static/research.json').write_text(json.dumps(sets,indent=2),encoding='utf-8')
