// 动效列表 + hooks/纯函数清单卡 + dockkit 说明（P1 降级为清单卡）。
import React from 'react'
import * as P from '@deepseek-ai/dsh-client-ui-primitives'
import { DemoCard, has, HostMissing } from './shared.jsx'

const HOOKS = [
	['useClipboardCopy', '复制文本 + 1s 成功反馈，防重复与卸载竞态'],
	['useModalLayer', '模态层顶层 Esc/Tab 处理与焦点恢复（Modal 与设置外壳共用）'],
	['closeTopModal / isBehindModal / modalSelector', '请求前台弹窗关闭 / 判断嵌套弹窗遮挡关系'],
	['useAnchoredMaxHeight', '底部锚定浮层限制在可见视口内'],
	['useDismissOnOutsidePointer', '外部指针按下时关闭浮层'],
	['usePointerGrace', '可取消的延迟关闭：指针跨过锚点间隙'],
	['useRowDragPreview', '不可交互离屏行副本生成原生拖拽预览'],
	['useMarkdownDelegate', '读取 MarkdownDelegateProvider 注入的导航委托'],
	['useCodeHighlighter', '惰性逐行 shiki token 高亮（与官方工具卡片同源）'],
	['focusWithoutRing', '弹窗自动聚焦且先抑制焦点环（Tab/方向键恢复）'],
	['isMobileDevice / isDarwinDesktop', 'iOS/Android 设备识别（UA 缓存）/ 桌面 macOS 判定'],
	['observeComposition', 'IME composition-end 与旧版输入法保护'],
	['relativeTime', '相对时间格式化（刚刚 / N 分钟前…）'],
	['rankByName', '有序子序列模糊排序（/ 菜单与 skill 源共用）'],
	['fileSizeText / fileExtension', '人类可读文件大小 / basename 扩展名解析'],
	['writeClipboard', '剪贴板写入原语'],
	['classifyFileType / classifyLinkPath', '文件名→图形类别 / URL→链接图形类别'],
	['languageForPath / CODE_HIGHLIGHT_EXTENSIONS', '路径→语法（官方扩展名表）'],
	['DOCUMENT_ZOOM / MENU_TRANSITION_MS / ICON_SYMBOLS', '缩放档位常量 / 菜单过渡时长 / 图标 sprite 源'],
	['pointerModality', '主指针 / any-hover 能力查询'],
]

const DOCKKIT = [
	['@deepseek-ai/dsh-client-ui-dockkit', '分栏布局套件：split-tree 引擎（可逆操作）+ 渲染/驱动它的 React 组件，zero cordis。同样在宿主冻结模块表内，external 后 require 即得宿主实例。'],
	['@deepseek-ai/dsh-client-store', 'Client 状态层（SessionManager 投影 store）。'],
	['@deepseek-ai/dsh-client-ui-slots', 'Slot 注册表纯核心：typed Slots / 组件工厂 / 派生 props——整页面板注册即用（本插件正在用）。'],
	['@tanstack/react-virtual', '官方虚拟列表（宿主同实例共享）。'],
	['zod / @deepseek-ai/cordis', '校验与插件框架本体，亦在冻结模块表内。'],
]

function PlainList({ items }) {
	return (
		<ul className="uig-plain-list">
			{items.map(([name, what]) => (
				<li key={name}><code>{name}</code><span className="uig-what">{what}</span></li>
			))}
		</ul>
	)
}

function SectionAnimated() {
	const [rows, setRows] = React.useState(['alpha', 'bravo', 'charlie'])
	const seq = React.useRef(3)
	// 宿主冻结模块表按宿主版本提供组件：AnimatedRows 0.2.2 才有，旧宿主为 undefined
	const AnimatedRows = P.AnimatedRows

	if (typeof AnimatedRows !== 'function') {
		return (
			<DemoCard name="AnimatedRows" purpose="带键列表位移动画：移动 200ms / 进出淡变 100ms" wide>
				<span className="uig-what">
					当前宿主的 ui-primitives 尚未提供该组件（0.2.2+ 引入；宿主升级后此处自动变为活体演示）。
				</span>
			</DemoCard>
		)
	}

	const add = () => { seq.current += 1; const id = 'row-' + seq.current; setRows(list => [...list, id]) }
	const remove = () => setRows(list => list.length > 1 ? list.slice(0, -1) : list)
	const shuffle = () => setRows(list => list.length > 1 ? [...list.slice(1), list[0]] : list)

	return (
		<DemoCard name="AnimatedRows" purpose="带键列表位移动画：移动 200ms / 进出淡变 100ms；首次列表内交互后启用" wide>
			<div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
				<P.Button size="sm" onClick={add}>追加一行</P.Button>
				<P.Button size="sm" onClick={remove}>移除末行</P.Button>
				<P.Button size="sm" onClick={shuffle}>首行移到末尾</P.Button>
			</div>
			<AnimatedRows className="uig-anim-rows" role="list" label="动画行演示" rowKeys={rows} ready resetKey="demo">
				{rows.map(id => (
					<div key={id} data-row-key={id} className="uig-anim-row">
						<P.StateDot state="done" /> {id}
					</div>
				))}
			</AnimatedRows>
		</DemoCard>
	)
}

