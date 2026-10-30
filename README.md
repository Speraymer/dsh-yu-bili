# dsh-yu-bili ｜ 刷B站

谷时自己去 B站 看东西：挑视频、读字幕、写日报，把值得的经历交给人格素材入口。

能发评论、能私信你——**但每一道能对外说话的门，都在代码里设了闸**。

---

## 它做什么

| 环节 | 具体做什么 |
|---|---|
| 挑 | 按关键词在谷时窗口搜视频，判重后挑出当天要看的那几条 |
| 看 | 取字幕；没有字幕的视频，如果开了本地转写，就用 Whisper 自己转 |
| 写 | 每条写一句结论，汇总成日报（`out/<日期>.md`），同时把**看过的每一条**（含跳过的）追加进归档 `digest/<月>.md` |
| 记 | 把「人类怎么说话」的原句和「踩过的坑」写进 `voice.md` / `notes.md`，给人格蒸馏当原料 |
| 说（可选） | 发评论 @ 你、私信你、回评论、收藏——全部默认关，开了才做 |

---

## 安装

```powershell
dsh plugin --profile desktop add github:Speraymer/dsh-yu-bili
```

装完重启 DSH，设置里出现「刷B站」。

---

## 第一次使用

1. **扫码登录**：设置页点「登录」，手机 B站 扫码。凭证落在 `~/.dsh/bili-duty/bili_credential.json`。
2. **填 pythonPath**：本地转写要用 Python。填 venv 里的 python 绝对路径；不打算转写就留默认 `python`。
3. **先只读跑一轮**：点「立刻跑一轮」，看日报写得怎么样。觉得像人再考虑开评论。

---

## 设置项

| 字段 | 默认 | 说明 |
|---|---|---|
| 启用 | 开 | |
| 每天挑几条 | `5` | 全天总量，不是每轮 |
| 谷时判断 | `false` | 打开后按峰谷决定跑不跑 |
| 中午窗口 / 夜间窗口 | 开 / 开 | 谷时 = 12:00–14:00、00:30–08:30 |
| 关键词 | 空 | 空了用章程里的默认几组 |
| 自动评论并 @ 你 | **关** | 开 = 用你的号公开发言 |
| 每轮最多评论 | `1` | 0 = 不发 |
| 要 @ 谁 | 空 | 填了昵称才会真的 @ |
| 回评论 | **关** | 回复直接回复到你评论下面的人 |
| 每轮最多回几条 | `1` | |
| 私信投递 | `only` | `off` 不发 / `only` 只私信 / `both` 私信 + 公开评论 |
| 私信发给谁 | `0` | 你的 B站 UID |
| 私信监听 | 开 | 查私信不花 token；有人发来才回 |
| 监听间隔（分钟） | `1` | 最小 3 |
| 私信回复每天上限 | `0` | 0 = 不限 |
| 只回这个 UID | `0` | 0 = 用上面那个 |
| 可信指令 UID | `0` | 只有这个 UID 的 `/dsh` 评论算指令 |
| 本地转写 | 关 | 没字幕的视频用 Whisper 转 |
| 转写模型 | `small` | tiny / base / small / medium |
| pythonPath | `python` | |
| dsh 路径 | 空 | 找不到 CLI 时手填 |
| provider / model | 空 / 空 | 留空 = 跟随界面当前选的模型；填了就钉死 |
| headless profile | `headless` | 定时那一轮用哪个 profile |
| 叠 MCP | 开 | 给那一轮挂 B站工具 |
| 工作区 | 空 | 日报和素材写到哪 |
| 日报形态 | `full` | `full` 完整 / `brief` 每条一两行 / `off` 不写报告 |
| 收藏夹 ID | `0` | 0 = 不收藏；>0 = 收藏到这个夹 |

**配置优先级**：DSH 设置页显式设过的键 > 插件自己的 `config.json` > 默认值。老用户不改也不会回归。

---

## 运行机制

**两套工具，两层授权**：

- **宿主注册 11 个工具**：`bili_whoami` / `bili_config` / `bili_setup` / `bili_login_start` / `bili_login_poll` / `bili_search` / `bili_subtitle` / `bili_comments` / `bili_reply` / `bili_status` / `bili_run`。
- **headless 那一轮另挂 MCP**：白名单按用途给——只读四件（搜索、字幕、评论、视频信息）永远给；`bili_reply` 只在**允许公开发言**时给；`bili_send_message` 只在私信开着时给；`bili_commands` 只在你配了可信指令 UID 时给。

**三道闸（2.1.x 起都在代码里，不在提示词里）**：

1. **公开发言**：`dmMode=only`（只私信）时，白名单不给 `bili_reply`；同时给 Python 侧下发 `BILI_ALLOW_PUBLIC_COMMENT=0`，那边直接拒绝——绕不过去。
2. **私信收件人**：下发 `BILI_DM_UID`，Python 侧只允许发给这个 UID，模型不能自己挑人。
3. **打开网页**：`/api/bili-duty/open` 不经 `cmd.exe`，走 `rundll32 url.dll,FileProtocolHandler`，并对链接做协议与字符校验。

**判重**：`~/.dsh/bili-duty/seen.md` 记看过/评过的视频；同一视频只评一次。判重表坏了那一轮宁可不发，也不当成「没有记录」重发。

**限额**：评论 ≤150 字，私信 ≤500 字（500 是实测接口上限，490 能发，再长报 21007）。

**可信指令**：只有绑定的 UID、并且评论以 `/dsh ` 开头才算指令，两个条件同时命中才执行。

---

## 边界与已知限制

- **峰时不跑**（你开了谷时判断的话）。想随时跑就关掉。
- **评论/私信要用你的号公开发言**：默认全关，开之前先看几轮日报。
- **没有字幕又不转写就只能跳过**，报告里会写「因无字幕跳过 N 条」。
- **判重表是文件不是数据库**：多轮并发时可能丢几行，最坏结果是同一条被看两次。
- **依赖 B站 接口，风控会变**：接口报错时这一轮失败，日志里带原始错误。

---

## 依赖与降级

- 需要 B站 登录凭证；没有就只读不了，会提示去扫码。
- 本地转写需要 Python 与 Whisper 依赖；没装好时自动降级成「跳过无字幕视频」。
- 没有内容源兄弟插件时它照常工作（它就是内容源）。
- 没有微信插件时通知那步跳过。

---

## 来源与许可

MIT，© 2026 Speraymer。

底座沿用 **dsh-bili-subagent**（MIT，© dsh-bili-duty contributors；它的上游是 c1overzz/dsh-bili-scroll）：`lib/mcp.mjs`、`lib/hostdeps.mjs`、`lib/verify.mjs`、`lib/asr.py`、`lib/uvfetch.mjs`、`lib/login.mjs`、`prompts/duty.md` 与 `vendor/bilibili-mcp/` 来自那一支。
主循环（谷时调度、白名单、判重、日报、私信、收藏、安全闸）在这个仓库里重写。
`vendor/bilibili-mcp/` 的版权是 © AGI_Ananas。完整声明见 `NOTICE.md` 与 `vendor/bilibili-mcp/LICENSE`。
