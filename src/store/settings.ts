import {vec2} from 'linearly'
import {defineStore} from 'pinia'
import {useTweeq} from 'tweeq'
import {ref} from 'vue'

export const useSettingsStore = defineStore('settings', () => {
	const Tq = useTweeq()

	const apiURL = Tq.config.ref('apiURL', 'https://baku89.com/unim/api/v1')

	const position = ref<vec2>([0, 0])
	const rotation = ref(0)
	const scale = ref(100)

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
		position,
		rotation,
		scale,
	}
})
