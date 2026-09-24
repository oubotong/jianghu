(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./run-data.js'):root.MemeRunData);if(typeof module==='object'&&module.exports)module.exports=api;else root.MemeRun=api;})(globalThis,function(D){
'use strict';
const MAX_HP=80,ENERGY=3,DRAW=5;
function random(s){let x=s.rng+=0x6D2B79F5;x=Math.imul(x^x>>>15,x|1);x^=x+Math.imul(x^x>>>7,x|61);s.rng>>>=0;return ((x^x>>>14)>>>0)/4294967296;}
function shuffle(s,a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(random(s)*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function addCard(s,id){const card={uid:++s.serial,id,upgraded:false};s.deck.push(card);return card;}
function fresh(name='林小满',seed=Date.now()){const s={version:2,name:String(name).trim().slice(0,12)||'林小满',rng:seed>>>0,seed:seed>>>0,hp:MAX_HP,money:28,serial:0,deck:[],relics:['uniform'],clues:[],flags:{},route:[],index:0,phase:'event',battle:null,result:null,journal:[],completedEvents:0,wins:0,retries:1,ending:null};for(let i=0;i<4;i++){addCard(s,'strike');addCard(s,'guard');}addCard(s,'insight');addCard(s,'logic');for(let chapter=0;chapter<6;chapter++){s.route.push({chapter,id:D.pools[chapter][0].id});for(const e of shuffle(s,D.pools[chapter].slice(1)).slice(0,4))s.route.push({chapter,id:e.id});s.route.push({chapter,id:'boss-'+chapter,boss:true});}return s;}
function node(s){return s.route[s.index]||{chapter:5,id:'goddess',boss:true};}
function event(s){const n=node(s);if(n.boss)return{id:n.id,title:['作业没写完，先打卷王','全体起立，副歌要来了','小黑子吹哨，主场算谁的','禁止随地大小变','你怎么敢准时下班','梗大魔王，等你很久了'][n.chapter],body:['卷王史莱姆用标准答案堵住出口。你把课本抽出来，这回不比成绩，比怎么出牌。','哈基米领唱吸了一口气。再不打断，这句歌会跟你回到晚自习。','裁判先给自己披上护盾。没关系，你牌组里的规则也不是写着好看的。','巨人与怪兽互相指着对方。你已经看清蓄力动作，这次由你选和谁过招。','主管说你手里每留一张牌，就多安排一项工作。你决定给他上一堂能量管理课。','王座上缝着你一路遇过的梗。魔王开口：「你是不是以为，笑一笑就能通关？」'][n.chapter],boss:true};return D.pools[n.chapter].find(e=>e.id===n.id);}
const has=(s,id)=>s.relics.includes(id);
function card(s,uid){const c=s.deck.find(c=>c.uid===uid);if(!c)return null;const v={...D.cards[c.id],...c};if(c.upgraded){if(v.damage)v.damage+=3;if(v.block)v.block+=3;if(v.heal)v.heal+=4;if(v.poison)v.poison++;if(v.energy)v.energy++;if(v.draw&&!v.damage&&!v.block)v.draw++;}return v;}
function handCard(s,uid){const v=card(s,uid);if(!v||s.phase!=='battle')return v;const b=s.battle,notes=[];
 if(v.damage){if(!b.attackUsed&&has(s,'stamp')){v.damage+=2;notes.push('梗物伤害＋2');}if(v.fromBlock){const bonus=Math.floor(b.block/2);v.damage+=bonus;v.blockBonus=bonus;}}
 if(v.block&&!b.guardUsed&&has(s,'fan')){v.block+=3;notes.push('梗物护盾＋3');}
 if(v.poison&&!b.poisonUsed&&has(s,'cat')){v.poison++;notes.push('梗物洗脑＋1');}
 if(v.damage&&!b.attackUsed&&has(s,'whistle'))v.pierce=true;
 v.bonusNote=notes.join('，');return v;
}
function cardEffects(v){
 const a=[],add=(kind,before,value,after,hint='')=>a.push({kind,before,value,after,hint});
 if(v.dispel)add('dispel','清除敌人全部护盾','','');
 if(v.damage)add('damage',v.hits?'每次造成':'造成',v.damage,'点伤害',[v.hits?'连续攻击'+v.hits+'次':'',v.pierce?'无视敌人护盾':'',v.fromBlock?(v.blockBonus!==undefined?'已计入护盾转伤'+v.blockBonus+'点':'额外附加自身护盾一半的伤害（向下取整）'):''].filter(Boolean).join('，'));
 if(v.block)add('block','获得',v.block,'点护盾','抵挡等量伤害，下回合开始清空');
 if(v.heal)add('heal','恢复',v.heal,'点生命','最多恢复至80点生命');
 if(v.hurt)add('hurt','自身失去',v.hurt,'点生命','护盾无法抵挡');
 if(v.poison)add('poison','给敌人叠加',v.poison,'层洗脑','行动前按层数扣血，随后减1层');
 if(v.weak)add('weak','给敌人叠加',v.weak,'回合虚弱','期间攻击伤害降低25%');
 if(v.energy)add('energy','本回合获得',v.energy,'点能量');
 if(v.draw)add('draw','抽',v.draw,'张牌');
 return a;
}
function cardText(v){return cardEffects(v).map(e=>e.before+e.value+e.after+(e.hint?'（'+e.hint+'）':'')).concat(v.exhaust?['打出后移出本场战斗，下场恢复']:[]).join('；');}
// Preview exactly the pending enemy action without consuming RNG or changing a save.
function incoming(s){if(s.phase!=='battle')return null;const b=s.battle,i=intent(s),interrupted=b.poison>=b.hp,blocked=interrupted?0:Math.min(b.block,i.damage),reduced=!interrupted&&i.damage>blocked&&has(s,'headset')?1:0;return{...i,interrupted,blocked,reduced,loss:interrupted?0:Math.min(s.hp,Math.max(0,i.damage-blocked-reduced))};}
function available(s,op){if(op.coins<0&&s.money<-op.coins)return'硬币不足';if(op.hurt&&s.hp<=op.hurt)return'生命不足以支付';if(op.remove&&!s.deck.some(c=>c.id===op.remove))return'牌组中没有这张牌';if(op.upgrade&&!s.deck.some(c=>!c.upgraded&&!D.cards[c.id].curse))return'没有可强化的牌';return'';}
function effects(s,op){const rewards=[];if(op.coins){s.money+=op.coins;rewards.push(`硬币 ${op.coins>0?'+':''}${op.coins}`);}const hp=s.hp;if(op.heal)s.hp=Math.min(MAX_HP,s.hp+op.heal);if(op.fullHeal)s.hp=MAX_HP;if(op.hurt)s.hp-=op.hurt;if(s.hp!==hp)rewards.push(`生命 ${s.hp>hp?'+':''}${s.hp-hp}`);if(op.card){addCard(s,op.card);rewards.push('加入牌组 · '+D.cards[op.card].name);}if(op.remove){const at=s.deck.findIndex(c=>c.id===op.remove);s.deck.splice(at,1);rewards.push('移除 · '+D.cards[op.remove].name);}if(op.relic){if(has(s,op.relic)){s.money+=12;rewards.push('重复梗物换成12硬币');}else{s.relics.push(op.relic);rewards.push('获得 · '+D.relics[op.relic].name);}}if(op.clue&&!s.clues.includes(op.clue)){s.clues.push(op.clue);rewards.push('证据 · '+op.clue);}if(op.flag)s.flags[op.flag]=true;return rewards;}
function choose(s,index){if(s.phase!=='event')return false;const e=event(s);if(e.boss){if(index!==0&&!(node(s).chapter===3&&index===1))return false;startBattle(s,node(s).chapter===3?(index===1?'kaiju':'ultraman'):['slime','hakimi','baller','ultraman','clerk','demon'][node(s).chapter]);return true;}const c=e.choices[index];if(!c||available(s,c.op))return false;const rewards=effects(s,c.op);s.result={title:e.title,text:c.text,rewards};s.completedEvents++;s.journal.push({title:e.title,choice:c.label,text:c.text});s.phase=c.op.upgrade?'upgrade':'result';return true;}
function upgrade(s,uid){if(s.phase!=='upgrade')return false;const c=s.deck.find(c=>c.uid===uid);if(!c||c.upgraded||D.cards[c.id].curse)return false;c.upgraded=true;s.result.rewards.push('强化 · '+D.cards[c.id].name+'＋');s.phase='result';return true;}
function advance(s){if(s.phase!=='result')return false;s.index++;s.result=null;s.phase=s.index>=s.route.length?'finale':'event';return true;}
function draw(s,n){const b=s.battle;for(let i=0;i<n&&b.hand.length<10;i++){if(!b.draw.length){b.draw=shuffle(s,b.discard);b.discard=[];}if(!b.draw.length)break;b.hand.push(b.draw.pop());}}
function startBattle(s,id){const e=D.enemies[id];s.battle={id,hp:e.hp-(id==='goddess'?Math.min(6,s.clues.length)*8:0),maxHp:e.hp-(id==='goddess'?Math.min(6,s.clues.length)*8:0),round:1,energy:ENERGY+(has(s,'bell')?1:0),block:has(s,'uniform')?3:0,enemyBlock:0,weak:0,poison:0,hand:[],draw:shuffle(s,s.deck.map(c=>c.uid)),discard:[],exhaust:[],played:[],attackUsed:false,guardUsed:false,poisonUsed:false,usedSlime:false,log:['每回合3能量，可以连续出牌；结束回合后对方行动。']};s.phase='battle';s.result=null;draw(s,DRAW+(has(s,'badge')?1:0));}
function intent(s){const b=s.battle,e=D.enemies[b.id],p=e.pattern[(b.round-1)%e.pattern.length];let amount=p[1];if(amount){if(b.id==='clerk')amount+=Math.min(4,b.hand.length);if(b.id==='demon')amount+=Math.min(5,b.round-1);if(b.weak>0)amount=Math.floor(amount*.75);if(b.round===1&&has(s,'remote'))amount=Math.max(0,amount-6);}return{name:p[0],damage:amount,block:p[2]||0};}
function reason(s,uid){if(s.phase!=='battle')return'不在战斗中';const v=card(s,uid);if(!v||!s.battle.hand.includes(uid))return'这张牌不在手中';if(s.battle.energy<v.cost)return'能量不足';return'';}
function log(s,text){s.battle.log.unshift(text);s.battle.log=s.battle.log.slice(0,60);}
function hit(s,n,pierce){const b=s.battle,blocked=pierce?0:Math.min(b.enemyBlock,n);b.enemyBlock-=blocked;const dealt=Math.min(b.hp,n-blocked);b.hp-=dealt;return dealt;}
function finish(s){const b=s.battle;if(s.hp<=0){s.hp=0;s.phase='defeat';return true;}if(b.hp>0)return false;s.wins++;const heal=Math.min(MAX_HP-s.hp,10+(has(s,'receipt')?4:0));s.hp+=heal;s.money+=18;s.journal.push({title:D.enemies[b.id].name,choice:'战胜对手',text:'靠手里的牌打赢了这一场。'});if(b.id==='goddess'){s.phase='ending';s.ending='truth';return true;}const options=shuffle(s,Object.keys(D.cards).filter(id=>!['strike','guard','guilt'].includes(id))).slice(0,3);s.result={title:'这一场，是你赢了',text:'新的一招会改变接下来的牌组。也可以跳过，让好牌更容易抽到。',rewards:['硬币 +18',...(heal?['生命 +'+heal]:[])],options};s.phase='reward';return true;}
function play(s,uid){if(reason(s,uid))return null;const b=s.battle,v=card(s,uid),notes=[],motion={side:'hero',id:v.id,name:v.name+(v.upgraded?'＋':''),kind:v.kind,damage:0,heal:0};b.energy-=v.cost;b.hand.splice(b.hand.indexOf(uid),1);(v.exhaust?b.exhaust:b.discard).push(uid);
 if(b.id==='slime'&&b.played.includes(v.id)){b.enemyBlock+=3;log(s,'卷王背出了这张牌的标准答案，获得3护盾。');}
 if(v.kind==='attack'&&!b.attackUsed&&b.id==='baller'){b.enemyBlock+=4;log(s,'裁判吹了一次主场哨，获得4护盾。');}
 if(v.dispel){notes.push('清除了敌人'+b.enemyBlock+'点护盾');b.enemyBlock=0;}
 if(v.damage){const extra=(!b.attackUsed&&has(s,'stamp')?2:0)+(v.fromBlock?Math.floor(b.block/2):0);for(let i=0;i<(v.hits||1);i++)motion.damage+=hit(s,v.damage+extra,v.pierce||(!b.attackUsed&&has(s,'whistle')));}
 if(v.block){const amount=v.block+(!b.guardUsed&&has(s,'fan')?3:0);b.block+=amount;notes.push('获得'+amount+'点护盾');b.guardUsed=true;}
 if(v.heal){motion.heal=Math.min(MAX_HP-s.hp,v.heal);s.hp+=motion.heal;notes.push(motion.heal?'恢复'+motion.heal+'点生命':'生命已满');}
 if(v.hurt){const lost=Math.min(s.hp,v.hurt);s.hp=Math.max(0,s.hp-v.hurt);notes.push('自身失去'+lost+'点生命');}
 if(v.poison){const before=b.poison;b.poison=Math.min(30,b.poison+v.poison+(!b.poisonUsed&&has(s,'cat')?1:0));b.poisonUsed=true;notes.push('敌人洗脑增加'+(b.poison-before)+'层');}
 if(v.weak){b.weak=Math.min(4,b.weak+v.weak);notes.push('敌人虚弱持续'+b.weak+'回合');}
 if(v.energy){b.energy+=v.energy;notes.push('获得'+v.energy+'点能量');}
 const beforeDraw=b.hand.length;if(v.draw)draw(s,v.draw);
 if(has(s,'slime')&&!b.usedSlime){b.usedSlime=true;draw(s,1);}
 if(b.hand.length>beforeDraw)notes.push('抽了'+(b.hand.length-beforeDraw)+'张牌');else if(v.draw)notes.push(b.hand.length>=10?'手牌已满，未抽牌':'没有可抽的牌');
 b.played.push(v.id);if(v.kind==='attack')b.attackUsed=true;
 if(b.played.length===3&&has(s,'ball')){motion.damage+=hit(s,5,true);log(s,'第三张牌接上签名篮球：额外5伤害。');}
 if(motion.damage)notes.unshift('敌人失去'+motion.damage+'点生命');else if(v.damage)notes.unshift('攻击被护盾全部挡下');
 log(s,motion.name+'：'+notes.join('，')+'。');finish(s);return motion;
}
function endTurn(s){if(s.phase!=='battle')return null;const b=s.battle,e=D.enemies[b.id],i=intent(s),motion={side:'enemy',id:b.id,name:i.name,kind:i.damage?'attack':'guard',damage:0,heal:0};if(b.poison){const hit=Math.min(b.hp,b.poison);b.hp-=hit;log(s,'洗脑副歌造成'+hit+'伤害。');b.poison--;if(finish(s)){motion.kind='skip';motion.name='副歌抢先收工';return motion;}}
 b.enemyBlock=i.block;const shield=Math.min(b.block,i.damage);b.block-=shield;motion.damage=Math.max(0,i.damage-shield-(i.damage>shield&&has(s,'headset')?1:0));const lost=Math.min(s.hp,motion.damage);s.hp=Math.max(0,s.hp-motion.damage);const notes=[i.damage?(lost?'你失去'+lost+'点生命':'你没有损失生命'):'本次未攻击'];if(shield)notes.push('护盾抵挡'+shield+'点伤害');if(i.damage>shield&&has(s,'headset'))notes.push('耳机减免1点伤害');if(i.block)notes.push('敌人护盾变为'+i.block+'点');if(b.id==='hakimi'&&i.damage){const healed=Math.min(b.maxHp-b.hp,3);b.hp+=healed;if(healed)notes.push('敌人恢复'+healed+'点生命');}log(s,i.name+'：'+notes.join('，')+'。');if(finish(s))return motion;
 b.discard.push(...b.hand);b.hand=[];b.round++;b.energy=ENERGY;b.block=0;b.attackUsed=false;b.guardUsed=false;b.poisonUsed=false;b.played=[];b.weak=Math.max(0,b.weak-1);draw(s,DRAW+(has(s,'badge')?1:0));return motion;
}
function reward(s,id){if(s.phase!=='reward'||(id!=='skip'&&!s.result.options.includes(id)))return false;if(id!=='skip')addCard(s,id);s.phase='result';s.result={title:id==='skip'?'保持精简':'新招入手',text:id==='skip'?'你把奖励留给了下一位路过的人。':'「'+D.cards[id].name+'」已加入牌组。',rewards:[]};return advance(s);}
function finale(s,id){if(s.phase!=='finale')return false;if(id==='truth'){if(s.clues.length<3)return false;startBattle(s,'goddess');return true;}if(id!=='home')return false;s.phase='ending';s.ending='home';return true;}
function retry(s){if(s.phase!=='defeat'||s.retries<=0)return false;const id=s.battle.id;s.retries--;s.hp=MAX_HP;s.money=0;startBattle(s,id);return true;}
function quit(s){if(s.phase!=='defeat')return false;s.phase='ending';s.ending=s.battle.id==='goddess'?'home':'lost';return true;}
function valid(s){if(!s||s.version!==2||typeof s.name!=='string'||!Array.isArray(s.deck)||!s.deck.length||!s.deck.every(c=>D.cards[c.id]&&Number.isInteger(c.uid))||new Set(s.deck.map(c=>c.uid)).size!==s.deck.length||!Array.isArray(s.relics)||!s.relics.every(id=>D.relics[id])||!Array.isArray(s.route)||s.route.length!==36||!Array.isArray(s.clues)||!Array.isArray(s.journal)||!Number.isFinite(s.hp)||s.hp<0||s.hp>80||!Number.isFinite(s.money)||s.money<0||!Number.isInteger(s.index)||s.index<0||s.index>36||!['event','result','upgrade','battle','reward','finale','ending','defeat'].includes(s.phase))return false;if(s.route.some(n=>!Number.isInteger(n.chapter)||n.chapter<0||n.chapter>5||(!n.boss&&!D.pools[n.chapter].some(e=>e.id===n.id))))return false;if(['battle','reward','defeat'].includes(s.phase)){const b=s.battle;if(!b||!D.enemies[b.id]||!Number.isFinite(b.energy)||![b.hand,b.draw,b.discard,b.exhaust].every(a=>Array.isArray(a)&&a.every(uid=>s.deck.some(c=>c.uid===uid))))return false;}return true;}
return {MAX_HP,ENERGY,DRAW,fresh,node,event,card,handCard,cardEffects,cardText,incoming,available,choose,upgrade,advance,startBattle,intent,reason,play,endTurn,reward,finale,retry,quit,valid};
});
