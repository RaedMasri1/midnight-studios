#!/usr/bin/env python3
"""Render a deterministic Idle Chaos diorama with an offline Mesa EGL renderer.

Runtime-only asset preparation dependencies (not website dependencies):
  python -m pip install moderngl==5.13.0 glcontext==3.1.0 numpy pillow
  LIBGL_ALWAYS_SOFTWARE=1 LP_NUM_THREADS=8 python design-assets/render-idle-chaos.py

No browser, image-generation service, purchased footage, or physics randomness is
used. Every frame is the same authored 3D scene evaluated at a precise progress.
The shadow map, terrain, city, volumetric storm and debris share one camera/depth.
The storm is a coherent 3D density field integrated along camera rays, with
rotating funnel structure, broad thundercloud anvil and a street-level dust skirt.
"""
from __future__ import annotations
import argparse, io, json, math, os, pathlib, random, sys
os.environ.setdefault('LIBGL_ALWAYS_SOFTWARE', '1')
os.environ.setdefault('LP_NUM_THREADS', '8')
os.environ.setdefault('OMP_NUM_THREADS', '8')
import numpy as np
from PIL import Image, ImageFilter, ImageDraw, ImageChops, ImageEnhance
import moderngl

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/assets/idle-chaos-frames'
W, H, COUNT = 1100, 800, 96
RNG = random.Random(71)

def norm(v):
    v=np.asarray(v,dtype=float); return v/max(np.linalg.norm(v),1e-8)
def rgb(h):
    h=h.lstrip('#');return np.array([int(h[i:i+2],16)/255 for i in (0,2,4)])
def smooth(a,b,t):
    t=np.clip((t-a)/(b-a),0,1); return t*t*(3-2*t)
def mat_identity():return np.eye(4,dtype='f4')
def look_at(eye,target):
    f=norm(np.array(target)-eye); r=norm(np.cross(f,[0,0,1])); u=np.cross(r,f)
    m=np.eye(4);m[:3,:3]=np.array([r,u,-f]);m[:3,3]=-m[:3,:3]@eye;return m
def ortho(l,r,b,t,n,f):
    m=np.eye(4);m[0,0]=2/(r-l);m[1,1]=2/(t-b);m[2,2]=-2/(f-n)
    m[:3,3]=[-(r+l)/(r-l),-(t+b)/(t-b),-(f+n)/(f-n)];return m
def rotate_z(v,a):
    c,s=math.cos(a),math.sin(a); return np.array([v[0]*c-v[1]*s,v[0]*s+v[1]*c,v[2]])

class Geo:
    def __init__(self):self.items=[]
    def tri(self,a,b,c,color,em=0):
        a,b,c=np.array(a),np.array(b),np.array(c);n=norm(np.cross(b-a,c-a));col=rgb(color) if isinstance(color,str) else np.asarray(color)
        self.items.extend([list(p)+list(n)+list(col)+[em] for p in (a,b,c)])
    def quad(self,a,b,c,d,color,em=0):self.tri(a,b,c,color,em);self.tri(a,c,d,color,em)
    def box(self,p,size,col,rot=0,em=0,bevel=0):
        # Beveled footprint produces warm edge highlights on the small buildings.
        x,y,z=size;v=np.array([[-x/2,-y/2,0],[x/2,-y/2,0],[x/2,y/2,0],[-x/2,y/2,0],[-x/2,-y/2,z],[x/2,-y/2,z],[x/2,y/2,z],[-x/2,y/2,z]])
        v=np.array([rotate_z(q,rot)+p for q in v])
        for ids in [(0,3,2,1),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7),(4,5,6,7)]:self.quad(*(v[i] for i in ids),col,em)
    def cyl(self,p,r,depth,col,segments=32,r2=None,em=0):
        r2=r if r2 is None else r2
        for i in range(segments):
            a=i*math.tau/segments;b=(i+1)*math.tau/segments
            q=[np.array(p)+[math.cos(a)*r,math.sin(a)*r,0],np.array(p)+[math.cos(b)*r,math.sin(b)*r,0],np.array(p)+[math.cos(b)*r2,math.sin(b)*r2,depth],np.array(p)+[math.cos(a)*r2,math.sin(a)*r2,depth]]
            self.quad(*q,col,em);self.tri(np.array(p)+[0,0,depth],q[3],q[2],col,em)
    def sphere(self,p,r,col,rings=8,sides=12,scale=(1,1,1),em=0,smooth=False):
        def v(a,b):return np.array(p)+np.array([math.sin(a)*math.cos(b),math.sin(a)*math.sin(b),math.cos(a)])*r*np.array(scale)
        for j in range(rings):
            a=j*math.pi/rings;b=(j+1)*math.pi/rings
            for i in range(sides):
                x=i*math.tau/sides;y=(i+1)*math.tau/sides
                start=len(self.items);self.quad(v(a,x),v(b,x),v(b,y),v(a,y),col,em)
                if smooth:
                    for item in self.items[start:]:item[3:6]=norm((np.array(item[:3])-p)/np.array(scale)**2)
    def tube(self,pts,r,col,sides=7,em=0):
        for a,b in zip(pts,pts[1:]):
            a,b=np.array(a),np.array(b);t=norm(b-a);u=norm(np.cross(t,[0,0,1] if abs(t[2])<.9 else [0,1,0]));v=np.cross(t,u)
            for i in range(sides):
                ang=i*math.tau/sides;ang2=(i+1)*math.tau/sides
                q=u*math.cos(ang)*r+v*math.sin(ang)*r;s=u*math.cos(ang2)*r+v*math.sin(ang2)*r
                self.quad(a+q,a+s,b+s,b+q,col,em)
    def ring(self,p,r,width,col,segments=96,em=0,ellipse=1):
        for i in range(segments):
            a=i*math.tau/segments;b=(i+1)*math.tau/segments
            v=lambda rr,t:np.array(p)+[rr*math.cos(t),rr*math.sin(t)*ellipse,0]
            self.quad(v(r-width/2,a),v(r+width/2,a),v(r+width/2,b),v(r-width/2,b),col,em)
    def array(self):return np.asarray(self.items,dtype='f4').reshape(-1,10)