function SectionDisclosure() {
	const [open, setOpen] = React.useState(false)
	return (
		<DemoCard name="DisclosureRow" purpose="24px 紧凑折叠行：标题+内容左右排。动效形态＝hover 行时图标→箭头 100ms 淡入 + 标题色过渡（展开内容即时出现，无高度动画）——悬停在标题行上观察" wide>
			<P.DisclosureRow
				icon={<P.IconCodeOutlineRegular size={16} />}
				title="折叠行标题（点击展开；悬停看箭头切换）"
				open={open}
				expandable
				onToggle={() => setOpen(v => !v)}
				headerAccessory={<P.Button size="sm" variant="ghost" onClick={() => {}}>独立操作</P.Button>}
			>
				<p className="uig-what" style={{ margin: 0, padding: '8px 0' }}>展开后的内容区（即时出现——本组件不做高度过渡）。标题行默认 tertiary 色，悬停 secondary。</p>
			</P.DisclosureRow>
		</DemoCard>
	)
}

export function SectionMisc() {
	// 动效环境三态探针：reduced-motion / hover 能力 / 画廊自绘动画（不写 reduce 覆盖，作为对照）
	const [env, setEnv] = React.useState({ reduced: null, hover: null, probe: null })
	React.useEffect(() => {
		const read = () => {
			const reduced = matchMedia?.('(prefers-reduced-motion: reduce)').matches
			const hover = matchMedia?.('(hover: hover)').matches
			const probeEl = document.querySelector('.uig-motion-probe')
			// 动画定义在 ::before 伪元素上——必须按伪元素读取（读元素自身恒为 none，0.1.10 的误报根源）
			const probe = probeEl ? getComputedStyle(probeEl, '::before').animationName !== 'none' : null
			setEnv({ reduced, hover, probe })
		}
		read()
		const mq = matchMedia?.('(prefers-reduced-motion: reduce)')
		mq?.addEventListener?.('change', read)
		return () => mq?.removeEventListener?.('change', read)
	}, [])

	const envLine = env.reduced === null
		? '（环境探针读取中…）'
		: `环境探针 → prefers-reduced-motion: ${env.reduced ? 'reduce（官方动效组件就地静止）' : 'no-preference'} · hover: ${env.hover ? 'hover' : 'none'} · 自绘对照动画: ${env.probe ? '运行中' : '未运行'}`

	return (
		<section id="uig-sec-misc">
			<h2 className="uig-section-title">动效与工具</h2>
			<p className="uig-section-desc">
				{envLine}
				{env.reduced
					? ' —— ⚠ 系统已开启「减弱动态效果」：TextShimmer 扫光与 DisclosureRow 过渡被组件内置的 reduce 覆盖关闭（在 系统设置 → 辅助功能 → 显示 中关闭后恢复）；下方对照小圆点是画廊自绘动画，不受该设置影响。'
					: ' —— AnimatedRows 首次列表内指针/键盘交互后才启用动画；TextShimmer 扫光在文字上，视觉克制。hooks 与纯函数以清单卡列出（S3 速查）。'}
			</p>
			<span className="uig-motion-probe uig-chip" aria-hidden="true">对照动画点</span>

			<SectionAnimated />
			<SectionDisclosure />

			<DemoCard name="TextShimmer" purpose="文字上叠加的柔和高光扫过（AI 生成中的占位动画）。像素实测（暗色主题双帧对比）：笔画亮度变化仅约 1.7%（峰值 8.6%）、无亮带无晕染——正常观看几乎不可见，这是官方设计的极克制幅度；需醒目加载反馈时应改用 StateDot(ongoing) 等旋转指示" wide>
				<span style={{ fontSize: 17, fontWeight: 500, display: 'inline-block' }}>
					<P.TextShimmer active>正在生成摘要，请稍候 —— 高光从左到右扫过这一行文字</P.TextShimmer>
				</span>
			</DemoCard>

			<DemoCard name="Hooks 与纯函数清单" purpose="冻结模块表 ui-primitives 内的 31 个非组件导出（画廊不做活体，附一句话用途）" wide>
				<PlainList items={HOOKS} />
			</DemoCard>

			<DemoCard name="其余共享模块（冻结模块表）" purpose="ui-primitives 之外的 5 个共享 specifier；dockkit 活体演示为 P1 降级项（见 acceptance）" wide>
				<PlainList items={DOCKKIT} />
			</DemoCard>
		</section>
	)
}
