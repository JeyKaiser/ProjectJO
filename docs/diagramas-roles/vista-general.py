from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
root=Path('docs/diagramas-roles')
paths=sorted(root.glob('*.png'))
paths=[p for p in paths if p.name!='vista-general.png']
thumb_w,thumb_h=420,510
sheet=Image.new('RGB',(thumb_w*4,thumb_h*3),'#dfe7f1')
draw=ImageDraw.Draw(sheet)
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',14)
for index,path in enumerate(paths):
    image=Image.open(path).convert('RGB')
    image.thumbnail((thumb_w-16,thumb_h-40))
    x=(index%4)*thumb_w+(thumb_w-image.width)//2
    y=(index//4)*thumb_h+28
    draw.text(((index%4)*thumb_w+8,(index//4)*thumb_h+7),path.stem,font=font,fill='#17243b')
    sheet.paste(image,(x,y))
sheet.save(root/'vista-general.png')