G=Geo()
LAND=1.35
# Deep ocean skirt and luminous shallow-water shoal.
G.cyl((0,0,-.76),6.45,.13,'#07556c',128,r2=6.55)
G.cyl((0,0,-.61),6.12,.16,'#088b9f',128,r2=6.24)
G.cyl((0,0,-.43),5.95,.06,'#0ed1de',128,em=.10)
for radius,col,width in [(6.28,'#1bd9e9',.045),(6.08,'#9debf1',.025),(5.85,'#4cd3dc',.07)]:G.ring((0,0,-.35),radius,width,col,160,em=.28)
# Off-island cloud banks give the city a floating world atmosphere.
for p,s in [((-5.6,4.1,.5),1.0),((-6.3,3.7,.05),1.0),((-5.8,5.2,.8),.9),((-4.8,5.5,.3),1.1),((4.2,5.8,.1),.9),((5.4,5.0,-.3),1.1),((6.1,4.7,.05),.85),((-6,-2.9,-.7),.5),((-5.7,-3.6,-.9),.55),((4.9,-4.5,-.9),.55)]:
    for j in range(4):
        pos=np.array(p)+np.array([math.cos(j*1.9)*s*.5,math.sin(j*1.9)*s*.4,(j%2)*s*.17])
        G.sphere(pos,s*.64,['#57748a','#66859b','#54738a','#7392a4'][j],10,16,scale=(1.3,1,.65),smooth=True)

# Island rock wall is composed of individual articulated facets, rather than a cylinder.
N=72
ROCKS=['#5d647d','#74768d','#8d8794','#62677f','#8c827d','#414e68']
RIM_CHUNKS=[]
for i in range(N):
    a=i*math.tau/N;b=(i+1)*math.tau/N;rr=5.25+.12*math.sin(i*2.3)
    top=lambda t,r,z:np.array([math.cos(t)*r,math.sin(t)*r,z])
    v=[top(a,rr,LAND-.12),top(b,5.25+.12*math.sin((i+1)*2.3),LAND-.12),top(b,5.05,-.43),top(a,5.05,-.43)]
    mid=(v[0]+v[1]+v[2]+v[3])/4;mid[:2]*=1.05;mid[2]+=.14*math.sin(i)
    is_chunk=53<=i<=67
    g=Geo() if is_chunk else G
    for k in range(4):g.tri(v[k],v[(k+1)%4],mid,ROCKS[(i+k)%len(ROCKS)])
    if is_chunk:
        G.tri((0,0,LAND),top(a,4.60,LAND),top(b,4.60,LAND),['#71a96a','#7bb874','#8cbd77'][i%3])
        G.quad(top(a,4.6,LAND),top(a,rr,LAND),top(b,rr,LAND),top(b,4.6,LAND),'#80b371')
        RIM_CHUNKS.append((i,(a+b)/2,g.array()))
    else:
        G.tri((0,0,LAND),top(a,rr,LAND),top(b,5.25+.12*math.sin((i+1)*2.3),LAND),['#71a96a','#7bb874','#8cbd77'][i%3])
    G.quad(top(a,rr,LAND),top(b,5.25+.12*math.sin((i+1)*2.3),LAND),v[1],v[0],'#a9c986')

# Winding boulevard, inner roundabout, pavements, and lane markings.
G.ring((-.3,.05,LAND+.025),3.55,.69,'#cad0bf',120)
G.ring((-.3,.05,LAND+.035),3.55,.48,'#68758a',120)
G.ring((-.3,.05,LAND+.042),3.55,.018,'#d6d9ca',120)
for k in range(36):
    a=k*math.tau/36
    G.box((-.3+3.55*math.cos(a),.05+3.55*math.sin(a),LAND+.05),(.12,.025,.012),'#f7e2b7',a+math.pi/2)
G.ring((-1.0,-.55,LAND+.05),1.35,.6,'#cad0bf',96)
G.ring((-1.0,-.55,LAND+.06),1.35,.39,'#68758a',96)
G.box((-.4,-2.75,LAND+.02),(.65,1.1,.04),'#cad0bf',.07)
G.box((-.4,-2.75,LAND+.065),(.45,1.1,.03),'#68758a',.07)
# Town square and fountain.
G.cyl((-1.0,-.55,LAND+.01),1.04,.10,'#d4c4a5',64)
G.cyl((-1.0,-.55,LAND+.12),.63,.13,'#ece3cf',48)
G.cyl((-1.0,-.55,LAND+.27),.50,.015,'#48bdd1',48,em=.12)
G.cyl((-1.0,-.55,LAND+.28),.14,.26,'#c9dbd2',20)
G.sphere((-1.0,-.55,LAND+.65),.16,'#7ae5f0',rings=10,sides=16,scale=(1,1,1.4),em=.35)

