// dsh-ui-gallery host 半：纯静态插件——无存储、无配置。
// 唯一职责：/ui-gallery/* 前缀下的版本探针端点（宿主 node 进程内解析官方包 package.json 与原生 App 元数据）。
import { createRequire } from 'node:module'
import { existsSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'

export const name = 'dsh-ui-gallery'

const require = createRequire(import.meta.url)

/** 探测桌面客户端原生 App Bundle（macOS Info.plist 等）版本 */
function detectAppBundleVersion() {
	try {
		const macPaths = [
			process.execPath ? join(dirname(dirname(process.execPath)), 'Info.plist') : null,
			'/Applications/DeepSeek Harness.app/Contents/Info.plist',
		].filter(Boolean)

		for (const p of macPaths) {
			if (existsSync(p)) {
				const content = readFileSync(p, 'utf8')
				const match = content.match(/<key>CFBundleShortVersionString<\/key>[\s\n]*<string>([^<]+)<\/string>/i)
				if (match && match[1]) {
					return match[1].trim()
				}
			}
		}
	} catch {}
	return null
}

/** 解析一个宿主安装包的版本；exports 不暴露 package.json 或包缺失时返回 null。 */
function pkgVersion(spec) {
	try {
		return require(spec + '/package.json')?.version ?? null
	} catch {
		return null
	}
}

/**
 * 从一个已知可解析的官方包位置出发解析另一个包——pnpm 隔离布局下，
 * 插件包只能看见自己声明的依赖；官方包之间的传递依赖（如 ui-primitives）
 * 要借 bundle 直接依赖（dsh / dsh-base / web-app）的解析位置做跳板。
 */
function pkgVersionFrom(spec, viaSpec) {
	try {
		const viaPath = require.resolve(viaSpec + '/package.json')
		return createRequire(viaPath)(spec + '/package.json')?.version ?? null
	} catch {
		return null
	}
}

/** 链式解析：直接 → 借各 bundle 跳板 */
function resolveVersion(spec) {
	return pkgVersion(spec)
		?? pkgVersionFrom(spec, '@deepseek-ai/dsh')
		?? pkgVersionFrom(spec, '@deepseek-ai/dsh-base')
		?? pkgVersionFrom(spec, '@deepseek-ai/dsh-web-app')
}

// 宿主批版本候选：CLI 聚合包 → base 组合包；组件库版本单独探测（组件可用性的判定基准）
const DSH_CANDIDATES = ['@deepseek-ai/dsh', '@deepseek-ai/dsh-base']

function hostVersions() {
	// 多层动态探测：环境变量 -> App Bundle 清单 -> 模块链式解析
	const envVer = process.env.DSH_CLIENT_VERSION || process.env.DSH_VERSION
	const bundleVer = detectAppBundleVersion()
	const dsh = envVer ?? bundleVer ?? DSH_CANDIDATES.map(pkgVersion).find(v => v != null)
	const uiPrimitives = resolveVersion('@deepseek-ai/dsh-client-ui-primitives') ?? dsh
	const dockkit = resolveVersion('@deepseek-ai/dsh-client-ui-dockkit') ?? dsh
	return { dsh, uiPrimitives, dockkit }
}

export default {
	inject: ['webServer'],
	apply(ctx) {
		ctx.effect(() => ctx.webServer.register({
			kind: 'prefix',
			path: '/ui-gallery',
			handler: (req, res) => {
				// prefix 路由下 req.url 仍是完整路径，须先剥前缀再匹配（media-desk/zw 同款）
				const path = new URL(req.url || '/', 'http://local').pathname.replace(/^\/ui-gallery\/?/, '')
				if (path !== 'version') {
					res.statusCode = 404
					res.setHeader('content-type', 'application/json; charset=utf-8')
					res.end(JSON.stringify({ ok: false, error: 'not found' }))
					return
				}
				res.statusCode = 200
				res.setHeader('content-type', 'application/json; charset=utf-8')
				res.setHeader('cache-control', 'no-store')
				res.end(JSON.stringify({ ok: true, ...hostVersions() }))
			},
		}), 'dsh-ui-gallery: /ui-gallery/version')
	},
}
