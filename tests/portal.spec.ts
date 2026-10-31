import {test,expect} from '@playwright/test';

test('new portal assets, responsive spacing, background and keyboard navigation',async({page})=>{await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/portal');
 await expect(page.locator('.portal-link img')).toHaveCount(3);
 await expect.poll(()=>page.locator('.portal-link img').evaluateAll(images=>images.every(image=>(image as HTMLImageElement).complete&&(image as HTMLImageElement).naturalWidth===2172))).toBeTruthy();
 expect(await page.locator('.portal-link img').evaluateAll(images=>images.map(image=>image.getAttribute('src')))).toEqual(['/portal/cm2.png','/portal/edu.png','/portal/busi.png']);
 const background=await page.request.get('/portal/bg.jpg');expect(background.ok()).toBeTruthy();expect(background.headers()['content-type']).toContain('image/jpeg');
 for(const [name,width,height] of [['desktop',1440,900],['mobile',390,844],['short',740,360]] as const){
  await page.setViewportSize({width,height});await page.reload();await expect.poll(()=>page.locator('.portal-link img').evaluateAll(images=>images.every(image=>(image as HTMLImageElement).complete&&(image as HTMLImageElement).naturalWidth>0))).toBeTruthy();
  const layout=await page.locator('.portal').evaluate(root=>{
   const style=getComputedStyle(root),images=[...root.querySelectorAll('nav img')].map(e=>e.getBoundingClientRect());
   return{background:style.backgroundImage,size:style.backgroundSize,position:style.backgroundPosition,noOverflow:document.documentElement.scrollWidth<=innerWidth,separated:images.every((r,i)=>i===0||r.top>=images[i-1].bottom),ratios:images.map(r=>r.width/r.height),sloganTop:root.querySelector('.slogan')!.getBoundingClientRect().top,lastImageBottom:images[2].bottom,mastheadBottom:root.querySelector('.portal-masthead')!.getBoundingClientRect().bottom,firstImageTop:images[0].top};
  });
  expect(layout.background).toContain('/portal/bg.jpg');expect(layout.size).toBe('cover');expect(layout.position).toBe('50% 50%');expect(layout.noOverflow).toBeTruthy();expect(layout.separated).toBeTruthy();expect(layout.sloganTop).toBeGreaterThanOrEqual(layout.lastImageBottom);expect(layout.firstImageTop).toBeGreaterThanOrEqual(layout.mastheadBottom);for(const ratio of layout.ratios)expect(ratio).toBeCloseTo(3,2);
  await page.screenshot({path:`test-results/new-portal-${name}.png`,fullPage:true});
 }
 await page.setViewportSize({width:1280,height:720});
 await page.keyboard.press('Tab');await expect(page.getByRole('link',{name:'replay the séance',exact:true})).toBeFocused();
 await page.keyboard.press('Tab');const community=page.getByRole('link',{name:'Enter community workspace'});await expect(community).toBeFocused();expect(await community.evaluate(e=>getComputedStyle(e).outlineStyle)).toBe('solid');await page.keyboard.press('Enter');await expect(page).toHaveURL('/community');await page.goBack();await expect(page).toHaveURL(/\/portal\/?$/);await page.goForward();await expect(page).toHaveURL('/community');
});

test('portal replay restarts the unchanged cinematic before returning to portal',async({page})=>{
 test.setTimeout(90000);await page.setViewportSize({width:800,height:500});await page.goto('/portal');await page.getByRole('link',{name:'replay the séance',exact:true}).click();await expect(page).toHaveURL('/');await expect(page.locator('canvas')).toBeVisible();await expect(page.locator('.portal')).toHaveCount(0);await expect(page.getByRole('button',{name:'Skip cinematic and enter portal'})).toBeEnabled({timeout:30000});await expect(page).toHaveURL('/portal',{timeout:45000});
});

test('portal respects reduced motion',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/portal');const link=page.getByRole('link',{name:'Enter business workspace'});await link.hover();expect(await link.evaluate(e=>getComputedStyle(e).transitionDuration)).toBe('0s');expect(await link.evaluate(e=>getComputedStyle(e).transform)).toBe('none');
});
