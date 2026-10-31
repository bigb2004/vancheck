import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const sw=fs.readFileSync(new URL('../sw.js',import.meta.url),'utf8');

test('service worker fetches Jax sync code network-first with cache fallback',()=>{
 assert.match(sw,/jax-sync-bridge\.js/);
 assert.match(sw,/sync\.js/);
 assert.match(sw,/networkFirst/);
 assert.match(sw,/fetch\(request/);
 assert.match(sw,/cache\.match\(request/);
});