DYNAMIC_ROOFS=[]
DYNAMIC_WALLS=[]
def house(p,w,d,h,wall,roof,rot=0):
    body_start=len(G.items)
    p=np.array(p);G.box(p,(w,d,h),wall,rot)
    # limestone corner bands, door, glazed windows on all four sides.
    for xx in (-w*.45,w*.45):
        for yy in (-d*.45,d*.45):G.box(p+rotate_z([xx,yy,0],rot),(.045,.045,h),'#f4dfba',rot)
    for floor in range(max(1,int(h/.32))):
        z=.16+floor*.30
        if z+.13>h:break
        for xx in (-w*.24,w*.24):
            for yy in (-d/2-.012,d/2+.012):
                G.box(p+rotate_z([xx,yy,z],rot),(.12,.025,.17),'#2b647b',rot)
                G.box(p+rotate_z([xx,yy-.016 if yy<0 else yy+.016,z+.02],rot),(.078,.011,.12),'#f6c976',rot,em=.13)
        for yy in (-d*.22,d*.22):
            for xx in (-w/2-.013,w/2+.013):G.box(p+rotate_z([xx,yy,z],rot),(.025,.11,.16),'#3d778c',rot)
    G.box(p+rotate_z([0,-d/2-.021,.0],rot),(.15,.03,.25),'#735d56',rot)
    roof_start=len(G.items)
    # Deep tiled gabled roof with two sloping planes.
    pts=[[-w*.57,-d*.57,h],[-w*.57,d*.57,h],[w*.57,d*.57,h],[w*.57,-d*.57,h],[0,-d*.57,h+.32],[0,d*.57,h+.32]]
    pts=[p+rotate_z(v,rot) for v in pts]
    G.quad(pts[0],pts[4],pts[5],pts[1],roof);G.quad(pts[4],pts[3],pts[2],pts[5],roof)
    G.tri(pts[0],pts[3],pts[4],wall);G.tri(pts[1],pts[5],pts[2],wall)
    for j in range(5):
        yy=(-d*.5+j*d*.25)
        for s in (-1,1):
            G.tube([p+rotate_z([s*w*.53,yy,h+.025],rot),p+rotate_z([0,yy,h+.33],rot)],.012,'#f0ad7b',sides=4)
    G.box(p+rotate_z([w*.25,d*.15,h+.14],rot),(.11,.12,.33),'#f3c6a2',rot)
    if p[0]>1 and p[1]<0:
        DYNAMIC_ROOFS.append((p+np.array([0,0,h]),np.array(G.items[roof_start:],dtype='f4')))
        del G.items[roof_start:]
        if p[0]<2 and p[1]<-3.4:
            DYNAMIC_WALLS.append((p,np.array(G.items[body_start:roof_start],dtype='f4')))
            del G.items[body_start:roof_start]

WALLS=['#e7cfa6','#efb787','#f3d799','#c2d7c4','#e0cabd','#b7ced8']
ROOFS=['#cc7752','#cd6e4d','#568d9d','#b27156']
# Outer district: varied houses with generous breathing room around the storm zone.
for i,a in enumerate(np.linspace(-math.pi*.95,math.pi*.97,17)):
    if -.38<a<.65:continue
    x=-.3+4.32*math.cos(a);y=.05+4.32*math.sin(a)
    house((x,y,LAND+.02),.50+(i%3)*.07,.53,.55+(i%3)*.2,WALLS[i%6],ROOFS[i%4],a+math.pi/2)
# Inner district and civic hall.
for i,(x,y,w,d,h) in enumerate([(-2.9,.6,.65,.7,1.1),(-2.5,1.6,.7,.6,.85),(-1.6,2.1,.65,.7,1.0),(-.5,2.35,.6,.65,.85),(-2.7,-1.5,.6,.55,.7),(-2.0,-2.55,.7,.62,.65),(.0,-1.45,.48,.55,.65),(.6,2.4,.65,.64,.78),(1.65,2.55,.58,.66,.6)]):
    house((x,y,LAND+.02),w,d,h,WALLS[(i+2)%6],ROOFS[(i+1)%4],.07*math.sin(i))
# Pale stone clock tower with teal roof and gilt finial.
G.box((-1.55,1.05,LAND),(.58,.62,1.75),'#eee1c6')
for z in (.13,.65,1.2,1.6):G.box((-1.55,1.05,LAND+z),(.64,.68,.07),'#d2bb91')
for yy in (.72,1.38):
    G.sphere((-1.55,yy,LAND+1.42),.18,'#f7e6bc',rings=12,sides=24,scale=(1,.08,1))
    G.tube([(-1.55,yy-.018,LAND+1.42),(-1.55,yy-.018,LAND+1.55)],.014,'#394a62',6)
    G.tube([(-1.55,yy-.018,LAND+1.42),(-1.43,yy-.018,LAND+1.42)],.012,'#394a62',6)
G.cyl((-1.55,1.05,LAND+1.8),.48,.7,'#3b889a',4,r2=.02)
G.cyl((-1.55,1.05,LAND+2.5),.025,.2,'#edc36d',10)
# Observatory by the water.
G.cyl((2.9,-2.5,LAND),.48,.52,'#f0d6b2',40)
G.sphere((2.9,-2.5,LAND+.54),.48,'#58a0b4',12,24,scale=(1,1,.75))
G.box((2.9,-2.5,LAND+.52),(.08,1.02,.11),'#b0d9dd',.25)

DYNAMIC_TREES=[]
def tree(p,s=1,kind=0):
    start=len(G.items)
    p=np.array(p);G.cyl(p,.042*s,.47*s,'#886547',8)
    if kind:
        for i in range(3):G.cyl(p+[0,0,.26*s+i*.22*s],(.30-i*.045)*s,.46*s,['#3c7964','#4b9570','#65a775'][i],9,r2=.02)
    else:
        G.sphere(p+[0,0,.64*s],.33*s,'#75a857',6,9,scale=(1,.9,1.05))
        G.sphere(p+[.16*s,-.04*s,.56*s],.21*s,'#9cbd68',5,8)
        G.sphere(p+[-.14*s,.02*s,.74*s],.22*s,'#5c9555',5,8)
    if p[0]>.05:
        DYNAMIC_TREES.append((p,np.array(G.items[start:],dtype='f4')))
        del G.items[start:]
for i in range(65):
    a=RNG.random()*math.tau;r=RNG.uniform(4.77,5.08)
    if -.5<a<.4:continue
    tree((math.cos(a)*r,math.sin(a)*r,LAND),RNG.uniform(.7,1.05),i%3==0)
