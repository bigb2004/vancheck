export function startJob(address, tools, jobType='Custom') { return { id: crypto.randomUUID(), address, jobType, startedAt: Date.now(), items: Object.fromEntries(tools.map(t=>[t.id,{...t,qty:t.qty||1,returnedQty:0,status:'out'}])) }; }
export function returnItem(job,id,qty){ const old=job.items[id]; const returnedQty=Math.max(0,Math.min(old.qty,qty??old.qty)); return {...job,items:{...job.items,[id]:{...old,returnedQty,status:returnedQty>=old.qty?'returned':'out'}}}; }
export function markMissing(job,id){ return {...job,items:{...job.items,[id]:{...job.items[id],status:'missing'}}}; }
export function canClearJob(job){ return Object.values(job.items).every(v=>v.status==='returned' && (v.returnedQty??v.qty)>=v.qty); }
export function lastConfirmed(log,id){ return log.filter(x=>x.itemId===id).sort((a,b)=>b.at-a.at)[0]; }
export function criticalItemsOut(job){ return Object.values(job.items).filter(x=>x.level==='critical'&&x.status!=='returned'); }
export function addInventoryItem(inventory,input){ const name=(input.name||'').trim(); if(!name)return inventory; const base=name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'item'; let id=base,n=2;while(inventory.some(x=>x.id===id))id=`${base}-${n++}`; return [...inventory,{id,name,level:input.level||'tracked',owner:input.owner||'Personal',qty:Math.max(1,Number(input.qty)||1),brand:(input.brand||'').trim()}]; }
export function pruneHistory(history,days=30,now=Date.now()){ const cutoff=now-days*86400000;return history.filter(x=>(x.finishedAt||x.startedAt)>=cutoff); }
export function missingTrail(history,id,limit=10){ return history.filter(h=>h.items&&h.items[id]).sort((a,b)=>(b.finishedAt||b.startedAt)-(a.finishedAt||a.startedAt)).slice(0,limit); }
export function formatSavedAt(value,locale=undefined,timeZone=undefined){
  if(!value)return 'Not saved yet';
  const d=value instanceof Date?value:new Date(value);
  const time=d.toLocaleTimeString(locale,{hour:'numeric',minute:'2-digit',second:'2-digit',...(timeZone?{timeZone}:{})});
  return `Saved ✓ ${time}`;
}
export function addEquipmentToJob(job,tool){
  if(!job||!tool||job.items?.[tool.id])return job;
  return {...job,items:{...job.items,[tool.id]:{...tool,qty:tool.qty||1,returnedQty:0,status:'out',removedAt:Date.now()}}};
}
export function completedToolSnapshot(job){
  return Object.values(job?.items||{}).map(i=>({id:i.id,name:i.name,owner:i.owner,level:i.level,qty:i.qty||1,returnedQty:i.returnedQty??0,brand:i.brand||'',finalStatus:i.status}));
}
