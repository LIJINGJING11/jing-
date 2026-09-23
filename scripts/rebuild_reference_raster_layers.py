"""Replace the poster's geometric placeholder art with raster artwork cutouts.

All decorations exported here are RGBA pixel layers.  Painterly ornaments come
from an image-generated transparent atlas; fireworks, clouds, ribbon colors and
title rules are extracted from the supplied raster reference.
"""
from pathlib import Path
import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'output' / '新春酒店促销海报_分层源文件' / 'assets'
W, H = 1088, 1445
ATLAS = Image.open('/Users/sigurd/.codex/generated_images/01a0ae83-9500-7010-bd43-6694f2ad3ffd/exec-10dec927-99f9-4d67-8d22-ff489441a5b8.png').convert('RGBA')
BADGE = Image.open('/Users/sigurd/.codex/generated_images/01a0ae83-9500-7010-bd43-6694f2ad3ffd/exec-1dd6f88a-06b8-4041-adf5-6a644027f8af.png').convert('RGBA')
REF = Image.open('/Users/sigurd/Downloads/01a0a4d8-4107-7b6a-ab0c-ad32002b5ef4.webp').convert('RGB').resize((W,H), Image.Resampling.LANCZOS)

def full():
    return Image.new('RGBA', (W,H), (0,0,0,0))

def put(im, art, x, y, w, h):
    art = art.resize((int(w),int(h)), Image.Resampling.LANCZOS)
    x, y = int(x), int(y)
    left, top = max(0,x), max(0,y)
    right, bottom = min(W,x+art.width), min(H,y+art.height)
    if right <= left or bottom <= top: return
    im.alpha_composite(art.crop((left-x,top-y,right-x,bottom-y)), (left,top))

def save(name, im):
    im.save(ASSETS/name, 'PNG', optimize=True)

def cut_sprite(row, col):
    cell = ATLAS.crop((col*362,row*362,(col+1)*362,(row+1)*362))
    a = np.asarray(cell.getchannel('A'))
    mask = np.uint8(a > 40)
    n, labels, stats, _ = cv2.connectedComponentsWithStats(mask, 8)
    if n <= 1:
        return cell
    areas = stats[1:, cv2.CC_STAT_AREA]
    keep_label = int(np.argmax(areas) + 1)
    x,y,w,h,area = stats[keep_label]
    # Strip the model's detached alpha specks, while retaining the nearby soft glow.
    pad=10
    x0,y0=max(0,x-pad),max(0,y-pad)
    x1,y1=min(362,x+w+pad),min(362,y+h+pad)
    rgba=np.asarray(cell).copy()
    yy,xx=np.mgrid[0:362,0:362]
    near=(xx>=x0)&(xx<x1)&(yy>=y0)&(yy<y1)
    rgba[:,:,3]=np.where(near & (rgba[:,:,3]>=8),rgba[:,:,3],0).astype(np.uint8)
    return Image.fromarray(rgba,'RGBA').crop((x0,y0,x1,y1))

def paste_sprite(name, tile, box):
    im=full(); put(im,tile,*box); save(name,im)

def extracted_firework(box, paste_box, name, warm=False):
    x0,y0,x1,y1=box
    roi=np.asarray(REF.crop(box)).astype(np.int16)
    blur=cv2.GaussianBlur(roi.astype(np.uint8),(0,0),7.5).astype(np.int16)
    diff=np.max(np.abs(roi-blur),axis=2).astype(np.float32)
    r,g,b=roi[:,:,0],roi[:,:,1],roi[:,:,2]
    if warm:
        color=(r>150)&(g>80)&(b>35)&((r-g)<125)&((g-b)>8)
    else:
        color=(r>185)&(g>180)&(b>130)&((r-g)<125)
    alpha=np.clip((diff-1.8)*15,0,255)
    alpha=np.where(color,alpha,0).astype(np.uint8)
    alpha=cv2.GaussianBlur(alpha,(0,0),0.45)
    rgba=np.dstack([roi.astype(np.uint8),alpha])
    crop=Image.fromarray(rgba,'RGBA')
    im=full(); put(im,crop,*paste_box); save(name,im)