for x,y in [(-3.4,2.2),(-3,2.6),(-2.4,2.75),(-3.8,1.9),(-3.7,-.4),(-.4,.2),(-.7,.7),(.15,.5),(1,2.9),(.4,-3.9),(1.5,-4.1)]:tree((x,y,LAND),.9,1)
# Park shrubs, streetlights and tiny parked cars.
for i in range(17):
    a=i*math.tau/17;x=-.3+3.98*math.cos(a);y=.05+3.98*math.sin(a)
    G.cyl((x,y,LAND),.024,.7,'#425b6a',8)
    G.sphere((x,y,LAND+.74),.075,'#ffe5a7',6,8,em=.4)
for i,a in enumerate([-.8,-2,1.6,2.5]):
    p=(-.3+3.56*math.cos(a),.05+3.56*math.sin(a),LAND+.08)
    G.box(p,(.16,.31,.13),['#e5b362','#af6b50','#8eb9c3','#f1dfc3'][i],a)
    G.box(np.array(p)+[0,0,.13],(.12,.16,.08),'#7596a8',a)
# Foam rings and water cascades pour from the same ledges on all frames.
for k,a in enumerate([-2.3,-1.25,.85]):
    pts=[]
    for j in range(15):
        f=j/14;r=5.1+.28*math.sin(f*math.pi/2)
        pts.append((r*math.cos(a),r*math.sin(a),LAND-(LAND+.43)*f))
    for shift in (-.12,-.04,.04,.12):
        G.tube([(x+shift,y,z) for x,y,z in pts],.06,'#76e7ec',6,em=.18)
    G.ring((5.4*math.cos(a),5.4*math.sin(a),-.31),.38,.06,'#bbf3ed',40,em=.3,ellipse=.6)

STATIC=G.array()
DEBRIS=[]
for i in range(170):
    DEBRIS.append((RNG.random(),RNG.random()*math.tau,RNG.uniform(.08,.31),['#d99b60','#d7bc8b','#976e4e','#596574','#78a75c','#b77956'][i%6]))
RAIN=[(RNG.uniform(-3.5,5.5),RNG.uniform(-3.5,4.3),RNG.random(),RNG.uniform(.35,.78)) for _ in range(150)]

def dynamic(t):
    g=Geo();grow=smooth(.08,.90,t);chaos=smooth(.50,.98,t)
    cx,cy=1.85,.10
    # Original cliff wedges detach; the bedrock is continuous from the first frame.
    for idx,angle,verts in RIM_CHUNKS:
        part=verts.copy();offset=.12+.30*(.5+.5*math.sin(idx*2.1))
        displacement=np.array([math.cos(angle)*offset,math.sin(angle)*offset,-.08-.18*(.5+.5*math.sin(idx*1.9))])*chaos
        part[:,:3]+=displacement;g.items.extend(part.tolist())
        if chaos>.001:
            for dz in (-.2,-.55):
                p=(math.cos(angle)*5.15,math.sin(angle)*5.15,dz)
                g.box(p,(chaos*.20,chaos*.22,chaos*.08),'#ff7b23',angle,em=3.1*chaos)
    # Two district roofs are lifted intact before joining the vortex debris.
    roof_lift=smooth(.52,.98,t)
    for i,(pivot,verts) in enumerate(DYNAMIC_ROOFS):
        part=verts.copy();angle=roof_lift*(1.0+i*.4)
        c,s=math.cos(angle),math.sin(angle);rotation=np.array([[c,-s,0],[s,c,0],[0,0,1]])
        part[:,:3]=(part[:,:3]-pivot)@rotation.T+pivot
        part[:,:3]+=np.array([(cx-pivot[0])*.8*roof_lift,(cy-pivot[1])*.8*roof_lift,(3.3+i*.7)*roof_lift])
        part[:,3:6]=part[:,3:6]@rotation.T;g.items.extend(part.tolist())
    for i,(pivot,verts) in enumerate(DYNAMIC_TREES):
        part=verts.copy();h=np.maximum(0,part[:,2]-pivot[2]);wind=grow*(.7+.3*math.sin(t*14+i*.7))
        part[:,0]+=.16*wind*h*h;part[:,1]+=.32*wind*h*h
        if i in (3,11):
            lift=smooth(.65,.97,t);angle=lift*(1.1+i*.03)
            c,s=math.cos(angle),math.sin(angle);rotation=np.array([[c,0,s],[0,1,0],[-s,0,c]])
            part[:,:3]=(part[:,:3]-pivot)@rotation.T+pivot
            part[:,:3]+=np.array([(cx-pivot[0])*.4*lift,(cy-pivot[1])*.4*lift,2.1*lift])
            part[:,3:6]=part[:,3:6]@rotation.T
        g.items.extend(part.tolist())
    for i,(pivot,verts) in enumerate(DYNAMIC_WALLS):
        collapse=smooth(.71,.98,t);angle=collapse*.82
        c,s=math.cos(angle),math.sin(angle);rotation=np.array([[1,0,0],[0,c,s],[0,-s,c]])
        part=verts.copy();part[:,:3]=(part[:,:3]-pivot)@rotation.T+pivot;part[:,3:6]=part[:,3:6]@rotation.T;g.items.extend(part.tolist())
        if collapse>.01:
            for j in range(10):
                p=pivot+np.array([math.sin(j*2.3)*.55,math.cos(j*1.8)*.5,.05])
                g.box(p,(.14*collapse,.11*collapse,.08*collapse),'#d3b28c',j*1.3)
    # Ground displacement: an authored radial fracture. Eases from flush terrain.
    crack=[[(cx,-.1,LAND+.05),(2,-1.3,LAND+.06),(2.7,-2,LAND+.065),(2.65,-3,LAND+.07),(3.2,-4.1,LAND+.06),(3.5,-4.0,-.40)],[(2,-1.3,LAND+.06),(3.15,-.7,LAND+.06),(4.35,-1.45,LAND+.07),(4.9,-1.6,-.35)],[(2.7,-2,LAND+.065),(1.45,-2.2,LAND+.06),(1.1,-3.55,LAND+.06),(1.0,-5,-.35)]]
    if chaos>.001:
        for pts in crack:
            n=max(2,int(len(pts)*chaos)+1);g.tube(pts[:n],.040+chaos*.055,'#ff641e',7,em=2.7)
            g.tube(pts[:n],.018+chaos*.025,'#ffcf71',5,em=3.2)
    # The storm itself is rendered as a shared, depth-tested 3D density field.
    height=.35+grow*6.0
    # Suspended chunks follow continuous spirals; every frame uses the same seeded set.
    for i,(phase,a,size,col) in enumerate(DEBRIS):
        appear=smooth(.23+phase*.35,.43+phase*.35,t)
        if appear<.001:continue
        f=phase*.28+smooth(.23+phase*.40,1,t)*.65
        angle=a+t*9.4;rr=.65+f*2.55+chaos*.4
        z=LAND+.18+f*height*.84
        p=(cx+math.cos(angle)*rr,cy+math.sin(angle)*rr,z)
        g.box(p,(size*appear,size*.75*appear,size*.84*appear),col,angle+t*3)
    rain=smooth(.30,.78,t)
    if rain>.01:
        for i,(x,y,phase,length) in enumerate(RAIN):
            f=(phase-t*1.6)%1;fade=smooth(0,.12,f)*(1-smooth(.85,1,f))*rain
            z=2.0+f*4.8*grow
            p=np.array([x+.3*math.sin(t*3+i),y,z])
            if fade>.01:g.tube([p,p+np.array([.17,.08,-length])],.0045*fade,'#87b8ca',4,em=.1)
    # Authored fork lightning, a short broad flash in each continuous progress window.
    pulse=max(0,1-abs(t-.55)/.04)+max(0,1-abs(t-.79)/.035)+smooth(.85,.97,t)*.8
    if pulse>.01:
        branches=[[(cx-1.5,cy-.7,LAND+height*.89),(cx-2.6,cy-1.0,LAND+height*.72),(cx-2.1,cy-1.2,LAND+height*.61),(cx-3.0,cy-1.8,LAND+height*.43),(cx-2.7,cy-2.0,LAND+height*.30),(cx-3.65,cy-2.5,LAND+.10)],[(cx-2.1,cy-1.2,LAND+height*.61),(cx-3.1,cy-.8,LAND+height*.54),(cx-3.7,cy-.9,LAND+height*.38)],[(cx+1.8,cy-.2,LAND+height*.92),(cx+2.6,cy-.5,LAND+height*.70),(cx+2.1,cy-.7,LAND+height*.55),(cx+3.3,cy-.9,LAND+height*.25),(cx+3.2,cy-1.5,LAND+.12)],[(cx+2.1,cy-.7,LAND+height*.55),(cx+3.5,cy-.4,LAND+height*.49),(cx+3.9,cy-.5,LAND+height*.32)]]
        for pts in branches:g.tube(pts,.015+pulse*.019,'#71e1ff',6,em=5)
    return g.array()

