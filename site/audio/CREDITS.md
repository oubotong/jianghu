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

## 现成音效：均选用 CC0 1.0 授权

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
   页面提供多种授权，本项目选择 CC0。使用 swish_2、3、4 与 Bow，用于拳脚、爪击、暗器、闪避和运气；运气声音使用较轻音量、较低音高的原有挥风音效。

授权说明：https://creativecommons.org/publicdomain/zero/1.0/

下载核实日期：2026-09-09。原始素材包保存在 `sources/`。网页使用的 `sfx/` 衍生 WAV 经单声道转换、起止静音裁剪、响度调整和极短淡入淡出。完整文件映射见 `audio-manifest.json`。感谢以上作者分享素材。

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
