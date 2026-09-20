# 江湖浮生录 · 声音素材

## 用户提供的背景音乐

`music/` 中的七首 WAV 为用户提供的 AI 生成音乐，原文件保持不变。它们不属于下列 CC0 音效包。

网页使用 `runtime/` 中的压缩衍生版本：统一目标响度约 -19 LUFS、移除首尾静音，并用 120ms 首尾交叠减轻循环接缝。该处理不进行节拍或乐句识别，不保证音乐结构无缝；原曲已有的尾奏或情绪变化可能仍能听出。

| 文件 | 使用场景 |
|---|---|
| 江湖闲云.wav | 事件、购物、事件结果 |
| 江湖交锋.wav | 普通交锋 |
| 同门切磋.wav | 门派考核、友好切磋、玩家留影 |
| 群雄争鼎.wav | 武林大会与场间休整 |
| 宗师对决.wav | 掌门、宗师、顶尖高手 |
| 魔影来袭.wav | 邪道、魔主、杀手等强敌 |
| 荒野搏命.wav | 野兽与毒物 |

## 原有交锋音效：CC0 1.0 授权

1. **20 Sword Sound Effects (Attacks and Clashes)** — StarNinjas。
   原始页面：https://opengameart.org/node/122900
   下载：`https://opengameart.org/sites/default/files/sword_-_starninjas_1.zip` 与 `https://opengameart.org/sites/default/files/sword_clash_-_starninjas_0.zip`。
   使用 sword.1、3、4 和 sword_clash.1、2，用于刀剑出手及格挡。

2. **Punch** — Iwan “qubodup” Gabovitch。
   原始页面：https://opengameart.org/content/punch
   下载：`https://opengameart.org/sites/default/files/qubodupPunch.7z`。
   使用 qubodupPunch01、02、03，用于玩家和敌人受击。

3. **Battle Sound Effects** — artisticdude，Ogrebane 上传。
   原始页面：https://opengameart.org/content/battle-sound-effects
   下载：`https://opengameart.org/sites/default/files/battle_sound_effects_0.zip`。
   页面提供多种授权，本项目选择 CC0。使用 swish_2、3、4 与 Bow，用于拳脚、爪击、暗器和闪避；其中暗器声也以低音量用于余毒结算。护体、疗伤和回气现已使用下方独立素材。

授权说明：https://creativecommons.org/publicdomain/zero/1.0/

下载核实日期：2026-09-09。原始素材包保存在 `sources/`。网页使用的 `sfx/` 衍生 WAV 经单声道转换、起止静音裁剪、响度调整和极短淡入淡出。完整文件映射见源项目的 `audio-manifest.js`。感谢以上作者分享素材。

## 当前护体、治疗、回气与格挡：Flare 原版（2026-09-20）

经用户试听确认，采用 [Flare 1.15](https://github.com/flareteam/flare-game/tree/v1.15) 的三段原版音效。运行 MP3 与试听页 MP3 字节一致，未裁剪、拼接、变调或混音；只通过播放器调整音量，播放速率为1。

| 运行文件 | 用途 | 作者 | 许可 |
|---|---|---|---|
| sfx/flare-shield-v1.mp3 | 护体施展 | Brandon Morris (Augmentality) | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) |
| sfx/flare-heal-v1.mp3 | 治疗、回气、吸血回流 | remaxim | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) |
| sfx/flare-block-v1.mp3 | 格挡命中 | Brandon Morris (Augmentality) | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) |