VERT='''#version 330
in vec3 in_pos;in vec3 in_normal;in vec3 in_color;in float in_em;
uniform mat4 mvp;uniform mat4 light_mvp;
out vec3 normal;out vec3 color;out vec3 world;out vec4 shadow_pos;out float em;
void main(){world=in_pos;normal=in_normal;color=in_color;em=in_em;shadow_pos=light_mvp*vec4(in_pos,1);gl_Position=mvp*vec4(in_pos,1);}
'''
FRAG='''#version 330
in vec3 normal;in vec3 color;in vec3 world;in vec4 shadow_pos;in float em;
uniform sampler2D shadow_map;uniform vec3 camera_pos;uniform float storm;
layout(location=0) out vec4 frag;layout(location=1) out vec4 normal_out;
float hash31(vec3 p){p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
float noise3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash31(i),hash31(i+vec3(1,0,0)),f.x),mix(hash31(i+vec3(0,1,0)),hash31(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash31(i+vec3(0,0,1)),hash31(i+vec3(1,0,1)),f.x),mix(hash31(i+vec3(0,1,1)),hash31(i+vec3(1,1,1)),f.x),f.y),f.z);}
float cloudNoise(vec3 p){return .57*noise3(p)+.28*noise3(p*2.07)+.15*noise3(p*4.12);}
float visibility(){vec3 p=shadow_pos.xyz/shadow_pos.w*.5+.5;float shade=0;float bias=max(.0015*(1.-dot(normalize(normal),normalize(vec3(-6,-8,14)))),.00065);
for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++){float d=texture(shadow_map,p.xy+vec2(x,y)*.0012).r;shade+=(p.z-bias>d)? .24:1.;}return shade/9.;}
void main(){vec3 n=normalize(normal);vec3 l=normalize(vec3(-6,-8,14));vec3 fill=normalize(vec3(8,4,9));
float nd=max(dot(n,l),0);float ff=max(dot(n,fill),0);float vis=visibility();
vec3 c=color;if(em<-.5){float cloud=cloudNoise(world*3.8+vec3(0,0,storm*8));c*=.67+cloud*.85;}
vec3 albedo=pow(c,vec3(2.2));
vec3 lit=albedo*(vec3(.13,.19,.26)+vec3(1.65,1.27,.90)*nd*vis+vec3(.12,.25,.42)*ff);
float cloudShade=exp(-length((world.xy-vec2(1.0,.2))/vec2(7,6)));lit*=1.-storm*.75*cloudShade;
vec3 v=normalize(camera_pos-world);float spec=pow(max(dot(n,normalize(l+v)),0),45)*.08;
lit+=vec3(spec)+albedo*max(em,0.)*.85;
float lava=max(0.,1.-length(world-vec3(2.7,-1.8,1.4))/3.5)*storm;lit+=vec3(.43,.12,.015)*lava*max(.25,dot(n,normalize(vec3(2.7,-1.8,1.5)-world)));
lit=lit/(vec3(1.0)+lit*.25);lit=pow(lit,vec3(1.0/2.2));frag=vec4(lit,1);normal_out=vec4(n*.5+.5,1);}
'''
SVERT='''#version 330
in vec3 in_pos;uniform mat4 light_mvp;void main(){gl_Position=light_mvp*vec4(in_pos,1);}
'''
SFRAG='''#version 330
void main(){}
'''
POSTVERT='''#version 330
out vec2 uv;void main(){vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);uv=p;gl_Position=vec4(p*2.-1.,0,1);}
'''
POSTFRAG='''#version 330
in vec2 uv;out vec4 frag;uniform sampler2D colors;uniform sampler2D normals;uniform sampler2D depths;uniform mat4 inverse_mvp;uniform mat4 mvp;
const vec3 kernel[12]=vec3[](vec3(.4,.1,.4),vec3(-.5,.3,.5),vec3(.2,-.5,.3),vec3(-.3,-.4,.6),vec3(.8,.4,.3),vec3(-.6,.6,.4),vec3(.4,-.7,.2),vec3(-.8,-.2,.4),vec3(.2,.9,.3),vec3(.9,-.3,.2),vec3(-.2,-.8,.2),vec3(-.7,.1,.5));
void main(){vec4 col=texture(colors,uv);if(col.a<.1){frag=col;return;}float depth=texture(depths,uv).r;vec4 wp=inverse_mvp*vec4(uv*2.-1.,depth*2.-1.,1);vec3 p=wp.xyz/wp.w;
vec3 n=normalize(texture(normals,uv).xyz*2.-1.);vec3 u=normalize(cross(n,abs(n.z)>.85?vec3(0,1,0):vec3(0,0,1)));vec3 v=cross(n,u);
float ao=0.;for(int i=0;i<12;i++){vec3 sample_pos=p+(u*kernel[i].x+v*kernel[i].y+n*kernel[i].z)*.44;vec4 sp=mvp*vec4(sample_pos,1);sp.xyz=sp.xyz/sp.w*.5+.5;float d=texture(depths,sp.xy).r;float delta=sp.z-d;
ao+=smoothstep(.0005,.002,delta)*(1.-smoothstep(.007,.017,delta));}
frag=vec4(col.rgb*(1.-ao/12.*.66),col.a);}
'''
VOLUMEFRAG='''#version 330
in vec2 uv;out vec4 frag;uniform sampler2D colors;uniform sampler2D depths;uniform mat4 inverse_mvp;uniform float progress;
float hash31(vec3 p){p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
float noise3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash31(i),hash31(i+vec3(1,0,0)),f.x),mix(hash31(i+vec3(0,1,0)),hash31(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash31(i+vec3(0,0,1)),hash31(i+vec3(1,0,1)),f.x),mix(hash31(i+vec3(0,1,1)),hash31(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){return .62*noise3(p)+.27*noise3(p*2.03)+.11*noise3(p*4.11);}
float grow;float chaos;float height;
float density(vec3 p){
float h=(p.z-1.35)/height;vec2 c=vec2(1.65+.28*sin(h*4.+progress*5.),.1+.15*cos(h*5.+progress*4.));vec2 q=p.xy-c;
float radius=.15+grow*.29+grow*1.90*pow(max(h,0.),1.13);
float angle=atan(q.y,q.x);float twist=sin(angle*3.-h*26.+progress*25.);
vec3 advect=vec3(p.xy,p.z-progress*2.8);float n=fbm(advect*2.0)-.5;
float funnel=1.-length(q)/max(radius,.08)+twist*.23+n*.34;
funnel=smoothstep(-.13,.35,funnel)*smoothstep(-.03,.04,h)*(1.-smoothstep(.84,.96,h));
vec3 capCenter=vec3(.9,.45,1.35+height*.93);vec3 capR=vec3(.30+grow*4.0,.30+grow*2.75,.18+grow*1.0);
float cap=1.-length((p-capCenter)/capR);cap+=n*.52+.065*sin(p.x*2.+progress*4.);
float anvil=1.-length((p-(capCenter-vec3(.50,0,.38)))/vec3(.35+grow*4.7,.35+grow*2.9,.12+grow*.48));anvil+=n*.40;
cap=smoothstep(-.14,.30,max(cap,anvil));
vec3 skirtCenter=vec3(1.85,.1,1.64);float skirt=1.-length((p-skirtCenter)/vec3(.45+chaos*2.1,.45+chaos*1.85,.14+chaos*.65));
skirt=smoothstep(-.1,.5,skirt+n*.7+twist*.11)*chaos*.65;
return max(max(funnel,cap)*grow,skirt)*1.85;
}
void main(){vec4 behind=texture(colors,uv);grow=smoothstep(.08,.90,progress);chaos=smoothstep(.50,.98,progress);height=.35+grow*6.0;
if(grow<.001){frag=behind;return;}
vec4 nearP=inverse_mvp*vec4(uv*2.-1.,-1,1);vec4 farP=inverse_mvp*vec4(uv*2.-1.,1,1);vec3 ro=nearP.xyz/nearP.w;vec3 rd=normalize(farP.xyz/farP.w-ro);
float sceneDepth=texture(depths,uv).r;vec4 sceneP=inverse_mvp*vec4(uv*2.-1.,sceneDepth*2.-1.,1);float sceneDistance=dot(sceneP.xyz/sceneP.w-ro,rd);
vec3 boxLo=vec3(-5.4,-4.3,1.29),boxHi=vec3(7.2,5.,9.4);vec3 ta=(boxLo-ro)/rd,tb=(boxHi-ro)/rd;vec3 lo=min(ta,tb),hi=max(ta,tb);
float start=max(max(lo.x,lo.y),max(lo.z,0.));float end=min(min(hi.x,hi.y),min(hi.z,sceneDistance));if(end<=start){frag=behind;return;}
float stepLength=(end-start)/72.;float jitter=hash31(vec3(gl_FragCoord.xy,7.));float trans=1.;vec3 accum=vec3(0);vec3 sun=normalize(vec3(-.6,-.7,1));
float pulse=max(0.,1.-abs(progress-.55)/.04)+max(0.,1.-abs(progress-.79)/.035)+smoothstep(.85,.97,progress)*.8;
for(int i=0;i<72;i++){vec3 p=ro+rd*(start+(float(i)+jitter)*stepLength);float d=density(p);if(d>.005){
float dl=density(p+sun*.55);float shade=clamp(.52+(d-dl)*.45,.08,1.);float altitude=clamp((p.z-1.4)/7.5,0.,1.);
vec3 cloud=vec3(.025,.045,.080)+vec3(.23,.28,.34)*shade+vec3(.18,.21,.23)*pow(shade,4.);cloud*=.78+altitude*.22;
float h=(p.z-1.35)/height;float ang=atan(p.y-.1,p.x-1.85);float band=.5+.5*sin(ang*3.-h*28.+progress*25.);cloud*=mix(.60+.40*band,1.,smoothstep(.72,.95,h));
float dust=1.-smoothstep(1.8,3.0,p.z);cloud=mix(cloud,vec3(.31,.25,.20)+vec3(.17,.13,.07)*shade,dust*chaos*.6);
float electric=exp(-length((p-vec3(.1,-.7,4.8))/vec3(2.0,1.8,2.0)))*pulse;cloud+=vec3(.035,.14,.24)*electric;
cloud+=vec3(.25,.075,.01)*chaos*exp(-length(p-vec3(2.7,-1.8,1.5))*1.3);
float attenuation=exp(-d*stepLength*1.65);accum+=trans*cloud*(1.-attenuation);trans*=attenuation;if(trans<.012)break;}}
float alpha=(1.-trans)+behind.a*trans;vec3 outC=accum+behind.rgb*behind.a*trans;frag=vec4(outC/max(alpha,.001),alpha);}
'''

