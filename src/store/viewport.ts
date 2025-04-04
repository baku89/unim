import {mat2d, scalar} from 'linearly'
import {defineStore} from 'pinia'
import {useTweeq} from 'tweeq'
import {computed, ref, shallowRef} from 'vue'

import {useAppStateStore} from './appState'
import {useProjectStore} from './project'

interface Style {
	stroke?: string
	fill?: string
	opacity?: number
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

	const onionskinCount = ref<[prevCount: number, nextCount: number]>([0, 2])
	const showOnionskin = ref(false)

	Tq.actions.register([
		{
			id: 'toggle_onionskin',
			icon: 'fluent-emoji-high-contrast:onion',
			bind: 'o',
			perform() {
				showOnionskin.value = !showOnionskin.value
			},
		},
	])

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

					if (!appState.isPlaying && showOnionskin.value) {
						for (let i = 0; i < onionskinCount.value[0]; i++) {
							const index = scalar.mod(charIndex - i - 1, item.glyphs.length)
							const opacity = (1 - i / onionskinCount.value[0]) ** 1.2

							shapes.push({
								style: {
									stroke: `rgba(0, 0, 255, ${opacity})`,
								},
								path: item.glyphs[index].path,
							})
						}
						for (let i = 0; i < onionskinCount.value[1]; i++) {
							const index = scalar.mod(charIndex + i + 1, item.glyphs.length)
							const opacity = (1 - i / onionskinCount.value[1]) ** 1.2

							shapes.push({
								style: {
									stroke: `rgba(255, 0, 0, ${opacity})`,
								},
								path: item.glyphs[index].path,
							})
						}
					}
				}
			}
		}

		shapes.push(
			...appState.hoveredGlyphs.map(glyph => ({
				style: {fill: '#ff0000', opacity: 0.5},
				path: glyph.path,
			}))
		)

		return shapes
	})

	const shapes = computed(() => {
		return [...selectedShapes.value]
	})

	Tq.actions.register([
		{
			id: 'viewport',
			icon: 'material-symbols:preview',
			children: [
				{
					id: 'fit_viewport',
					bind: 'h',
					icon: 'mdi:fit-to-screen',
					perform() {
						transform.value = 'fit'
					},
				},
			],
		},
	])

	return {
		transform,
		shapes,
		onionskinCount,
		showOnionskin,
	}
})
