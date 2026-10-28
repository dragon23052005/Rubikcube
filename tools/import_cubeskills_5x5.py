"""Extract each PDF column with its own case image and algorithm.
Run with the bundled Python (pdfplumber + renderer installed).
"""
from pathlib import Path
import json,re,hashlib
import pdfplumber

ROOT=Path(__file__).resolve().parents[1]
STATIC=ROOT/'src/main/resources/static'
SOURCE='https://www.cubeskills.com/uploads/pdf/tutorials/last-2-{kind}-algorithms-5x5.pdf'

def run():
 cases=[];manifest=[]
 for kind,word,expected in [('l2e','edges',12),('l2c','centers',19)]:
  number=0
  with pdfplumber.open(ROOT/f'sources/5x5-{kind}.pdf') as doc:
   for page_index,page in enumerate(doc.pages):
    # Page 1 starts with logo and a presentation example, neither is a case.
    images=page.images[2:] if page_index==0 else page.images
    for index,img in enumerate(images):
     row=sorted([i for i in images if abs(i['top']-img['top'])<5],key=lambda i:i['x0'])
     column=row.index(img)
     left=0 if column==0 else (row[column-1]['x1']+img['x0'])/2
     right=page.width if column==len(row)-1 else (img['x1']+row[column+1]['x0'])/2
     below=[i['top'] for i in images if i['top']>img['bottom']+2]
     bottom=min(below)-2 if below else page.height-15
     raw=page.crop((left,img['bottom'],right,bottom)).extract_text()
     if raw=='Solved':
      manifest.append(dict(kind=kind,page=page_index+1,position=index+1,excluded='Solved reference; no algorithm required'))
      continue
     assert raw
     # A bracketed rotation starts a new alternative angle on L2E page 1.
     lines=raw.splitlines() if kind=='l2e' and page_index==0 else [' '.join(raw.splitlines())]
     algs=[re.sub(r"\s+'","'",re.sub(r'\s+',' ',line)).replace(' )',')').strip() for line in lines]
     for alg in algs:
      clean=re.sub(r'[\s()\[\]]','',alg)
      assert clean==''.join(re.findall(r'(?:[23][RLUDFB]w?|[RLUDFB]w?|[MESxyz])[23]?\x27?',clean)),alg
     number+=1;ident=f'5x5-{kind}-{number}'
     path=f'/images/cubeskills/{ident}.png';target=STATIC/path.lstrip('/');target.parent.mkdir(parents=True,exist_ok=True)
     bbox=(img['x0'],img['top'],img['x1'],img['bottom'])
     page.crop(bbox).to_image(resolution=160).save(target)
     category=('Không parity' if page_index==0 else 'Parity cạnh') if kind=='l2e' else ('Hai tâm cuối · nhóm 1' if page_index==0 else 'Hai tâm cuối · nhóm 2')
     description=('Hai cạnh cuối, giữ hướng nhận diện như hình. Một số biến thể bắt đầu [z\' y\'] để chuyển sang góc nhìn khác; thực hiện cả hai phép xoay này trước chuỗi còn lại.' if kind=='l2e' else 'Áp dụng khi đã có khối tâm 2×3 hoàn chỉnh ở mặt trước, theo đúng hình PDF. M là lớp chính giữa theo chiều L; không xoay cả ba lớp trong. Hình Solved của nguồn chỉ dùng tham chiếu và không được tính vào bộ luyện.')
     cases.append(dict(id=ident,puzzle='5x5',method='5×5 '+kind.upper(),number=number,name=f'{kind.upper()} · {number:02}',category=category,algorithm=algs[0],alternatives=algs[1:],images=[path],recognition='',sourceUrl=SOURCE.format(kind=word),verificationStatus='SOURCE_MATCHED',description=description+' Nguồn CubeSkills; hình VisualCube của Conrad Rider. Thứ tự theo từng hàng từ trái sang phải trong PDF. Đã đối chiếu hình/công thức theo cùng cột; chưa xác minh toàn bộ bằng solver độc lập.'))
     manifest.append(dict(id=ident,kind=kind,page=page_index+1,position=index+1,bbox=bbox,text=raw,algorithm=algs[0],alternatives=algs[1:],image=path,sha256=hashlib.sha256(target.read_bytes()).hexdigest()))
  assert number==expected,(kind,number)
 assert len(cases)==31 and sum(len(c['alternatives']) for c in cases)==3
 (STATIC/'cubeskills-5x5.json').write_text(json.dumps(cases,ensure_ascii=False,indent=2),encoding='utf-8')
 (ROOT/'sources/5x5-import-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
 print('Imported 12 L2E + 19 L2C, 31 images, 3 alternatives; skipped Solved reference.')

if __name__=='__main__':run()