class Renderer:
    def __init__(self):
        self.ctx=moderngl.create_standalone_context(backend='egl')
        self.ctx.enable(moderngl.DEPTH_TEST)
        self.p=self.ctx.program(vertex_shader=VERT,fragment_shader=FRAG)
        self.sp=self.ctx.program(vertex_shader=SVERT,fragment_shader=SFRAG)
        self.pp=self.ctx.program(vertex_shader=POSTVERT,fragment_shader=POSTFRAG)
        self.post_vao=self.ctx.vertex_array(self.pp,[])
        self.vp=self.ctx.program(vertex_shader=POSTVERT,fragment_shader=VOLUMEFRAG);self.volume_vao=self.ctx.vertex_array(self.vp,[])
        self.shadow=self.ctx.depth_texture((2048,2048));self.shadow.compare_func=''
        self.shadow.repeat_x=False;self.shadow.repeat_y=False
        self.sf=self.ctx.framebuffer(depth_attachment=self.shadow)
        self.tex=self.ctx.texture((W*2,H*2),4);self.normal_tex=self.ctx.texture((W*2,H*2),4,dtype='f2');self.depth=self.ctx.depth_texture((W*2,H*2));self.depth.compare_func=''
        self.fbo=self.ctx.framebuffer([self.tex,self.normal_tex],self.depth)
        self.final_tex=self.ctx.texture((W*2,H*2),4);self.final_fbo=self.ctx.framebuffer([self.final_tex])
        self.volume_tex=self.ctx.texture((W,H),4);self.volume_fbo=self.ctx.framebuffer([self.volume_tex]);self.vp['colors'].value=0;self.vp['depths'].value=1
        self.pp['colors'].value=0;self.pp['normals'].value=1;self.pp['depths'].value=2
        self.static=self.ctx.buffer(STATIC.tobytes());self.dynamic=self.ctx.buffer(reserve=32_000_000)
        self.main_static=self.ctx.vertex_array(self.p,[(self.static,'3f 3f 3f 1f','in_pos','in_normal','in_color','in_em')])
        self.main_dyn=self.ctx.vertex_array(self.p,[(self.dynamic,'3f 3f 3f 1f','in_pos','in_normal','in_color','in_em')])
        self.shadow_static=self.ctx.vertex_array(self.sp,[(self.static,'3f 28x','in_pos')])
        self.shadow_dyn=self.ctx.vertex_array(self.sp,[(self.dynamic,'3f 28x','in_pos')])
        self.light=ortho(-9,9,-9,9,1,45)@look_at(np.array([-9,-12,20]),np.array([0,0,1.]))
        self.sp['light_mvp'].write(self.light.astype('f4').T.tobytes());self.p['light_mvp'].write(self.light.astype('f4').T.tobytes());self.p['shadow_map'].value=0
    def render(self,t):
        # A subtle physical camera move; all geometry retains the same common depth.
        grow=float(smooth(.08,.90,t));eye=np.array([12.8-.6*t,-16.5+.5*t,14.3]);target=np.array([.2,0,.95+2.6*grow])
        view=look_at(eye,target);s=6.65+.35*grow
        mvp=ortho(-s*W/H,s*W/H,-s,s,.1,65)@view
        self.p['mvp'].write(mvp.astype('f4').T.tobytes());self.p['camera_pos'].value=tuple(eye);self.p['storm'].value=float(smooth(.25,.98,t))
        dyn=dynamic(t);self.dynamic.write(dyn.tobytes())
        self.sf.use();self.ctx.viewport=(0,0,2048,2048);self.sf.clear(depth=1)
        self.shadow_static.render();self.shadow_dyn.render(vertices=len(dyn))
        self.fbo.use();self.ctx.viewport=(0,0,W*2,H*2);self.fbo.clear(0,0,0,0,depth=1);self.shadow.use(0)
        self.main_static.render();self.main_dyn.render(vertices=len(dyn))
        self.final_fbo.use();self.tex.use(0);self.normal_tex.use(1);self.depth.use(2)
        self.pp['mvp'].write(mvp.astype('f4').T.tobytes());self.pp['inverse_mvp'].write(np.linalg.inv(mvp).astype('f4').T.tobytes())
        self.ctx.disable(moderngl.DEPTH_TEST);self.post_vao.render(vertices=3)
        self.volume_fbo.use();self.ctx.viewport=(0,0,W,H);self.final_tex.use(0);self.depth.use(1)
        self.vp['inverse_mvp'].write(np.linalg.inv(mvp).astype('f4').T.tobytes());self.vp['progress'].value=float(t);self.volume_vao.render(vertices=3)
        self.ctx.enable(moderngl.DEPTH_TEST)
        im=Image.frombytes('RGBA',(W,H),self.volume_fbo.read(components=4)).transpose(Image.Transpose.FLIP_TOP_BOTTOM)
        return post(im,t)

