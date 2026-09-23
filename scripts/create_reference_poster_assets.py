from pathlib import Path
from PIL import Image, ImageDraw
import math

W, H, S = 1088, 1445, 2
OUT = Path(__file__).resolve().parents[1] / 'output' / '新春酒店促销海报_分层源文件' / 'assets'
OUT.mkdir(parents=True, exist_ok=True)
RED = (186, 25, 31, 255)
RED_DARK = (132, 12, 22, 255)
RED_LIGHT = (224, 44, 43, 255)
GOLD = (237, 194, 105, 255)
GOLD_LIGHT = (255, 231, 176, 255)
CREAM = (255, 242, 216, 255)

def canvas():
    return Image.new('RGBA', (W*S, H*S), (0, 0, 0, 0))

def p(x, y): return (int(round(x*S)), int(round(y*S)))
def line(d, pts, fill=GOLD, width=2): d.line([p(x,y) for x,y in pts], fill=fill, width=max(1,int(width*S)), joint='curve')
def poly(d, pts, fill): d.polygon([p(x,y) for x,y in pts], fill=fill)
def ellipse(d, box, fill, outline=None, width=1): d.ellipse((int(box[0]*S),int(box[1]*S),int(box[2]*S),int(box[3]*S)), fill=fill, outline=outline, width=max(1,int(width*S)))
def rounded(d, box, radius, fill, outline=None, width=1): d.rounded_rectangle(tuple(int(v*S) for v in box), radius=int(radius*S), fill=fill, outline=outline, width=max(1,int(width*S)))

def save(name, im):
    im.resize((W,H), Image.Resampling.LANCZOS).save(OUT/name, 'PNG', optimize=True)

def flower(d, x, y, r, petals=5):
    for i in range(petals):
        a = 2*math.pi*i/petals
        cx, cy = x+math.cos(a)*r*.62, y+math.sin(a)*r*.62
        ellipse(d,(cx-r*.42,cy-r*.42,cx+r*.42,cy+r*.42),RED_LIGHT,outline=(246,95,74,255),width=1)
    ellipse(d,(x-r*.22,y-r*.22,x+r*.22,y+r*.22),GOLD)

def firework(name, cx, cy, radius=54, rays=24):
    im=canvas(); d=ImageDraw.Draw(im)
    for i in range(rays):
        a=2*math.pi*i/rays
        inner=radius*(.27 if i%2==0 else .34); outer=radius*(.8 if i%3 else 1)
        x1,y1=cx+math.cos(a)*inner,cy+math.sin(a)*inner
        x2,y2=cx+math.cos(a)*outer,cy+math.sin(a)*outer
        line(d,[(x1,y1),(x2,y2)],GOLD_LIGHT if i%3 else GOLD,width=1.3 if i%4 else 2.0)
        if i%3==0:
            ellipse(d,(x2-1.8,y2-1.8,x2+1.8,y2+1.8),GOLD_LIGHT)
    ellipse(d,(cx-2.8,cy-2.8,cx+2.8,cy+2.8),GOLD_LIGHT)
    save(name,im)

# Top-left plum branch, with blossoms kept separate from type.
im=canvas(); d=ImageDraw.Draw(im)
line(d,[(-25,24),(41,45),(84,81),(135,90),(177,129),(239,147),(302,180)],(83,45,31,255),7)
line(d,[(61,55),(73,14),(106,-12)],(83,45,31,255),5)
line(d,[(126,89),(148,42),(183,19)],(83,45,31,255),4)
line(d,[(193,135),(209,84),(248,57)],(83,45,31,255),4)
line(d,[(236,149),(272,122),(311,122)],(83,45,31,255),3)
for x,y,r in [(22,27,21),(83,51,17),(110,87,19),(150,69,14),(198,26,13),(234,55,11),(252,116,13),(47,137,18),(4,87,13)]: flower(d,x,y,r)
save('02_装饰_左上梅花枝.png',im)

def lantern(name, x, y, w, h):
    im=canvas(); d=ImageDraw.Draw(im)
    cx=x+w/2
    line(d,[(cx,0),(cx,y-14)],GOLD,width=3)
    # tassel cap, body, ribs and bottom fringe
    rounded(d,(x+w*.28,y-14,x+w*.72,y+7),5,GOLD)
    ellipse(d,(x+4,y+2,x+w-4,y+h-2),RED,outline=GOLD,width=3)
    rounded(d,(x+7,y+9,x+w-7,y+h-8),int(w*.34),RED_LIGHT,outline=GOLD,width=2)
    for frac in [.22,.4,.6,.78]:
        xx=x+w*frac
        line(d,[(xx,y+9),(xx,y+h-9)],(255,191,126,255),1)
    rounded(d,(x+w*.23,y+h-5,x+w*.77,y+h+7),4,GOLD)
    line(d,[(cx,y+h+7),(cx,y+h+42)],RED,width=4)
    for off in [-7,-3,0,3,7]: line(d,[(cx,y+h+15),(cx+off,y+h+39)],RED_LIGHT,width=1.7)
    save(name,im)
