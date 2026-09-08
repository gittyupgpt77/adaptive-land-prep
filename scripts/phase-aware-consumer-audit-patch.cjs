const fs=require('node:fs');
const path=require('node:path');
const p=path.join(__dirname,'../.github/workflows/ui-audit.yml');
let s=fs.readFileSync(p,'utf8');
const anchor=`          await page.locator('#sleepQ').selectOption('3');`;
const inserted=`${anchor}\n          await page.locator('#fatigue').selectOption('3');`;
if(s.includes(inserted)){
  console.log('Consumer audit fixture already patched.');
}else{
  const matches=s.split(anchor).length-1;
  if(matches!==1)throw new Error(`Expected exactly one yellow-state sleep-quality anchor, found ${matches}`);
  s=s.replace(anchor,inserted);
  fs.writeFileSync(p,s);
  console.log('Consumer audit now uses independent sleep + fatigue caution domains.');
}
