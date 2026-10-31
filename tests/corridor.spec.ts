import {test,expect} from '@playwright/test';
const characters={community:['Nurse of Horror','nurse_of_horror.glb'],education:['Creeping Flesh Creature','creeping_flesh_creature__free_3d_horror_model.glb'],business:['Creepy Scarecrow','creepy_scarecrow__horror_stylized.glb']} as const;

test('all three real characters render in the corridor and reach their destination',async({page})=>{
 test.setTimeout(120000);await page.setViewportSize({width:960,height:680});
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 const loaded=new Set<string>();page.on('response',response=>{if(response.ok()&&response.url().endsWith('.glb'))loaded.add(response.url().split('/').pop()!)});
 await page.goto('/portal');
 for(const [destination,[name,file]] of Object.entries(characters)){
  await page.getByRole('link',{name:`Enter ${destination} workspace`}).click();
  const dialog=page.getByRole('dialog');await expect(dialog).toHaveAttribute('data-character',name);
  await expect(dialog).toHaveAttribute('data-phase','playing',{timeout:15000});
  await expect(page).toHaveURL(/\/portal\/?$/);
  await expect.poll(()=>page.locator('.corridor-veil').evaluate(e=>Number(getComputedStyle(e).opacity)),{timeout:2500}).toBeLessThan(.05);
  await page.screenshot({path:`test-results/corridor-${destination}.png`});
  await expect(page).toHaveURL('/'+destination,{timeout:8000});
  await expect(page.locator('h1')).toBeVisible();expect(loaded.has(file)).toBeTruthy();
  await page.getByRole('link',{name:'↖ portal'}).click();await expect(page.getByRole('dialog')).toHaveCount(0);
 }
 expect(loaded.has('corridor.glb')).toBeTruthy();expect(errors).toEqual([]);
});

test('direct routes, Midnight colors, responsive work areas and reduced-motion bypass',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/portal');
 for(const destination of Object.keys(characters)){
  await page.getByRole('link',{name:`Enter ${destination} workspace`}).click();await expect(page).toHaveURL('/'+destination);await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(await page.locator('.workspace-heading').evaluate(e=>getComputedStyle(e).backgroundColor)).toBe('rgb(33, 19, 47)');
  expect(await page.locator('h1').evaluate(e=>getComputedStyle(e).color)).toBe('rgb(255, 244, 228)');
  expect(await page.locator('.primary').evaluate(e=>getComputedStyle(e).backgroundColor)).toBe('rgb(83, 55, 119)');
  await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:`test-results/midnight-${destination}-desktop.png`,fullPage:true});
  await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();await page.screenshot({path:`test-results/midnight-${destination}-mobile.png`,fullPage:true});
  await page.getByRole('link',{name:'↖ portal'}).click();
 }
 await page.emulateMedia({reducedMotion:'no-preference'});
 for(const destination of Object.keys(characters)){await page.goto('/'+destination);await expect(page.locator('h1')).toBeVisible();await expect(page.getByRole('dialog')).toHaveCount(0);}
});

test('skip, Escape, load failure, timeout and browser Back cannot trap navigation',async({page})=>{
 test.setTimeout(45000);
 await page.route('**/models/*.glb',()=>{}); // Deliberately stalled provider: test-only.
 await page.goto('/portal');await page.getByRole('link',{name:'Enter community workspace'}).click();await expect(page.getByRole('button',{name:'Skip Transition'})).toBeFocused();await page.getByRole('button',{name:'Skip Transition'}).click();await expect(page).toHaveURL('/community');
 await page.getByRole('link',{name:'↖ portal'}).click();await page.getByRole('link',{name:'Enter education workspace'}).click();await page.keyboard.press('Escape');await expect(page).toHaveURL('/education');
 await page.getByRole('link',{name:'↖ portal'}).click();await page.getByRole('link',{name:'Enter business workspace'}).click();await expect(page).toHaveURL('/business',{timeout:13000});
 await page.getByRole('link',{name:'↖ portal'}).click();await page.getByRole('link',{name:'Enter community workspace'}).click();await page.goBack();await expect(page).toHaveURL('/business');await expect(page.getByRole('dialog')).toHaveCount(0);
 await page.unroute('**/models/*.glb');await page.route('**/models/*.glb',route=>route.abort());await page.goto('/portal');await page.getByRole('link',{name:'Enter business workspace'}).click();await expect(page).toHaveURL('/business',{timeout:13000});
});

test('mobile corridor keeps the animated character and skip control visible',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/portal');await page.getByRole('link',{name:'Enter business workspace'}).click();await expect(page.getByRole('dialog')).toHaveAttribute('data-phase','playing',{timeout:15000});await expect.poll(()=>page.locator('.corridor-veil').evaluate(e=>Number(getComputedStyle(e).opacity)),{timeout:2500}).toBeLessThan(.05);const canvas=await page.locator('.corridor-canvas canvas').boundingBox();expect(canvas?.width).toBe(390);expect(canvas?.height).toBe(844);await expect(page.getByRole('button',{name:'Skip Transition'})).toBeInViewport();await page.screenshot({path:'test-results/corridor-mobile.png'});await expect(page).toHaveURL('/business',{timeout:8000});expect(await page.evaluate(()=>document.body.style.overflow)).not.toBe('hidden');
});

test('corridor gracefully bypasses a browser without WebGL',async({page})=>{
 await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;Object.defineProperty(HTMLCanvasElement.prototype,'getContext',{value:function(type:string,...args:unknown[]){if(type.startsWith('webgl')||type==='experimental-webgl')return null;return original.apply(this,[type,...args] as never);}})});await page.goto('/portal');await page.getByRole('link',{name:'Enter community workspace'}).click();await expect(page).toHaveURL('/community',{timeout:15000});await expect(page.locator('h1')).toBeVisible();
});
