import path from 'node:path';
import {access,cp} from 'node:fs/promises';

/** The download stores images once in public; prepare the static preview on first launch. */
export async function preparePreviewAssets(projectRoot=process.cwd()) {
  const root=path.resolve(projectRoot);
  await access(path.join(root,'out/index.html'));
  await cp(path.join(root,'public/assets'),path.join(root,'out/assets'),{recursive:true,force:false});
}
