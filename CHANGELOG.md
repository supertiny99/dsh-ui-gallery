# Changelog — @supertiny99/dsh-ui-gallery

发布说明（GitHub Release 由此文件按版本节自动提取）。格式：`## vX.Y.Z（日期）`，节内为面向使用者的更新内容。

## v0.2.1（2026-11-19）

修复：macOS 侧边栏收起后，窗口红绿灯按钮压在「组件画廊」顶栏上的重叠问题（pm-CHG-002 跨插件窗口安全区适配）。

- 顶部说明条按宿主窗口安全区变量恒定垫高（`--dsh-frame-top-clearance`），红绿灯 / 侧栏开关 / 左上角控制带不再遮挡标题与抽屉开关
- 侧栏展开与收起两种状态下顶栏位置一致，切换不跳动；与官方插件管理器页同款行为
- Windows / web 环境不受影响（仅在 macOS 生效）

## v0.2.0（2026-11-18）

新增 **DSH 原始盒子模型与 112 个插槽蓝图可视化**（cg-CHG-002 / cg-CHG-003）：为第三方插件开发者提供首个直观的官方 UI 骨架微缩透视、插槽元数据图例指南与挂载开发驾驶舱。

- **DSH 窗口骨架微缩透视 (Interactive Wireframe)**：
  - 高保真微缩还原 Titlebar 壳层、左侧 Sidebar（Brand / Panellist / ChatNav / Footer）、中栏 Main Stage（Header / Chat Flow / Composer Dock）、右侧 Rightbar（Terminal / Doc / Deliverables）以及设置中心模态层（Settings Modal）
  - 骨架视口全画幅拓宽（自适应宽屏 + 真实桌面比例），左侧分类导航支持「浮窗抽屉模式 / 侧栏常驻模式」自由切换
  - 鼠标悬停任意微缩区域即时高亮并显示中文盒子名称与容器属性，点击中栏盒子即时反向联动过滤右侧插槽列表
  - 支持「会话视口模式」与「整页工作台模式」切换，支持「预览设置弹窗」交互展开/收起
- **112 个全量 Slot 契约映射与插槽图例指南**：
  - 静态紧凑打包官方编译期 112 个 Slot 座位元数据，提供 10 大场景快捷过滤器（⭐ 常用推荐、全量 112、左侧栏、主舞台、会话与输入坞、右侧栏、设置中心、全局壳层等）
  - 新增「右上角标识图例指南」折叠面板，系统化解读 4 大架构维度：生命周期作用域（Scope: root/session/session-maybe）、挂载契约形态（Kind: keyed/single/list/chain/hoc）、官方 UI 替换风险（Risk: none/wraps-owner-content/shadows-shipped-ui）以及业务场景标签（Badge）
  - 右栏插槽卡片右上角徽标全量注入中文原生悬停提示（Tooltip），鼠标 Hover 即刻查看通俗人话解释与避坑指南
  - 风险级别采用绿色（零风险）、橙黄色（包裹宿主）、深橙红（遮蔽官方）直观语义色彩分级
- **开箱即用注册代码生成（一键复制）**：
  - 针对 8 大核心高频实战场景（`sidebar.panellist` + `main` 独立面板组合、`settings.section`、`assistant-actions` 消息动作、`commandview` 工具执行卡、`composer.dock` 输入坞等）提供带有生产级防御（order 规范、ErrorBoundary 隔离）的标准注册代码模版
  - 提供一键复制代码按钮，支持剪贴板快速复制与 1.5s 动效反馈
- **宿主版本动态探针与规范加固**：
  - 顶栏接入宿主多层动态探测（读取系统桌面 App Bundle Info.plist 与环境变量），实时精准显示当前运行宿主版本
  - 全面遵循 UI 规范：0 emoji 残留，全量采用标准 SVG 矢量图标，严格使用 `--dsw-alias-*` 语义 token，自适应深浅双主题
- **零网络依赖与极致性能**：
  - 数据编译期紧凑内嵌，运行时零网络请求，在离线环境下秒级加载渲染；打包产物仅 166.5 KB，strict external 保持冻结模块表零内嵌

## v0.1.13（2026-11-13）

- 适配官方 0.2.x 宿主最新冻结模块表（`window.__ModuleLoader__`），完善 external 依赖声明
- 优化明暗主题适配，统一全面迁移至 `--dsw-alias-*` 语义 token

## v0.1.0（2026-11-11）

- 首次发布官方组件画廊：在整页面板活体展示 `@deepseek-ai/dsh-client-ui-primitives` 70+ 个官方原子组件（基础操作、选择切换、浮层菜单、状态数据、输出块、消息引用、设置表单、图标插画、动效工具等 9 大分类）
