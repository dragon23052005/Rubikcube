"""Fetch only discovered public catalog pages, with bounded traversal and caching."""
from urllib.request import urlopen
from urllib.parse import urljoin,urlparse
from pathlib import Path
from bs4 import BeautifulSoup
import re,time
base='https://cubezone.be/';dest=Path(__file__).resolve().parents[1]/'sources';dest.mkdir(exist_ok=True)
queue=['index.html','oll.html','pll.html','coll.html','zbf2l.html','square1.html','imagecube.html','imagerevenge.html','crossstudy.html','xcrossstudy.html'];seen=set()
while queue:
 name=queue.pop(0)
 if name in seen:continue
 seen.add(name);p=dest/name
 if not p.exists():p.write_bytes(urlopen(base+name,timeout=30).read());time.sleep(.2)
 s=BeautifulSoup(p.read_bytes(),'html.parser')
 for a in s.select('a[href]'):
  href=a['href']
  if re.fullmatch(r'(conU\w+|sepU\w+|insert[CE]\d|conF2L\d|square1(?:notation|step[1-6])|zbf2lprint)\.html',href) and href not in seen:queue.append(href)
 print('Cached',name)
