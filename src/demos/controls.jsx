// 基础操作 + 选择切换演示。
import React from 'react'
import * as P from '@deepseek-ai/dsh-client-ui-primitives'
import { DemoCard } from './shared.jsx'

export function SectionControls() {
	const [on, setOn] = React.useState(true)
	const [checked, setChecked] = React.useState(false)
	const [draft, setDraft] = React.useState('排队中的消息草稿…')
	const [saved, setSaved] = React.useState('')
	const [isEditing, setIsEditing] = React.useState(false)

	return (
		<section id="uig-sec-controls">
			<h2 className="uig-section-title">基础操作</h2>
			<p className="uig-section-desc">Button / Switch / Checkbox / Input / InlineEditor —— 全部来自宿主 ui-primitives 实例。</p>

			<DemoCard name="Button" purpose="可点击操作；variant 选 primary / ghost / outline / toolbar，size 分 md(36px) / sm(28px)">
				<P.Button variant="primary">Primary</P.Button>
				<P.Button variant="ghost">Ghost（默认）</P.Button>
				<P.Button variant="outline">Outline</P.Button>
				<P.Button variant="toolbar">Toolbar</P.Button>
				<P.Button variant="primary" size="sm">Primary sm</P.Button>
				<P.Button variant="ghost" disabled>Disabled</P.Button>
			</DemoCard>

			<DemoCard name="Switch" purpose="36×20 双态开关；label 必填（无障碍名称），受控 checked + onChange">
				<P.Switch checked={on} onChange={setOn} label="自动同步" />
				<P.Switch checked={!on} onChange={() => setOn(v => !v)} label="桌面通知" />
				<P.Switch checked={false} onChange={() => {}} label="已禁用" disabled />
			</DemoCard>

			<DemoCard name="Checkbox" purpose="带标签的原生复选框；受控，支持键盘与禁用态">
				<P.Checkbox checked={checked} onChange={setChecked} label="我已阅读风险说明" />
				<P.Checkbox checked={false} onChange={() => {}} label="不可用项" disabled />
			</DemoCard>

			<DemoCard name="Input" purpose="单行文本输入（搜索框 / 行内表单）；原生属性透传">
				<P.Input placeholder="搜索组件…" aria-label="搜索组件" style={{ width: 220 }} />
				<P.Input placeholder="禁用态" disabled aria-label="禁用示例" style={{ width: 160 }} />
			</DemoCard>

			<DemoCard name="InlineEditor" purpose="自动聚焦多行行内编辑器：Enter 保存 / Shift+Enter 换行 / Esc 取消，最多六行后滚动（按需唤起）">
				<div className="uig-col" style={{ flex: 1, minWidth: 280 }}>
					{isEditing ? (
						<P.InlineEditor
							value={draft}
							label="消息草稿"
							onChange={setDraft}
							onSave={() => {
								setSaved(draft)
								setIsEditing(false)
							}}
							onCancel={() => setIsEditing(false)}
						/>
					) : (
						<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
							<span className="uig-what" style={{ fontSize: 13, color: 'var(--ink)' }}>
								{draft || '（空草稿）'}
							</span>
							<P.Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
								点击编辑草稿
							</P.Button>
						</div>
					)}
					<span className="uig-what">已保存：{saved || '（尚未保存）'}</span>
				</div>
			</DemoCard>
		</section>
	)
}

export function SectionSelection() {
	const [mode, setMode] = React.useState('list')
	const [tab, setTab] = React.useState('overview')
	const [pills, setPills] = React.useState(['draft'])

	const togglePill = id => setPills(list => list.includes(id) ? list.filter(x => x !== id) : [...list, id])

	return (
		<section id="uig-sec-selection">
			<h2 className="uig-section-title">选择切换</h2>
			<p className="uig-section-desc">SegmentedControl / SegmentedTabs / Pill / Tag —— 互斥模式切换与多选胶囊。</p>

			<DemoCard name="SegmentedControl" purpose="互斥模式 tablist（带滑动指示块 + 完整键盘走位）；面板由调用方渲染">
				<div className="uig-col" style={{ width: '100%' }}>
					<P.SegmentedControl
						id="uig-segc"
						label="视图模式"
						value={mode}
						onChange={setMode}
						options={[
							{ value: 'list', label: '列表' },
							{ value: 'grid', label: '网格' },
							{ value: 'tree', label: '树', disabled: true, title: '暂未开放' },
						]}
					/>
					<div id={`uig-segc-${mode}-panel`} role="tabpanel" aria-labelledby={`uig-segc-${mode}`} className="uig-what">
						当前面板：{mode}
					</div>
				</div>
			</DemoCard>

			<DemoCard name="SegmentedTabs" purpose="受控等宽分段标签（md 42px / sm 34px）；只渲染 tab 本体，面板归调用方">
				<div className="uig-col" style={{ width: '100%' }}>
					<P.SegmentedTabs
						label="详情分区"
						value={tab}
						onChange={setTab}
						items={[
							{ value: 'overview', label: '概览', id: 'uig-tab-overview', panelId: 'uig-panel-overview' },
							{ value: 'usage', label: '用量', id: 'uig-tab-usage', panelId: 'uig-panel-usage' },
							{ value: 'log', label: '日志', id: 'uig-tab-log', panelId: 'uig-panel-log' },
						]}
					/>
					<div id={`uig-panel-${tab}`} role="tabpanel" aria-labelledby={`uig-tab-${tab}`} className="uig-what">
						{tab} 面板内容
					</div>
				</div>
			</DemoCard>

			<DemoCard name="Pill" purpose="可选中胶囊按钮（视图切换 / 筛选器）；一排 Pill 是彼此独立的 chip">
				{['draft', 'published', 'archived'].map(id => (
					<P.Pill key={id} active={pills.includes(id)} onClick={() => togglePill(id)}>
						{id === 'draft' ? '草稿' : id === 'published' ? '已发布' : '归档'}
					</P.Pill>
				))}
			</DemoCard>

			<DemoCard name="Tag" purpose="只读胶囊徽章；tone 八种配色">
				<P.Tag>outline（默认）</P.Tag>
				<P.Tag tone="neutral">neutral</P.Tag>
				<P.Tag tone="quiet">quiet</P.Tag>
				<P.Tag tone="success">success</P.Tag>
				<P.Tag tone="warning">warning</P.Tag>
				<P.Tag tone="error">error</P.Tag>
				<P.Tag tone="info">info</P.Tag>
				<P.Tag tone="accent">accent</P.Tag>
			</DemoCard>
		</section>
	)
}
