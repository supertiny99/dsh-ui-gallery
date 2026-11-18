// 浮层与菜单演示（AC3 交互件：Modal / Toast / Menu / Tooltip 全在此）。
import React from 'react'
import * as P from '@deepseek-ai/dsh-client-ui-primitives'
import { DemoCard } from './shared.jsx'

// data-URI SVG：零网络依赖的演示图
const SAMPLE_IMG = 'data:image/svg+xml;utf8,' + encodeURIComponent(
	'<svg xmlns="http://www.w3.org/2000/svg" width="480" height="270"><rect width="480" height="270" fill="#2b3440"/><circle cx="240" cy="135" r="80" fill="#7ea6d8"/><text x="240" y="142" font-size="20" fill="#fff" text-anchor="middle" font-family="sans-serif">sample image</text></svg>')

export function SectionOverlays() {
	const [modalOpen, setModalOpen] = React.useState(false)
	const [riskOpen, setRiskOpen] = React.useState(false)
	const [riskAck, setRiskAck] = React.useState(false)
	const [toast, setToast] = React.useState(null)
	const [toastSeq, setToastSeq] = React.useState(0)
	const [menuOpen, setMenuOpen] = React.useState(false)
	const [picked, setPicked] = React.useState('')
	const [lightboxOpen, setLightboxOpen] = React.useState(false)

	const fireToast = () => { setToastSeq(n => n + 1); setToast(`已刷新 · ${new Date().toLocaleTimeString('zh-CN')}`) }

	return (
		<section id="uig-sec-overlays">
			<h2 className="uig-section-title">浮层与菜单</h2>
			<p className="uig-section-desc">Modal / RiskConfirmation / Toast / Tooltip / HoverCard / ImageLightbox / Menu 家族 —— 全部可交互。</p>

			<DemoCard name="Modal" purpose="遮罩之上居中对话框；Esc 关闭 + 焦点恢复，与设置外壳共用模态层">
				<P.Button variant="primary" onClick={() => setModalOpen(true)}>打开 Modal</P.Button>
				<P.Modal
					open={modalOpen}
					onClose={() => setModalOpen(false)}
					title="确认操作"
					closeLabel="关闭"
					description="这是一个来自 ui-primitives 的演示对话框。"
					footer={<P.Button variant="primary" onClick={() => setModalOpen(false)}>知道了</P.Button>}
				>
					<p>正文内容：模态遮罩不模糊背景（主题 --dsw-mask-blur: none），圆角与投影走主题 token。</p>
				</P.Modal>
			</DemoCard>

			<DemoCard name="RiskConfirmation" purpose="敏感操作确认：勾选承认后才允许确认，共用警告标题布局">
				<P.Button variant="outline" onClick={() => { setRiskOpen(true); setRiskAck(false) }}>发起敏感操作</P.Button>
				<P.RiskConfirmation
					open={riskOpen}
					title="删除全部会话记录"
					description="此操作不可撤销，将删除当前工作区的全部会话历史。"
					acknowledgeLabel="我理解此操作不可撤销"
					cancelLabel="取消"
					closeLabel="关闭"
					confirmLabel="永久删除"
					acknowledged={riskAck}
					onAcknowledgedChange={setRiskAck}
					onCancel={() => setRiskOpen(false)}
					onConfirm={() => { setRiskOpen(false); fireToast() }}
				/>
			</DemoCard>

			<DemoCard name="Toast" purpose="顶部居中瞬时横幅；holdMs 控制停留，onDone 归还后卸载">
				<P.Button onClick={fireToast}>弹出 Toast</P.Button>
				{toast && (
					<P.Toast key={toastSeq} text={toast} holdMs={2600} onDone={() => setToast(null)}
						actions={[{ label: '撤销', onClick: () => setToast(null) }]} />
				)}
			</DemoCard>

			<DemoCard name="Tooltip" purpose="悬停 / 键盘聚焦提示；portal 可防裁剪，shortcutKeys 变体显示键帽">
				<P.Tooltip label="刷新插件列表（演示提示）" side="top">
					<P.Button variant="ghost">悬停我</P.Button>
				</P.Tooltip>
				<P.Tooltip label="保存" shortcutKeys={['Meta', 'S']} side="top">
					<P.Button variant="ghost">带快捷键提示</P.Button>
				</P.Tooltip>
			</DemoCard>

			<DemoCard name="HoverCard" purpose="可阅读的悬停预览；指针宽限期允许跨过间隙，可带复制按钮">
				<P.HoverCard
					anchor={<P.Button variant="outline">悬停预览</P.Button>}
					content={<div style={{ maxWidth: 260 }}>
						<strong>deepseek-harness</strong>
						<p style={{ margin: '6px 0 0' }}>一切皆插件的 agent harness，由 Cordis 驱动。悬停卡片支持复制按钮与键盘聚焦。</p>
					</div>}
					copyText="deepseek-harness"
					copyLabel="复制"
					copiedLabel="已复制"
				/>
			</DemoCard>

			<DemoCard name="ImageLightbox" purpose="共享图片浮层；Esc 关闭 + 焦点恢复">
				<P.Button variant="outline" onClick={() => setLightboxOpen(true)}>打开图片浮层</P.Button>
				{lightboxOpen && (
					<P.ImageLightbox
						src={SAMPLE_IMG}
						alt="演示图片"
						labels={{ close: '关闭' }}
						onClose={() => setLightboxOpen(false)}
					/>
				)}
			</DemoCard>

			<DemoCard name="Menu / MenuItemButton" purpose="下拉菜单：items 数据行 + children 组件行 + 嵌套子菜单；↑↓ 走位 / Esc 逐级退出">
				<P.Menu
					open={menuOpen}
					onClose={() => setMenuOpen(false)}
					onSelect={id => { setPicked(id); setMenuOpen(false) }}
					selectedId={picked || 'open'}
					anchor={<P.Button variant="outline" onClick={() => setMenuOpen(v => !v)}>打开菜单</P.Button>}
					submenuBackLabel="返回"
					items={[
						{ id: 'open', label: '打开工作区' },
						{ id: 'reveal', label: '在 Finder 中显示', shortcut: { keys: ['Meta', 'O'] } },
						{ type: 'separator' },
						{ id: 'export', label: '导出', submenu: [
							{ id: 'export-md', label: 'Markdown' },
							{ id: 'export-pdf', label: 'PDF' },
						] },
						{ id: 'locked', label: '未解锁项', disabled: true },
						{ id: 'delete', label: '删除', danger: true },
					]}
				>
					<P.MenuItemButton separatorBefore onClick={() => { setPicked('component-row'); setMenuOpen(false) }}>
						组件行（MenuItemButton）
					</P.MenuItemButton>
				</P.Menu>
				<span className="uig-what">最近选择：{picked || '（无）'}</span>
			</DemoCard>

			<DemoCard name="MenuSurface / MenuGroup" purpose="MenuSurface 自定义菜单容器（共享菜单材质）；MenuGroup 提供本地化分组与吸顶标题">
				<div style={{ minWidth: 240 }}>
					<P.MenuSurface>
						<P.MenuGroup label="视图">
							<P.MenuItemButton current>组件画廊</P.MenuItemButton>
							<P.MenuItemButton>插件列表</P.MenuItemButton>
						</P.MenuGroup>
						<P.MenuGroup label="操作">
							<P.MenuItemButton shortcut={{ keys: ['Meta', 'R'] }}>刷新</P.MenuItemButton>
						</P.MenuGroup>
					</P.MenuSurface>
				</div>
			</DemoCard>
		</section>
	)
}