def post(im,t):
    # Studio sky and bloom are compositing passes on the actual geometry render.
    yy,xx=np.mgrid[0:H,0:W];glow=np.exp(-(((xx-W*.58)/(W*.55))**2+((yy-H*.44)/(H*.65))**2)*2.0)
    bg=np.zeros((H,W,4),np.uint8);bg[:,:,3]=255
    for i,(a,b) in enumerate([(7,20),(17,43),(32,63)]):bg[:,:,i]=(a+(b-a)*glow).astype(np.uint8)
    base=Image.fromarray(bg,'RGBA');base.alpha_composite(im)
    a=np.array(im).astype(float);mask=((a[:,:,0]>205)&(a[:,:,1]>95)&(a[:,:,2]<170))|((a[:,:,2]>210)&(a[:,:,1]>190)&(a[:,:,2]>a[:,:,0]*1.025))
    highlights=Image.fromarray((a[:,:,:3]*mask[:,:,None]).astype('uint8'),'RGB')
    tight=ImageEnhance.Brightness(highlights.filter(ImageFilter.GaussianBlur(3))).enhance(.85)
    broad=ImageEnhance.Brightness(highlights.filter(ImageFilter.GaussianBlur(13))).enhance(1.25)
    base=ImageChops.screen(ImageChops.screen(base.convert('RGB'),broad),tight)
    # Subtle submerged halo anchors the floating world to the page.
    return base.convert('RGB')

