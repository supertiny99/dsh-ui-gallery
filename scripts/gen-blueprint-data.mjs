// 从官方 raw-git 提取 slot-catalog 并生成结构化紧凑的 blueprint-data.js
import fs from 'node:fs';
import path from 'node:path';

const sourceFile = '/Users/supertiny/Myproject/dsh/raw-git/deepseek-harness/packages/extensions/cordis-client-runner/src/client/slot-catalog.ts';
const targetFile = '/Users/supertiny/Myproject/dsh/plugin/ui-gallery/src/demos/blueprint-data.js';

if (!fs.existsSync(sourceFile)) {
  console.error('Source file not found:', sourceFile);
  process.exit(1);
}

const content = fs.readFileSync(sourceFile, 'utf8');
const chunks = content.split(/\{\s*key:\s*'/).slice(1);

const FEATURED_CONFIGS = {
  'sidebar.panellist': {
    chineseName: '侧边栏插件图标入口',
    badge: '核心入口',
    tips: '推荐 order 避开 50(zcode), 60(gallery), 65(launcher), 70(guardian)。图标建议采用 18x18 SVG，stroke="currentColor"。',
    codeSnippet: `// 注册左侧栏图标入口
ctx.slots.inject('sidebar.panellist', () =>
  ctx.slots.register(
    { name: 'sidebar.panellist', id: 'my-plugin', order: 80, label: '我的插件' },
    PanelIcon
  )
)`
  },
  'main': {
    chineseName: '整页工作台主面板',
    badge: '核心画布',
    tips: '必须与 sidebar.panellist 的 id 一致（即 key: "my-plugin"）。建议根节点用 ErrorBoundary 隔离，防止单一插件 crash 导致主屏白屏。',
    codeSnippet: `// 注册整页工作台（与侧边栏 id 配对）
ctx.slots.inject('main', () =>
  ctx.slots.register(
    { name: 'main', key: 'my-plugin' },
    MyMainPanel
  )
)`
  },
  'settings.section': {
    chineseName: '设置中心自定义分区',
    badge: '常用配置',
    tips: '无缝嵌入官方设置中心。最轻量，适合仅需要用户配置 Token / 偏好设置的插件。',
    codeSnippet: `// 注册设置中心分区
ctx.slots.inject('settings.section', () =>
  ctx.slots.register(
    { name: 'settings.section', id: 'my-plugin-settings', order: 40, label: '我的插件设置' },
    SettingsComponent
  )
)`
  },
  'conversation.chat.assistant-actions': {
    chineseName: 'AI 助手回复底部操作栏',
    badge: '消息动作',
    tips: '挂载在每条已完成的助手回复底部（与复制、重新生成并列）。接受 message props，可用于一键导出、评注或发送到第三方服务。',
    codeSnippet: `// 助手消息操作扩展
ctx.slots.inject('conversation.chat.assistant-actions', () =>
  ctx.slots.register(
    { name: 'conversation.chat.assistant-actions', id: 'export-action' },
    ({ message }) => (
      <button onClick={() => handleExport(message)} className="dsh-action-btn">
        导出笔记
      </button>
    )
  )
)`
  },
  'conversation.chat.commandview': {
    chineseName: '工具调用与命令执行卡',
    badge: 'Agent 扩展',
    tips: '根据工具名称 key 匹配，自定义 tool call / execution 的呈现方式（替代默认终端灰盒）。',
    codeSnippet: `// 自定义工具执行视觉卡片
ctx.slots.inject('conversation.chat.commandview', () =>
  ctx.slots.register(
    { name: 'conversation.chat.commandview', key: 'my_custom_tool' },
    CustomToolRenderer
  )
)`
  },
  'conversation.composer.dock': {
    chineseName: '输入框底部工具坞',
    badge: '输入增强',
    tips: '位于输入框下方。若需弹出浮层/菜单，请使用 React Portal 渲染到 document.body，避免被输入容器裁切。',
    codeSnippet: `// 输入框底部扩展按钮/标签
ctx.slots.inject('conversation.composer.dock', () =>
  ctx.slots.register(
    { name: 'conversation.composer.dock', id: 'prompt-presets' },
    PromptPresetBar
  )
)`
  },
  'rightbar': {
    chineseName: '右侧辅助抽屉（全局）',
    badge: '辅助抽屉',
    tips: '与主会话并排工作，基于 DockKit 支持拖拽调节宽度。适合终端监控、日志看板、文档检查器等伴随视图。',
    codeSnippet: `// 注册右侧辅助抽屉
ctx.slots.inject('rightbar', () =>
  ctx.slots.register(
    { name: 'rightbar', key: 'my-drawer' },
    RightbarDrawerComponent
  )
)`
  },
  'workspace.toast': {
    chineseName: '全局 Toast 通知层',
    badge: '全局通知',
    tips: '全局非模态提示，提供给需要跨视图给用户弹出轻量反馈的场景。',
    codeSnippet: `// 注册自定义全局通知管道
ctx.slots.inject('workspace.toast', () =>
  ctx.slots.register({ name: 'workspace.toast' }, ToastHost)
)`
  }
};

function determineRegion(key) {
  if (key.startsWith('sidebar.')) return 'sidebar';
  if (key === 'main' || key.startsWith('main.')) return 'main';
  if (key.startsWith('conversation.')) return 'conversation';
  if (key.startsWith('rightbar') || key.startsWith('deliverables.')) return 'rightbar';
  if (key.startsWith('settings.')) return 'settings';
  if (key.startsWith('tool.')) return 'tool';
  if (key.startsWith('plugins.')) return 'plugins';
  if (key.startsWith('shell.') || key === 'root' || key.startsWith('workspace.')) return 'shell';
  if (key.startsWith('contextMenu.')) return 'contextMenu';
  return 'other';
}

const entries = chunks.map(chunk => {
  const key = chunk.match(/^([^']+)'/)?.[1] || '';
  const kind = chunk.match(/kind:\s*'([^']+)'/)?.[1] || 'single';
  const scope = chunk.match(/scope:\s*'([^']+)'/)?.[1] || 'root';
  const summary = chunk.match(/summary:\s*'([^']*)'/)?.[1] || '';
  const doc = chunk.match(/doc:\s*'([^']*)'/)?.[1] || '';
  const replaceRisk = chunk.match(/replaceRisk:\s*'([^']*)'/)?.[1] || 'safe';
  const keyDomain = chunk.match(/keyDomain:\s*'([^']*)'/)?.[1] || '';

  const feat = FEATURED_CONFIGS[key];
  const region = determineRegion(key);

  return {
    key,
    kind,
    scope,
    region,
    summary,
    doc,
    replaceRisk,
    keyDomain,
    isFeatured: !!feat,
    chineseName: feat?.chineseName || '',
    badge: feat?.badge || '',
    tips: feat?.tips || '',
    codeSnippet: feat?.codeSnippet || ''
  };
});

