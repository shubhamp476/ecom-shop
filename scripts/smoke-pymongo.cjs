const fs = require('node:fs');
const assert = require('node:assert/strict');
const puppeteer = require('puppeteer-core');
(async () => {
  const base = process.env.SMOKE_URL || 'http://127.0.0.1:3100';
  const auth = 'Basic '+Buffer.from('test:local-test-only').toString('base64');
  const checks=[];
  async function api(path, method='GET', body) {
    const r = await fetch(base+path,{method,headers:{Authorization:auth,'Content-Type':'application/json'},body:body ? JSON.stringify(body):undefined});
    return {status:r.status,data:await r.json()};
  }
  const publicList = await api('/api/products');
  assert.equal(publicList.status,200);assert.equal(publicList.data.source,'pymongo');assert(publicList.data.data.length>0);checks.push('Next.js -> FastAPI catalog response');
  await api('/api/admin/products/BROWSER-TEST','DELETE');
  const created=await api('/api/admin/products','POST',{name:'Browser Integration Phone',sku:'BROWSER-TEST',slug:'browser-integration-phone',category:'Smartphones',categorySlug:'smartphones',price:39999,mrp:44999,stock:4});
  assert.equal(created.status,201);const id=created.data.product._id;checks.push('Product creation through Next.js proxy');
  const browser=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox']});
  const page=await browser.newPage();await page.authenticate({username:'test',password:'local-test-only'});await page.setViewport({width:1440,height:1000});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const [path,label] of [['/shop','storefront'],['/product/browser-integration-phone','product'],['/admin/products','admin-products'],['/admin/reports','inventory-report']]) {
    const response=await page.goto(base+path,{waitUntil:'domcontentloaded'});assert.equal(response.status(),200);
    if(path==='/shop') assert((await page.$eval('body',e=>e.innerText)).includes('Browser Integration Phone'));
    if(path==='/admin/products') await page.waitForFunction(()=>document.body.innerText.includes('Browser Integration Phone'));
    if(path==='/admin/reports') await page.waitForFunction(()=>document.body.innerText.includes('Category summary'));
    await page.screenshot({path:`docs/evidence/${label}.png`,fullPage:false});checks.push(`Browser rendered ${path}`);
  }
  const editResponse=await page.goto(base+'/admin/products/'+id+'/edit',{waitUntil:'domcontentloaded'});assert.equal(editResponse.status(),200);await page.waitForSelector('input');checks.push('Server-rendered product edit reads FastAPI');
  const update=await api('/api/admin/products/'+id,'PATCH',{stock:0});assert.equal(update.status,200);assert.equal(update.data.product.availableStock,0);checks.push('Zero-stock update is preserved');
  const deleted=await api('/api/admin/products/'+id,'DELETE');assert.equal(deleted.status,200);
  assert.equal((await api('/api/admin/products/'+id)).status,404);checks.push('Delete and subsequent 404 through proxy');
  await browser.close();assert.deepEqual(errors,[]);
  fs.writeFileSync('docs/evidence/browser-tests.json',JSON.stringify({database:'isolated mongomock fixture; not Atlas',checks,consoleErrors:errors},null,2));
  console.log(checks.join('\n'));console.log('Browser errors: 0');
})().catch(e=>{console.error(e);process.exit(1)});