lantern('03_装饰_右上灯笼_小.png',914,9,82,130)
lantern('04_装饰_右上灯笼_大.png',994,-3,123,176)

firework('05_装饰_烟花_左上.png',128,189,63)
firework('06_装饰_烟花_顶部中.png',421,67,48,20)
firework('07_装饰_烟花_右侧.png',945,350,63)
firework('08_装饰_烟花_左下.png',47,1175,72)
firework('09_装饰_烟花_右下.png',873,1180,53,20)

# Hanging vertical blessing plaque at the upper-right edge.
im=canvas(); d=ImageDraw.Draw(im)
cx=1044
line(d,[(cx,0),(cx,158)],GOLD,width=3)
poly(d,[(cx-31,151),(cx+31,151),(cx+27,342),(cx-27,342)],RED)
poly(d,[(cx-27,156),(cx+27,156),(cx+23,337),(cx-23,337)],(168,20,27,255))
line(d,[(cx-26,158),(cx+26,158),(cx+23,337),(cx-23,337),(cx-26,158)],GOLD,width=2)
line(d,[(cx-18,166),(cx+18,166),(cx+15,329),(cx-15,329),(cx-18,166)],(255,219,141,255),width=1)
rounded(d,(cx-31,146,cx+31,161),4,GOLD)
rounded(d,(cx-27,338,cx+27,348),4,GOLD)
line(d,[(cx,348),(cx,392)],RED,width=4)
for off in [-8,-4,0,4,8]: line(d,[(cx,355),(cx+off,389)],RED_LIGHT,width=2)
save('10_装饰_右侧如意吊牌底.png',im)

# Left diamond-shaped 福 hanging plaque base; 福 itself is live text in the PSD.
im=canvas(); d=ImageDraw.Draw(im)
cx,cy=102,509
line(d,[(cx,384),(cx,cy-70)],GOLD,width=3)
poly(d,[(cx,cy-60),(cx+60,cy),(cx,cy+60),(cx-60,cy)],RED)
poly(d,[(cx,cy-52),(cx+52,cy),(cx,cy+52),(cx-52,cy)],(177,23,31,255))
line(d,[(cx,cy-54),(cx+54,cy),(cx,cy+54),(cx-54,cy),(cx,cy-54)],GOLD,width=2)
line(d,[(cx,cy-44),(cx+44,cy),(cx,cy+44),(cx-44,cy),(cx,cy-44)],(255,222,152,255),width=1)
line(d,[(cx,cy+60),(cx,cy+119)],GOLD,width=3)
rounded(d,(cx-9,cy+72,cx+9,cy+83),4,GOLD)
line(d,[(cx,cy+83),(cx,cy+121)],RED,width=4)
for off in [-8,-4,0,4,8]: line(d,[(cx,cy+89),(cx+off,cy+118)],RED_LIGHT,width=2)
save('11_装饰_左侧福牌底.png',im)

# Red footer field and sweeping silk. Kept as distinct raster layers.
im=canvas(); d=ImageDraw.Draw(im)
for y in range(1275,H):
    t=(y-1275)/(H-1275)
    col=(int(160+25*t),int(10+8*t),int(20+3*t),255)
    d.line([p(0,y),p(W,y)],fill=col,width=S)
line(d,[(0,1277),(W,1277)],GOLD,width=3)
save('12_底色_页脚酒红底.png',im)

im=canvas(); d=ImageDraw.Draw(im)
pts=[]
for x in range(-10,1100,8):
    y=1114+47*math.sin((x+20)/155)+17*math.sin(x/81)
    pts.append((x,y))
poly(d,pts+[(W+20,1308),(-20,1308)],RED)
# soft layered red highlights across the lower wave
line(d,pts,(250,77,56,255),3)
line(d,[(x,y+11) for x,y in pts],GOLD,width=2)
line(d,[(0,1286),(230,1307),(484,1297),(790,1315),(1088,1277)],(244,183,94,255),width=2)
save('13_装饰_底部红色绸带.png',im)

# Cream cloud plaque for the price.
im=canvas(); d=ImageDraw.Draw(im)
# shadow is restrained and stays within the decorative bitmap layer
rounded(d,(281,1022,812,1252),70,(89,25,18,70))
rounded(d,(273,1008,815,1240),76,CREAM,outline=GOLD,width=5)
for bx,by,r in [(357,1013,54),(433,996,53),(544,987,69),(655,998,54),(746,1018,48)]:
    ellipse(d,(bx-r,by-r,bx+r,by+r),CREAM,outline=GOLD,width=5)
