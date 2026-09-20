import { test } from 'node:test';
import assert from 'node:assert/strict';
import {normalize,safeUrl,phoneNumber,validateBudget,validatePhotos,friendlyError} from '../src/lib/utils.js';
test('Albanian search ignores accents, spacing and case',()=>{assert.equal(normalize(' TIRANË '),normalize('Tirane'));assert.equal(normalize('Çati'),'cati');});
test('Only safe external links are exposed',()=>{for(const value of ['javascript:alert(1)','data:text/html,hi','mailto:test@example.com','https://user:pass@example.com'])assert.equal(safeUrl(value),'');assert.equal(safeUrl('example.com'),'https://example.com/');});
test('Albanian and international phone formats remain dialable',()=>{assert.equal(phoneNumber('069 123 4567'),'355691234567');assert.equal(phoneNumber('0049 170 123456'),'49170123456');assert.equal(phoneNumber('+355 69 1234567'),'355691234567');});
test('Budgets reject invalid amounts and reversed ranges',()=>{for(const args of [[100,50],[-1,100],['abc',100],[0,1e10]])assert.ok(validateBudget(...args));assert.equal(validateBudget('',100),'');assert.equal(validateBudget(0,100),'');});
test('Photo validation enforces size, MIME and batch count',()=>{assert.ok(validatePhotos([{type:'image/svg+xml',size:20}]));assert.ok(validatePhotos([{type:'image/png',size:6*1024*1024}]));assert.ok(validatePhotos(Array(6).fill({type:'image/jpeg',size:10})));assert.equal(validatePhotos([{type:'image/webp',size:500}]),'');});
test('Infrastructure errors are not leaked to customers',()=>{assert.ok(!friendlyError({message:'relation public.secret_table does not exist'}).includes('secret_table'));assert.equal(friendlyError({message:'FIX24: Kërkesa nuk u gjet.'}),'Kërkesa nuk u gjet.');});
