import test from 'node:test';
import assert from 'node:assert/strict';
import {invoiceTotals,resizeRect,validDimensions} from '../lib/tool-calculations.ts';
test('invoice applies percentage discount before tax with currency rounding',()=>{assert.deepEqual(invoiceTotals([{quantity:2,rate:49.99},{quantity:1,rate:25}],10,18),{subtotal:124.98,discountAmount:12.5,taxAmount:20.25,total:132.73})});
test('a full discount produces no taxable balance',()=>{assert.equal(invoiceTotals([{quantity:3,rate:19.99}],100,18).total,0)});
test('decimal line values do not leak floating point cents',()=>{assert.equal(invoiceTotals([{quantity:3,rate:.1}],0,0).total,.3)});
test('contain letterboxes and cover crops centrally',()=>{assert.deepEqual(resizeRect(1600,900,400,400,'contain'),{x:0,y:87.5,width:400,height:225});const r=resizeRect(1600,900,400,400,'cover');assert.equal(r.height,400);assert.ok(r.x<0);assert.equal(r.y,0)});
test('output limits reject invalid or oversized images',()=>{for(const size of [[0,10],[-1,3],[3.5,4],[12001,1],[10000,10000],[NaN,4],[Infinity,1]])assert.equal(validDimensions(...size),false);assert.equal(validDimensions(8000,5000),true)});
