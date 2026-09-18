/* Full-game battle presentation; does not create or alter a party. */
(()=>{'use strict';
 const heroPortrait=new Image();let heroPortraitPath='';
 function syncHeroPortrait(){const src=window.playerHeroPortrait?.()||'phaser-trial/hero-v2/portrait.webp';if(src!==heroPortraitPath){heroPortraitPath=src;heroPortrait.src=src;}return heroPortrait.complete&&heroPortrait.naturalWidth;}
 const originalPortraits=partyTrackPortraits;partyTrackPortraits=async function(){await originalPortraits.apply(this,arguments);paintHeroPortrait();};
 function paintHeroPortrait(){if(!syncHeroPortrait())return;const token=document.querySelector('[data-initiative="p"] canvas');if(token){token.dataset.heroGender=S.gender==='女'?'female':'male';const ctx=token.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,40,40);ctx.drawImage(heroPortrait,2,2,36,36);}}
 heroPortrait.onload=()=>{paintHeroPortrait();decorate();};
 // The original controls retain ownership of combat rules and settlement.
 // This two-level view only delegates to their live buttons.
 let commandView='root',commandSide='',commandCategory='attack',commandSelection=-1;
 function stageCommands(card){
  const stage=card.querySelector('#stage'),source=document.getElementById('cbt-bottom');if(!stage||!source)return;
  let menu=stage.querySelector('#stage-commands');
  if(!menu){menu=document.createElement('section');menu.id='stage-commands';menu.setAttribute('aria-label','战斗指令');stage.append(menu);commandView='root';commandSelection=-1;}
  const enabled=document.body.classList.contains('classic-stage-page'),owner=C;
  source.classList.toggle('stage-command-source',enabled);
  const side=C.initiative?.active||'p',ready=enabled&&!C.over&&!C.busy&&!C.playing&&(C.initiative?C.initiative.phase==='choosing'&&['p','c'].includes(side):!C.auto);
  const mayAct=()=>C===owner&&!C.over&&!C.busy&&!C.playing&&(!C.initiative||C.initiative.phase==='choosing'&&C.initiative.active===side);
  menu.hidden=!ready;
  let edge=stage.querySelector('#stage-command-edges');
  if(!edge){edge=document.createElement('div');edge.id='stage-command-edges';edge.innerHTML='<button type="button" id="stage-auto">自动</button><button type="button" id="stage-flee">撤退</button>';stage.append(edge);}
  edge.hidden=!enabled||(!ready&&!C.partyAuto&&!C.auto);
  const auto=edge.querySelector('#stage-auto'),flee=edge.querySelector('#stage-flee');
  auto.textContent=C.partyAuto||C.auto?'停止托管':'自动';auto.disabled=!ready&&!C.partyAuto&&!C.auto;
  auto.onclick=()=>{if(C!==owner||C.over)return;autoFight();decorate();};
  const fleeSource=source.querySelector('#flee-btn');flee.hidden=!ready||side!=='p'||!fleeSource;flee.disabled=!!fleeSource?.disabled;flee.title=fleeSource?.textContent||'';
  flee.onclick=()=>{if(mayAct()&&!fleeSource?.disabled){fleeSource?.click();decorate();}};
  if(!ready){menu.dataset.signature='';commandView='root';commandSelection=-1;return;}
  if(commandSide!==side){commandSide=side;commandView='root';commandSelection=-1;}
  const moves=side==='c'?partyMoves():playerMoves(),buttons=[...source.querySelectorAll(side==='c'?'#party-moves article>button':'#moves-grid button')];
  const basics={attack:0,guard:moves.findIndex(m=>m.kind==='def'&&!m.art&&!m.grade),heal:moves.findIndex(m=>m.kind==='heal'&&!m.art&&!m.grade)};
  const group=m=>['atk','drain'].includes(m.kind)?'attack':m.kind==='heal'?'heal':'guard';
  const learned=moves.map((m,i)=>({m,i})).filter(({i})=>!Object.values(basics).includes(i));
  const signature=JSON.stringify([side,commandView,commandCategory,C.initiative?.serial,C.round,source.innerHTML,buttons.map(b=>b.disabled)]);
  if(menu.dataset.signature===signature)return;menu.dataset.signature=signature;menu.dataset.side=side;menu.dataset.view=commandView;
  const cast=i=>{if(!mayAct()||!buttons[i]||buttons[i].disabled)return;buttons[i].click();decorate();};
  const header='<header><canvas class="command-portrait" width="40" height="40" aria-hidden="true"></canvas><strong>'+storyEscape(side==='c'?partyName('c'):S.name)+'</strong>'+(commandView==='arts'?'<button type="button" class="command-back" aria-label="返回战斗指令">返回</button>':'')+'</header>';
  if(commandView==='root'){
   menu.innerHTML=header+'<div class="command-root-grid">'+[['attack','普攻'],['arts','武学'],['guard','防御'],['heal','调息']].map(([key,label])=>'<button type="button" data-command="'+key+'"><span aria-hidden="true">◆</span>'+label+'</button>').join('')+'</div>';
   menu.querySelectorAll('[data-command]').forEach(b=>{const key=b.dataset.command;b.disabled=key==='arts'?!learned.length:basics[key]<0||!buttons[basics[key]]||!!buttons[basics[key]]?.disabled;b.onclick=()=>{if(key==='arts'){commandView='arts';commandSelection=-1;stageCommands(card);}else cast(basics[key]);};});
  }else{
   menu.innerHTML=header+'<nav aria-label="武学类别">'+[['attack','攻击'],['guard','身法防御'],['heal','调息']].map(([key,label])=>'<button type="button" data-command-category="'+key+'" aria-pressed="'+(commandCategory===key)+'">'+label+'</button>').join('')+'</nav><div class="command-art-list" aria-label="选择招式"></div><div class="command-art-detail" aria-live="polite"></div><footer><span class="command-art-count"></span><button type="button" class="command-confirm">施展</button></footer>';
   menu.querySelector('.command-back').onclick=()=>{commandView='root';stageCommands(card);menu.querySelector('[data-command="arts"]').focus();};
   menu.querySelectorAll('[data-command-category]').forEach(b=>b.onclick=()=>{commandCategory=b.dataset.commandCategory;commandSelection=-1;stageCommands(card);});
   const list=menu.querySelector('.command-art-list'),detail=menu.querySelector('.command-art-detail'),confirm=menu.querySelector('.command-confirm');
   const entries=learned.filter(({m})=>group(m)===commandCategory);
   const select=i=>{
    commandSelection=i;const m=moves[i];
    list.querySelectorAll('[data-move-index]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.moveIndex)===i)));
    const summary=side==='p'?(()=>{const s=labMoveSummary(m);return s.label+' '+s.value;})():buttons[i]?.querySelector('b')?.textContent||'';
    const content=buttons[i]?.closest('article')?.querySelector('details ul,details p')?.cloneNode(true);
    if(side==='p'&&content){const label=labMoveSummary(m).label;content.querySelectorAll('li').forEach(li=>{if(li.textContent.trim().startsWith(label+' '))li.remove();});}
    detail.innerHTML='<strong>'+storyEscape(summary)+'</strong><div>'+(content?.outerHTML||'<p>'+storyEscape(m.desc||moveEffect(m))+'</p>')+'</div>';
    confirm.disabled=!!buttons[i]?.disabled;confirm.textContent=confirm.disabled?'内力不足':'施展';confirm.setAttribute('aria-label','施展'+m.name);confirm.onclick=()=>cast(i);
   };
   entries.forEach(({m,i})=>{const b=document.createElement('button');b.type='button';b.className='command-art-row '+(GRADE_CLS[m.grade]||'gr1');b.dataset.moveIndex=i;b.setAttribute('aria-label',m.name+'，'+(m.mp?'内力 '+m.mp:'无消耗')+(buttons[i]?.disabled?'，内力不足':''));b.classList.toggle('unaffordable',!!buttons[i]?.disabled);b.innerHTML='<span class="command-pointer" aria-hidden="true">◆</span><strong>'+storyEscape(m.name)+'</strong><small>'+ (m.mp?'内力 '+m.mp:'无消耗')+'</small>';b.onclick=()=>select(i);b.onfocus=()=>select(i);list.append(b);});
   if(entries.length){select(entries.some(x=>x.i===commandSelection)?commandSelection:(entries.find(x=>!buttons[x.i]?.disabled)||entries[0]).i);}
   else{list.innerHTML='<p class="command-empty">尚未习得此类武学</p>';detail.textContent='普攻、防御与调息可在上一层使用。';confirm.disabled=true;}
   menu.querySelector('.command-art-count').textContent=entries.length+'式'+(entries.length>3?' · 上下滚动':'');
   list.onkeydown=e=>{const rows=[...list.querySelectorAll('button')],i=rows.indexOf(document.activeElement);if(['ArrowDown','ArrowUp'].includes(e.key)&&rows.length){e.preventDefault();rows[(i+(e.key==='ArrowDown'?1:rows.length-1))%rows.length].focus();}else if(e.key==='Enter'&&commandSelection>=0){e.preventDefault();cast(commandSelection);}};
  }
  menu.onkeydown=e=>{if(e.key==='Escape'&&commandView==='arts'){e.preventDefault();commandView='root';stageCommands(card);menu.querySelector('[data-command="arts"]').focus();}};
  const portrait=menu.querySelector('.command-portrait'),image=document.querySelector('[data-initiative="'+side+'"] canvas')||(side==='p'&&heroPortrait.complete&&heroPortrait.naturalWidth?heroPortrait:null);
  if(image){const ctx=portrait.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.drawImage(image,0,0,40,40);}
 }
 function decorate(){const card=document.getElementById('cbt-card');if(!card||!C||C.over)return;
  paintHeroPortrait();
  for(const [side,id]of [['p','p-hp-label'],['c','c-hp-label'],['e','e-hp-label']]){
   const panel=document.getElementById(id)?.closest('.cbt-side');if(!panel)continue;panel.dataset.classicSide=side;
   if(!panel.querySelector('.classic-portrait')){const portrait=document.createElement('canvas');portrait.width=48;portrait.height=48;portrait.className='classic-portrait';portrait.setAttribute('aria-hidden','true');panel.prepend(portrait);}
   const src=document.querySelector('[data-initiative="'+side+'"] canvas'),portrait=panel.querySelector('.classic-portrait');if(src){const ctx=portrait.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,48,48);ctx.drawImage(src,0,0,48,48);}
   panel.classList.toggle('classic-active',C.initiative?.active===side);
  }
  const log=card.querySelector('.lab-chronicle');if(log&&!log.dataset.classicReady){log.dataset.classicReady='true';log.dataset.expanded='false';const b=document.getElementById('lab-log-toggle');if(b){b.textContent='展开实录';b.setAttribute('aria-expanded','false');}}
  const controls=document.getElementById('cbt-bottom');if(controls)controls.setAttribute('aria-label','当前人物招式');
  stageCommands(card);
 }
 const original=updateCombat;updateCombat=function(){const r=original.apply(this,arguments);decorate();return r;};
 const originalToggle=labToggleLog;labToggleLog=function(){const panel=document.querySelector('.lab-chronicle');labLogExpanded=panel?.dataset.expanded==='true';return originalToggle.apply(this,arguments);};
 let portraitTimer=setInterval(()=>{if(!document.hidden)decorate();},600);window.addEventListener('pagehide',()=>clearInterval(portraitTimer));
 decorate();
})();