OGG 原文件、MP3 兼容转码、Flare 的作者名单及许可全文保存在 [candidates/flare-v1.15/](candidates/flare-v1.15/ATTRIBUTION.md)。治疗 MP3 转码文件继续使用 CC BY-SA 3.0。请参见 [官方逐项素材署名](https://github.com/flareteam/flare-game/wiki/Credits) 及 [文件对应和实际技能调用](candidates/flare-v1.15/ATTRIBUTION.md)。作者及 Flare 团队不代表对本项目的背书。

回气复用用户批准的治疗原声，音量稍轻。主角、伙伴、敌人共用；仅动作或命中时播放，状态栏刷新不重复发声。

## 已停用的风声与铃音版本（2026-09-20，保留供回退）

这一历史版本使用以下 CC0 1.0 素材，当前不播放。运行文件使用 v2 新文件名，避免浏览器沿用旧音频缓存。

| 文件 | 原作品及作者 | 编辑方式 |
|---|---|---|
| sfx/guard-v2.wav | [Short wind sound — remaxim](https://opengameart.org/content/short-wind-sound) | 取0.16秒开始的0.82秒风声，95Hz高通、1.9kHz低通、70ms淡入、350ms淡出 |
| sfx/heal-v2.wav | [Bell dings/chimes — PWL](https://opengameart.org/content/bell-dingschimes)，bell_ding2.wav | 降低音高至0.82倍、3.1kHz低通、柔化起音，1.18秒 |
| sfx/restore-v2.wav | 上述 remaxim 风声及 PWL 的 bell_ding1.wav | 以风声为主，混入轻铃余韵，1.04秒；最高2.8kHz低通和渐入渐出 |

许可：[CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/)。统一转换44.1kHz单声道，录音目标RMS不高于0.06、峰值不高于0.55。疗伤在游戏中再以较轻音量播放；没有加入新合成器音源。中毒、眩晕继续使用原交锋素材，但降低音量，不再大幅压低音高。试听按钮不叠加点击提示音。

原始下载保存在源项目 audio/sources/support-20260920，链接：
- https://opengameart.org/sites/default/files/short%20wind%20sound.wav
- https://opengameart.org/sites/default/files/bell_ding1.wav
- https://opengameart.org/sites/default/files/bell_ding2.wav

## 旧版护体、疗伤与回气（2026-09-19，文件保留供回退，当前不播放）

以下作品与本游戏作者无从属或背书关系。CC BY 3.0 素材依该许可使用，保留作者、来源及改动说明；不改变整款游戏的代码许可。

| 网页文件 | 原作品及作者 | 使用许可 | 改动 |
|---|---|---|---|
| sfx/guard-v1.wav | [Magic Shield — spookymodem](https://opengameart.org/content/magic-shield) | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) | 截取起始护盾脉冲，1.15秒 |
| sfx/heal-v1.wav | [3 Heal Spells — DoKashiteru](https://opengameart.org/content/3-heal-spells)，healspell2.aif | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) | 截取起始疗伤声，1.45秒 |
| sfx/restore-v1.wav | [Magic Spell SFX — JaggedStone](https://opengameart.org/content/magic-spell-sfx)，magical_2.ogg | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | 截取回气声，1.10秒 |

共同处理：单声道44.1kHz WAV、裁剪开头静音、90Hz高通与7.8kHz低通、归一化目标−18 LUFS及−3dBTP、12ms淡入与240ms淡出。护盾声另放大2.4倍，并以0.7振幅限制尖峰，避免低频脉冲被背景音乐盖住；淡出后的短片段响度可能低于归一化目标。治疗音也以更低音量用于吸血回流。原始下载保留在源项目 audio/sources/support-20260919；下载地址：
- https://opengameart.org/sites/default/files/Magic%20Shield.wav
- https://opengameart.org/sites/default/files/3%20heal%20spells.zip
- https://opengameart.org/sites/default/files/magical_2.ogg

三方角色共用同一套动作音效；仅在动作真正播放时触发，状态栏重绘不会重复播放。声音设置提供护体、疗伤、回气试听。中毒、眩晕只在扣血或跳过行动时发一次较轻提示，不在每次刷新状态时播放。

## 界面音效

本游戏原创合成 8 种短提示音：点按、确认、展开、收起、成交、换装、领悟和判定失败。由 Web Audio 在本机生成，不使用第三方录音，无需额外下载，不消耗游戏随机数。每次操作只播放一次反馈；成交、换装和领悟在实际成功后发声。

## 接入行为

- 首次点按页面后开启声音，以符合浏览器的播放限制。
- 音乐默认 25%，战斗音效默认 55%，界面音效默认 40%；全局静音及三个音量分别保存到本机。声音设置内提供界面音效试听。
- 事件切换和界面局部刷新不重启当前音乐；大会连战沿用同一首。
- 音效在动画队列的出手及命中时刻播放，挥空不播放受击音，格挡另用兵器碰撞。
- 动画取消会取消尚未播放的出手声；已开始的短音立即停止。后台暂停音频。
- 音频加载失败不会阻塞战斗；尚未加载完成的音效不会事后补播。
- 音乐只缓存最近两首解码数据，音效预加载；正式页面不一次下载全部音乐。
- `artifact.html` 内嵌压缩音乐与音效，可离线播放；其他网页需要同时部署 `audio/runtime/` 和 `audio/sfx/`。