rounded(d,(290,1032,798,1225),58,(255,247,229,255),outline=(255,224,166,255),width=2)
save('14_装饰_价格云朵牌框.png',im)

# Red capsule under the offer amount.
im=canvas(); d=ImageDraw.Draw(im)
rounded(d,(296,1190,792,1259),34,(120,10,19,120))
rounded(d,(286,1182,802,1250),34,RED,outline=GOLD,width=3)
line(d,[(319,1191),(769,1191)],(226,91,65,255),1)
save('15_底色_元旦专享红条.png',im)

# Small gift box at the left of the main offer.
im=canvas(); d=ImageDraw.Draw(im)
rounded(d,(244,1129,334,1207),7,(147,13,23,255),outline=GOLD,width=3)
poly(d,[(244,1142),(334,1142),(347,1150),(256,1150)],(211,32,38,255))
poly(d,[(334,1142),(347,1150),(347,1209),(334,1207)],(119,9,18,255))
rounded(d,(277,1135,291,1208),3,GOLD)
rounded(d,(244,1161,346,1174),3,GOLD)
# bow
ellipse(d,(262,1111,291,1138),RED_LIGHT,outline=GOLD,width=2)
ellipse(d,(289,1111,318,1138),RED_LIGHT,outline=GOLD,width=2)
ellipse(d,(278,1120,302,1141),GOLD)
save('16_装饰_礼盒.png',im)

def cloud(name, x, y, scale=1.0, flip=False):
    im=canvas(); d=ImageDraw.Draw(im)
    pts=[]
    # scrolling cloud ribbon line and puffs
    line(d,[(x,y+30*scale),(x+28*scale,y+20*scale),(x+54*scale,y+23*scale),(x+75*scale,y+7*scale),(x+102*scale,y+8*scale),(x+119*scale,y+25*scale),(x+149*scale,y+27*scale),(x+174*scale,y+15*scale),(x+201*scale,y+21*scale),(x+223*scale,y+34*scale)],GOLD,width=5*scale)
    for bx,by,r in [(x+62*scale,y+8*scale,22*scale),(x+91*scale,y+4*scale,29*scale),(x+120*scale,y+15*scale,19*scale)]:
        ellipse(d,(bx-r,by-r,bx+r,by+r),(255,224,158,255),outline=GOLD,width=3*scale)
    # spiral flourish
    line(d,[(x+176*scale,y+15*scale),(x+193*scale,y+2*scale),(x+211*scale,y+7*scale),(x+212*scale,y+18*scale),(x+203*scale,y+20*scale)],GOLD,width=3*scale)
    save(name,im)
cloud('17_装饰_左侧祥云.png',34,1215,.68)
cloud('18_装饰_右侧祥云.png',884,1193,.72)

# Separate address and phone icons, both transparent PNGs.
im=canvas(); d=ImageDraw.Draw(im)
ellipse(d,(119,1322,165,1368),CREAM)
poly(d,[(124,1353),(160,1353),(142,1390)],CREAM)
ellipse(d,(133,1335,151,1353),RED)
save('19_图标_酒店地址定位.png',im)

im=canvas(); d=ImageDraw.Draw(im)
ellipse(d,(612,1322,658,1368),CREAM)
# simple telephone handset silhouette
line(d,[(628,1335),(633,1331),(638,1337),(636,1341),(642,1347),(646,1345),(651,1350),(648,1355),(642,1356),(635,1352),(630,1347),(626,1340)],RED,width=5)
save('20_图标_电话听筒.png',im)

# Fine gold rules flanking the title, separate from the text.
im=canvas(); d=ImageDraw.Draw(im)
line(d,[(52,302),(305,302)],GOLD,width=2)
line(d,[(783,302),(1036,302)],GOLD,width=2)
for x in [52,305,783,1036]: ellipse(d,(x-3,299,x+3,305),GOLD)
save('21_装饰_标题两侧金线.png',im)

# Soft cream wash over the upper room wall keeps the headline legible while
# letting the original room photo remain intact as its own bottom layer.
im=canvas(); pix=im.load()
for y in range(H*S):
    yy=y/S
    if yy < 110: alpha=120
    elif yy < 315: alpha=195
    elif yy < 475: alpha=int(195*(1-(yy-315)/160))
    else: alpha=0
    for x in range(W*S): pix[x,y]=(250,226,193,alpha)
save('22_底色_顶部标题柔光.png',im)

print(f'Wrote transparent layer assets to {OUT}')
