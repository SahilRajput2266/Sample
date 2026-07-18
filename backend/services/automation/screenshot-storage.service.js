import path from 'node:path';
import fs from 'node:fs/promises';

export const resolvePrivateScreenshot=async(root,relative)=>{
  const base=await fs.realpath(path.resolve(root));
  const candidate=path.resolve(base,relative);
  if(!candidate.startsWith(base+path.sep)||path.extname(candidate).toLowerCase()!=='.png')throw new Error('Invalid screenshot path');
  const stat=await fs.lstat(candidate);
  if(stat.isSymbolicLink()||!stat.isFile())throw new Error('Invalid screenshot file');
  const real=await fs.realpath(candidate);
  if(!real.startsWith(base+path.sep))throw new Error('Invalid screenshot path');
  return real;
};