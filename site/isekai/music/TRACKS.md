# 异世界音乐对应表

用户按顺序提供的 AI 音乐。原始编号文件保留在本地；线上只发布处理后的版本。

| 原文件 | 场景 | 运行文件 |
|---|---|---|
| 1.mp3 | 请假条上的异世界 | runtime/event-v1.mp3 |
| 2.mp3 | 书包也是钝器 | runtime/battle-normal-v1.mp3 |
| 3.mp3 | 这段副歌有问题 | runtime/battle-hakimi-v1.mp3 |
| 4.mp3 | 主场哨不算数 | runtime/battle-court-v1.mp3 |
| 5.mp3 | 维修费谁来出 | runtime/battle-giant-v1.mp3 |
| 6.mp3 | 你怎么敢准时下班 | runtime/battle-guild-v1.mp3 |
| 7.mp3 | 大的真的要来了 | runtime/battle-demon-v1.mp3 |
| 8.mp3 | 最终解释权归谁 | runtime/battle-goddess-v1.mp3 |

处理：44100 Hz 双声道，去除首尾低电平静音，120ms 首尾交叠并旋转接点，响度目标 −18 LUFS、真峰值至少保留2dB余量，MP3 160kbps。保留整体音乐内容与速度，不根据提示词强行改变调性或节拍。循环的乐句自然程度还需实际试听反馈。
