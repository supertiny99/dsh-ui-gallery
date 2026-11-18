/**
 * DSH 盒子模型与插槽蓝图可视化组件
 * 左-中-右三栏联动布局（Three-column Inspector Layout）：
 * 左侧画廊主导航 + 中间常驻微缩骨架透视 + 右侧独立滚动插槽检视器。
 * 支持双向穿梭联动：点击中栏盒子即时过滤右栏；Hover 右栏插槽卡片中栏对应盒子高亮发光。
 */
import React from 'react'
import { BOX_REGIONS, SLOTS_DATA } from './blueprint-data.js'

/* ---------- 内联标准主题 SVG 图标（stroke="currentColor"） ---------- */

function IconCopy() {
	return (
		<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
			<rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
			<path d="M3.5 10.5h-1a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v1" />
		</svg>
	)
}

function IconCheck() {
	return (
		<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
			<path d="M3.5 8.5l3 3 6-7" />
		</svg>
	)
}

function IconStar() {
	return (
		<svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
			<path d="M8 1.5l1.9 4.3 4.6.4-3.5 3.1 1 4.6L8 11.5l-4 2.4 1-4.6-3.5-3.1 4.6-.4z" />
		</svg>
	)
}

function IconInfo() {
	return (
		<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
			<circle cx="8" cy="8" r="6.5" />
			<path d="M8 7v4M8 4.8v.4" />
		</svg>
	)
}

function IconHelp() {
	return (
		<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
			<circle cx="8" cy="8" r="6.5" />
			<path d="M6.5 6.5a1.5 1.5 0 1 1 2.2 1.3c-.6.4-.7.7-.7 1.2v.5M8 12.2v.3" />
		</svg>
	)
}

function IconChevronDown() {
	return (
		<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
			<path d="M4 6l4 4 4-4" />
		</svg>
	)
}

const SCOPE_META = {
	'root': { label: '根级常驻', desc: '窗口级全生命周期常驻，所有会话共享，插件常驻单例' },
	'session': { label: '会话绑定', desc: '绑定当前激活会话生命周期，切会话或关闭时销毁重建' },
	'session-maybe': { label: '会话可选', desc: '有活动会话时携带 session 上下文，无会话时降级运行' },
}

const KIND_META = {
	'keyed': { label: '键值隔离', desc: '多插件通过唯一 key 独立注册同类项，互不干扰' },
	'single': { label: '单例独占', desc: '此插槽仅允许挂载一个主视图，后注册或高优先级独占' },
	'list': { label: '列表线性', desc: '多插件注册的元素以线性列表顺序排列（如操作按钮栏）' },
	'chain': { label: '责任链', desc: '按声明顺序串联流水线拦截，需正确传递管道数据' },
	'hoc': { label: '高阶包装', desc: '用自定义组件包裹宿主原生节点，需透传 children' },
}

const RISK_META = {
	'none': { label: '零风险', desc: '纯增量扩展点，官方稳定推荐，零副作用，升级兼容最好' },
	'shadows-shipped-ui': { label: '遮蔽官方UI', desc: '会替换或掩盖官方内置默认视图，需自测保证核心交互' },
	'wraps-owner-content': { label: '包裹宿主内容', desc: '作为外层容器包裹官方宿主内容，务必透传渲染 children' },
}

function getSlotTargetBox(slotKey) {
	if (!slotKey) return null
	if (slotKey === 'sidebar.panellist') return 'panellist'
	if (slotKey.startsWith('sidebar.brand')) return 'brand'
	if (slotKey.startsWith('sidebar.chat') || slotKey.startsWith('sidebar.header')) return 'sessions'
	if (slotKey.startsWith('sidebar.footer') || slotKey.startsWith('sidebar.settings')) return 'sidebar-footer'
	if (slotKey.startsWith('sidebar.')) return 'sidebar'
	if (slotKey === 'main' || slotKey.startsWith('main.')) return 'main'
	if (slotKey.startsWith('conversation.composer.dock')) return 'composer-dock'
	if (slotKey.startsWith('conversation.composer')) return 'composer'
	if (slotKey.startsWith('conversation.chat.assistant-actions')) return 'assistant-actions'
	if (slotKey.startsWith('conversation.chat.reasoning')) return 'reasoning'
	if (slotKey.startsWith('conversation.chat.commandview') || slotKey.startsWith('tool.')) return 'toolview'
	if (slotKey.startsWith('conversation.header')) return 'conv-header'
	if (slotKey.startsWith('conversation.chat')) return 'conv-flow'
	if (slotKey.startsWith('conversation.')) return 'conversation'
	if (slotKey.startsWith('rightbar') || slotKey.startsWith('deliverables.')) return 'rightbar'
	if (slotKey.startsWith('settings.')) return 'settings'
	if (slotKey.startsWith('shell.') || slotKey === 'root' || slotKey.startsWith('workspace.')) return 'shell'
	return null
}

