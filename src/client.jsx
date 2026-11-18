/**
 * dsh-ui-gallery · Client 半
 *
 * 整页面板画廊（panellist + main，zw-CHG-001 同款契约）：左侧分类导航，右侧活体演示流。
 * 本插件即「external 引宿主冻结模块表」的样板：React 与官方组件全部来自宿主实例，
 * 构建时 external（见 scripts/build.mjs 的 HOST_SHARED 清单）。
 */
import React from 'react'
import * as P from '@deepseek-ai/dsh-client-ui-primitives'
import css from './gallery.css'
import { SectionBlueprint } from './demos/blueprint.jsx'
import { SectionControls, SectionSelection } from './demos/controls.jsx'
import { SectionOverlays } from './demos/overlays.jsx'
import { SectionData } from './demos/data.jsx'
import { SectionOutput, SectionMessages } from './demos/output.jsx'
import { SectionForms } from './demos/forms.jsx'
import { SectionIcons } from './demos/icons.jsx'
import { SectionMisc } from './demos/misc.jsx'

const PANEL_ID = 'ui-gallery'

/* ---------- 分类目录（与各 Section 的演示卡对齐） ---------- */

const SECTIONS = [
	{ id: 'blueprint', label: '盒子与插槽', desc: 'DSH 窗口骨架微缩图与 112 个 Slot 挂载蓝图' },
	{ id: 'controls', label: '基础操作', desc: '按钮 / 开关 / 输入等高频控件' },
	{ id: 'selection', label: '选择切换', desc: '分段控件 / 胶囊 / 徽章' },
	{ id: 'overlays', label: '浮层与菜单', desc: 'Modal / Toast / Tooltip / Menu 家族' },
	{ id: 'data', label: '状态与数据', desc: '状态点 / JSON / 路径 / 缩放' },
	{ id: 'output', label: 'Agent 输出块', desc: '终端 / diff / 搜索 / 网页 / Markdown' },
	{ id: 'messages', label: '消息与引用', desc: '用户气泡 / 引用 chip / 引用预览' },
	{ id: 'forms', label: '设置表单', desc: '官方插件设置页框架' },
	{ id: 'icons', label: '图标与插画', desc: '产品图标 / 文件类型 / 品牌 / 插画' },
	{ id: 'misc', label: '动效与工具', desc: '列表动效 / hooks 与纯函数清单' },
	{ id: 'all', label: '全部平铺', desc: '在单页流中平铺浏览全部 10 个分类' },
]

/* ---------- 侧栏入口图标 ---------- */

function PanelIcon() {
	return (
		<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
			<rect x="1.5" y="1.5" width="6" height="6" rx="1.6" stroke="currentColor" strokeWidth="1.3" />
			<rect x="10.5" y="1.5" width="6" height="6" rx="1.6" stroke="currentColor" strokeWidth="1.3" />
			<rect x="1.5" y="10.5" width="6" height="6" rx="1.6" stroke="currentColor" strokeWidth="1.3" />
			<rect x="10.5" y="10.5" width="6" height="6" rx="1.6" stroke="currentColor" strokeWidth="1.3" />
		</svg>
	)
}

function IconSidebarToggle() {
	return (
		<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
			<rect x="2" y="2.5" width="12" height="11" rx="2" />
			<line x1="6" y1="2.5" x2="6" y2="13.5" />
		</svg>
	)
}

/* ---------- Section 级错误边界：单个演示 API 不匹配只显示该节错误卡，不白屏全页 ---------- */

class SectionBoundary extends React.Component {
	constructor(props) {
		super(props)
		this.state = { error: null }
	}
	static getDerivedStateFromError(error) {
		return { error }
	}
	render() {
		if (this.state.error) {
			return (
				<section className="uig-section-crashed">
					<h2 className="uig-section-title">⚠ {this.props.label}</h2>
					<p className="uig-section-desc">
						该分类渲染失败：{String(this.state.error?.message || this.state.error)}
						——多半是宿主 {this.props.hostHint} 与演示 props 不匹配，其余分类不受影响。
					</p>
				</section>
			)
		}
		return this.props.children
	}
}

/* ---------- 画廊根 ---------- */

