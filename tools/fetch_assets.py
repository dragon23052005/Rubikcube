from pathlib import Path
from urllib.request import urlopen,Request
out=Path('src/main/resources/static/vendor');out.mkdir(parents=True,exist_ok=True)
for name,url in [('lucide.js','https://unpkg.com/lucide@0.468.0/dist/umd/lucide.min.js'),('Lucide-LICENSE.txt','https://unpkg.com/lucide@0.468.0/LICENSE'),('InterVariable.ttf','https://raw.githubusercontent.com/google/fonts/main/ofl/inter/Inter%5Bopsz,wght%5D.ttf'),('Inter-OFL.txt','https://raw.githubusercontent.com/google/fonts/main/ofl/inter/OFL.txt')]:
 (out/name).write_bytes(urlopen(url,timeout=30).read())