export function SectionBlueprint() {
	const [activeRegion, setActiveRegion] = React.useState('featured')
	const [searchQuery, setSearchQuery] = React.useState('')
	const [hoveredBox, setHoveredBox] = React.useState(null)
	const [hoveredSlotKey, setHoveredSlotKey] = React.useState(null)
	const [copiedKey, setCopiedKey] = React.useState(null)
	const [viewMode, setViewMode] = React.useState('conversation') // 'conversation' | 'panel'
	const [showSettingsModal, setShowSettingsModal] = React.useState(false)
	const [showLegend, setShowLegend] = React.useState(false)

	const inspectorRef = React.useRef(null)

	// 一键复制
	const handleCopy = (key, snippet) => {
		if (!snippet) return
		navigator.clipboard?.writeText(snippet)
			.then(() => {
				setCopiedKey(key)
				setTimeout(() => setCopiedKey(null), 1500)
			})
			.catch(() => {
				try {
					const ta = document.createElement('textarea')
					ta.value = snippet
					document.body.appendChild(ta)
					ta.select()
					document.execCommand('copy')
					document.body.removeChild(ta)
					setCopiedKey(key)
					setTimeout(() => setCopiedKey(null), 1500)
				} catch (e) {
					console.error('Copy failed', e)
				}
			})
	}

	// 选中中栏盒子切换过滤并回滚右栏
	const selectRegionFromBox = (regionId) => {
		setActiveRegion(regionId)
		if (inspectorRef.current) {
			inspectorRef.current.scrollTop = 0
		}
	}

	// 计算当前被右栏卡片 Hover 联动的微缩盒子目标
	const linkedTarget = getSlotTargetBox(hoveredSlotKey)

	// 过滤数据
	const filteredSlots = React.useMemo(() => {
		return SLOTS_DATA.filter(slot => {
			if (activeRegion === 'featured') {
				if (!slot.isFeatured) return false
			} else if (activeRegion !== 'all') {
				if (slot.region !== activeRegion) return false
			}

			if (searchQuery.trim()) {
				const q = searchQuery.trim().toLowerCase()
				const matchKey = slot.key.toLowerCase().includes(q)
				const matchSummary = (slot.summary || '').toLowerCase().includes(q)
				const matchChinese = (slot.chineseName || '').toLowerCase().includes(q)
				const matchDoc = (slot.doc || '').toLowerCase().includes(q)
				return matchKey || matchSummary || matchChinese || matchDoc
			}
			return true
		})
	}, [activeRegion, searchQuery])

	return (
		<section className="uig-section uig-blueprint-section" id="uig-sec-blueprint">
			{/* 顶栏说明 */}
			<header className="uig-blueprint-head">
				<div className="uig-bp-head-text">
					<h2 className="uig-section-title">DSH 盒子模型与插槽蓝图</h2>
					<p className="uig-section-desc">
						左-中-右三栏联动：中栏常驻 DSH 视口骨架透视，右栏独立滚动插槽契约与生成模版，支持双向穿梭联动。
					</p>
				</div>
				<div className="uig-blueprint-canvas-toggles">
					<button
						className={`uig-bp-toggle-btn ${viewMode === 'conversation' ? 'is-active' : ''}`}
						onClick={() => setViewMode('conversation')}
						title="展示默认会话视口结构"
					>
						会话视口模式
					</button>
					<button
						className={`uig-bp-toggle-btn ${viewMode === 'panel' ? 'is-active' : ''}`}
						onClick={() => setViewMode('panel')}
						title="展示第三方整页面板挂载模式"
					>
						整页工作台模式
					</button>
					<button
						className={`uig-bp-toggle-btn ${showSettingsModal ? 'is-active' : ''}`}
						onClick={() => {
							setShowSettingsModal(!showSettingsModal)
							if (!showSettingsModal) selectRegionFromBox('settings')
						}}
						title="展开/隐藏设置中心模态层"
					>
						{showSettingsModal ? '收起设置弹窗' : '预览设置弹窗'}
					</button>
				</div>
			</header>

			{/* ==================== 中-右核心联动区 ==================== */}
			<div className="uig-blueprint-layout">
				{/* 【中栏】：常驻置顶的骨架微缩视口 */}
				<aside className="uig-bp-stage">
					<div className="uig-blueprint-canvas-wrapper">
						<div className="uig-blueprint-canvas-header">
							<div className="uig-blueprint-canvas-title">
								<span>窗口骨架透视 (常驻视口)</span>
								<span className="uig-blueprint-hint">
									{hoveredSlotKey ? (
										<span className="uig-bp-linked-hint">
											聚焦插槽：<code>{hoveredSlotKey}</code>
										</span>
									) : hoveredBox ? (
										`悬停盒子：${hoveredBox}`
									) : (
										'点击盒子联动过滤右栏，Hover 盒子高亮探查'
									)}
								</span>
							</div>
						</div>

						{/* 真实微缩窗体 */}
						<div className="uig-blueprint-window">
							{/* 顶栏 Titlebar / Window Drag */}
							<div
								className={`uig-bp-titlebar ${hoveredBox === 'Window Shell / Titlebar' ? 'is-hover' : ''} ${linkedTarget === 'shell' ? 'is-linked-highlight' : ''}`}
								onMouseEnter={() => setHoveredBox('Window Shell / Titlebar')}
								onMouseLeave={() => setHoveredBox(null)}
								onClick={() => selectRegionFromBox('shell')}
								title="点击查看全局壳层插槽 (shell.*, root, workspace.toast)"
							>
								<div className="uig-bp-window-dots">
									<span className="dot dot-red" />
									<span className="dot dot-yellow" />
									<span className="dot dot-green" />
								</div>
								<div className="uig-bp-title-text">Window Shell (window-drag)</div>
								<div className="uig-bp-shell-tags">
									<span className="bp-tag-micro">shell.overlay</span>
									<span className="bp-tag-micro">toast</span>
								</div>
							</div>

							{/* 三栏主工作区 */}
							<div className="uig-blueprint-main-dock">
								{/* 1. 左侧边栏 Sidebar */}
								<div
									className={`uig-bp-sidebar ${activeRegion === 'sidebar' ? 'is-selected' : ''} ${hoveredBox === 'Sidebar' ? 'is-hover' : ''} ${linkedTarget === 'sidebar' ? 'is-linked-highlight' : ''}`}
									onMouseEnter={() => setHoveredBox('Sidebar')}
									onMouseLeave={() => setHoveredBox(null)}
									onClick={() => selectRegionFromBox('sidebar')}
								>
									<div
										className={`uig-bp-sub-box bp-brand ${linkedTarget === 'brand' ? 'is-linked-highlight' : ''}`}
										title="sidebar.brand.* 品牌图标与名称"
										onClick={(e) => {
											e.stopPropagation()
											selectRegionFromBox('sidebar')
										}}
									>
										<span className="bp-sub-label">Brand</span>
									</div>

									<div
										className={`uig-bp-sub-box bp-panellist is-featured-box ${activeRegion === 'featured' || activeRegion === 'sidebar' ? 'is-pulse' : ''} ${linkedTarget === 'panellist' ? 'is-linked-highlight' : ''}`}
										title="sidebar.panellist 插件整页面板切换入口"
										onClick={(e) => {
											e.stopPropagation()
											selectRegionFromBox('sidebar')
										}}
									>
										<div className="bp-featured-pill">
											<IconStar /> Panellist
										</div>
										<div className="bp-panellist-icons">
											<span className="bp-icon-mock is-active">G</span>
											<span className="bp-icon-mock">Z</span>
											<span className="bp-icon-mock">P</span>
											<span className="bp-icon-mock">+</span>
										</div>
									</div>

									<div
										className={`uig-bp-sub-box bp-sessions ${linkedTarget === 'sessions' ? 'is-linked-highlight' : ''}`}
										title="sidebar.chat.conversation 会话历史导航"
										onClick={(e) => {
											e.stopPropagation()
											selectRegionFromBox('sidebar')
										}}
									>
										<span className="bp-sub-label">Chat Nav / Sessions</span>
										<div className="bp-line-mock" />
										<div className="bp-line-mock short" />
										<div className="bp-line-mock" />
									</div>

									<div
										className={`uig-bp-sub-box bp-footer ${linkedTarget === 'sidebar-footer' ? 'is-linked-highlight' : ''}`}
										title="sidebar.footer.* 底部环境状态、设置入口"
										onClick={(e) => {
											e.stopPropagation()
											setShowSettingsModal(true)
											selectRegionFromBox('settings')
										}}
									>
										<span className="bp-sub-label">Footer / Settings</span>
									</div>
								</div>

								{/* 2. 中间主舞台 Main Stage */}
								<div
									className={`uig-bp-main-stage ${activeRegion === 'main' || activeRegion === 'conversation' ? 'is-selected' : ''} ${hoveredBox === 'Main' ? 'is-hover' : ''} ${linkedTarget === 'main' || linkedTarget === 'conversation' ? 'is-linked-highlight' : ''}`}
									onMouseEnter={() => setHoveredBox('Main Stage')}
									onMouseLeave={() => setHoveredBox(null)}
									onClick={() => selectRegionFromBox(viewMode === 'panel' ? 'main' : 'conversation')}
								>
									{viewMode === 'panel' ? (
										/* 整页面板态 */
										<div
											className={`uig-bp-full-panel is-featured-box ${linkedTarget === 'main' ? 'is-linked-highlight' : ''}`}
											title="main slot (key 对应 sidebar.panellist id)"
										>
											<div className="bp-panel-banner">
												<span className="bp-featured-pill">
													<IconStar /> main (keyed, 100% 独立画布)
												</span>
											</div>
											<div className="bp-desc-micro">ui-gallery / profile-launcher 同款</div>
											<div className="bp-panel-mock-content">
												<div className="bp-panel-rect" />
												<div className="bp-panel-rect" />
											</div>
										</div>
									) : (
										/* 会话模式 */
										<div className="uig-bp-conversation-frame">
											<div
												className={`uig-bp-sub-box bp-conv-header ${linkedTarget === 'conv-header' ? 'is-linked-highlight' : ''}`}
												title="conversation.header 会话顶栏与模型选择器"
												onClick={(e) => {
													e.stopPropagation()
													selectRegionFromBox('conversation')
												}}
											>
												<span className="bp-sub-label">conversation.header</span>
												<span className="bp-tag-micro">Model Selector</span>
											</div>

											<div
												className={`uig-bp-sub-box bp-chat-flow ${linkedTarget === 'conv-flow' ? 'is-linked-highlight' : ''}`}
												title="conversation.chat.flow 虚拟滚动消息流"
												onClick={(e) => {
													e.stopPropagation()
													selectRegionFromBox('conversation')
												}}
											>
												{/* 用户消息 */}
												<div className="bp-msg-mock user">
													<span className="bp-msg-pill">User</span>
													<span className="bp-msg-text">如何开发全屏插件？</span>
												</div>

												{/* 助手消息 */}
												<div className="bp-msg-mock assistant">
													<div
														className={`bp-reasoning-mock ${linkedTarget === 'reasoning' ? 'is-linked-highlight' : ''}`}
														title="conversation.chat.reasoning.body 思维链折叠区"
													>
														<span>Reasoning 思维链</span>
													</div>
													<div className="bp-text-mock">
														<span>Reply (Markdown / Code)</span>
													</div>
													<div
														className={`bp-toolview-mock ${linkedTarget === 'toolview' ? 'is-linked-highlight' : ''}`}
														title="conversation.chat.commandview 工具执行卡"
													>
														<span>ToolView: command</span>
													</div>
													<div
														className={`bp-action-row ${linkedTarget === 'assistant-actions' ? 'is-linked-highlight' : ''}`}
														title="conversation.chat.assistant-actions 回复底部操作"
													>
														<span className="bp-featured-pill-mini">
															<IconStar /> Actions 动作
														</span>
													</div>
												</div>
											</div>

											{/* 底部输入区 */}
											<div
												className={`uig-bp-sub-box bp-composer is-featured-box ${linkedTarget === 'composer' ? 'is-linked-highlight' : ''}`}
												title="conversation.composer (bar + dock) 输入坞"
												onClick={(e) => {
													e.stopPropagation()
													selectRegionFromBox('conversation')
												}}
											>
												<div className="bp-composer-bar">
													<span className="bp-composer-ph">输入消息...</span>
													<span className="bp-send-btn">Send</span>
												</div>
												<div
													className={`bp-composer-dock ${linkedTarget === 'composer-dock' ? 'is-linked-highlight' : ''}`}
													title="conversation.composer.dock 底部插件标签/工具"
												>
													<span className="bp-featured-pill-mini">
														<IconStar /> composer.dock
													</span>
												</div>
											</div>
										</div>
									)}
								</div>

								{/* 3. 右侧辅助栏 Rightbar */}
								<div
									className={`uig-bp-rightbar ${activeRegion === 'rightbar' ? 'is-selected' : ''} ${hoveredBox === 'Rightbar' ? 'is-hover' : ''} ${linkedTarget === 'rightbar' ? 'is-linked-highlight' : ''}`}
									onMouseEnter={() => setHoveredBox('Rightbar')}
									onMouseLeave={() => setHoveredBox(null)}
									onClick={() => selectRegionFromBox('rightbar')}
									title="点击查看右侧辅助栏插槽 (rightbar, deliverables.*)"
								>
									<div className="bp-rightbar-header">
										<span className="bp-sub-label">Rightbar</span>
									</div>
									<div className="bp-rightbar-item">Terminal</div>
									<div className="bp-rightbar-item">Preview</div>
									<div className="bp-rightbar-item">Review</div>
								</div>
							</div>

							{/* 模拟设置弹窗浮层 */}
							{showSettingsModal && (
								<div
									className="uig-bp-modal-overlay"
									onClick={() => setShowSettingsModal(false)}
								>
									<div
										className={`uig-bp-settings-modal is-featured-box ${linkedTarget === 'settings' ? 'is-linked-highlight' : ''}`}
										onClick={(e) => {
											e.stopPropagation()
											selectRegionFromBox('settings')
										}}
									>
										<div className="bp-modal-head">
											<span>设置中心 (Settings Shell)</span>
											<button className="bp-close-btn" onClick={() => setShowSettingsModal(false)}>✕</button>
										</div>
										<div className="bp-modal-body">
											<div className="bp-modal-nav">
												<span className="is-on">通用</span>
												<span>模型</span>
												<span className="bp-active-section">插件扩展</span>
											</div>
											<div className="bp-modal-content">
												<div className="bp-settings-section-card">
													<div className="bp-featured-pill">
														<IconStar /> settings.section slot
													</div>
													<div className="bp-setting-row">[ 开启功能开关 ]</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							)}
						</div>
					</div>

					<div className="uig-bp-stage-footer-tip">
						<span>提示：在右侧列表 Hover 任一插槽卡片，中栏对应位置即时产生高亮光环。</span>
					</div>
				</aside>

				{/* 【右栏】：独立滚动的插槽检视器与代码流 */}
				<main className="uig-bp-inspector" ref={inspectorRef}>
					{/* 检索与区域筛选胶囊 */}
					<div className="uig-bp-filter-panel">
						<div className="uig-blueprint-search">
							<input
								type="search"
								className="uig-search-input"
								placeholder="检索插槽 Key / 中文用途 / 契约说明..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</div>

						<div className="uig-blueprint-regions">
							{BOX_REGIONS.map(reg => (
								<button
									key={reg.id}
									className={`uig-region-chip ${activeRegion === reg.id ? 'is-active' : ''}`}
									onClick={() => selectRegionFromBox(reg.id)}
									title={reg.desc}
								>
									{reg.id === 'featured' && <IconStar />}
									<span>{reg.name}</span>
									<span className="uig-chip-count">{reg.count}</span>
								</button>
							))}
						</div>
					</div>

					{/* 插槽卡片流 */}
					<div className="uig-slots-container">
						<div className="uig-slots-summary-bar">
							<div className="uig-summary-left">
								<span>
									匹配到 <strong>{filteredSlots.length}</strong> 个插槽座位
									{activeRegion === 'featured' && '（实战高频推荐挂载点）'}
								</span>
							</div>
							<div className="uig-summary-right">
								<button
									className={`uig-legend-toggle-btn ${showLegend ? 'is-active' : ''}`}
									onClick={() => setShowLegend(!showLegend)}
									title={showLegend ? '收起插槽架构标识图例说明' : '展开插槽右上角标识图例说明（Scope / Kind / Risk / Badge）'}
								>
									<IconHelp />
									<span>{showLegend ? '收起标识图例' : '右上角标识图例'}</span>
									<span className={`uig-chevron-icon ${showLegend ? 'is-expanded' : ''}`}>
										<IconChevronDown />
									</span>
								</button>
							</div>
						</div>

						{/* 插槽契约架构标识图例指南卡片（可折叠） */}
						{showLegend && (
							<div className="uig-slots-legend-panel">
								<div className="uig-legend-header">
									<div className="uig-legend-title">
										<IconHelp />
										<span>插槽契约架构标识速查（官方 slot-catalog 四大元数据维度）</span>
									</div>
									<button
										className="uig-legend-close-btn"
										onClick={() => setShowLegend(false)}
										title="收起图例"
									>
										✕
									</button>
								</div>
								<div className="uig-legend-grid">
									{/* 1. Scope 生命周期 */}
									<div className="uig-legend-col">
										<div className="uig-legend-col-title">
											<span className="uig-badge-scope is-root">Scope</span>
											<span>生命周期作用域</span>
										</div>
										<ul className="uig-legend-list">
											<li>
												<div className="uig-legend-item-head">
													<code>root</code>
													<span className="uig-legend-tag">根级常驻</span>
												</div>
												<p>与 DSH 窗口同生命周期，所有会话全局共享（如顶栏、侧栏列表、全局设置）。</p>
											</li>
											<li>
												<div className="uig-legend-item-head">
													<code>session</code>
													<span className="uig-legend-tag">会话绑定</span>
												</div>
												<p>严格绑定当前打开的对话或任务，会话切换或关闭时自动销毁与重建。</p>
											</li>
											<li>
												<div className="uig-legend-item-head">
													<code>session-maybe</code>
													<span className="uig-legend-tag">会话可选</span>
												</div>
												<p>有活动会话时携带 session 上下文，无会话时降级运行，务必注意空值防御。</p>
											</li>
										</ul>
									</div>

									{/* 2. Kind 挂载形态 */}
									<div className="uig-legend-col">
										<div className="uig-legend-col-title">
											<span className="uig-badge-kind">Kind</span>
											<span>挂载契约形态</span>
										</div>
										<ul className="uig-legend-list">
											<li>
												<div className="uig-legend-item-head">
													<code>keyed</code>
													<span className="uig-legend-tag">键值多项</span>
												</div>
												<p>多插件通过声明独有 key 独立注册（如侧栏图标列表），按 key 隔离互不覆盖。</p>
											</li>
											<li>
												<div className="uig-legend-item-head">
													<code>single</code>
													<span className="uig-legend-tag">单例独占</span>
												</div>
												<p>同一时间仅允许挂载一个主视图，后注册或高优先级插件独占呈现。</p>
											</li>
											<li>
												<div className="uig-legend-item-head">
													<code>list</code>
													<span className="uig-legend-tag">线性列表</span>
												</div>
												<p>所有插件注册的元素以列表排开（如按钮操作条），按 order 属性依次排序。</p>
											</li>
											<li>
												<div className="uig-legend-item-head">
													<code>chain / hoc</code>
													<span className="uig-legend-tag">责任链/包装</span>
												</div>
												<p>责任链传递或高阶组件包裹宿主节点，必须正确透传 <code>children</code> 与 props。</p>
											</li>
										</ul>
									</div>

									{/* 3. Risk 替换风险 */}
									<div className="uig-legend-col">
										<div className="uig-legend-col-title">
											<span className="uig-badge-risk is-none">Risk</span>
											<span>官方 UI 替换风险</span>
										</div>
										<ul className="uig-legend-list">
											<li>
												<div className="uig-legend-item-head">
													<code className="uig-code-risk is-none">none</code>
													<span className="uig-legend-tag is-safe">零风险·推荐</span>
												</div>
												<p>纯增量扩展挂载点，官方预留插槽，零副作用，版本升级兼容性最好。</p>
											</li>
											<li>
												<div className="uig-legend-item-head">
													<code className="uig-code-risk is-wraps">wraps-owner-content</code>
													<span className="uig-legend-tag is-warn">包裹宿主</span>
												</div>
												<p>作为容器包裹官方宿主内容，务必保证 children 正常渲染，不得中断 React 树。</p>
											</li>
											<li>
												<div className="uig-legend-item-head">
													<code className="uig-code-risk is-shadows">shadows-shipped-ui</code>
													<span className="uig-legend-tag is-danger">遮蔽官方</span>
												</div>
												<p>会掩盖或替换官方内置默认 UI（如接管默认输入框），需全面自测核心功能完整性。</p>
											</li>
										</ul>
									</div>

									{/* 4. Badge 场景推荐 */}
									<div className="uig-legend-col">
										<div className="uig-legend-col-title">
											<span className="uig-badge-star"><IconStar /> Badge</span>
											<span>业务场景推荐</span>
										</div>
										<ul className="uig-legend-list">
											<li>
												<div className="uig-legend-item-head">
													<code>★ 核心插槽</code>
													<span className="uig-legend-tag is-featured">实战高频</span>
												</div>
												<p>官方和社区插件开发最推荐的黄金点位，具有独立的布局空间与高可靠生命周期。</p>
											</li>
											<li>
												<div className="uig-legend-item-head">
													<code>消息动作 / Agent 扩展 / 输入增强</code>
												</div>
												<p>直观标识具体业务领域（消息交互栏、模型思考流、输入坞、全局通知、常用配置等）。</p>
											</li>
										</ul>
									</div>
								</div>
							</div>
						)}

						<div className="uig-slots-grid">
							{filteredSlots.map(slot => (
								<div
									key={slot.key}
									className={`uig-slot-card ${slot.isFeatured ? 'is-featured' : ''} ${hoveredSlotKey === slot.key ? 'is-hovered-slot' : ''}`}
									onMouseEnter={() => setHoveredSlotKey(slot.key)}
									onMouseLeave={() => setHoveredSlotKey(null)}
								>
									<div className="uig-slot-card-header">
										<div className="uig-slot-title-group">
											<code className="uig-slot-key">{slot.key}</code>
											{slot.chineseName && (
												<span className="uig-slot-chinese">{slot.chineseName}</span>
											)}
										</div>
										<div className="uig-slot-meta-badges">
											{slot.badge && (
												<span
													className="uig-badge-star"
													title={`业务场景: ${slot.badge}（实战高频推荐点位）`}
												>
													<IconStar /> {slot.badge}
												</span>
											)}
											<span
												className={`uig-badge-scope is-${slot.scope}`}
												title={`生命周期作用域 Scope: ${slot.scope} — ${SCOPE_META[slot.scope]?.label || ''}（${SCOPE_META[slot.scope]?.desc || ''}）`}
											>
												{slot.scope}
											</span>
											<span
												className="uig-badge-kind"
												title={`挂载契约形态 Kind: ${slot.kind} — ${KIND_META[slot.kind]?.label || ''}（${KIND_META[slot.kind]?.desc || ''}）`}
											>
												{slot.kind}
											</span>
											<span
												className={`uig-badge-risk is-${slot.replaceRisk}`}
												title={`官方UI替换风险 Risk: ${slot.replaceRisk} — ${RISK_META[slot.replaceRisk]?.label || ''}（${RISK_META[slot.replaceRisk]?.desc || ''}）`}
											>
												risk: {slot.replaceRisk}
											</span>
										</div>
									</div>

									<div className="uig-slot-doc">
										<p className="uig-slot-summary">{slot.summary}</p>
										{slot.keyDomain && (
											<p className="uig-slot-domain"><strong>Key Domain:</strong> {slot.keyDomain}</p>
										)}
										{slot.tips && (
											<div className="uig-slot-tips">
												<span className="uig-tips-icon">
													<IconInfo /> 避坑提示：
												</span>
												<span>{slot.tips}</span>
											</div>
										)}
									</div>

									{slot.codeSnippet && (
										<div className="uig-slot-code-box">
											<div className="uig-code-header">
												<span>开箱即用注册模版</span>
												<button
													className="uig-copy-btn"
													onClick={() => handleCopy(slot.key, slot.codeSnippet)}
												>
													{copiedKey === slot.key ? (
														<>
															<IconCheck /> 已复制
														</>
													) : (
														<>
															<IconCopy /> 复制代码
														</>
													)}
												</button>
											</div>
											<pre className="uig-code-pre">
												<code>{slot.codeSnippet}</code>
											</pre>
										</div>
									)}
								</div>
							))}
						</div>
					</div>
				</main>
			</div>
		</section>
	)
}
