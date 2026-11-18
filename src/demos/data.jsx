// 状态指示与数据展示演示。
import React from 'react'
import * as P from '@deepseek-ai/dsh-client-ui-primitives'
import { DemoCard, has, HostMissing, jsonTreeLabels } from './shared.jsx'

const SAMPLE_JSON = {
	name: 'dsh-ui-gallery',
	version: '0.1.2',
	tags: ['dsh', 'gallery'],
	author: { name: 'supertiny99', url: 'https://github.com/supertiny99' },
	engines: { dsh: '>=0.2.1-rc.5 <0.3.0' },
	external: 11,
}

export function SectionData() {
	const [conn, setConn] = React.useState('connected')
	const [zoom, setZoom] = React.useState(1)
	const [zoomVisible, setZoomVisible] = React.useState(true)

	return (
		<section id="uig-sec-data">
			<h2 className="uig-section-title">状态与数据</h2>
			<p className="uig-section-desc">StateDot / ConnectionIndicator / ShortcutKeys / JsonTree / JsonBlock / PathLabel / CommandText / ZoomControls。</p>

			<DemoCard name="StateDot" purpose="状态圆点：done / warning / error / idle / ongoing(旋转) / step(勾)；全部 aria-hidden，名称由渲染点给">
				<span className="uig-chip"><P.StateDot state="done" /> done</span>
				<span className="uig-chip"><P.StateDot state="warning" /> warning</span>
				<span className="uig-chip"><P.StateDot state="error" /> error</span>
				<span className="uig-chip"><P.StateDot state="idle" /> idle</span>
				<span className="uig-chip"><P.StateDot state="ongoing" /> ongoing</span>
				<span className="uig-chip"><P.StateDot state="done" appearance="step" /> step·done</span>
				<span className="uig-chip"><P.StateDot state="idle" appearance="step" /> step·idle</span>
			</DemoCard>

			<DemoCard name="ConnectionIndicator" purpose="连接恢复控件：断线（可点击重连）/ 连接中 / 已恢复三态">
				{conn === 'disconnected' ? (
					<P.ConnectionIndicator state="disconnected"
						disconnectedLabel="连接已断开" connectingLabel="连接中…" recoveredLabel="已恢复连接"
						reconnectActionLabel="立即重连" restartActionLabel="重启应用"
						onReconnect={() => setConn('connecting')} />
				) : conn === 'connecting' ? (
					<P.ConnectionIndicator state="connecting"
						disconnectedLabel="连接已断开" connectingLabel="连接中…" recoveredLabel="已恢复连接"
						reconnectActionLabel="立即重连" restartActionLabel="重启应用"
						onReconnect={() => {}} />
				) : (
					<P.ConnectionIndicator state="recovered"
						disconnectedLabel="连接已断开" connectingLabel="连接中…" recoveredLabel="已恢复连接"
						reconnectActionLabel="立即重连" restartActionLabel="重启应用"
						onReconnect={() => {}} />
				)}
				<P.Button size="sm" variant="ghost" onClick={() => setConn(s =>
					s === 'disconnected' ? 'connecting' : s === 'connecting' ? 'recovered' : 'disconnected')}>
					切换状态
				</P.Button>
			</DemoCard>

			<DemoCard name="ShortcutKeys" purpose="键帽提示：plain 变体无方块键帽，tooltip 变体配深色气泡">
				<span className="uig-chip">复制 <P.ShortcutKeys keys={['Meta', 'C']} /></span>
				<span className="uig-chip">全局搜索 <P.ShortcutKeys keys={['Meta', 'P']} /></span>
				<span className="uig-chip">组合键 <P.ShortcutKeys keys={['Ctrl', '+', 'Shift', '+', 'K']} /></span>
			</DemoCard>

			<DemoCard name="JsonTree" purpose="只读 JSON 树：可折叠、行级右键复制菜单（值/路径/紧凑/格式化 JSON）" wide>
				<P.JsonTree data={SAMPLE_JSON} label="示例包描述" labels={jsonTreeLabels} />
			</DemoCard>

			<DemoCard name="JsonBlock" purpose="JSON 卡片（默认收起，点开显示格式化体）">
				<P.JsonBlock label="tool 输出" payload={{ ok: true, items: ['a', 'b'], count: 2 }} truncatedLabel={n => `已截断，共 ${n} 字符`} />
			</DemoCard>

			<DemoCard name="PathLabel" purpose="单行文件路径：目录弱化 / 文件名主色；溢出保尾部 + 左侧渐隐">
				<P.PathLabel path="/Users/supertiny/Myproject/dsh/plugin/ui-gallery/src/client.jsx" />
				<P.PathLabel path="packages/client/ui-primitives/src/Button.tsx" />
			</DemoCard>

			<DemoCard name="CommandText" purpose="可选中的命令文本；横向溢出时出现键盘聚焦目标">
				<P.CommandText text="pnpm add dsh-ui-gallery@latest --save-exact" label="安装命令" />
				<P.CommandText text="dsh --profile web --port 8080" label="启动命令" />
			</DemoCard>

			<DemoCard name="ZoomControls" purpose="悬浮文档缩放控件（含适配档位开关）">
				{!has('ZoomControls') ? <HostMissing name="ZoomControls" /> : null}
				{has('ZoomControls') && <div style={{ position: 'relative', minHeight: 120, width: '100%' }}>
					<div className="uig-what" style={{ padding: '12px 0' }}>宿主文档查看器的悬浮缩放条（visible 受控演示）</div>
					<P.ZoomControls
						zoom={zoom}
						visible={zoomVisible}
						labels={{
							controls: '缩放控制', menu: '缩放比例',
							out: '缩小', into: '放大',
							value: percent => `${percent}%`,
						}}
						fit={{ label: '适配宽度', selected: zoom === 1, onSelect: () => setZoom(1) }}
						onZoom={setZoom}
						onActiveChange={() => {}}
					/>
					<P.Button size="sm" variant="ghost" onClick={() => setZoomVisible(v => !v)}>切换可见性</P.Button>
				</div>}
			</DemoCard>
		</section>
	)
}