const output = `/**
 * DSH 官方 112 个 Slot 契约元数据（编译期紧凑数据包）
 * 自动生成自 packages/extensions/cordis-client-runner/src/client/slot-catalog.ts
 */

export const BOX_REGIONS = [
  { id: 'all', name: '全部插槽', count: ${entries.length}, desc: '112 个全量编译期契约座位' },
  { id: 'featured', name: '常用推荐', count: ${Object.keys(FEATURED_CONFIGS).length}, desc: '第三方插件实战最高频、经过验证的黄金挂载点' },
  { id: 'sidebar', name: '左侧边栏 (Sidebar)', count: ${entries.filter(e => e.region === 'sidebar').length}, desc: '品牌区、面板切换图标栏、会话历史流、底栏' },
  { id: 'main', name: '主舞台 (Main)', count: ${entries.filter(e => e.region === 'main').length}, desc: '整页工作台面板与会话全屏容器' },
  { id: 'conversation', name: '会话与输入坞 (Chat)', count: ${entries.filter(e => e.region === 'conversation').length}, desc: '消息流、用户/助手气泡、思维链、工具卡片、输入坞' },
  { id: 'rightbar', name: '右侧辅助栏 (Rightbar)', count: ${entries.filter(e => e.region === 'rightbar').length}, desc: '右侧伴随抽屉：终端、浏览器、文档预览、审查' },
  { id: 'settings', name: '设置中心 (Settings)', count: ${entries.filter(e => e.region === 'settings').length}, desc: '全局偏好与插件配置分区' },
  { id: 'shell', name: '全局壳层 (Shell/Root)', count: ${entries.filter(e => e.region === 'shell').length}, desc: '全局遮罩、状态浮标、全局通知 Toast' },
  { id: 'tool', name: '工具动作 (Tools)', count: ${entries.filter(e => e.region === 'tool').length}, desc: '工具调用结果与图像渲染扩展' },
  { id: 'plugins', name: '插件管理 (Plugins)', count: ${entries.filter(e => e.region === 'plugins').length}, desc: '官方插件管理器内部操作与详情扩展' },
];

export const SLOTS_DATA = ${JSON.stringify(entries, null, 2)};
`;

fs.writeFileSync(targetFile, output, 'utf8');
console.log('Successfully generated blueprint-data.js with ' + entries.length + ' entries.');
