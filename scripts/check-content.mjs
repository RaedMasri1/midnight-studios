import fs from 'node:fs';
import assert from 'node:assert/strict';
import {contentSnapshotSchema,postSchema} from '../lib/content-schema.ts';
import {homeSchema} from '../lib/home-schema.ts';
const games=JSON.parse(fs.readFileSync('content/games.json','utf8'));
const posts=JSON.parse(fs.readFileSync('content/posts.json','utf8'));
contentSnapshotSchema.parse({games,posts});
homeSchema.parse(JSON.parse(fs.readFileSync('content/home.json','utf8')));
const one=posts[0];
if(one){
 // A dashboard can add arbitrary articles without frontend changes.
 const many=Array.from({length:100},(_,i)=>({...one,slug:'entry-'+i,publishedAt:'2026-10-11T12:00:00Z'}));
 assert.equal(contentSnapshotSchema.parse({games,posts:many}).posts.length,100);
 assert.equal(contentSnapshotSchema.safeParse({games,posts:[one,one]}).success,false);
 assert.equal(postSchema.safeParse({...one,publishedAt:'yesterday'}).success,false);
 assert.equal(postSchema.safeParse({...one,publishedAt:'2026-02-30T12:00:00Z'}).success,false);
 assert.equal(postSchema.safeParse({...one,publication:'unlisted'}).success,false);
 assert.equal(postSchema.safeParse({...one,media:{type:'image',image:{...one.media.image,src:'javascript:alert(1)'}}}).success,false);
 assert.equal(contentSnapshotSchema.safeParse({games,posts:[{...one,gameSlug:'missing-game'}]}).success,false);
}
assert.equal(contentSnapshotSchema.parse({games,posts:[]}).posts.length,0);
console.log('PASS: CMS snapshot schemas, empty and 100-entry journals, duplicate slugs, invalid dates, unsafe media and linked-game integrity.');
