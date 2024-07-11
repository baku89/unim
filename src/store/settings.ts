import { defineStore } from 'pinia'
import {useTweeq} from 'tweeq'

export const useSettingsStore = defineStore('settings', () => {
	const Tq = useTweeq()

	const apiURL = Tq.config.ref('apiURL', 'http://localhost:8123')

	Tq.actions.register([
		{
			id: 'settings',
			icon: 'mdi:settings',
			bind: 'command+,',
			async perform() {
				const result = await Tq.modal.prompt(
					{
						apiURL: apiURL.value,
					},
					{
						apiURL: {label: 'API URL', type: 'string'},
					},
					{
						title: 'Settings',
					}
				)

				if (!result) return

				apiURL.value = result.apiURL
			},
		},
	])

	return {
		apiURL,
	}
})
