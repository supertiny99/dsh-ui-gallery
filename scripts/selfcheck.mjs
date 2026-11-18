// 本地模拟宿主加载：用假 __ModuleLoader__ + 假共享模块执行 dist/client.js，
// 捕获包装层错误（如 "module is not defined"）并核验插件导出面。
// 背景：2026-11-10 首版 banner 漏定义 module/exports，desktop 实装即崩——
// external 路径在真实宿主外无法完全验证，但包装错误可以。
import { readFile } from 'node:fs/promises'

const SHARED = [
	'react', 'react/jsx-runtime', 'react-dom', 'react-dom/client',
	'@deepseek-ai/cordis', 'zod', '@tanstack/react-virtual',
	'@deepseek-ai/dsh-client-store', '@deepseek-ai/dsh-client-ui-slots',
	'@deepseek-ai/dsh-client-ui-primitives', '@deepseek-ai/dsh-client-ui-dockkit',
]

// 最小 React stub：画廊 client 只用 createElement/useState/useRef（esbuild jsxFactory）
const reactStub = {
	createElement: (...args) => ({ args }),
	Fragment: 'fragment',
	Component: class Component {},
	useState: (v) => [typeof v === 'function' ? v() : v, () => {}],
	useRef: (v) => ({ current: v }),
	useEffect: () => {},
}
const primitivesStub = new Proxy({}, { get: (t, key) => key === '__esModule' ? true : reactStub.createElement })

const fakeRequire = (spec) => {
	if (!SHARED.includes(spec)) throw new Error('unexpected require: ' + spec)
	if (spec === 'react' || spec === 'react/jsx-runtime') return reactStub
	if (spec === '@deepseek-ai/dsh-client-ui-primitives') return primitivesStub
	return {}
}

let registered = null
const fakeLoader = { load: (entry) => { registered = entry } }
const window = { __ModuleLoader__: fakeLoader }

const source = await readFile('dist/client.js', 'utf8')
// 用 window/require 作用域执行产物（严格模拟宿主 factory 调用面）
const run = new Function('window', 'require', `"use strict";\n${source}`)
run(window, fakeRequire)

const failures = []
if (!registered) failures.push('产物未调用 __ModuleLoader__.load 注册')
if (registered && registered.id !== '@supertiny99/dsh-ui-gallery') {
	failures.push(`ModuleLoader 注册 id 错误: 期望 "@supertiny99/dsh-ui-gallery"，实际 "${registered.id}"`)
}
const exports = registered?.factory(fakeRequire)
if (!exports || typeof exports.apply !== 'function') failures.push('factory 未返回 { apply }（module.exports 链断裂？）')
if (exports && !Array.isArray(exports.inject)) failures.push('缺少 inject 声明（应为 [\'slots\']）')

if (failures.length) {
	console.error('selfcheck FAIL:\n  ' + failures.join('\n  '))
	process.exit(1)
}
console.log(`selfcheck OK — load 注册 ✓ / factory 执行 ✓ / 导出 apply+inject${exports.name ? '+name' : ''} ✓ / external require 面: ${SHARED.length} specifier`)
