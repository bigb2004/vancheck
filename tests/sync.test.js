import test from 'node:test';
import assert from 'node:assert/strict';
import {buildSyncSnapshot,applySyncSnapshot,chooseSyncAction,VanCheckSyncClient} from '../sync.js';

test('buildSyncSnapshot produces a versioned portable state document',()=>{
 const state={inventory:[{id:'xm2',name:'XM2'}],active:{id:'job-1'},history:[{id:'old'}],retention:30,lastSavedAt:123};
 const snapshot=buildSyncSnapshot(state,456);
 assert.equal(snapshot.version,1);
 assert.equal(snapshot.updatedAt,456);
 assert.deepEqual(snapshot.inventory,state.inventory);
 assert.deepEqual(snapshot.active,state.active);
 assert.deepEqual(snapshot.history,state.history);
 assert.equal(snapshot.retention,30);
});

test('applySyncSnapshot keeps only supported state and normalizes bad values',()=>{
 const local={inventory:[],active:null,history:[],retention:30,lastSavedAt:1};
 const next=applySyncSnapshot(local,{version:1,updatedAt:99,inventory:[{id:'x'}],active:null,history:'bad',retention:0});
 assert.deepEqual(next.inventory,[{id:'x'}]);
 assert.deepEqual(next.history,[]);
 assert.equal(next.retention,30);
 assert.equal(next.lastSavedAt,99);
});

test('applySyncSnapshot rejects unsupported versions',()=>{
 assert.throws(()=>applySyncSnapshot({}, {version:99}),/Unsupported VanCheck sync version/);
});

test('sync reconciliation pushes local state when server is empty',()=>{
 assert.equal(chooseSyncAction({lastSavedAt:100},null),'push');
});

test('sync reconciliation keeps the newest copy',()=>{
 assert.equal(chooseSyncAction({lastSavedAt:200},{version:1,updatedAt:100}),'push');
 assert.equal(chooseSyncAction({lastSavedAt:100},{version:1,updatedAt:200}),'pull');
 assert.equal(chooseSyncAction({lastSavedAt:200},{version:1,updatedAt:200}),'none');
});

test('VanCheck sync can use Safari first-party Jax cookie credentials',async()=>{
 let options;
 const client=new VanCheckSyncClient({
  baseUrl:'https://jax.example',
  fetchImpl:async(_url,opts)=>{options=opts;return {status:404,ok:false}}
 });
 assert.equal(await client.pull(),null);
 assert.equal(options.credentials,'include');
 assert.equal(options.headers.authorization,undefined);
});
