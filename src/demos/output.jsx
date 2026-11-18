// Agent 输出块 + 消息与引用演示（mock 数据）。
import React from 'react'
import * as P from '@deepseek-ai/dsh-client-ui-primitives'
import { DemoCard, has, HostMissing, markdownLabels, toolbarLabels } from './shared.jsx'

const termLabels = {
	commandLine: n => `命令第 ${n} 行`,
	signal: s => `被信号 ${s} 终止`,
	exitCode: c => `退出码 ${c}`,
	noExitCode: '无退出码',
	running: '运行中', failed: '失败', done: '完成',
	copy: '复制', copied: '已复制', noOutput: '（无输出）',
	collapseAria: '收起', collapse: '收起',
	expandAria: n => `展开另外 ${n} 行`, expand: n => `展开 ${n} 行`,
}

const blockLabels = {
	...toolbarLabels,
	copy: '复制', copied: '已复制',
	collapseAria: '收起', collapse: '收起',
	expandAria: n => `展开另外 ${n} 行`, expand: n => `展开 ${n} 行`,
}

const searchLabels = {
	pathsSummary: (shown, total) => `共 ${total} 个路径`,
	matchesSummary: (shown, total, files) => `${files} 个文件 · ${total} 处匹配`,
	copy: '复制', copied: '已复制', noResults: '无匹配',
	collapseAria: '收起', collapse: '收起',
	expandAria: n => `展开另外 ${n} 行`, expand: n => `展开 ${n} 行`,
}

const webLabels = {
	noResults: '无结果', sourcesTruncated: '来源已截断', http: 'HTTP',
	contentTruncated: '内容已截断',
	markdown: markdownLabels,
}

export function SectionOutput() {
	return (
		<section id="uig-sec-output">
			<h2 className="uig-section-title">Agent 输出块</h2>
			<p className="uig-section-desc">工具结果卡片家族：Terminal / Read / Diff / Search / Web / Code / Markdown / DetailDocument。</p>

			<DemoCard name="TerminalBlock" purpose="shell 工具结果：命令行 + 状态 pill（退出码/信号）+ 可折叠输出" wide>
				<P.TerminalBlock
					command="pnpm run build"
					cwd="/Users/supertiny/Myproject/dsh/plugin/ui-gallery"
					home="/Users/supertiny"
					output={'> dsh-ui-gallery@0.1.2 build\n> node scripts/build.mjs\n\ndist/client.js 9.3 KB\nexternal check: OK — 冻结模块表未内嵌\nselfcheck OK'}
					exitCode={0}
					labels={termLabels}
				/>
			</DemoCard>

			<DemoCard name="ReadBlock" purpose="文件读取结果：行号槽 + 惰性语法高亮 + 窗口计数" wide>
				<P.ReadBlock
					label="scripts/build.mjs"
					labels={{ ...blockLabels, window: (shown, total) => `显示 ${shown} / ${total} 行` }}
					lang="js"
					lines={[
						{ number: 1, text: "import { build } from 'esbuild'" },
						{ number: 2, text: "const HOST_SHARED = ['react', '@deepseek-ai/cordis', '@deepseek-ai/dsh-client-ui-primitives']" },
						{ number: 3, text: "await build({ entryPoints: ['src/client.jsx'], external: HOST_SHARED, format: 'cjs' })" },
						{ number: 4, text: "console.log('dist/client.js built')" },
					]}
					totalLines={4}
				/>
			</DemoCard>

			<DemoCard name="DiffBlock" purpose="编辑结果卡片：diffTotals 汇总 + 折叠 + 高亮" wide>
				<P.DiffBlock
					labels={blockLabels}
					diffs={[{
						path: 'src/client.jsx',
						oldText: "const P = null\n// TODO: import primitives",
						newText: "const P = require('@deepseek-ai/dsh-client-ui-primitives')\n// external: 宿主冻结模块表提供实例",
					}]}
				/>
			</DemoCard>

			<DemoCard name="SearchBlock" purpose="内容搜索结果：按文件分组（可折叠）或纯路径列表两种形态" wide>
				<P.SearchBlock
					kind="matches"
					labels={searchLabels}
					total={3}
					truncated={false}
					files={[
						{ path: 'src/client.jsx', matches: [
							{ lineNumber: 8, line: "const P = require('@deepseek-ai/dsh-client-ui-primitives')" },
							{ lineNumber: 12, line: "ctx.slots.register({ name: 'main', key: PANEL_ID }, Gallery)" },
						] },
						{ path: 'src/demos/shared.jsx', matches: [
							{ lineNumber: 5, line: "export function DemoCard({ name, purpose, children })" },
						] },
					]}
				/>
			</DemoCard>

			<DemoCard name="WebBlock" purpose="web 工具结果：search（答案+来源列表）与 fetch（URL+状态码）两形态" wide>
				<div className="uig-col" style={{ width: '100%', gap: 14 }}>
					<P.WebBlock
						kind="search"
						labels={webLabels}
						truncated={false}
						answer="DeepSeek Harness（dsh）是 DeepSeek 开源的 agent harness，一切皆插件架构，由 Cordis 驱动。"
						sources={[
							{ url: 'https://github.com/deepseek-ai/deepseek-harness', title: 'deepseek-ai/deepseek-harness', snippet: 'Everything is a plugin, powered by Cordis.' },
							{ url: 'https://deepseek-harness.github.io/deepseek-harness/', title: 'DeepSeek Harness 文档', snippet: '开发者预览版文档站。' },
						]}
					/>
					<P.WebBlock kind="fetch" labels={webLabels} url="https://github.com/deepseek-ai/deepseek-harness" statusCode={200} truncated={false} />
				</div>
			</DemoCard>

			<DemoCard name="CodeBlock" purpose="独立代码卡片：shiki 惰性高亮 + 行号开关 + 复制工具栏" wide>
				<P.CodeBlock
					lang="ts"
					code={"const PLATFORM_MODULES = [\n  'react', '@deepseek-ai/cordis',\n  '@deepseek-ai/dsh-client-ui-primitives',\n] as const"}
					copyLabel="复制" copiedLabel="已复制" toolbarLabels={toolbarLabels} lineNumbers
				/>
			</DemoCard>

			<DemoCard name="MarkdownText" purpose="不可信 GFM + TeX 数学渲染；委托方控制外部链接" wide>
				<P.MarkdownText
					text={'**冻结模块表**（frozen module table）：宿主启动时注入插件加载器的共享模块集合。\n\n- 同一 `React` 实例，无 hooks 报错\n- 主题 token `--dsw-*` 自动适配\n- 包体零成本\n\n行内公式 $E=mc^2$，块级：\n\n$$\\int_0^1 x^2\\,dx = \\tfrac{1}{3}$$'}
					labels={markdownLabels}
				/>
			</DemoCard>

			<DemoCard name="DetailDocument" purpose="长 Markdown 描述区块：加载骨架 / 正文（超高分区内滚动）/ 失败重试 / 空" wide>
				{!has('DetailDocument') ? <HostMissing name="DetailDocument" /> : (
					<P.DetailDocument
						state={{ status: 'found', markdown: '## 插件介绍\n\n这是 DetailDocument 的演示文档。超过 `min(560px, 60vh)` 的高度会在可键盘聚焦的分区内滚动；原始 HTML 会被省略。' }}
						labels={{ title: '插件详情', loading: '加载中', retry: '重试', markdown: markdownLabels }}
						onRetry={() => {}}
					/>
				)}
			</DemoCard>
		</section>
	)
}

