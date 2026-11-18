// 设置表单演示（mock：本地暂存模型，不接真实 settings scope）。
import React from 'react'
import * as P from '@deepseek-ai/dsh-client-ui-primitives'
import { DemoCard } from './shared.jsx'

function useDraftField(initial) {
	const [text, setText] = React.useState(initial)
	const [overridden, setOverridden] = React.useState(false)
	return {
		field: {
			id: 'uig-' + initial,
			label: '示例字段',
			hint: '改动后暂存，点保存才生效（mock）',
			text,
			overridden,
			invalid: false,
			overriddenLabel: '已覆盖',
			resetLabel: '重置',
			invalidLabel: '值无效',
			disabled: false,
			onEdit: v => { setText(v); setOverridden(true) },
			onReset: () => { setText(initial); setOverridden(false) },
		},
		reset: () => { setText(initial); setOverridden(false) },
	}
}

export function SectionForms() {
	const name = useDraftField('组件画廊')
	const refresh = useDraftField('30')
	const secretConfigured = React.useState(true)[0]
	const [formState, setFormState] = React.useState({ available: true, writable: true, dirty: false, invalid: false, saving: false, failed: false })
	const touch = next => setFormState(s => ({ ...s, ...next, dirty: true }))

	return (
		<section id="uig-sec-forms">
			<h2 className="uig-section-title">设置表单</h2>
			<p className="uig-section-desc">官方插件设置页框架：SettingsForm 只在点保存时落盘，卸载即丢弃；密文字段每次为空、只报是否已配置。（本页为 mock 暂存模型演示）</p>

			<DemoCard name="SettingsForm + SettingsValueField" purpose="表单框架（保存按钮统一在 footer）+ 值字段（覆盖徽标 / 重置 / 校验态）" wide>
				<P.SettingsForm
					state={formState}
					labels={{
						unavailable: '设置不可用', readOnly: '只读模式',
						save: '保存', saveFailed: '保存失败', discard: '放弃',
					}}
					onSave={() => { setFormState(s => ({ ...s, saving: false, dirty: false })); }}
					onDiscard={() => { name.reset(); refresh.reset(); setFormState(s => ({ ...s, dirty: false })) }}
				>
					<SettingsRow>
						<P.SettingsValueField {...name.field} label="面板名称" placeholder="给画廊起个名字" />
					</SettingsRow>
					<SettingsRow>
						<P.SettingsValueField {...refresh.field} label="刷新间隔（秒）" numeric hint="15–3600 之间的整数" placeholder="30" />
					</SettingsRow>
				</P.SettingsForm>
			</DemoCard>

			<DemoCard name="SettingsSecretField" purpose="密钥字段：输入框每次为空、不自动填充；旁边徽标只报是否已配置" wide>
				<P.SettingsSecretField
					id="uig-api-key"
					label="API Key"
					hint="仅保存在本机 profile"
					text=""
					disabled={false}
					configured={secretConfigured}
					stateLabel={secretConfigured ? '已配置' : '未配置'}
					onEdit={() => {}}
				/>
			</DemoCard>
		</section>
	)
}

function SettingsRow({ children }) {
	return <div style={{ padding: '8px 0', borderBottom: '0.5px solid var(--line)' }}>{children}</div>
}
