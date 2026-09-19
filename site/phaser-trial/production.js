/* Renderer-only experiment. The existing combat engine owns every rule and result. */
(() => {
 'use strict';
 const classicStage=true;
 let enabled=new URLSearchParams(location.search).get('renderer')!=='classic',instance=null,mountId=0,richEffects=true,retryTimer=null,retryCover=null;
 const base={spawn:spawnFx,start:startCombat,cancel:cancelCombatMotion,finish:finishCombatView};
 const states={ready:0,actions:0,contacts:0,frames:[],failures:[]};
 // Guard visuals follow the same queued snapshots as HP and status icons, not
 // the already-resolved combat state ahead of the visible action.
 const previousSnapshot=combatSnapshot;
 combatSnapshot=function(){const snapshot=previousSnapshot.apply(this,arguments);if(C)snapshot.guardVisual={p:C.block||0,c:C.companion?.block||0,e:C.e.block||0};return snapshot;};
 const label=()=>{};
 function controls(){}
 function dispose(){document.body.classList.remove("classic-stage-page","phaser-trial-page");clearNames();clearTimeout(retryTimer);retryTimer=null;if(retryCover){retryCover.cover.remove();retryCover.owner.stage?.classList.remove('phaser-loading');retryCover.owner.busy=false;delete retryCover.owner._trialLoading;retryCover=null;}mountId++;if(instance){const old=instance;instance=null;old.owner.stage?.classList.remove('phaser-rendering','phaser-loading');old.owner.stage?.removeAttribute('aria-busy');old.loading?.remove();old.game?.destroy(true);old.host?.remove();}controls();}
 function select(on){if(C?.busy)return;enabled=on;dispose();if(on)mount();else label('原版画面 · 数值保留');controls();}
 const FX_ASSETS={"sword":{"url":"phaser-trial/fx/sword-68672bd8.png","width":85,"height":82,"frames":6,"source":"Cethiel"},"cleave":{"url":"phaser-trial/fx/cleave-b13770a4.png","width":93,"height":96,"frames":6,"source":"Cethiel"},"claw":{"url":"phaser-trial/fx/claw-70b9c308.png","width":107,"height":105,"frames":6,"source":"Cethiel"},"spear":{"url":"phaser-trial/fx/spear-c5d0676a.png","width":81,"height":78,"frames":6,"source":"Cethiel"},"step":{"url":"phaser-trial/fx/step-fc5044c3.png","width":105,"height":105,"frames":6,"source":"Cethiel"},"impact":{"url":"phaser-trial/fx/impact-f489c09d.png","width":37,"height":37,"frames":30,"source":"CodeManu"},"palm":{"url":"phaser-trial/fx/palm-2b562253.png","width":62,"height":56,"frames":61,"source":"CodeManu"},"cast":{"url":"phaser-trial/fx/cast-6e498c27.png","width":75,"height":77,"frames":61,"source":"CodeManu"},"poison":{"url":"phaser-trial/fx/poison-1f5a9033.png","width":71,"height":70,"frames":91,"source":"CodeManu"},"guard":{"url":"phaser-trial/fx/guard-8449f9eb.png","width":34,"height":34,"frames":61,"source":"CodeManu"},"heal":{"url":"phaser-trial/fx/heal-1f5a9033.png","width":71,"height":70,"frames":91,"source":"CodeManu"}};
 FX_ASSETS.lava={url:'phaser-trial/fx/lava-fire-cc0.png',width:25,height:51,frames:61,source:'CodeManu / Davit Masia, CC0'};
 const supports=new Set(['step','heal','guard']);
 // Quality is captured when the move queues, before asynchronous presentation.
 const TIERS=[
  {scale:.18,alpha:.42,duration:190,particles:3,color:'#d0d3c8'},
  {scale:.34,alpha:.50,duration:300,particles:5,color:'#e0e3d7'},
  {scale:.60,alpha:.68,duration:380,particles:9,color:'#88d1ea'},
  {scale:.90,alpha:.88,duration:500,particles:17,color:'#d3a6ff'},
  {scale:1.12,alpha:1,duration:570,particles:26,color:'#ffe09a'}
 ];
 const tierFor=m=>m?.art||m?.grade?({'凡品':1,'上品':2,'绝学':3,'神功':4}[m.grade]||1):0;
 const metaFor=(m,side='p')=>({side,name:m?.name||'',tier:tierFor(m),style:m?.style,animation:m?.animation});
 let moveContext=null;const oldUse=useMove;
 useMove=function(i){const previous=moveContext;moveContext=metaFor(playerMoves()[i]);try{return oldUse.apply(this,arguments);}finally{moveContext=previous;}};
 if(typeof partyCompanionMove==='function'){const oldCompanion=partyCompanionMove;partyCompanionMove=function(i){const previous=moveContext;moveContext=metaFor(partyMoves()[i],'c');try{return oldCompanion.apply(this,arguments);}finally{moveContext=previous;}};}
 const oldFx=fx;
 fx=function(side,text,cls,opts){const result=oldFx.apply(this,arguments),packet=C?.fx?.at(-1);if(!packet)return result;
  if(opts?.vfx)packet.vfx={...opts.vfx};
  else if(moveContext)packet.vfx={...moveContext};
  else if(opts?.dash||supports.has(opts?.motion))packet.vfx={name:'',tier:0};
  if(opts?.banner&&!moveContext){const art=Object.values(ARTS).find(a=>a.move?.name===opts.banner||a.name===opts.banner);
   const prior=C.fx.slice(0,-1).reverse().find(f=>f.side===side&&(f.dash||supports.has(f.motion)));
   const meta=prior?.vfx?.name===opts.banner?{...prior.vfx}:{name:opts.banner,tier:art?tierFor({...art,art:art.name}):2};packet.vfx=meta;
   if(prior)prior.vfx=meta;
  }return result;
 };
 // Two name lanes share neither timers nor replacement logic. Wall-clock timing is
 // intentional: doubling battle speed must not halve the time available to read.
 const nameLanes=new Map();
 function clearNames(){for(const lane of nameLanes.values()){clearTimeout(lane.timer);lane.el.remove();}nameLanes.clear();}
 function showName(name,side,tier){if(!name||!C?.stage?.isConnected)return;
  const key=side==='e'?'enemy':'ally',old=nameLanes.get(key);
  if(old){if(old.name!==name)old.pending={name,side,tier};return;}
  const stage=C.stage,el=document.createElement('div'),hold=tier>=4?2900:tier>=3?2600:2300;
  el.className='trial-move-name '+key;el.dataset.tier=tier;el.style.setProperty('--name-color',TIERS[tier].color);el.style.setProperty('--name-time',hold+'ms');
  const title=document.createElement('strong');title.textContent=name;el.append(title);stage.append(el);
  const lane={el,name,timer:null,pending:null};nameLanes.set(key,lane);
  lane.timer=setTimeout(()=>{if(nameLanes.get(key)!==lane)return;el.remove();nameLanes.delete(key);if(lane.pending&&C?.stage===stage){const p=lane.pending;showName(p.name,p.side,p.tier);}},hold);
 }
 const ms=v=>v*MOTION_PACE/combatSpeed;
 const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
 function fail(message){
  states.failures.push(message);const owner=instance?.owner||C;dispose();
  if(owner===C&&owner?._trialLoading){owner.busy=false;delete owner._trialLoading;updateCombat();}
  console.warn('[Battle scene] '+message);
  // A transient asset failure belongs to this load, never to the entire life.
  if(!owner||owner!==C||owner.over||!enabled)return;
  if(!owner._sceneRetry&&typeof Phaser!=='undefined'){
   owner._sceneRetry=1;const stage=owner.stage,cover=document.createElement('div');
   cover.className='battle-scene-loading';cover.textContent='正在重新载入战场…';stage.append(cover);stage.classList.add('phaser-loading');
   owner.busy=true;owner._trialLoading=true;
   if(classicStage){document.body.classList.add('classic-stage-page','phaser-trial-page');cover.style.backgroundImage='url("phaser-trial/river-stage.webp")';}
   retryCover={owner,cover};clearTimeout(retryTimer);retryTimer=setTimeout(()=>{retryTimer=null;retryCover=null;cover.remove();stage.classList.remove('phaser-loading');if(C!==owner||owner.over)return;owner.busy=false;delete owner._trialLoading;mount();},600);return;
  }
  const notice=document.createElement('button');notice.type='button';notice.className='battle-scene-retry';notice.textContent='新版战场加载未完成 · 点击重试';
  notice.onclick=()=>{if(C!==owner||owner.busy||owner.over)return;notice.remove();owner._sceneRetry=0;mount();};owner.stage?.append(notice);
  label('战场加载未完成，可点击重试');controls();
 }
 function mount(){
  if(!enabled||!C?.stage?.isConnected||C.over||instance)return;
  if(typeof Phaser==='undefined'){fail('Phaser unavailable');return;}
  document.body.classList.add("classic-stage-page","phaser-trial-page");
  const owner=C,token=++mountId,stage=C.stage,host=document.createElement('div');host.id='phaser-stage';stage.prepend(host);
  const wasBusy=owner.busy;owner._trialLoading=true;owner.busy=true;controls();label('载入竹林与人物动作');
  const width=Math.max(300,Math.round(stage.clientWidth)),height=stage.clientHeight;
  const modernHero=classicStage&&(window.playerHeroAtlas?.()||window.CLASSIC_HERO_ATLASES);
  const atlas={p:modernHero||{...HERO_MARTIAL_ATLASES,claw:HERO_CLAW_ATLAS},e:{}};
  const idlePack=classicStage&&window.ACTOR_IDLE_V3,sizePack=classicStage&&window.ACTOR_SIZE_V3,enemyIdentity=hdFoe(owner.e.name);
  for(const style of ['sword','cleave','spear','palm','finger','cast','claw','kick','step','guard','heal','poison','pounce','charge','coil','bite']){const a=enemyAtlas(style);if(a){const key=Object.keys(ENEMY_MARTIAL_ATLASES).find(k=>ENEMY_MARTIAL_ATLASES[k]===a);atlas.e[style]={...a,bodyHeight:sizePack?.enemy?.[key]||a.height};}}
  if(!Object.keys(atlas.e).length){fail('Enemy animation missing');host.remove();owner.busy=wasBusy;delete owner._trialLoading;return;}
  if(owner.companion){const a=COMPANION_ATLASES[owner.companion.id];atlas.c=window.COMPANION_ACTION_ATLASES?.[owner.companion.id]||{attack:{...a,bodyHeight:sizePack?.companion?.[owner.companion.id]||a.height}};}
  if(idlePack?.['e-'+enemyIdentity])atlas.e.idle={...idlePack['e-'+enemyIdentity],facing:enemyIdentity==='bandit'?1:-1};
  if(atlas.c&&idlePack?.['c-'+owner.companion.id])atlas.c.idle=idlePack['c-'+owner.companion.id];
  const rival=owner.e.tournamentHero;
  if(rival){const a=COMPANION_ATLASES[rival];atlas.e={...(window.COMPANION_ACTION_ATLASES?.[rival]||{attack:{...a,bodyHeight:sizePack?.companion?.[rival]||a.height}})};atlas.e.special||=atlas.e.attack;if(idlePack?.['c-'+rival])atlas.e.idle=idlePack['c-'+rival];}
  const bonusActor=window.BONUS_ACTORS?.[owner.e.bonusActor];
  if(bonusActor){const a=bonusActor.atlas;atlas.e={idle:a.idle,palm:a.attack,claw:a.attack,pounce:a.attack,charge:a.attack,cast:a.special,finger:a.special,guard:a.guard,hurt:a.hurt};}
  // Cover the legacy stage synchronously, before the first asynchronous asset load.
  // Keep this cover until the new scene has actually rendered its first frame.
  const loading=document.createElement('div');loading.className='battle-scene-loading';loading.setAttribute('role','status');loading.textContent='战场准备中…';
  stage.classList.add('phaser-loading');stage.setAttribute('aria-busy','true');stage.append(loading);
  const trial={owner,host,loading,scene:null,game:null,atlas,ready:false};instance=trial;
  class BattleScene extends Phaser.Scene{
   preload(){
    this.load.image('grove',classicStage?'phaser-trial/river-stage.webp':'phaser-trial/bamboo-stage.png');
    this.load.on('loaderror',file=>{if(file.key.startsWith('fx-'))trial.fxFailed=true;else trial.failed=file.key;});
    for(const [key,a]of Object.entries(FX_ASSETS))this.load.spritesheet('fx-'+key,a.url,{frameWidth:a.width,frameHeight:a.height,endFrame:a.frames-1});
    for(const [side,entries]of Object.entries(atlas))for(const [style,a]of Object.entries(entries))if(a?.src)this.load.spritesheet(side+'-'+style,a.src,{frameWidth:a.width,frameHeight:a.height});
    if(!modernHero){const poses=heroPoses();if(poses?.[8])this.load.image('p-hurt',poses[8]);}
   }
   create(){
    if(instance!==trial||token!==mountId)return;
    if(trial.failed){fail(trial.failed);return;}
    if(trial.fxFailed){richEffects=false;states.failures.push('Effect asset unavailable; simple effects retained');}
    trial.scene=this;this.actors={};this.wind=[];this.spells=[];this.localSeed=7723;
    this.bg=this.add.image(width/2,height/2,'grove').setDepth(-10);
    this.bg.setScale(Math.max(width/this.bg.width,height/this.bg.height));
    if(!classicStage)this.add.rectangle(width/2,height*.89,width,height*.22,0x091916,.17).setDepth(-8);
    this.focusShade=this.add.rectangle(width/2,height/2,width,height,0x071720,0).setDepth(0);
    this.turnMark=this.add.ellipse(0,0,80,16).setStrokeStyle(2,0xffe0a0,.7).setDepth(1).setVisible(false);
    const y=height*.84,baseSize=classicStage?(width<600?114:170):(width<600?136:178);
    for(const side of Object.keys(atlas)){
     const style=atlas[side].idle?'idle':side==='p'?'sword':Object.keys(atlas[side])[0],key=side+'-'+style;
     if(!this.textures.exists(key))continue;
     const animalSize={boar:.72,centipede:.52,monkey:.80,python:.76,rat:.52,tiger:.74,wolf:.68,ghost:.88};
     const size=baseSize*(side==='e'&&bonusActor?bonusActor.size:classicStage&&side==='e'?(animalSize[enemyIdentity]||1):1);
     // Leave a central command lane between the opposing formations.
     const x=width*(classicStage?(width<600?(side==='e'?.14:side==='c'?.86:.81):(side==='e'?.22:side==='c'?.84:.78)):(side==='e'?.77:side==='c'?.14:.27)),ground=classicStage?height*(side==='e'?.70:side==='c'?.54:.84):y-(side==='c'?12:0);
     const shadow=this.add.ellipse(x,ground-2,size*.56,12,0x03110e,.42).setDepth(2);
     const sprite=this.add.sprite(x,ground,key,0).setOrigin(.5,1).setDepth(side==='c'?3:4);
     // Use each clip's authored facing; mixed-source enemies have both directions.
     const a=atlas[side][style],nativeFacing=a.facing||(side==='e'?-1:1),homeFacing=classicStage?(side==='e'?1:-1):(side==='e'?-1:1),homeFlip=homeFacing!==nativeFacing;
     sprite.setScale(size/(a.bodyHeight||a.height)).setFlipX(homeFlip);
     // Actor sprites are presentation only; details open from HP/MP panels.
     // Canvas events must not reach the game's document-level detail dismissal listener.
     this.actors[side]={sprite,shadow,aura:this.add.sprite(x,ground-size*.52,'fx-guard',0).setDepth(5).setTintFill(0xaedfff).setVisible(false),home:x,ground,visualGround:ground,homeFacing,homeFlip,scale:size/(a.bodyHeight||a.height),size,idle:key,nativeFacing,action:null,react:null,style};
     Object.assign(this.actors[side],{idleFrames:a.frames||1,idleSince:null,idleInterval:side==='p'?400:side==='c'?660:730,bodyHeight:a.bodyHeight||a.height,identity:side==='c'?owner.companion.id:side==='e'?enemyIdentity:'hero'});
     if(side==='e'&&bonusActor){Object.assign(this.actors[side],{bonus:true,nativeFacing:1,homeFlip:!classicStage,idleInterval:240,identity:owner.e.bonusActor});sprite.setFlipX(!classicStage);}
     if(side==='e'&&rival){Object.assign(this.actors[side],{namedRival:true,nativeFacing:1,homeFlip:!classicStage,idleInterval:660,identity:rival});sprite.setFlipX(!classicStage);}
    }
    host.addEventListener('click',e=>e.stopPropagation());
    for(let i=0;i<14;i++){const dot=this.add.rectangle(i/14*width,(i*47)%height,2+i%2,2,0xd7d5a0,.18+i%3*.06).setDepth(i%2?1:7);this.wind.push(dot);}
    stage.classList.add('phaser-rendering');
    this.game.events.once('postrender',()=>{
     if(instance!==trial||token!==mountId)return;
     stage.classList.remove('phaser-loading');stage.removeAttribute('aria-busy');loading.remove();
     trial.ready=true;states.ready++;owner.busy=wasBusy;delete owner._trialLoading;controls();label('新版战场 · 可切换对比');updateCombat();
    });
   }
   random(){this.localSeed=(Math.imul(this.localSeed,1664525)+1013904223)>>>0;return this.localSeed/4294967296;}
   stopIdle(a){a.idleSince=null;}
   playIdle(a,now,dead){
    if(a.action||a.react){a.idleSince=null;return;}
    if(a.idleSince===null)a.idleSince=now;
    const frame=gentleCombat||dead||owner.over?0:Math.floor((now-a.idleSince)/a.idleInterval)%a.idleFrames;
    a.sprite.setTexture(a.idle,frame).setScale(a.scale).setFlipX(a.homeFlip);
   }
   clearSpellEffects(){for(const f of this.spells)f.g.destroy();this.spells=[];window.BonusBattleFX?.clear(this);for(const a of Object.values(this.actors))a.aura.setVisible(false);}
   updateProtection(side,a,now,dead){
    const visible=owner.visual,block=visible?(visible.guardVisual?.[side]??(side==='c'?visible.companion?.block||0:0)):(side==='p'?owner.block:side==='c'?owner.companion?.block:owner.e.block);
    const shield=(visible?visible.statuses:owner.statuses)?.[side]?.shield;
    const active=block>0||(shield?.points>0&&shield.turns>0);
    a.aura.setVisible(false);
    if(!active){if(!(a.action?.support&&a.action.style==='guard'))a.guardTier=0;return;}
    if(!richEffects||dead||owner.over||!this.textures.exists('fx-guard'))return;
    if(a.action?.support&&a.action.style==='guard')return;
    const tier=Math.max(1,Math.min(4,a.guardTier||1));
    a.aura.setVisible(true).setFrame(gentleCombat?2:Math.floor(now/100)%FX_ASSETS.guard.frames).setPosition(a.sprite.x,a.visualGround-a.size*.52).setDepth(a.sprite.depth+.12).setDisplaySize(a.size*.97,a.size*1.24).setAlpha((gentleCombat?.16:.22)+tier*.025);
   }
   spell(kind,side,target,delay=0,tier=this.actors[side]?.tier||0){
    if(!richEffects||tier===0)return;const a=this.actors[side];if(!a)return;
    const key=({staff:'spear',blade:'cleave',fist:'palm'}[kind])||(FX_ASSETS[kind]?kind:['finger','spear'].includes(kind)?'spear':['kick','pounce','charge','bite','coil'].includes(kind)?'palm':'sword');
    if(!this.textures.exists('fx-'+key))return;
    const duration=kind==='impact'?240+tier*25:supports.has(kind)?500+tier*45:TIERS[tier].duration;
    const layered=['sword','cleave','palm','cast'].includes(key)&&!supports.has(kind);
    const count=kind==='claw'?3:layered&&tier>=3?tier-1:1;
    for(let i=0;i<count;i++){
     const g=this.add.sprite(0,0,'fx-'+key,0).setDepth(kind==='heal'?3:kind==='guard'?5:8).setVisible(false);
     if(kind==='guard')g.setTintFill(0xaedfff);
     this.spells.push({kind,key,side,target,tier,layer:kind==='claw'?0:i,index:i,start:performance.now()+ms(delay+i*36),duration,g,frame:-1});
    }
   }
   updateSpells(now){
    for(const f of [...this.spells]){
     const elapsed=(now-f.start)*combatSpeed/MOTION_PACE;if(elapsed<0)continue;
     if(elapsed>=f.duration||!richEffects){f.g.destroy();this.spells.splice(this.spells.indexOf(f),1);continue;}
     const a=this.actors[f.side],b=this.actors[f.target];if(!a)continue;
     const t=elapsed/f.duration,data=FX_ASSETS[f.key],sign=b?(b.home<a.home?-1:1):a.homeFacing,size=a.size;
     // Follow the wind-up; anchor the slash at contact so it does not slide home with the actor.
     if(!f.anchor&&elapsed>=190)f.anchor={x:a.sprite.x,y:(a.visualGround??a.ground)-size*.56};
     const ax=f.anchor?.x??a.sprite.x,ay=f.anchor?.y??(a.visualGround??a.ground)-size*.56;
     let x=ax,y=ay,w=size*1.32,h=w*data.height/data.width,angle=0,alpha=gentleCombat?.66:1;
     if(['sword','cleave'].includes(f.key)){x+=sign*size*.37;y-=size*.04;w=size*1.38;h=w*data.height/data.width;}
     else if(f.kind==='claw'){x=(b?b.sprite.x:ax)+sign*(f.index-1)*size*.17;y=(b?b.ground-b.size*.55:ay)-(f.index-1)*size*.17;w=size*.81;h=size*.97;angle=90;}
     else if(f.key==='spear'){const start=ax+sign*size*.28,end=b?b.sprite.x:ax+sign*size;const u=smooth(Math.min(1,elapsed/190));x=start+(end-start)*u;y=ay;w=size*.95;h=size*.68;angle=45;}
     else if(['palm','cast','poison'].includes(f.key)){const start=a.action?.end??a.home,end=b?b.sprite.x:start;const u=smooth(Math.min(1,elapsed/190));x=start+(end-start)*u;y=ay;w=size*(f.key==='palm'?1.03:.93);h=w*data.height/data.width;alpha*=.9;}
     else if(f.kind==='impact'){x=f.x??a.sprite.x;y=f.y??a.ground-size*.57;w=size*.64;h=w;alpha*=.72;}
     else if(f.kind==='guard'){x=a.sprite.x;y=a.ground-size*.52;w=size*.97;h=size*1.24;alpha*=.48;}
     else if(f.kind==='heal'){x=a.sprite.x;y=a.ground-size*.43;w=size*1.12;h=size*1.12;alpha*=.68;}
     else if(f.kind==='step'){x=a.sprite.x-sign*size*.20;y=a.ground-size*.20;w=size*1.40;h=size*.52;alpha*=.85;}
     // Fixed artist-authored frames, no gameplay RNG or additional damage scheduling.
     const frame=Math.min(data.frames-1,Math.floor(t*data.frames));f.frame=frame;
     const profile=TIERS[f.tier],layer=f.layer||0,effectScale=f.kind==='guard'?Math.max(.84,profile.scale):profile.scale;w*=effectScale*(1-layer*.17);h*=effectScale*(1-layer*.17);alpha*=(f.kind==='guard'?Math.max(.75,profile.alpha):profile.alpha)*(layer? .32:1);
     if(f.kind==='claw'&&b){x=b.sprite.x+(x-b.sprite.x)*profile.scale;y=b.ground-b.size*.55+(y-(b.ground-b.size*.55))*profile.scale;}
     const fade=Math.min(1,t*12,(1-t)*5);
     f.g.setVisible(true).setFrame(frame).setPosition(Math.round(x),Math.round(y)).setDisplaySize(w,h).setFlipX(sign<0).setAngle(angle*sign).setAlpha(alpha*fade);
    }
   }
   burst(x,y,color,count=12){
    if(gentleCombat)count=Math.min(4,count);
    for(let i=0;i<count;i++){const angle=this.random()*6.283,speed=14+this.random()*40;
     const dot=this.add.rectangle(x,y,i%3?2:3,i%3?2:3,color,.9).setDepth(8);
     this.tweens.add({targets:dot,x:x+Math.cos(angle)*speed,y:y+Math.sin(angle)*speed+12,alpha:0,duration:ms(250+this.random()*250),ease:'Cubic.Out',onComplete:()=>dot.destroy()});
    }
   }
   ghost(a){if(gentleCombat)return;const s=a.sprite,g=this.add.image(s.x,s.y,s.texture.key,s.frame.name).setOrigin(.5,1).setScale(s.scaleX,s.scaleY).setFlipX(s.flipX).setTint(0xa0cfce).setAlpha(.22).setDepth(3);this.tweens.add({targets:g,alpha:0,duration:ms(240),onComplete:()=>g.destroy()});}
   attack(side,style,target,meta={tier:0}){
    const a=this.actors[side],other=this.actors[target];if(!a||!other)return;
    this.stopIdle(a);
    a.tier=meta.tier||0;a.style=meta.style||style;const key=side+'-'+style,found=this.textures.exists(key)?key:a.idle;
    a.sprite.setTexture(found,0);const data=atlas[side][style]||atlas[side][Object.keys(atlas[side])[0]];
    a.sprite.setScale(a.size/(data.bodyHeight||data.height));
    const remote=['finger','cast','poison'].includes(meta.style||style),sign=other.home>a.home?1:-1;
    a.sprite.setFlipX(sign!==(data.facing||a.nativeFacing));const reach=a.size*(style==='spear'?1.0:.64);
    a.action={start:performance.now(),style,key:found,sign,target,end:remote?a.home+sign*6:other.home-sign*reach,endY:classicStage&&!remote?other.ground+(side==='e'?-1:1)*height*.035:a.ground,remote,support:false};
    a.action.frameCount=data.frames||8;
    if(a.bonus){a.action.frameCount=data.frames;a.action.bonus=true;a.action.bonusFX=meta.bonusFX;}
    states.actions++;states.frames=[];this.burst(a.home,a.ground,0xa8ae8e,a.tier>=3?6:2);
    if(a.bonus&&meta.bonusFX&&richEffects)window.BonusBattleFX?.begin(this,a,meta.bonusFX,target,a.action.start);
    else this.spell(meta.style||style,side,target,Math.max(210,400-TIERS[a.tier].duration*.35));
   }
   support(side,style,meta={tier:0}){
    const a=this.actors[side];if(!a)return;a.tier=Math.max(1,meta.tier||0);if(style==='guard')a.guardTier=a.tier;const clip=side==='c'&&meta.animation==='special'?'special':style,key=side+'-'+clip;
    this.stopIdle(a);
    a.sprite.setTexture(this.textures.exists(key)?key:a.idle,0);
    const data=atlas[side][clip];if(data)a.sprite.setScale(a.size/(data.bodyHeight||data.height));
    a.sprite.setFlipX(a.homeFacing!==(data?.facing||a.nativeFacing));
    a.action={start:performance.now(),style,key:a.sprite.texture.key,frameCount:data?.frames||(a.sprite.texture.key===a.idle?a.idleFrames:8),sign:classicStage?(side==='e'?1:-1):(side==='e'?-1:1),end:a.home,support:true};
    if(a.bonus){a.action.bonus=true;a.sprite.setFlipX(a.homeFlip);if(meta.bonusFX==='charge'){a.sprite.setTexture(side+'-cast',0);a.action.key=side+'-cast';a.action.frameCount=2;}if(meta.bonusFX&&richEffects)window.BonusBattleFX?.begin(this,a,meta.bonusFX,null,a.action.start);}
    states.actions++;this.burst(a.home,a.ground-a.size*.45,style==='heal'?0x9ae3b5:0xa8daeb,TIERS[a.tier].particles);
    this.spell(style,side,null);
    const ring=this.add.ellipse(a.home,a.ground-4,a.size*(.25+a.tier*.1),10).setStrokeStyle(2,style==='heal'?0x9ae3b5:0xa8daeb,.7).setDepth(3);
    this.tweens.add({targets:ring,scaleX:1.45,scaleY:1.45,alpha:0,duration:ms(690),onComplete:()=>ring.destroy()});
   }
   strikeMark(target,from,style,miss,blocked){
    const a=this.actors[target],s=this.actors[from];if(!a)return;
    const x=a.sprite.x,y=a.ground-a.size*.57,sign=s&&s.home>a.home?-1:1;
    const color=blocked?0xc4e6ff:style==='claw'?0xd7a1f0:style==='palm'?0xffd78a:0xd0f1ff;
    if(miss){this.ghost(a);return;}
    if(richEffects){
     const tier=s?.tier||0;if(tier===0&&!blocked){this.burst(x,y,color,3);return;}
     if(blocked){this.spell('guard',target,null,0,Math.max(1,a.guardTier||1));this.burst(x,y,0xc4e6ff,12);}
     else{this.spell('impact',target,null,0,tier);const f=this.spells.at(-1);if(f){f.x=x;f.y=y;}this.burst(x,y,color,TIERS[tier].particles);}
     return;
    }
    const g=this.add.graphics().setDepth(8);g.lineStyle(blocked?3:2,color,.95);
    if(style==='claw')for(let i=0;i<3;i++){g.beginPath();g.moveTo(x-sign*26+i*7,y-25);g.lineTo(x+sign*9+i*7,y+15);g.lineTo(x+sign*14+i*7,y+28);g.strokePath();}
    else if(['finger','cast','poison'].includes(style)&&s){g.beginPath();g.moveTo(s.sprite.x+sign*20,s.ground-s.size*.55);g.lineTo(x,y);g.strokePath();}
    else if(style==='palm'||blocked){g.strokeCircle(x,y,blocked?20:27);g.strokeCircle(x,y,blocked?14:18);}
    else {g.beginPath();g.moveTo(x-sign*32,y+28);g.lineTo(x+sign*8,y-5);g.lineTo(x+sign*30,y-30);g.strokePath();}
    this.tweens.add({targets:g,alpha:0,duration:ms(style==='claw'?300:210),onComplete:()=>g.destroy()});this.burst(x,y,color,blocked?12:18);
   }
   react(side,f){const a=this.actors[side];if(!a)return;const from=f.from||f.vfx?.side||(side==='e'?'p':'e'),style=this.actors[from]?.style||'sword';
    if(f.miss)for(const effect of this.bonusEffects||[])if(effect.target===side)effect.miss=true;
    this.stopIdle(a);
    a.react={start:performance.now(),miss:!!f.miss,blocked:!!f.blocked,heavy:f.cls==='crit'};
    this.strikeMark(side,from,style,f.miss,f.blocked);states.contacts++;
    if(!f.miss){if((this.actors[from]?.tier||0)>=3)a.sprite.setTintFill(f.blocked?0xb1d5f7:0xffe0c0);else a.sprite.setTint(f.blocked?0xb1d5f7:0xffd7b6);if(f.cls==='crit'&&(this.actors[from]?.tier||0)>=3&&!gentleCombat)this.cameras.main.shake(ms(90),.002);}
   }
   float(side,text,cls){const a=this.actors[side];if(!a||!text)return;
    const t=this.add.text(a.sprite.x,a.ground-a.size-12,text,{fontFamily:'Consolas, monospace',fontSize:cls==='crit'?'27px':'19px',fontStyle:'bold',color:cls==='heal'?'#a7ecc2':cls==='miss'?'#b8e0ef':cls==='crit'?'#ffe2a3':'#ffe9d0',stroke:'#12221e',strokeThickness:4}).setOrigin(.5).setDepth(20);
    this.tweens.add({targets:t,y:t.y-28,alpha:0,duration:ms(900),hold:ms(150),ease:'Cubic.Out',onComplete:()=>t.destroy()});
   }
   update(){
    if(instance!==trial)return;
    if(C!==owner||!stage.isConnected){dispose();return;}
    const now=performance.now();controls();
    if(classicStage){const active=this.actors[owner.initiative?.active],choosing=owner.initiative?.phase==='choosing';this.turnMark.setVisible(!!active&&choosing);if(active)this.turnMark.setPosition(active.sprite.x,active.visualGround-1).setDisplaySize(active.size*.7,14).setAlpha(.65+.2*Math.sin(now/260));
     const bright=Object.values(this.actors).some(a=>a.tier===4&&a.action&&(now-a.action.start)<ms(780));const target=bright&&!gentleCombat?.16:0;this.focusShade.setAlpha(this.focusShade.alpha+(target-this.focusShade.alpha)*.12);}
    for(const dot of this.wind){if(gentleCombat)dot.setVisible(false);else{dot.setVisible(true);dot.x+=.12;dot.y+=.035;if(dot.x>width)dot.x=0;if(dot.y>height)dot.y=0;}}
    for(const [side,a]of Object.entries(this.actors)){
     let x=a.home,y=a.ground;const action=a.action;
     if(action){const t=(now-action.start)*combatSpeed/MOTION_PACE,total=action.support?730:960;
      if(t>=total){a.action=null;a.sprite.setTexture(a.idle,0).setScale(a.scale).setFlipX(a.homeFlip);}
      else{
       const times=action.support?[0,85,165,250,335,420,510,595]:[0,110,230,335,400,475,590,720];let frame=0;while(frame<7&&t>=times[frame+1])frame++;
       if(!action.bonus&&action.frameCount!==8)frame=Math.round(frame/7*(action.frameCount-1));
       if(action.bonus){frame=action.support?Math.min((action.frameCount||2)-1,Math.floor(t/365)):t<180?0:t<320?1:t<590?2:3;}
       a.sprite.setFrame(Math.min(frame,(action.frameCount||8)-1));if(states.frames.at(-1)!==frame){states.frames.push(frame);if(states.frames.length>80)states.frames.shift();}
       if(action.support){if(action.style==='step'){x=a.home-action.sign*25*Math.sin(Math.PI*t/total);y-=6*Math.sin(Math.PI*t/total);if(frame!==a.lastGhost&&a.tier>=3){this.ghost(a);a.lastGhost=frame;}}}
       else{
        const back=a.home-action.sign*7;
        x=t<150?a.home+(back-a.home)*smooth(t/150):t<400?back+(action.end-back)*smooth((t-150)/250):t<540?action.end:action.end+(a.home-action.end)*smooth((t-540)/420);
        if(classicStage)y=a.ground+(action.endY-a.ground)*(t<150?0:t<400?smooth((t-150)/250):t<540?1:1-smooth((t-540)/420));
       if(['kick','pounce'].includes(action.style))y-=18*Math.sin(Math.PI*Math.min(t,540)/540);
       if(action.bonusFX==='ball')y-=14*Math.sin(Math.PI*Math.min(t,600)/600);
       if(action.bonusFX==='catstep')y-=28*Math.sin(Math.PI*Math.min(t,540)/540);
       if(['quake','shoulder'].includes(action.bonusFX)&&t>150&&t<540)y+=5*Math.sin(Math.PI*(t-150)/390);
        if(t>180&&t<380&&frame!==a.lastGhost&&!action.remote&&a.tier>=3){this.ghost(a);a.lastGhost=frame;}
       }
      }
     }
     if(a.react){const t=(now-a.react.start)*combatSpeed/MOTION_PACE;
      if(t>470){a.react=null;a.sprite.clearTint();a.sprite.angle=0;if(!a.action)a.sprite.setTexture(a.idle,0).setScale(a.scale);}
      else{const sign=classicStage?(side==='e'?-1:1):(side==='e'?1:-1);x+=sign*(a.react.miss?26:a.react.blocked?5:a.react.heavy?17:10)*Math.sin(Math.PI*Math.min(1,t/470));
       if(t>80)a.sprite.clearTint();if(!a.react.miss&&!a.react.blocked){a.sprite.angle=gentleCombat?0:sign*3*Math.sin(Math.PI*t/470);if((a.bonus||a.namedRival||side==='c')&&!a.action&&this.textures.exists(side+'-hurt'))a.sprite.setTexture(side+'-hurt',Math.min((atlas[side].hurt?.frames||2)-1,Math.floor(t/470*(atlas[side].hurt?.frames||2)))).setScale(a.scale).setFlipX(a.homeFlip);else if(side==='p'&&!a.action&&this.textures.exists('p-hurt')){a.sprite.setTexture('p-hurt',modernHero?Math.min(3,Math.floor(t/118)):0);a.sprite.setScale(modernHero?a.scale:a.size/a.sprite.frame.realHeight);}}
      }
     }
     const dead=(side==='p'?(owner.visual?.php??owner.php):side==='e'?(owner.visual?.ehp??owner.e.hp):(owner.visual?.companion?.hp??owner.companion?.hp))<=0;

     a.visualGround=y;a.sprite.setPosition(Math.round(x),Math.round(y)).setAlpha(dead?.45:1);if(classicStage)a.sprite.setDepth(4+y/height);a.shadow.setPosition(Math.round(x),classicStage?y-2:a.ground-2);if(dead&&!a.action)a.sprite.angle=side==='e'?12:-12;
     this.playIdle(a,now,dead);
     // Re-evaluate after texture changes (including hurt and return-to-idle frames).
     const facing=atlas[side][a.sprite.texture.key.slice(side.length+1)]?.facing||a.nativeFacing;
     a.sprite.setFlipX((a.action?.sign||a.homeFacing)!==facing);
     this.updateProtection(side,a,now,dead);
    }
    this.updateSpells(now);
    window.BonusBattleFX?.update(this,now,combatSpeed/MOTION_PACE,gentleCombat);
   }
  }
  try{trial.game=new Phaser.Game({type:Phaser.AUTO,parent:host,width,height,backgroundColor:'#102622',pixelArt:true,roundPixels:true,antialias:false,banner:false,audio:{noAudio:true},fps:{target:60},scene:BattleScene});}catch(error){fail('Renderer initialization: '+error.message);}
 }
 spawnFx=function(f){const trial=instance;if(!enabled||!trial?.ready||trial.owner!==C)return base.spawn(f);
  const scene=trial.scene,side=f.companionAction?'c':f.side,meta=f.vfx||{tier:0};
  if(f.dash||f.companionAction){scene.attack(side,f.companionAction?(f.companionAnimation||'attack'):f.enemyAnimation||f.motion||'palm',side==='e'?(f.partyTarget||'p'):'e',meta);if(meta.tier)showName(meta.name||f.moveName,side,meta.tier);motionLater(()=>GameAudio.strike(f.motion||'sword',side==='c'?'p':side),220);}
  else if(supports.has(f.motion)){scene.support(side,f.motion,meta);if(meta.tier)showName(meta.name,side,meta.tier);GameAudio.support(f.motion,side==='c'?'p':side);}
  // Named action packets already opened the appropriate reading lane.
  if(f.shake||f.miss){scene.react(side,f);GameAudio.contact(f);}
  if(f.text)scene.float(side,f.text,f.cls);
 };
 startCombat=function(){dispose();const result=base.start.apply(this,arguments);if(enabled)mount();return result;};
 cancelCombatMotion=function(){dispose();return base.cancel.apply(this,arguments);};
 finishCombatView=function(){dispose();return base.finish.apply(this,arguments);};
 let resizeTimer;
 function resized(){if(!instance?.ready)return;if(C?.busy){resizeTimer=setTimeout(resized,180);return;}dispose();mount();}
 window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(resized,180);});
 window.addEventListener('pagehide',dispose);
 window.PhaserTrial={get state(){return {...states,enabled,richEffects,stageDesign:classicStage?'classic-oblique':'bamboo-side',effectVersion:'tiered-atlas-v2',activeEffects:instance?.scene?.spells?.length||0,ready:!!instance?.ready,canvasCount:document.querySelectorAll('#phaser-stage canvas').length,hostConnected:instance?.host?.isConnected,booted:instance?.game?.isBooted,gameParent:instance?.game?.config?.parent?.id};},get scene(){return instance?.scene;},select};
 mount();
})();