export function SectionMessages() {
	return (
		<section id="uig-sec-messages">
			<h2 className="uig-section-title">消息与引用</h2>
			<p className="uig-section-desc">UserMessageBubble / UserTextRun / ReferenceChip / QuotePreview —— 对话流内的文本件。</p>

			<DemoCard name="UserMessageBubble" purpose="用户消息气泡壳：背景/圆角/内边距/换行规则；行对齐与内容由调用方拥有" wide>
				{!has('UserMessageBubble') ? <HostMissing name="UserMessageBubble" /> : (
					<P.UserMessageBubble style={{ maxWidth: 420 }}>
						帮我把官方组件整理成一个画廊插件，界面里活体展示可继承的组件。
					</P.UserMessageBubble>
				)}
			</DemoCard>

			<DemoCard name="UserTextRun / ReferenceChip" purpose="行内文本 run 与已解析引用 chip（file / folder / skill / command 形态）">
				<div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
					<P.UserTextRun text="打开 " />
					<P.ReferenceChip appearance="file" label="client.jsx" title="/src/client.jsx" onActivate={() => {}} />
					<P.UserTextRun text=" 里的 " />
					<P.ReferenceChip appearance="folder" label="demos/" title="/src/demos" onActivate={() => {}} />
					<P.UserTextRun text=" 再跑 " />
					<P.ReferenceChip appearance="command" label="/build" title="构建插件" onActivate={() => {}} />
					<P.UserTextRun text="，或者用技能 " />
					<P.ReferenceChip appearance="skill" label="pm-chg-flow" title="变更管理技能" onActivate={() => {}} />
				</div>
			</DemoCard>

			<DemoCard name="QuotePreview" purpose="引用消息预览：单行截断 + 可选移除动作" wide>
				{!has('QuotePreview') ? <HostMissing name="QuotePreview" /> : (
					<P.QuotePreview
						text="在 dsh 插件体系中，什么样的 UI 库更合适，是自己开发还是继承于 dsh？"
						removal={{ label: '移除引用', onRemove: () => {} }}
					/>
				)}
			</DemoCard>
		</section>
	)
}
