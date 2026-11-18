// 把 src/client.jsx 打包成 DSH 的 lazy CommonJS 模块：冻结模块表全部留给宿主提供，
// CSS 内联成字符串（React 树内 <style> 注入）。metafile 落盘供 AC5 核验（external 是否生效）。
import { build, context } from 'esbuild'
import { writeFile } from 'node:fs/promises'

// 宿主冻结模块表（官方 packages/client/web/src/platform.ts PLATFORM_MODULES，0.2.x 实证）。
// 第三方插件的 externals 只应取自这份清单——照抄本文件即可。
const HOST_SHARED = [
	'react',
	'react/jsx-runtime',
	'react-dom',
	'react-dom/client',
	'@deepseek-ai/cordis',
	'zod',
	'@tanstack/react-virtual',
	'@deepseek-ai/dsh-client-store',
	'@deepseek-ai/dsh-client-ui-slots',
	'@deepseek-ai/dsh-client-ui-primitives',
	'@deepseek-ai/dsh-client-ui-dockkit',
]

const options = {
	entryPoints: ['src/client.jsx'],
	outfile: 'dist/client.js',
	bundle: true,
	format: 'cjs',
	platform: 'browser',
	target: 'chrome120',
	jsx: 'transform',
	jsxFactory: 'React.createElement',
	jsxFragment: 'React.Fragment',
	external: HOST_SHARED,
	loader: { '.css': 'text' },
	minify: !process.argv.includes('--watch'),
	legalComments: 'none',
	metafile: true,
	// banner 必须预定义 module/exports（esbuild CJS 入口包装会引用它们），
	// footer 返回 module.exports 作为插件导出——dsh-media-desk 同款约定。
	// 漏掉这步 = 宿主加载即抛 "module is not defined"（2026-11-10 desktop 实装翻车实证）。
	banner: { js: 'window.__ModuleLoader__.load({id:"@supertiny99/dsh-ui-gallery",factory:(require)=>{const module={exports:{}};const exports=module.exports;' },
	footer: { js: 'return module.exports}})' },
}

if (process.argv.includes('--watch')) {
	const ctx = await context(options)
	await ctx.watch()
	console.log('watching src/')
} else {
	const result = await build(options)
	await writeFile('dist/meta.json', JSON.stringify(result.metafile, null, '\t'))
	const size = Object.values(result.metafile.outputs).find(o => o.bytes != null)
	const bundled = Object.entries(result.metafile.inputs).filter(([path]) =>
		HOST_SHARED.some(spec => path.startsWith(spec)) || path === 'react' || path.startsWith('react-dom'))
	console.log(`dist/client.js ${(size.bytes / 1024).toFixed(1)} KB`)
	console.log(bundled.length === 0
		? 'external check: OK — 冻结模块表未内嵌'
		: `external check: FAIL — 内嵌了 ${bundled.map(([p]) => p).join(', ')}`)
}
