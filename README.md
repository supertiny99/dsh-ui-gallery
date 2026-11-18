# @supertiny99/dsh-ui-gallery · 官方组件画廊与架构蓝图

DeepSeek Harness 插件：在整页面板中**活体展示**官方 `@deepseek-ai/dsh-client-ui-primitives` 全部可继承 UI 组件，并提供 **DSH 原始窗口盒子模型与 112 个 Slot 插槽蓝图的交互式可视化**——插件 UI 选型与挂载开发的活体驾驶舱，自动跟随宿主版本与明暗主题。

本插件同时是 **"external 引宿主冻结模块表"** 的可照抄样板：React 与全部官方组件来自宿主实例，client 产物零内嵌（~140 KB，含全量插槽契约与微缩线框图），构建配置见 [`scripts/build.mjs`](scripts/build.mjs)。

## 截图占位

（0.1.12 desktop 实装截图，双主题）

## 冻结模块表（插件可 external 的全部 specifier）

宿主 Web 壳启动时把下列模块注入插件加载器（官方 `packages/client/web/src/platform.ts` 的 `PLATFORM_MODULES`，0.2.x 实证）。第三方插件打包时把这些写进 esbuild `external`，运行时经 `window.__ModuleLoader__` 的 `require` 拿到**宿主同一实例**：

| specifier | 说明 |
|---|---|
| `react` / `react/jsx-runtime` | 官方组件与本插件共用同一 React 实例（无 hooks 报错） |
| `react-dom` / `react-dom/client` | 渲染层 |
| `@deepseek-ai/cordis` | 插件框架本体 |
| `zod` | 校验 |
| `@tanstack/react-virtual` | 官方虚拟列表 |
| `@deepseek-ai/dsh-client-store` | Client 状态层（SessionManager 投影 store） |
| `@deepseek-ai/dsh-client-ui-slots` | Slot 注册表（整页面板注册即用） |
| `@deepseek-ai/dsh-client-ui-primitives` | **官方组件库**（本画廊主角） |
| `@deepseek-ai/dsh-client-ui-dockkit` | 分栏布局引擎（split-tree，zero cordis） |

**注意**：`ui-primitives` 编译进宿主 Web 壳、无独立包实体——它的版本 = 宿主批次版本（官方批次制，批次内全包同版本）。画廊顶栏显示的宿主批次即组件库版本。

## esbuild external 配置（可照抄）

```js
const HOST_SHARED = [
  'react', 'react/jsx-runtime', 'react-dom', 'react-dom/client',
  '@deepseek-ai/cordis', 'zod', '@tanstack/react-virtual',
  '@deepseek-ai/dsh-client-store', '@deepseek-ai/dsh-client-ui-slots',
  '@deepseek-ai/dsh-client-ui-primitives', '@deepseek-ai/dsh-client-ui-dockkit',
]

await build({
  entryPoints: ['src/client.jsx'], bundle: true, format: 'cjs',
  platform: 'browser', target: 'chrome120',
  jsx: 'transform', jsxFactory: 'React.createElement', jsxFragment: 'React.Fragment',
  external: HOST_SHARED,
  loader: { '.css': 'text' }, metafile: true,
  // banner 必须预定义 module/exports（esbuild CJS 入口包装会引用它们），
  // footer 返回 module.exports——漏掉即 "module is not defined" 宿主加载崩溃
  banner: { js: 'window.__ModuleLoader__.load({id:"<pkg-name>",factory:(require)=>{const module={exports:{}};const exports=module.exports;' },
  footer: { js: 'return module.exports}})' },
})
```

Client 侧消费（React 树内 `<style>{css}</style>` 注入样式）：

```jsx
import React from 'react'
import * as P from '@deepseek-ai/dsh-client-ui-primitives'

export const inject = ['slots']
export function apply(ctx) {
  ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: 'my-plugin' }, MyPanel))
  ctx.slots.inject('sidebar.panellist', () =>
    ctx.slots.register({ name: 'sidebar.panellist', id: 'my-plugin', order: 60, label: '我的面板' }, PanelIcon))
}
```