def bottom_cloud(box, name):
    roi=np.asarray(REF.crop(box)).astype(np.int16)
    r,g,b=roi[:,:,0],roi[:,:,1],roi[:,:,2]
    # The neighboring ribbon is deep red; retain the cloud's cream and gold pixels.
    alpha=np.clip((g-32)*2.3,0,255)
    alpha=np.where((g>55)&(b>32)&(r>135),alpha,0)
    alpha=cv2.GaussianBlur(alpha.astype(np.uint8),(0,0),0.35)
    rgba=np.dstack([roi.astype(np.uint8),alpha.astype(np.uint8)])
    art=Image.fromarray(rgba,'RGBA')
    im=full(); put(im,art,box[0],box[1],box[2]-box[0],box[3]-box[1]); save(name,im)

# Source-based footer field: sample the real red field row by row and omit all lettering.
src=np.asarray(REF).astype(np.uint8)
footer=full(); fa=np.zeros((H,W,4),dtype=np.uint8)
for y in range(1280,H):
    row=src[y]
    red=row[(row[:,0]>row[:,1]+65)&(row[:,0]>row[:,2]+45)&(row[:,1]<105)]
    color=np.median(red,axis=0).astype(np.uint8) if len(red) else np.array([164,12,21],dtype=np.uint8)
    fa[y,:,0:3]=color
    fa[y,:,3]=255
save('12_底色_页脚酒红底.png',Image.fromarray(fa,'RGBA'))

# Extract the original flowing red field and gold lines from the lower decoration.
wave=full(); wa=np.zeros((H,W,4),dtype=np.uint8)
for y in range(1070,1324):
    row=src[y].astype(np.int16); r,g,b=row[:,0],row[:,1],row[:,2]
    alpha=np.where((r>110)&(r-g>70)&(r-b>45)&(g<115),255,0).astype(np.uint8)
    wa[y,:,0:3]=src[y]
    wa[y,:,3]=alpha
wa[:,:,3]=cv2.GaussianBlur(wa[:,:,3],(0,0),0.35)
save('13_装饰_底部红色绸带.png',Image.fromarray(wa,'RGBA'))

gold=full(); ga=np.zeros((H,W,4),dtype=np.uint8)
for y in range(1070,1324):
    row=src[y].astype(np.int16); r,g,b=row[:,0],row[:,1],row[:,2]
    score=np.minimum(np.minimum(g-65,b-20),r-g-10)
    alpha=np.clip(score*9,0,255).astype(np.uint8)
    alpha=np.where((r>155)&(g>85)&(b>30),alpha,0).astype(np.uint8)
    # The badge face is excluded; only the sweeping border flourishes stay here.
    alpha[280:820]=0
    ga[y,:,0:3]=src[y]
    ga[y,:,3]=alpha
ga[:,:,3]=cv2.GaussianBlur(ga[:,:,3],(0,0),0.35)
save('22_装饰_底部金色流线.png',Image.fromarray(ga,'RGBA'))

# Raster ornaments from the twelve-cutout atlas, fitted to the reference positions.
paste_sprite('02_装饰_左上梅花枝.png', cut_sprite(0,0), (0,0,316,196))
paste_sprite('03_装饰_右上灯笼_小.png', cut_sprite(0,2), (906,-2,113,178))
paste_sprite('04_装饰_右上灯笼_大.png', cut_sprite(0,1), (980,-8,148,201))
paste_sprite('10_装饰_右侧如意吊牌底.png', cut_sprite(1,1), (1008,168,80,266))
paste_sprite('11_装饰_左侧福牌底.png', cut_sprite(1,0), (41,454,145,354))
paste_sprite('16_装饰_礼盒.png', cut_sprite(2,0), (246,1110,116,151))
paste_sprite('19_图标_酒店地址定位.png', cut_sprite(2,2), (119,1321,47,61))
paste_sprite('20_图标_电话听筒.png', cut_sprite(2,3), (612,1321,49,55))

# Blank plaque cutout from the exact reference shape. Keep its painted raster edges and glow.
a=np.asarray(BADGE.getchannel('A'))
mask=np.uint8(a>40)
n,labels,stats,_=cv2.connectedComponentsWithStats(mask,8)
keep_label=int(np.argmax(stats[1:,cv2.CC_STAT_AREA])+1)
x,y,w,h,_=stats[keep_label]
pad=8; x0,y0=max(0,x-pad),max(0,y-pad); x1,y1=min(BADGE.width,x+w+pad),min(BADGE.height,y+h+pad)
badge=np.asarray(BADGE).copy()
yy,xx=np.mgrid[0:BADGE.height,0:BADGE.width]
near=(xx>=x0)&(xx<x1)&(yy>=y0)&(yy<y1)
badge[:,:,3]=np.where(near&(badge[:,:,3]>=8),badge[:,:,3],0).astype(np.uint8)
blank=Image.fromarray(badge,'RGBA').crop((x0,y0,x1,y1))
im=full(); put(im,blank,278,964,548,306); save('14_装饰_价格云朵牌框.png',im)

