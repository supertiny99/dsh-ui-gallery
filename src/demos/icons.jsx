// 图标与插画演示：产品图标成对（Regular 1.0 / Medium 1.3 线重）+ 品牌标识 + 权限/插件插画 + 文件类型。
import React from 'react'
import * as P from '@deepseek-ai/dsh-client-ui-primitives'
import { DemoCard } from './shared.jsx'

const ICON_SAMPLE = [
	['Search', P.IconSearchOutlineRegular, P.IconSearchOutlineMedium],
	['NewChat', P.IconNewChatOutlineRegular, P.IconNewChatOutlineMedium],
	['Layers', P.IconLayersOutlineRegular, P.IconLayersOutlineMedium],
	['Check', P.IconCheckOutlineRegular, P.IconCheckOutlineMedium],
	['Close', P.IconCloseOutlineRegular, P.IconCloseOutlineMedium],
	['Copy', P.IconCopyOutlineRegular, P.IconCopyOutlineMedium],
	['Edit', P.IconEditOutlineRegular, P.IconEditOutlineMedium],
	['Download', P.IconDownloadOutlineRegular, P.IconDownloadOutlineMedium],
	['Archive', P.IconArchiveOutlineRegular, P.IconArchiveOutlineMedium],
	['Code', P.IconCodeOutlineRegular, P.IconCodeOutlineMedium],
	['Clock', P.IconClockOutlineRegular, P.IconClockOutlineMedium],
	['Globe', P.IconGlobeOutlineRegular, P.IconGlobeOutlineMedium],
	['Ellipsis', P.IconEllipsisOutlineRegular, P.IconEllipsisOutlineMedium],
	['ChevronDown', P.IconChevronDownOutlineRegular, P.IconChevronDownOutlineMedium],
	['Branch', P.IconBranchOutlineRegular, P.IconBranchOutlineMedium],
	['Database', P.IconDatabaseOutlineRegular, P.IconDatabaseOutlineMedium],
].filter(([, regular, medium]) => regular != null && medium != null)

function IconPair({ label, Regular, Medium }) {
	return (
		<span className="uig-icon-cell" title={label}>
			<Regular size={20} />
			<Medium size={20} />
			<span className="uig-icon-name">{label}</span>
		</span>
	)
}

export function SectionIcons() {
	return (
		<section id="uig-sec-icons">
			<h2 className="uig-section-title">图标与插画</h2>
			<p className="uig-section-desc">
				产品图标共 83 基名 × 双线重（Regular 1 / Medium 1.3，随视口缩放）；下方为抽样。全量清单见官方 icons/index.tsx。
			</p>

			<DemoCard name="icons/*（抽样 16 对）" purpose="每格左 Regular 右 Medium；描边几何由组件库拥有，消费方 CSS 不覆盖" wide>
				<div className="uig-icon-grid">
					{ICON_SAMPLE.map(([label, Regular, Medium]) => <IconPair key={label} label={label} Regular={Regular} Medium={Medium} />)}
				</div>
			</DemoCard>

			<DemoCard name="FishLogo / BrandWordmark" purpose="品牌标识（Logo 与字标），填充品牌 slot">
				<span className="uig-chip"><P.FishLogo /></span>
				<span className="uig-chip"><P.BrandWordmark /></span>
			</DemoCard>

			<DemoCard name="PermissionIcon ×8" purpose="权限模式图形：只读 / 工作区写入 / 完全访问 / 自动审查，各双线重">
				{[
					['只读', P.PermissionIconReadOnlyRegular, P.PermissionIconReadOnlyMedium],
					['工作区写入', P.PermissionIconWorkspaceWriteRegular, P.PermissionIconWorkspaceWriteMedium],
					['完全访问', P.PermissionIconFullAccessRegular, P.PermissionIconFullAccessMedium],
					['自动审查', P.PermissionIconAutoReviewRegular, P.PermissionIconAutoReviewMedium],
				].map(([label, Regular, Medium]) => (
					<span key={label} className="uig-chip"><Regular size={18} /> {label} <Medium size={18} /></span>
				))}
			</DemoCard>

			<DemoCard name="PluginArtwork ×5" purpose="36×36 固定配色插件插画：Terminal / Loop / Subagent / Search / Default">
				<span className="uig-chip"><P.PluginArtworkTerminal /> Terminal</span>
				<span className="uig-chip"><P.PluginArtworkLoop /> Loop</span>
				<span className="uig-chip"><P.PluginArtworkSubagent /> Subagent</span>
				<span className="uig-chip"><P.PluginArtworkSearch /> Search</span>
				<span className="uig-chip"><P.PluginArtworkDefault /> Default</span>
			</DemoCard>

			<DemoCard name="GuideArtwork ×2" purpose="36×36 侧栏引导插画：Browser / Files">
				<span className="uig-chip"><P.GuideArtworkBrowser /> Browser</span>
				<span className="uig-chip"><P.GuideArtworkFiles /> Files</span>
			</DemoCard>

			<DemoCard name="FileTypeIcon / classifyFileType" purpose="28px 文件类型图形（48 个代码/配置类别 + 传统类别），按完整文件名分类" wide>
				{['client.jsx', 'build.mjs', 'gallery.css', 'README.md', 'package.json', 'photo.png', '数据表.xlsx', 'report.pdf', 'demo.mp4', '未知文件.xyz'].map(name => (
					<span key={name} className="uig-chip"><P.FileTypeIcon path={name} /> {name}</span>
				))}
			</DemoCard>

			<DemoCard name="ReferenceIcon / LinkIcon" purpose="引用分类图形（session/file/folder）与链接前置图形：kind = url/folder/code/image/document/other（classifyLinkPath 由路径推导）">
				<span className="uig-chip"><P.ReferenceIconRegular kind="session" size={18} /> session</span>
				<span className="uig-chip"><P.ReferenceIconRegular kind="file" size={18} /> file</span>
				<span className="uig-chip"><P.ReferenceIconRegular kind="folder" size={18} /> folder</span>
				<span className="uig-chip"><P.LinkIconMedium kind="url" size={16} /> url</span>
				<span className="uig-chip"><P.LinkIconMedium kind={P.classifyLinkPath('client.jsx')} size={16} /> classifyLinkPath('client.jsx')</span>
				<span className="uig-chip"><P.LinkIconMedium kind={P.classifyLinkPath('report.pdf')} size={16} /> pdf → document</span>
				<span className="uig-chip"><P.LinkIconMedium kind="other" size={16} /> other</span>
			</DemoCard>
		</section>
	)
}
