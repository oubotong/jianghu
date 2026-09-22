(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory;else root.applyCourtChapter=factory;})(typeof globalThis!=='undefined'?globalThis:this,function(D){
'use strict';
const choice=(id,label,text,op={},extra={})=>({id,label,text,op,...extra});
function replace(id,patch){Object.assign(D.events.find(e=>e.id===id),patch);}
const event=(id,title,speaker,body,choices,next='court',chapter=2)=>({id,title,speaker,body,choices,next,chapter,day:chapter===2?6:7,scene:chapter===2?'arena':'palace'});
Object.assign(D.items,{
 teamJersey:{name:'替补席签名球衣',slot:'wear',tier:3,hp:20,bonus:{body:1},desc:'生命上限＋20，体能＋1。每次伙伴助战后，你的下一次攻击额外造成12伤害。接力效果不叠加。'},
 fanMic:{name:'全场借给你的麦克风',slot:'hand',tier:3,bonus:{social:1},desc:'社交＋1。每次凑满三层破梗，恢复最大生命的8%。把观众的声援变成续航。'},
 blackWhistle:{name:'没收的主场哨',slot:'odd',tier:3,bonus:{mind:1},desc:'心态＋1。每战可吹一次黑哨：耗1灵感取消敌方本次行动，热度＋2。对所有敌人有效。'},
 fairWhistle:{name:'观众席的公正哨',slot:'odd',tier:3,bonus:{brain:1},desc:'脑洞＋1。每战可重审一次上一击：耗1灵感，恢复上次敌方行动造成的伤害，最多为生命上限的35%。'},
 benchTag:{name:'永不空缺的替补牌',slot:'odd',tier:2,hp:16,bonus:{},desc:'生命上限＋16。每战第一次在敌方行动后降到半血或以下时，灵感＋2。下一次上场也算数。'}
});
replace('courtIntro',{title:'客队还没进场，比分已经落后',body:'城门就是球场入口。记分牌亮着「客队0，主队2」。\n你问那两分怎么来的。裁判指着自己的哨子：「历史遗留问题。」\n替补席老哥递来球，观众席有人递来话筒，后台门则刚好没有关。你决定从哪里动手？',choices:[
 choice('practice','去替补席，把球打明白','老哥把战术板擦干净，只画了两个人。\n「这次不按他们的剧本输。先说好，球传回来。」',{court:{route:'athlete'},next:'courtTraining',learn:'feint'},{quip:'你第一次见到战术板上没有给裁判留位置。'}),
 choice('audience','去看台，先把观众争取过来','你发现大家也受够了主场哨，只是没人愿意第一个喊出来。\n一位大爷把喇叭递给你：「你开头，我们接。」',{court:{route:'crowd'},next:'courtBleachers',learn:'talk'},{quip:'客场优势，从认识看台大爷开始。'}),
 choice('equipment','溜进后台，看看哨子怎么管分','后台桌上有备用哨、比分底稿，还有一张写着「客队必须感动落泪」的赛程。\n你把书包卸下来。这次先不抡它。',{court:{route:'whistle'},next:'courtBackstage',learn:'logic'},{quip:'如果问题出在裁判，那就先研究裁判的工具。'})]});
D.events.push(
 event('courtTraining','替补席老哥，今天想接到一个传球','替补席老哥','老哥的球衣洗得发白，号码却没有磨损——他几乎没上过场。\n「你要是只想一个人出风头，现在就说。我不想再空跑一次。」\n你们只有一段热身时间。',[
  choice('feet','练启动和急停，靠空当抢分','你把裁判的第一步记在鞋尖前面。对方眼睛盯人，你就让他看错第一步。',{court:{prep:'feet'},stats:{body:1}},{quip:'这一次，脚步真的会写进比分里。'}),
  choice('team','邀请老哥同行，练一趟二过一','老哥先看了眼替补席，才跑向篮下。你把球传过去，他又稳稳送回你手中。',{ally:'baller',court:{prep:'team',promise:true},flag:'courtTeamPromise'},{quip:'他的第一声「好球」，不是说给裁判听的。'}),
  choice('rest','留住体力，练最稳的两分','你没去练漂亮的花活，只把篮板上的方框记牢。老哥点了点头：「先进球，再谈上镜。」',{heal:45,court:{prep:'steady'}})
 ]),
 event('courtBleachers','观众不缺嗓门，缺一个领头的人','看台大爷','喇叭的电线被踩断了一截，前排的座椅还锁着。\n裁判的助理送来一箱饮料：「只要今天别替客队说话。」\n大爷把饮料推回去，等你做决定。',[
  choice('seats','花10硬币修喇叭、打开座椅','看台里的人终于坐到了一起。你喊出半句口号，整排观众便接上了后半句。',{money:-10,court:{prep:'seats'},stats:{social:1}},{cost:10,quip:'你买的不是掌声，是让大家能听见彼此。'}),
  choice('honest','坦白自己是高中生，求一次公平','你说自己还要回去上晚自习。看台先笑了一阵，然后有人喊：「那就别让孩子白跑！」',{court:{prep:'honest'},item:'mic'},{quip:'这次没有编人设，效果反而不错。'}),
  choice('chant','和观众排一个只在关键时刻喊的口号','你们约定，进球时不乱喊，黑哨时一起站起来。裁判的助理突然开始检查出口。',{court:{prep:'chant'},learn:'mute'},{quip:'约好的口号：在裁判抬哨时用「拒绝复读」，可阻止这次虚报分并增加1格声援。'})
 ]),
 event('courtBackstage','哨子旁边，还有一只备用哨','你','桌上的赛程写着谁领先、谁落泪，唯独没写谁有权拒绝。\n裁判的脚步声正从走廊靠近。你只来得及做一件事。',[
  choice('record','拍下改分记录，留着当众质证','照片上同时拍到了原始比分和神殿印章。你把手机调成静音，准备让观众自己看。',{clue:['match','比赛胜负与主角情绪被神殿预先编排'],court:{prep:'record'}}),
  choice('swap','把主场哨换成没有哨芯的空壳','你把真哨塞进口袋。裁判试吹了一下，疑惑地咳嗽两声，怪到了自己的嗓子上。',{court:{prep:'swap',stolen:true},heat:1},{test:{stat:'brain',target:6},fail:{text:'哨链卡住了桌腿。你没拿走真哨，但记清了他抬手时挂绳露出的位置。',op:{court:{prep:'strap'},hp:-8},quip:'潜行差一点成功，观察确实成功了。'}}),
  choice('spare','藏起备用哨，免得他临时换规则','你把备用哨藏进装着数学卷子的夹层。裁判绝对不会主动翻那里。',{court:{prep:'spare'},flag:'courtSpareHidden'},{quip:'作业第一次成为天然的防盗装置。'})
 ]),
 event('courtSportAfter','比分属于你，合照里还站着谁？','替补席老哥','终场哨响了。这次，客队真的站在了记分牌前面。\n老哥把印着你号码的球衣递过来：「这张合照，能不能把替补席也拍进去？」',[
  choice('team','把替补席都叫来，一起领这件球衣','老哥把自己的名字写在你背后。此后每一次助战，他都会给你的下一招留出接力的空当。',{item:'teamJersey',ally:'baller',court:{bond:2,reward:'team',title:'替补席的首发'},next:'courtTeamExit'},{quip:'号码是你的，签名是大家的。'}),
  choice('solo','领走个人奖金，把球衣留给球队','你把奖杯底座的零钱倒进书包，把球衣留给了老哥。你们仍能道别，只是没有约定下一场。',{money:55,heat:2,court:{reward:'solo',title:'客场得分王'},next:'courtSoloExit'},{quip:'奖金比奖杯轻，装进书包也方便。'})
 ],null),
 event('courtCrowdAfter','第一次，观众比裁判更响','看台大爷','裁判还想说两句，记分员却已经转向了观众席。\n大爷把喇叭线卷好：「这个麦克风，借你带到下一座城。有人不讲理，你就让大家听见。」',[
  choice('voice','接过麦克风，替他们把话带出去','你答应不把这份支持只留给自己的比赛。麦克风上的胶带写着：声音借给你，别替我们沉默。',{item:'fanMic',court:{reward:'voice',title:'看台自己选的队长'},next:'courtCrowdExit'}),
  choice('donate','留下28硬币修看台，带着大家的信任走','座椅上的锁被一把把拆下来。你没有带走麦克风，却带走一封盖满指印的介绍信。',{money:-28,stats:{social:2},court:{reward:'letter',title:'全场的自己人'},next:'courtCrowdExit'},{cost:28,quip:'有些通行证，看起来像一张被按脏的纸。'})
 ],null),
 event('courtWhistleAfter','哨子现在在你手里','裁判','裁判按赛前赌约，把主场哨放在你面前。这次，他没替你宣布下一步该做什么。\n观众也在等。拿走它，你就拥有一次不讲理的权力；交出去，下一场才不必再找一个好人当裁判。',[
  choice('return','把哨子交给观众，换一只公正哨','大爷收下主场哨，给了你一只刻着「允许重审」的小哨。以后遇到伤害，你有一次重新核算的机会。',{item:'fairWhistle',court:{reward:'fair',title:'把规则还回去的人',bond:1},next:'courtFairExit'}),
  choice('keep','留着主场哨，以后也能强行叫停','裁判说：「你迟早懂我。」你没有回答。书包里多了一件强力工具，看台的掌声却停了半拍。',{item:'blackWhistle',heat:2,court:{reward:'black',title:'新任客场裁判',bond:-1},next:'courtBlackExit'},{quip:'这东西能救急。问题是，你打算把多少次都算作急事。'})
 ],null),
 event('courtBenchAfter','输了球，却没有被赶出替补席','替补席老哥','终场比分没站在你这边。场务递来扫把，老哥却先递给你一瓶水。\n「他们想让你在镜头前哭。你没哭，这场就还有点别的结果。」\n他问你愿不愿意帮忙把球队的旧器材送出城。',[
  choice('help','留下帮忙，和老哥一起送器材','你收起扫把，扛起球框。老哥把替补牌塞进你口袋：跌到半血时，它会提醒你还没下场。',{item:'benchTag',ally:'baller',court:{reward:'bench',title:'还会再上场的人',bond:1},next:'courtBenchExit'}),
  choice('leave','认下这次失利，记住下一次该怎么打','你把错误写在课本最后一页，学会了用假动作抢回主动。没有奖杯，也没有人能替你写好下一场。',{learn:'feint',stats:{mind:1},court:{reward:'lesson',title:'带着错题离场'},next:'courtSoloExit'})
 ],null),
 event('courtTeamExit','下一座城，有人替你接球','球队运输员','球队的器材车把你带到光之都市。运输员认识疏散站的人，提前替你领出一件工作背心。\n老哥坐在车尾，问：「下次球还传回来吧？」',[
  choice('promise','答应他，把背心穿上去帮忙','你们约好下一次配合。疏散站为你留了一条工作人员通道。',{item:'vest',flag:'courtCityPass',court:{bond:1},heal:30})
 ],'giantIntro',3),
 event('courtCrowdExit','你的喊声比你先到下一座城','疏散站志愿者','有人把你在球场争取公平的片段传了过来。志愿者没有让你排长队，而是把撤离地图摊到你面前。\n「看台说你愿意替别人开口。现在这里也缺一个。」',[
  choice('help','接受这份信任，加入疏散队','你领到工作背心，也获得了一次以志愿者身份调停的机会。',{item:'vest',flag:'courtCityPass',money:18,heal:25})
 ],'giantIntro',3),
 event('courtFairExit','通行理由：曾把权力交还给别人','城市工作人员','介绍信没有夸你赢得漂亮，只写了你最后把哨子交给了谁。\n工作人员读完，给你开了一张现场调停许可。',[
  choice('permit','收好许可，去看看两边到底怎么回事','你可以先看完整现场，再决定站在哪一边。许可的背面写着：双方都该有机会解释。',{flag:'truce',court:{city:'mediator'},heal:30})
 ],'giantIntro',3),
 event('courtBlackExit','你刚到城门，黑哨的消息也到了','城门守卫','守卫认出了挂在书包上的哨子。\n「球场上是谁的主场我不管，这里不能拿它当证件。」\n人群在撤离。你可以付登记押金，也可以绕过正在检查的正门。',[
  choice('deposit','付18硬币登记，走正门','押金被夹进事故登记册。你保住体力，却失去了用名声换便利的机会。',{money:-18,court:{city:'registered'}},{cost:18}),
  choice('detour','背着书包绕过废墟，自己找入口','碎石划破了袖口。你终于看见广场，但这条路没有人为你提前清场。',{hp:-22,court:{city:'detour'}},{quip:'拥有叫停别人的权力，不代表所有人都得给你让路。'})
 ],'giantIntro',3),
 event('courtBenchExit','替补席的器材车，也能开出城','替补席老哥','你们把旧篮架送到光之都市的临时安置点。孩子们围上来，没人问上一场是谁赢了。\n老哥说：「先把架子装起来，再说下一场。」',[
  choice('build','帮忙架好篮筐，顺便休整','安置点给你们留了饭和药。你没拿到冠军通道，却找到了愿意互相照应的人。',{heal:55,money:12,court:{bond:1,city:'shelter'}})
 ],'giantIntro',3),
 event('courtSoloExit','一个人背着书包走出球场','你','城门后的路没有加冕仪式。你把球场里的事重新想了一遍，记下下一次该带的东西。\n远处，光之都市的警报已经响起。',[
  choice('go','整理书包，按自己的路继续','你把鞋带重新系紧。下一座城不会因为上一场的比分替你做决定。',{heal:25})
 ],'giantIntro',3)
);
// Existing event IDs remain valid for saves already in the chapter.
replace('court',{title:'这一次，比分真的会变',body:'记分牌亮了，主队先拿走两分。\n十回合内先到八分，才能赢下通行资格。你可以突破抢空当、争取观众公证，也可以夺走或质疑那只哨子。\n打空裁判体力只会制造一次抢分机会。你仍然得把球投进去。',choices:[choice('play','上场，把这一场打成自己的','你把书包系紧。计分牌、看台和那只哨子，都成了这场交锋的一部分。',{battle:'baller'})]});
// The introduction letter is useful even if the vest is not worn.
D.events.find(e=>e.id==='giantEvidence').choices.push(choice('courtPermit','出示球场带来的介绍信，请求暂停转播','球场的人替你作证，工作人员给双方送去了调停许可。',{flag:'truce',heat:-1},{requires:'courtCityPass'}));
return D;
});
