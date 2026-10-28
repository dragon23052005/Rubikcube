"""Read-only PDF extraction; requires pdfplumber and its renderer dependencies."""
from pathlib import Path
import pdfplumber
ROOT=Path(__file__).resolve().parents[1]
with pdfplumber.open(ROOT/'sources/cubeskills-4x4-l2e.pdf') as document:
    page=document.pages[0]
    assert len(page.images)==7 # logo, presentation sample, five real cases
    for n,i in enumerate(page.images[2:],1):
        page.crop((i['x0'],i['top'],i['x1'],i['bottom'])).to_image(resolution=160).save(ROOT/f'src/main/resources/static/images/jperm/4x4-l2e-{n}.png')