def save_preview(im,path,fmt='PNG',**kwargs):
    encoded=io.BytesIO();im.save(encoded,format=fmt,**kwargs);data=encoded.getvalue();Image.open(io.BytesIO(data)).load()
    stage=path.with_suffix(path.suffix+'.tmp');stage.write_bytes(data);stage.replace(path)

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--preview',action='store_true');ap.add_argument('--frames',type=int,default=COUNT);ap.add_argument('--start',type=int,default=0);ap.add_argument('--only',default='');args=ap.parse_args()
    OUT.mkdir(exist_ok=True,parents=True);(OUT/'mobile').mkdir(exist_ok=True)
    r=Renderer();print('Renderer:',r.ctx.info['GL_RENDERER'],flush=True)
    if args.preview:
        ims=[]
        for i,t in enumerate([0,.36,.67,1]):
            im=r.render(t);save_preview(im,ROOT/f'docs/animation-review/idle-chaos-preview-{i}.png');ims.append(im.resize((550,400)))
        sheet=Image.new('RGB',(1100,800));
        for i,im in enumerate(ims):sheet.paste(im,((i%2)*550,(i//2)*400))
        save_preview(sheet,ROOT/'docs/animation-review/idle-chaos-contact-sheet.jpg','JPEG',quality=92);return
    def save_webp(im,path,quality):
        encoded=io.BytesIO();im.save(encoded,format='WEBP',quality=quality,method=6);data=encoded.getvalue()
        assert len(data)>1000,'Empty encoded frame'
        Image.open(io.BytesIO(data)).load()
        stage=path.with_suffix('.webp.tmp');stage.write_bytes(data);stage.replace(path)
    indices=[int(x) for x in args.only.split(',')] if args.only else range(args.start,args.frames)
    for i in indices:
        im=r.render(i/(args.frames-1));save_webp(im,OUT/f'{i:03d}.webp',83)
        save_webp(im.resize((660,480),Image.Resampling.LANCZOS),OUT/'mobile'/f'{i:03d}.webp',79)
        if i%12==0:print(f'Rendered {i+1}/{args.frames}',flush=True)
        if i==int((args.frames-1)*.94):
            save_webp(im,ROOT/'public/assets/idle-chaos.webp',88)
            save_webp(im,ROOT/'public/assets/idle-chaos-storm.webp',88)
    meta={'version':2,'frameCount':args.frames,'firstFrame':0,'lastFrame':args.frames-1,'filenamePattern':'{index:03d}.webp','desktop':{'width':W,'height':H,'path':'/assets/idle-chaos-frames/'},'mobile':{'width':660,'height':480,'path':'/assets/idle-chaos-frames/mobile/'},'poster':'/assets/idle-chaos-storm.webp','renderer':'ModernGL 5.13 / Mesa EGL software rasterizer; depth-aware volumetric raymarch','animation':'One coherent deterministic 3D scene; authored progress, no independently generated stills','effects':['Irregular volumetric thundercloud anvil','Rotating volumetric funnel and street-level dust skirt','170 authored fragments','150 depth-tested rain streaks','25 wind-deformed trees, two uproot','Two lifted roofs and one collapsing front house','Articulated cliff fractures and emissive fissures','Twin branched lightning and internal cloud illumination'],'phases':[{'progress':[0,.25],'label':'A small disturbance'},{'progress':[.25,.7],'label':'Build the storm'},{'progress':[.7,1],'label':'Unleash chaos'}],'seed':71,'desktopBytes':sum(p.stat().st_size for p in OUT.glob('*.webp')),'mobileBytes':sum(p.stat().st_size for p in (OUT/'mobile').glob('*.webp'))}
    meta['revision']='storm-v2'
    (OUT/'scene.json').write_text(json.dumps(meta,indent=2)+'\n');print(json.dumps(meta),flush=True)

if __name__=='__main__':main()