function Gallery() {
	const [active, setActive] = React.useState('blueprint')
	const [hostInfo, setHostInfo] = React.useState(null)
	const [isNavDrawer, setIsNavDrawer] = React.useState(true) // 默认开启抽屉模式，骨架微缩图全宽展开
	const [drawerOpen, setDrawerOpen] = React.useState(false)
	const streamRef = React.useRef(null)

	// 宿主版本（host 半 /ui-gallery/version 探针：宿主 node 进程内解析官方包 package.json）
	React.useEffect(() => {
		let alive = true
		fetch('/ui-gallery/version', { credentials: 'same-origin' })
			.then(r => r.json())
			.then(d => { if (alive && d && d.ok) setHostInfo(d) })
			.catch(() => {})
		return () => { alive = false }
	}, [])

	const selectSection = (id) => {
		setActive(id)
		if (isNavDrawer) {
			setDrawerOpen(false)
		}
		if (streamRef.current) {
			streamRef.current.scrollTop = 0
		}
	}

	React.useEffect(() => {
		if (streamRef.current) {
			streamRef.current.scrollTop = 0
		}
	}, [active])

	const currentSection = SECTIONS.find(s => s.id === active) || SECTIONS[0]

	const versionLabel = hostInfo?.dsh
		? `DSH v${hostInfo.dsh}`
		: 'DSH 官方环境'

	const versionTooltip = `宿主环境：${versionLabel} · 架构说明：零内嵌打包，React 与 ui-primitives 动态链接至宿主冻结模块表`

	return (
		<div className="uig-root">
			<style>{css}</style>
			<header className="uig-topbar">
				<div className="uig-topbar-left">
					<button
						className={`uig-topbar-nav-toggle ${drawerOpen ? 'is-active' : ''}`}
						onClick={() => setDrawerOpen(!drawerOpen)}
						title={drawerOpen ? '收起分类抽屉' : '展开分类导航抽屉'}
					>
						<IconSidebarToggle />
						<span className="uig-current-cat-label">{currentSection.label}</span>
					</button>
					<h1>组件画廊</h1>
				</div>
				<div className="uig-topbar-right">
					<button
						className={`uig-pin-nav-btn ${!isNavDrawer ? 'is-pinned' : ''}`}
						onClick={() => {
							setIsNavDrawer(!isNavDrawer)
							setDrawerOpen(false)
						}}
						title={isNavDrawer ? '固定左侧侧栏（占位模式）' : '收折为浮窗抽屉（宽屏模式）'}
					>
						{!isNavDrawer ? '侧栏已固定' : '浮窗抽屉模式'}
					</button>
					<span className="uig-note" title={versionTooltip}>
						{versionLabel} · 官方组件与插槽全景
					</span>
				</div>
			</header>
			<div className="uig-body">
				{/* 浮窗抽屉遮罩（抽屉模式下激活） */}
				{isNavDrawer && drawerOpen && (
					<div
						className="uig-drawer-overlay"
						onClick={() => setDrawerOpen(false)}
					/>
				)}

				<nav className={`uig-nav ${isNavDrawer ? 'is-drawer' : ''} ${drawerOpen ? 'is-open' : ''}`}>
					<div className="uig-drawer-header">
						<span>分类导航目录</span>
						{isNavDrawer && (
							<button className="uig-drawer-close" onClick={() => setDrawerOpen(false)}>✕</button>
						)}
					</div>
					{SECTIONS.map(s => (
						<div
							key={s.id}
							className={'uig-nav-item' + (active === s.id ? ' is-on' : '')}
							onClick={() => selectSection(s.id)}
							title={s.desc}
						>
							<span>{s.label}</span>
						</div>
					))}
				</nav>
				<main className={`uig-stream ${isNavDrawer ? 'is-wide-canvas' : ''}`} ref={streamRef}>
					{(active === 'blueprint' || active === 'all') && (
						<SectionBoundary label="盒子模型与插槽" hostHint="blueprint"><SectionBlueprint /></SectionBoundary>
					)}
					{(active === 'controls' || active === 'all') && (
						<SectionBoundary label="基础操作" hostHint="ui-primitives"><SectionControls /></SectionBoundary>
					)}
					{(active === 'selection' || active === 'all') && (
						<SectionBoundary label="选择切换" hostHint="ui-primitives"><SectionSelection /></SectionBoundary>
					)}
					{(active === 'overlays' || active === 'all') && (
						<SectionBoundary label="浮层与菜单" hostHint="ui-primitives"><SectionOverlays /></SectionBoundary>
					)}
					{(active === 'data' || active === 'all') && (
						<SectionBoundary label="状态与数据" hostHint="ui-primitives"><SectionData /></SectionBoundary>
					)}
					{(active === 'output' || active === 'all') && (
						<SectionBoundary label="Agent 输出块" hostHint="ui-primitives"><SectionOutput /></SectionBoundary>
					)}
					{(active === 'messages' || active === 'all') && (
						<SectionBoundary label="消息与引用" hostHint="ui-primitives"><SectionMessages /></SectionBoundary>
					)}
					{(active === 'forms' || active === 'all') && (
						<SectionBoundary label="设置表单" hostHint="ui-primitives"><SectionForms /></SectionBoundary>
					)}
					{(active === 'icons' || active === 'all') && (
						<SectionBoundary label="图标与插画" hostHint="ui-primitives"><SectionIcons /></SectionBoundary>
					)}
					{(active === 'misc' || active === 'all') && (
						<SectionBoundary label="动效与工具" hostHint="ui-primitives"><SectionMisc /></SectionBoundary>
					)}
				</main>
			</div>
		</div>
	)
}

/* ---------- 注册（官方插件页/任务页同款：pannellist 图标 + main 面板） ---------- */

export const inject = ['slots']

export function apply(ctx) {
	ctx.slots.inject('main', () =>
		ctx.slots.register({ name: 'main', key: PANEL_ID }, Gallery))
	ctx.slots.inject('sidebar.panellist', () =>
		ctx.slots.register(
			{ name: 'sidebar.panellist', id: PANEL_ID, order: 60, label: '组件画廊' },
			PanelIcon))
}
