/* Pixel effects use world-space hand/mouth anchors and the combat action clock. */
window.BonusBattleFX={
 begin(scene,a,kind,target,now){if(!kind)return;scene.bonusEffects||=[];const g=scene.add.graphics().setDepth(9),sprites=[];
  if(kind==='breath'&&scene.textures.exists('fx-lava'))for(let i=0;i<3;i++)sprites.push(scene.add.sprite(0,0,'fx-lava',0).setOrigin(.5,1).setDepth(9).setVisible(false));
  if(kind==='disc'&&scene.textures.exists('fx-step'))sprites.push(scene.add.sprite(0,0,'fx-step',0).setDepth(9).setVisible(false));
  if(['quake','shoulder','catstep'].includes(kind)&&scene.textures.exists('fx-impact'))sprites.push(scene.add.sprite(0,0,'fx-impact',0).setDepth(9).setVisible(false));
  scene.bonusEffects.push({a,kind,target,start:now,g,sprites});},
 update(scene,now,pace,reduced){
  for(const f of [...(scene.bonusEffects||[])]){const t=(now-f.start)*pace,a=f.a,b=scene.actors[f.target],sign=b?Math.sign(b.home-a.home):(a.homeFlip?-a.nativeFacing:a.nativeFacing),size=a.size;
   if(t>=930){f.g.destroy();for(const s of f.sprites)s.destroy();scene.bonusEffects.splice(scene.bonusEffects.indexOf(f),1);continue;}
   const g=f.g;g.clear();const x=a.sprite.x+sign*size*(a.identity==='kaiju'?.43:a.identity==='hakimi'?.4:.25),y=a.visualGround-size*(f.kind==='ball'?1.02:a.identity==='kaiju'?.8:a.identity==='hakimi'?.4:.62),tx=b?.sprite.x??x+sign*100,ty=b?b.visualGround-b.size*(f.miss?.75:.5):y;
   if(t<320){const q=t/320,r=size*(.18-.10*q);if(['beam','breath','hiss','ball','charge'].includes(f.kind)){g.lineStyle(2,f.kind==='breath'?0xffb755:0xc2ebff,.5);g.strokeCircle(Math.round(x),Math.round(y),r);for(let i=0;i<6;i++){const angle=i*Math.PI/3+(reduced?0:t/230);g.fillStyle(f.kind==='breath'?0xffb755:0xe2f7ff,.8);g.fillRect(Math.round(x+Math.cos(angle)*r),Math.round(y+Math.sin(angle)*r),3,3);}}continue;}
   const u=(t-320)/610,fade=Math.min(1,(1-u)*3),endX=x+(tx-x)*Math.min(1,(t-320)/80),endY=y+(ty-y)*Math.min(1,(t-320)/80);
   if(f.kind==='beam'){
    for(const [thick,color,alpha]of [[size*.24,0x288be4,.23],[size*.13,0x6bddff,.72],[size*.055,0xf5ffff,1]]){g.lineStyle(Math.max(2,Math.round(thick)),color,alpha*fade);g.beginPath();g.moveTo(Math.round(x),Math.round(y));g.lineTo(Math.round(endX),Math.round(endY));g.strokePath();}
    g.lineStyle(2,0xe4ffff,.8*fade);g.strokeCircle(endX,endY,size*(.08+.10*u));
    // Crisp traveling flecks break up the beam without obscuring the firing pose.
    for(let i=0;i<16;i++){const v=((reduced?i*71:t*1.7+i*71)%700)/700,px=x+(endX-x)*v,py=y+(endY-y)*v+Math.sin(i*2)*size*.075;g.fillStyle(i%2?0xeaffff:0x56bdf4,fade*.8);g.fillRect(Math.round(px),Math.round(py),i%3?5:9,2);}
   }else if(f.kind==='breath'){
    // Authored CC0 fire frames, rotated from upward flame to mouth-to-target flow.
    // Layer overlap forms a continuous jet; no procedurally drawn substitute flames.
    const dx=tx-x,dy=ty-y,distance=Math.hypot(dx,dy),angle=Math.atan2(dy,dx)+Math.PI/2;
    // One uninterrupted plume, a short muzzle core, and a terminal flare avoid tiled blobs.
    f.sprites.forEach((s,i)=>{const launch=i===2?400:320,elapsed=t-launch;if(elapsed<0||i===2&&f.miss){s.setVisible(false);return;}const frame=Math.min(60,Math.floor(elapsed/Math.max(1,(930-launch)/61))),growth=Math.min(1,elapsed/80),v=i===2?.84:0;s.setVisible(true).setFrame(frame).setPosition(Math.round(x+dx*v),Math.round(y+dy*v)).setRotation(angle).setDisplaySize(size*[.40,.19,.36][i]*growth,(i===0?distance*1.12:i===1?size*.55:size*.52)*growth).setAlpha(fade*(i===0?1:.86));});
   }else if(f.kind==='disc'){
    const v=Math.min(1,(t-320)/80),px=x+(tx-x)*v,py=y+(ty-y)*v;const s=f.sprites[0];if(s)s.setVisible(true).setPosition(px,py).setFrame(Math.min(5,Math.floor(u*6))).setDisplaySize(size*.64,size*.32).setAngle(reduced?0:t*.7).setTint(0xb8ecff).setAlpha(fade);
   }else if(['quake','shoulder','catstep'].includes(f.kind)){
    const s=f.sprites[0];if(s&&t>=400){s.setVisible(!f.miss).setPosition(tx,ty).setFrame(Math.min(29,Math.floor((t-400)/530*30))).setDisplaySize(size*(f.kind==='quake'?.85:.55),size*(f.kind==='quake'?.85:.55)).setTint(f.kind==='catstep'?0xcbeaf3:0xffd6a1).setAlpha(fade);}
    if(f.kind==='quake'&&t>=400){g.lineStyle(3,0xcfb584,.65*fade);g.strokeEllipse(tx,b?.ground||y,size*(.5+u*1.2),size*(.08+u*.2));}
    if(f.kind==='catstep'&&t<580){g.lineStyle(2,0xcde8dc,.7*fade);for(let i=0;i<3;i++){g.beginPath();g.moveTo(a.sprite.x-sign*(18+i*9),a.visualGround-size*.35+i*5);g.lineTo(a.sprite.x-sign*(42+i*9),a.visualGround-size*.25+i*5);g.strokePath();}}
   }else if(f.kind==='hiss'){
    for(let i=0;i<3;i++){const v=Math.min(1,u*1.6+i*.17),cx=x+(tx-x)*v,cy=y+(ty-y)*v,r=size*(.12+.23*v);g.lineStyle(3,0xffe9b0,fade*(1-v*.6));g.beginPath();g.arc(cx,cy,r,sign>0?-.85:Math.PI-.85,sign>0?.85:Math.PI+.85);g.strokePath();}
   }else if(f.kind==='scratch'){
    if(t<390||t>750)continue;const q=Math.min(1,(t-390)/90);for(let i=0;i<3;i++){const sx=tx-size*.20+i*size*.13,sy=ty-size*.25;g.lineStyle(3,0xffe4b0,fade);g.beginPath();g.moveTo(sx,sy);g.lineTo(sx+size*.26*q,sy+size*.49*q);g.strokePath();}
   }else if(f.kind==='ball'){
    // Launch at the empty-handed release pose, arrive at the damage snapshot (400).
    const v=Math.min(1,(t-320)/80),px=x+(tx-x)*v,py=y+(ty-y)*v-Math.sin(v*Math.PI)*size*.5,r=size*.085;
    if(t<430){g.fillStyle(0xf2a147,fade);g.fillCircle(px,py,r);g.lineStyle(2,0x583321,fade);g.strokeCircle(px,py,r);g.beginPath();g.moveTo(px-r,py);g.lineTo(px+r,py);g.moveTo(px,py-r);g.lineTo(px,py+r);g.strokePath();}else{g.lineStyle(2,0xf6c473,fade*(1-u));g.strokeCircle(tx,ty,size*(.10+.23*u));}
   }else if(f.kind==='charge'){g.lineStyle(2,0xb9eaff,fade*.65);g.strokeCircle(x,y,size*(.14+.07*u));}
  }
 },
 clear(scene){for(const f of scene.bonusEffects||[]){f.g.destroy();for(const s of f.sprites||[])s.destroy();}scene.bonusEffects=[];}
};