## 模块与组件分类清单（画廊 10 大分类）

| 分类 | 核心内容 |
|---|---|
| 盒子模型与插槽 | **DSH 原始窗口骨架微缩透视**（三栏/会话流/输入坞/设置层）+ 112 个 Slot 座位契约映射 + ⭐ 常用挂载点推荐 + 开箱即用注册代码模版（一键复制） |
| 基础操作 | Button（primary/ghost/outline/toolbar × md/sm）、Switch、Checkbox、Input、InlineEditor |
| 选择切换 | SegmentedControl、SegmentedTabs、Pill、Tag（八 tone） |
| 浮层与菜单 | Modal、RiskConfirmation、Toast、Tooltip、HoverCard(HoverCardGroup)、ImageLightbox、Menu/MenuItemButton（含子菜单）、MenuSurface、MenuGroup |
| 状态与数据 | StateDot（done/warning/error/idle/ongoing/step）、ConnectionIndicator、ShortcutKeys、JsonTree、JsonBlock、PathLabel、CommandText、ZoomControls |
| Agent 输出块 | TerminalBlock、ReadBlock、DiffBlock、SearchBlock、WebBlock、CodeBlock（shiki）、MarkdownText（GFM+TeX）、DetailDocument |
| 消息与引用 | UserMessageBubble、UserTextRun、ReferenceChip、QuotePreview |
| 设置表单 | SettingsForm、SettingsValueField、SettingsSecretField（mock 暂存演示） |
| 图标与插画 | icons/*（83 基名 × Regular/Medium 双线重，抽样 16 对）、FishLogo、BrandWordmark、PermissionIcon×8、PluginArtwork×5、GuideArtwork×2、FileTypeIcon、ReferenceIcon、LinkIcon |
| 动效与工具 | AnimatedRows、DisclosureRow、TextShimmer 活体；20 项 hooks/纯函数清单卡；dockkit 等 5 个其余共享模块清单卡 |

hooks/工具速查（完整一句话用途见画廊「动效与工具」）：`useClipboardCopy` `useModalLayer` `closeTopModal` `isBehindModal` `useAnchoredMaxHeight` `useDismissOnOutsidePointer` `usePointerGrace` `useRowDragPreview` `useMarkdownDelegate` `useCodeHighlighter` `focusWithoutRing` `isMobileDevice` `isDarwinDesktop` `observeComposition` `relativeTime` `rankByName` `fileSizeText` `writeClipboard` `classifyFileType` `classifyLinkPath` `languageForPath` `pointerModality` …

## 安装

```sh
dsh plugin --profile <name> add @supertiny99/dsh-ui-gallery
# 本地 tgz 离线安装：dsh plugin --profile <name> add file:/path/to/supertiny99-dsh-ui-gallery-<ver>.tgz
# desktop（Electron 独占管理）走 app 内 Web 插件页粘贴 npm spec 或 tgz 绝对路径
```

`engines.dsh: >=0.2.1-rc.5 <0.3.0`。宿主升级到含新组件的批次后，画廊中对应占位卡**自动变为活体演示**（能力检测，见 `src/demos/shared.jsx` 的 `has()`）。

## 开发

```sh
npm install && npm run build   # 构建 + external 检查 + selfcheck（本地假 ModuleLoader 执行产物）
npm run watch
```

`selfcheck` 在真实宿主外捕获包装层错误（"module is not defined" 一类上桌即崩的问题）；渲染期 API 不匹配由画廊 section 级错误边界隔离为单卡崩溃提示。

## 结构

```
src/
├─ host.js        # /ui-gallery/version 版本探针（宿主批次号）
├─ client.jsx     # slots 注册（pannellist + main）+ 画廊框架 + section 错误边界
├─ gallery.css    # 画廊壳样式（全走 --dsw-alias-* token，明暗主题自动适配）
└─ demos/         # 9 分类演示（shared 含 has() 能力检测与 HostMissing 降级卡）
```

## License

MIT
