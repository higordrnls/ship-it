import {readFile, mkdir, writeFile, copyFile, realpath, stat} from 'node:fs/promises';
import {resolve, dirname, sep} from 'node:path';
import {render} from './engine.mjs';
const [input,out]=process.argv.slice(2);
if(!input||!out) throw Error('Usage: node build.mjs config.json new-output-directory');
const c=JSON.parse(await readFile(input,'utf8'));
const html=render(c);
const root=await realpath(dirname(resolve(input)));
const images=new Map();
for(const p of c.portfolio||[]){
 const src=await realpath(resolve(root,p.image));
 if(!src.startsWith(root+sep)||!(await stat(src)).isFile()) throw Error('Asset outside configuration directory or not a file');
 images.set(p.image,src);
}
await mkdir(out);
if(images.size) await mkdir(resolve(out,'assets'));
for(const [path,src] of images) await copyFile(src,resolve(out,path));
await writeFile(resolve(out,'index.html'),html,{flag:'wx'});
console.log('Built '+resolve(out,'index.html'));
