import {useTweeq} from 'tweeq'

import {useSettings} from './settings'
import {APIResponse, GlyphInfo} from './store/api'
import {useAppStateStore} from './store/appState'
import {getGrapheme} from './util'

export function useAppActions() {
	const Tq = useTweeq()

	const settings = useSettings()
	const appState = useAppStateStore()

	Tq.actions.register([
		{
			id: 'insert_texts',
			bind: 'i',
			perform: async () => {
				const texts = prompt('Enter texts')

				if (!texts) return

				const chars = getGrapheme(texts).map(async char => {
					const url = `${settings.apiURL.value}/lookup?${new URLSearchParams({char})}`
					const res = await fetch(url)
					return res.json()
				})

				const reseponses: APIResponse<GlyphInfo>[] = await Promise.all(chars)

				const glyphs = reseponses
					.filter(res => res.status === 'success')
					.map(res => res.result)

				appState.insertGlyphInfos(glyphs)
			},
		},
	])
}
