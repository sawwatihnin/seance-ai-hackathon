from pathlib import Path
from PIL import Image
from io import BytesIO
from concurrent.futures import ThreadPoolExecutor
import json,struct,time
src=Path(__file__).resolve().parents[1]/'public/models/nurse_of_horror.glb'
# Lossless runtime repack. Requires Pillow; source GLB is never modified.
b=src.read_bytes();n=struct.unpack_from('<I',b,12)[0];j=json.loads(b[20:20+n]);binary=b[20+n+8:];changed={}
def convert(pair):
 i,image=pair;view=j['bufferViews'][image['bufferView']];blob=binary[view.get('byteOffset',0):view.get('byteOffset',0)+view['byteLength']];im=Image.open(BytesIO(blob));out=BytesIO();im.save(out,format='WEBP',lossless=True,method=4,exact=True);data=out.getvalue()
 assert im.convert('RGBA').tobytes()==Image.open(BytesIO(data)).convert('RGBA').tobytes(),f'Pixel mismatch {i}'
 return i,image['bufferView'],blob,data
start=time.monotonic()
with ThreadPoolExecutor(max_workers=2) as pool:
 for i,index,old,new in pool.map(convert,enumerate(j['images'])):
  if len(new)<len(old):changed[index]=new;j['images'][i]['mimeType']='image/webp'
  print(json.dumps({'image':i,'source':len(old),'lossless':min(len(new),len(old))}),flush=True)
for texture in j.get('textures',[]):
 if j['images'][texture['source']]['mimeType']=='image/webp':texture.setdefault('extensions',{})['EXT_texture_webp']={'source':texture.pop('source')}
j.setdefault('extensionsUsed',[]).append('EXT_texture_webp');j.setdefault('extensionsRequired',[]).append('EXT_texture_webp')
out=bytearray()
for index,view in enumerate(j['bufferViews']):
 raw=changed.get(index,binary[view.get('byteOffset',0):view.get('byteOffset',0)+view['byteLength']]);out.extend(b'\0'*((-len(out))%4));view['byteOffset']=len(out);view['byteLength']=len(raw);out.extend(raw)
j['buffers'][0]['byteLength']=len(out);out.extend(b'\0'*((-len(out))%4));text=json.dumps(j,separators=(',',':')).encode();text+=b' '*((-len(text))%4)
result=struct.pack('<III',0x46546c67,2,12+8+len(text)+8+len(out))+struct.pack('<II',len(text),0x4e4f534a)+text+struct.pack('<II',len(out),0x004e4942)+out
path=src.with_name('nurse_of_horror.runtime.glb');path.write_bytes(result)
print(json.dumps({'sourceBytes':len(b),'runtimeBytes':len(result),'seconds':round(time.monotonic()-start,1),'imagesVerified':len(j['images']),'path':str(path)}),flush=True)
