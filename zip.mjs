// Small dependency-free ZIP writer (stored files). Downloads contain owner presentation assets only.
const encoder=new TextEncoder(),table=Uint32Array.from({length:256},(_,n)=>{let c=n;for(let i=0;i<8;i++)c=c&1?0xedb88320^(c>>>1):c>>>1;return c>>>0;});
function crc(bytes){let c=0xffffffff;for(const byte of bytes)c=table[(c^byte)&255]^(c>>>8);return (c^0xffffffff)>>>0;}
export function makeZip(files){
 const parts=[],central=[];let offset=0,count=0;
 for(const [path,value]of Object.entries(files)){
  if(!/^(listing-content\.json|listing-content\/[a-z0-9_-]+\.json|media\/[a-zA-Z0-9_-]+\.(webp|png|jpg|jpeg))$/.test(path))throw Error('Invalid export path.');
  const name=encoder.encode(path),bytes=typeof value==='string'?encoder.encode(value):value;if(!(bytes instanceof Uint8Array))throw Error('Invalid export data.');
  const checksum=crc(bytes),header=new Uint8Array(30+name.length),h=new DataView(header.buffer);h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint16(6,0x800,true);h.setUint32(14,checksum,true);h.setUint32(18,bytes.length,true);h.setUint32(22,bytes.length,true);h.setUint16(26,name.length,true);header.set(name,30);parts.push(header,bytes);
  const c=new Uint8Array(46+name.length),d=new DataView(c.buffer);d.setUint32(0,0x02014b50,true);d.setUint16(4,20,true);d.setUint16(6,20,true);d.setUint16(8,0x800,true);d.setUint32(16,checksum,true);d.setUint32(20,bytes.length,true);d.setUint32(24,bytes.length,true);d.setUint16(28,name.length,true);d.setUint32(42,offset,true);c.set(name,46);central.push(c);offset+=header.length+bytes.length;count++;
 }
 const centralSize=central.reduce((sum,part)=>sum+part.length,0),end=new Uint8Array(22),e=new DataView(end.buffer);e.setUint32(0,0x06054b50,true);e.setUint16(8,count,true);e.setUint16(10,count,true);e.setUint32(12,centralSize,true);e.setUint32(16,offset,true);
 return new Blob([...parts,...central,end],{type:'application/zip'});
}
