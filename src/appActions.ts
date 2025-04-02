import {useTweeq} from 'tweeq'

import {APIResponse, GlyphInfo} from './store/api'
import {useAppStateStore} from './store/appState'
import {useSettingsStore} from './store/settings'
import {getGrapheme} from './util'

export function useAppActions() {
	const Tq = useTweeq()

	const settings = useSettingsStore()
	const appState = useAppStateStore()

	Tq.actions.register([
		{
			id: 'insert_texts',
			bind: 'i',
			icon: 'material-symbols:abc',
			perform: async () => {
				const texts = prompt('Enter texts')

				if (!texts) return

				const chars = getGrapheme(texts).map(async char => {
					const url = `${settings.apiURL}/lookup?${new URLSearchParams({char})}`
					const res = await fetch(url)
					return res.json()
				})

				const reseponses: APIResponse<GlyphInfo>[] = await Promise.all(chars)

				const glyphs = reseponses
					.filter(res => res.status === 'success')
					.map(res => res.result)

				appState.insertGlyphs(glyphs)
			},
		},
	])
}
