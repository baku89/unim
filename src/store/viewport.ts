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
		const shapes: Shape[] = []

		for (const selection of appState.selections) {
			if (selection.type === 'sequenceChar') {
				const {charIndex, gap} = selection

				const item = project.items[selection.index]

				if (item.type === 'glyphSequence' && !gap) {
					shapes.push({
						style: {fill: 'black'},
						path: item.glyphs[charIndex].path,
					})
				}
			}
		}

		if (appState.searchHoveredGlyph) {
			shapes.push({
				style: {fill: 'rgba(255, 0, 0, .5)'},
				path: appState.searchHoveredGlyph.path,
			})
		}

		return shapes
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