# Exact source clouds in the annotated callout areas; remove the red ribbon via a raster color matte.
bottom_cloud((0,1248,231,1320),'17_装饰_左侧祥云.png')
bottom_cloud((906,1122,1088,1270),'18_装饰_右侧祥云.png')

# Exact pale-gold firework strokes from the flattened source, isolated with local raster mattes.
extracted_firework((47,105,237,286),(43,101,197,191),'05_装饰_烟花_左上.png')
extracted_firework((350,0,495,140),(350,0,145,140),'06_装饰_烟花_顶部中.png')
extracted_firework((865,293,1024,466),(870,292,156,172),'07_装饰_烟花_右侧.png')
extracted_firework((0,1312,128,1445),(0,1308,130,137),'08_装饰_烟花_左下.png',True)
extracted_firework((814,1280,957,1418),(814,1277,143,141),'09_装饰_烟花_右下.png',True)

# Sample title rules retain the source's original thin red line and dot treatment.
rules=full(); rgba=np.zeros((H,W,4),dtype=np.uint8)
for box in [(277,342,382,369),(788,342,895,369)]:
    x0,y0,x1,y1=box; roi=src[y0:y1,x0:x1].astype(np.int16)
    r,g,b=roi[:,:,0],roi[:,:,1],roi[:,:,2]
    alpha=np.where((r>100)&(r-g>30)&(r-b>15)&(g<130),255,0).astype(np.uint8)
    rgba[y0:y1,x0:x1,0:3]=src[y0:y1,x0:x1]
    rgba[y0:y1,x0:x1,3]=alpha
rgba[:,:,3]=cv2.GaussianBlur(rgba[:,:,3],(0,0),0.25)
save('21_装饰_标题两侧金线.png',Image.fromarray(rgba,'RGBA'))

# Clean source red pill: inpaint only the original white text inside the red capsule.
pill_box=(286,1203,806,1257)
pill=np.asarray(REF.crop(pill_box)).copy()
gray=cv2.cvtColor(pill,cv2.COLOR_RGB2GRAY)
hsv=cv2.cvtColor(pill,cv2.COLOR_RGB2HSV)
mask=((gray>185)&(hsv[:,:,1]<205)).astype(np.uint8)*255
mask[:8,:]=0; mask[-8:,:]=0; mask[:,:20]=0; mask[:,-20:]=0
pill_clean=cv2.inpaint(pill,mask,7,cv2.INPAINT_TELEA)
r,g,b=pill_clean[:,:,0].astype(np.int16),pill_clean[:,:,1].astype(np.int16),pill_clean[:,:,2].astype(np.int16)
alpha=np.where(((r-g)>28)&((r-b)>20),255,0).astype(np.uint8)
# Keep the original gold edge around the pill as well.
goldmask=(r>155)&(g>95)&(b>30)&((r-g)>8)&((g-b)>4)
alpha=np.where(goldmask,255,alpha).astype(np.uint8)
alpha=cv2.GaussianBlur(alpha,(0,0),0.35)
pill_rgba=Image.fromarray(np.dstack([pill_clean,alpha]),'RGBA')
im=full(); put(im,pill_rgba,pill_box[0],pill_box[1],pill_box[2]-pill_box[0],pill_box[3]-pill_box[1]); save('15_底色_元旦专享红条.png',im)

# Crop the room plate so its wall picture and bed align with the lower positions
# in the reference while leaving the upper copy area clear.
photo_path=ASSETS/'01_背景_客房底图.png'
clean=Image.open('/Users/sigurd/.codex/generated_images/01a0ae83-9500-7010-bd43-6694f2ad3ffd/exec-33f2b853-8c15-44d1-a310-a0e1f08f32de.png').convert('RGB')
photo=clean.crop((0,90,941,1341)).resize((W,H),Image.Resampling.LANCZOS)
photo.save(photo_path,'PNG',optimize=True)

print(f'Rebuilt raster PNG layers in {ASSETS}')
