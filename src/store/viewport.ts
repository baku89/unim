import {mat2d} from 'linearly'
import {defineStore} from 'pinia'
import {useTweeq} from 'tweeq'
import {computed, shallowRef} from 'vue'

import {useAppStateStore} from './appState'
import {useProjectStore} from './project'

interface Style {
	stroke?: string
	fill?: string
}

interface Shape {
	path: string
	style: Style
}

export const useViewportStore = defineStore('viewport', () => {
	const Tq = useTweeq()
	const project = useProjectStore()
	const appState = useAppStateStore()

	const transform = shallowRef<mat2d | 'fit'>('fit')

	const selectedShapes = computed<Shape[]>(() => {
		if (appState.selection?.type === 'sequenceChar') {
			const {charIndex, gap} = appState.selection

			const item = project.items[appState.selection.itemIndex]

			if (item.type === 'glyphSequence' && !gap) {
				return [
					{
						style: {fill: 'black'},
						path: item.glyphs[charIndex].path,
					},
				]
			}
		}

		return []
	})

	const shapes = computed(() => {
		return [...selectedShapes.value]
	})

	Tq.actions.register([
		{
			id: 'fit_viewport',
			bind: 'h',
			perform() {
				transform.value = 'fit'
			},
		},
	])

	return {
		transform,
		shapes,
	}
})
