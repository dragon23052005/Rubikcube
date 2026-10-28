"""Import complete J Perm parity sets; expand [*] before copy/practice."""
from pathlib import Path
import json, re, base64

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'src/main/resources/static'
PARITY={'oll':"Rw U2 x Rw U2 Rw U2 Rw' U2 Lw U2 Rw' U2 Rw U2 Rw' U2 Rw'",'pll':'2R2 U2 2R2 Uw2 2R2 Uw2'}

def image(raw, name):
    target=OUT/'images/jperm'/f'{name}.png'
    data=base64.b64decode(raw.split(',',1)[1]);assert data.startswith(b'\x89PNG')
    target.write_bytes(data)
    return '/images/jperm/'+target.name

def run():
    cases=[]
    for kind,expected in [('oll',27),('pll',22)]:
        rows=json.loads((ROOT/f'sources/jperm-4x4{kind}.data.json').read_text())
        images={r['name'].removeprefix('Name'):r for r in json.loads((ROOT/f'sources/jperm-4x4{kind}-images.json').read_text())}
        assert len(rows)==expected and len(images)==expected
        for n,row in enumerate(rows,1):
            # Keep + and - distinct (O+ and O- are different cases).
            slug=re.sub('[^a-z0-9]+','-',row['name'].lower().replace('+','-plus').replace('-','-minus-')).strip('-')
            ident=f'4x4-{kind}-{slug}'
            im=images[row['name']]
            visible=im['text'].split('Algorithm',1)[1].split('Best',1)[0]
            assert re.sub(r'[\s()]','',visible)==re.sub(r'[\s()]','',row['alg'][0])
            assert len(im['images'])==1 and im['images'][0]['style'] is None
            algorithms=[a.replace('[*]',PARITY[kind]) for a in row['alg']]
            cases.append(dict(id=ident,puzzle='4x4',method='4×4 '+kind.upper(),number=n,name=kind.upper()+' parity · '+row['name'],category=row['group'],algorithm=algorithms[0],alternatives=algorithms[1:],images=[image(im['images'][0]['src'],ident)],recognition='',sourceUrl='https://jperm.net/algs/4x4/'+kind,verificationStatus='SOURCE_MATCHED',description='Bộ parity nâng cao J Perm. Đã thay [*] bằng toàn bộ công thức parity tương ứng để sao chép và luyện tập trực tiếp. Ảnh và hướng cầm theo công thức mặc định của nguồn; biến thể có thể đổi hướng cầm. M trên 4×4 xoay cả hai lớp giữa theo chiều L. Đây là bộ parity bổ sung, dùng cùng OLL/PLL thường sau khi ghép cạnh.'))
    tutorial=json.loads((ROOT/'sources/jperm-4x4-tutorial-images.json').read_text())
    basic=[('edge-flip','Lật cặp cạnh ở trước/phải',"R U R' F R' F' R",57,'Ghép cạnh','Giữ cặp cạnh cần lật ở trước/phải (FR). Đây là thao tác lật dùng giữa slice và slice ngược; cần hoàn tác slice để khôi phục tâm.'),('oll-parity','OLL parity cơ bản',PARITY['oll'],63,'Parity cơ bản','Đưa cặp cạnh bị lật lên trước/trên (UF). Sau parity tiếp tục OLL thông thường nếu cần.'),('pll-parity','PLL parity cơ bản',PARITY['pll'],67,'Parity cơ bản','Ảnh minh họa ví dụ parity từ nguồn. Công thức đổi trạng thái parity; có thể vẫn cần PLL 3×3 và AUF, không bảo đảm giải ngay mọi ảnh hoán vị.')]
    for n,(slug,name,alg,idx,group,desc) in enumerate(basic,1):
        cases.append(dict(id='4x4-basic-'+slug,puzzle='4x4',method='4×4 Basic',number=n,name=name,category=group,algorithm=alg,alternatives=[],images=[image(tutorial[idx]['src'],'4x4-basic-'+slug)],recognition='',sourceUrl='https://jperm.net/4x4',verificationStatus='SOURCE_MATCHED',description=desc))
    l2e=[
        ["Lw' U2 Rw' D2 Rw U2 Rw' D2 Rw2 x'", "U x' Uw' (R U R' F R' F' R) Uw U' x", "Lw U' R' U x R' U R U' Rw' R"],
        ["x' Rw2 D2 Rw' U2 Rw D2 Rw' U2 Lw'"],
        ["Rw U2 Rw D Rw' U2 Rw D' Rw2'"],
        ["Rw2 D Rw' U2 Rw D' Rw' U2 Rw'"],
        ["R' (Uw' R U R' F R' F' R Uw) R"],
    ]
    for n,algs in enumerate(l2e,1):
        path=f'/images/jperm/4x4-l2e-{n}.png'
        assert (OUT/path.lstrip('/')).exists()
        cases.append(dict(id=f'4x4-l2e-{n}',puzzle='4x4',method='4×4 L2E',number=n,name=f'L2E · CubeSkills {n}',category='Hai cạnh cuối',algorithm=algs[0],alternatives=algs[1:],images=[path],recognition='',sourceUrl='https://www.cubeskills.com/uploads/pdf/tutorials/useful-last-2-edges-algorithms-4x4.pdf',verificationStatus='SOURCE_MATCHED',description='Hình và công thức đối chiếu theo từng cột trong PDF CubeSkills; ảnh VisualCube của Conrad Rider. Giữ đúng hướng màu như hình, các sticker tối là phần không cần nhận diện. Bộ 5 ví dụ hữu ích của nguồn, không phải toàn bộ trạng thái L2E. Thứ tự đánh số trái sang phải, trên xuống dưới.'))
    assert len(cases)==57 and len({c['id'] for c in cases})==57
    (OUT/'jperm-4x4.json').write_text(json.dumps(cases,ensure_ascii=False,indent=2),encoding='utf-8')
    print('4x4:',len(cases),'cases;',sum(len(c['alternatives']) for c in cases),'alternatives')

if __name__=='__main__':run()
