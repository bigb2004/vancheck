import test from 'node:test';
import assert from 'node:assert/strict';
import {buildSyncSnapshot,applySyncSnapshot} from '../sync.js';

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