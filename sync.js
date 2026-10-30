export const VANCHECK_SYNC_VERSION=1;

export function buildSyncSnapshot(state={},now=Date.now()){
 return {
  version:VANCHECK_SYNC_VERSION,
  updatedAt:now,
  inventory:Array.isArray(state.inventory)?structuredClone(state.inventory):[],
  active:state.active&&typeof state.active==='object'?structuredClone(state.active):null,
  history:Array.isArray(state.history)?structuredClone(state.history):[],
  retention:Number(state.retention)>0?Number(state.retention):30
 };
}

export function applySyncSnapshot(local={},snapshot={}){
 if(snapshot.version!==VANCHECK_SYNC_VERSION)throw new Error(`Unsupported VanCheck sync version: ${snapshot.version}`);
 return {
  ...local,
  inventory:Array.isArray(snapshot.inventory)?structuredClone(snapshot.inventory):[],
  active:snapshot.active&&typeof snapshot.active==='object'?structuredClone(snapshot.active):null,
  history:Array.isArray(snapshot.history)?structuredClone(snapshot.history):[],
  retention:Number(snapshot.retention)>0?Number(snapshot.retention):(Number(local.retention)>0?Number(local.retention):30),
  lastSavedAt:Number(snapshot.updatedAt)||Date.now()
 };
}

export class VanCheckSyncClient{
 constructor({baseUrl,token,fetchImpl=fetch}){this.baseUrl=String(baseUrl||'').replace(/\/$/,'');this.token=token;this.fetch=fetchImpl}
 headers(){return {'content-type':'application/json',...(this.token?{authorization:`Bearer ${this.token}`}:{})}}
 async pull(){const r=await this.fetch(`${this.baseUrl}/v1/vancheck/state`,{headers:this.headers()});if(r.status===404)return null;if(!r.ok)throw new Error(`VanCheck sync pull failed: ${r.status}`);return r.json()}
 async push(snapshot){const r=await this.fetch(`${this.baseUrl}/v1/vancheck/state`,{method:'PUT',headers:this.headers(),body:JSON.stringify(snapshot)});if(!r.ok)throw new Error(`VanCheck sync push failed: ${r.status}`);return r.json()}
}