// 演示卡容器与共享文案构造器。
import React from 'react'
import * as P from '@deepseek-ai/dsh-client-ui-primitives'

/** 组件是否在当前宿主的冻结模块表中（宿主按自身版本提供组件，0.2.2 新增件在旧宿主为 undefined） */
export const has = name => P[name] != null

/** 能力检测降级占位：宿主升级后自动变活体 */
export function HostMissing({ name }) {
	return (
		<span className="uig-what">
			当前宿主的 ui-primitives 尚未提供 {name}（0.2.2+ 引入；宿主升级后此处自动变为活体演示）。
		</span>
	)
}

export function DemoCard({ name, purpose, children, wide }) {
	return (
		<div className={'uig-card' + (wide ? ' uig-card-wide' : '')}>
			<div className="uig-card-head">
				<span className="uig-card-name">{name}</span>
				<span className="uig-card-purpose">{purpose}</span>
			</div>
			<div className={wide ? 'uig-demo uig-demo-wide' : 'uig-demo'}>{children}</div>
		</div>
	)
}

/** 代码工具栏三件套（CodeToolbarLabels） */
export const toolbarLabels = {
	codeLabel: '源码',
	wrapLabel: '自动换行',
	unwrapLabel: '保持列宽',
}

/** Markdown 渲染标签（MarkdownLabels） */
export const markdownLabels = {
	code: { copyLabel: '复制', copiedLabel: '已复制', toolbarLabels },
	footnotes: '脚注',
}

/** JsonTree 标签全集 */
export const jsonTreeLabels = {
	copyValue: '复制值',
	copyJson: '复制 JSON',
	copyPath: '复制路径',
	copyPrettyJson: '复制格式化 JSON',
	copyCompactJson: '复制紧凑 JSON',
	copied: '已复制',
	copyFailed: '复制失败',
	collapseNode: '收起',
	expandNode: '展开',
	copyButtonTitle: action => action,
}
