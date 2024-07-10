import {useTweeq} from 'tweeq'

import {useProjectStore} from './store/project'

export function useSettings() {
	const Tq = useTweeq()
	const project = useProjectStore()

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
						frameRate: project.frameRate,
					},
					{
						apiURL: {label: 'API URL', type: 'string'},
						frameRate: {label: 'Frame Rate', type: 'number'},
					},
					{
						title: 'Settings',
					}
				)

				if (!result) return

				apiURL.value = result.apiURL
				project.frameRate = result.frameRate
			},
		},
	])

	return {
		apiURL,
	}
}
