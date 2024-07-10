import {whenever} from '@vueuse/core'
import {mat2d, scalar, vec2} from 'linearly'
import {uniqueId} from 'lodash'
import {defineStore} from 'pinia'
import {useTweeq} from 'tweeq'
import {computed, ref} from 'vue'

import {encodeAEKeyframe, parseAEKeyframe} from '@/AEKeyframes'
import {GlyphInfo, toGlyph, useAPIStore} from '@/store/api'

import {Glyph, useProjectStore} from './project'

type Selection =
	| {
			type: 'item'
			index: number
	  }
	| {
			type: 'sequenceChar'
			index: number
			charIndex: number
			gap: boolean
	  }

export const useAppStateStore = defineStore('appState', () => {
	const Tq = useTweeq()
	const project = useProjectStore()
	const api = useAPIStore()

	const selections = ref<Selection[]>([])

	const itemInsertPosition = ref<vec2>(vec2.zero)

	const selectedGlyphs = computed<Glyph[]>(() => {
		return selections.value.flatMap(sel => {
			if (sel.type === 'item') {
				const item = project.items[sel.index]
				if (item.type === 'glyphSequence') {
					return item.glyphs
				}
			} else if (sel.type === 'sequenceChar') {
				const item = project.items[sel.index]
				if (item.type === 'glyphSequence' && !sel.gap) {
					return [item.glyphs[sel.charIndex]]
				}
			}
			return []
		})
	})

	const copiedGlyphs = ref<{
		aeKeyframeData: string
		glyphs: Glyph[]
	} | null>(null)

	const hoveredGlyphs = ref<(GlyphInfo | Glyph)[]>([])

	const isPlaying = ref(false)

	// Play/pause
	whenever(isPlaying, () => {
		if (selections.value.length === 0) {
			isPlaying.value = false
			return
		}

		const selection = selections.value[0]

		if (selection.type !== 'sequenceChar') {
			isPlaying.value = false
			return
		}

		const {index} = selection
		let {charIndex} = selection

		const item = project.items[index]

		if (item.type !== 'glyphSequence') {
			isPlaying.value = false
			return
		}

		const {glyphs} = item

		function update() {
			if (!isPlaying.value) return

			charIndex = (charIndex + 1) % glyphs.length

			selections.value = [
				{
					type: 'sequenceChar',
					index,
					charIndex,
					gap: false,
				},
			]

			setTimeout(
				update,
				(1000 / project.frameRate) * glyphs[charIndex].duration
			)
		}

		setTimeout(update, (1000 / project.frameRate) * glyphs[charIndex].duration)
	})

	function offsetSelection(offset: number) {
		for (const selection of selections.value) {
			if (selection.type === 'sequenceChar') {
				const item = project.items[selection.index]
				if (item.type === 'glyphSequence') {
					selection.charIndex = scalar.mod(
						selection.charIndex + offset,
						item.glyphs.length
					)
				}
			}
		}
	}

	function offsetSelectedGlyphsDuration(offset: number) {
		for (const selection of selections.value) {
			if (selection.type === 'item') {
				const item = project.items[selection.index]
				if (item?.type === 'glyphSequence') {
					for (const glyph of item.glyphs) {
						glyph.duration = Math.max(1, glyph.duration + offset)
					}
				}
			} else if (selection.type === 'sequenceChar') {
				const item = project.items[selection.index]
				if (item.type === 'glyphSequence') {
					const glyph = item.glyphs[selection.charIndex]
					glyph.duration = Math.max(1, glyph.duration + offset)
				}
			}
		}
	}

	function swapSelectedGlyph(offset: number) {
		const sel = selections.value[0]
		if (sel?.type !== 'sequenceChar') {
			return
		}

		const {index, charIndex} = sel
		const item = project.items[index]
		if (item.type === 'glyphSequence') {
			const nextIndex = scalar.mod(charIndex + offset, item.glyphs.length)

			const [a, b] = [item.glyphs[charIndex], item.glyphs[nextIndex]]

			item.glyphs[charIndex] = b
			item.glyphs[nextIndex] = a
			selections.value = [
				{
					type: 'sequenceChar',
					index,
					charIndex: nextIndex,
					gap: false,
				},
			]
		}
	}

	Tq.actions.register([
		{
			id: 'deselect',
			bind: 'esc',
			perform() {
				selections.value = []
			},
		},
		{
			id: 'delete',
			bind: 'backspace',
			perform() {
				let nextSelection: Selection[] = []

				if (selections.value.length === 1) {
					const sel = selections.value[0]
					if (sel.type === 'sequenceChar' && !sel.gap) {
						const {index, charIndex} = sel
						const item = project.items[index]

						if (item.type === 'glyphSequence' && item.glyphs.length > 1) {
							const nextCharIndex = Math.min(charIndex, item.glyphs.length - 2)
							nextSelection = [
								{
									type: 'sequenceChar',
									index,
									charIndex: nextCharIndex,
									gap: false,
								},
							]
						}
					}
				}

				// Sort selections by index in descending order
				const sels = selections.value.slice().sort((a, b) => {
					if (a.type === 'sequenceChar' && b.type === 'sequenceChar') {
						if (a.index === b.index) {
							return b.charIndex - a.charIndex
						}
					}
					return b.index - a.index
				})

				for (const selection of sels) {
					if (selection.type === 'item') {
						project.items.splice(selection.index, 1)
						selections.value = []
					} else if (selection.type === 'sequenceChar' && !selection.gap) {
						const item = project.items[selection.index]
						if (item.type === 'glyphSequence') {
							item.glyphs.splice(selection.charIndex, 1)
							if (item.glyphs.length === 0) {
								project.items.splice(selection.index, 1)
								selections.value = []
							}
						}
					}
				}

				selections.value = nextSelection
			},
		},
		{
			id: 'toggle_play',
			icon: 'mdi:play',
			bind: ['space'],
			perform() {
				if (selections.value[0]?.type === 'item') {
					selections.value = [
						{
							type: 'sequenceChar',
							index: selections.value[0].index,
							charIndex: 0,
							gap: false,
						},
					]
				}
				isPlaying.value = !isPlaying.value
			},
		},
		{
			id: 'next_frame',
			bind: ['right', 'f'],
			perform() {
				offsetSelection(1)
			},
		},
		{
			id: 'prev_frame',
			bind: ['left', 'd'],
			perform() {
				offsetSelection(-1)
			},
		},
		{
			id: 'swap_selected_foward',
			bind: 'command+f',
			perform() {
				swapSelectedGlyph(1)
			},
		},
		{
			id: 'swap_selected_backward',
			bind: 'command+d',
			perform() {
				swapSelectedGlyph(-1)
			},
		},
		{
			id: 'edit',
			children: [
				{
					id: 'copy',
					bind: 'command+c',
					icon: 'ic:baseline-copy-all',
					perform: async () => {
						const keyframes = selectedGlyphs.value.map((g, frame) => ({
							frame,
							values: [g.index / 24],
						}))

						const aeKeyframeData = encodeAEKeyframe({
							frameRate: project.frameRate,
							compSize: [1000, 1000],
							sourcePixelAspectRatio: 1,
							compPixelAspectRatio: 1,
							layers: [
								{
									name: 'Layer',
									properties: [
										{
											type: 'Time Remap',
											name: '',
											keyframes,
										},
									],
								},
							],
						})

						await navigator.clipboard.writeText(aeKeyframeData)

						// deep clone the selected glyphs
						const glyphs = JSON.parse(JSON.stringify(selectedGlyphs.value))

						copiedGlyphs.value = {
							aeKeyframeData,
							glyphs,
						}
					},
				},
				{
					id: 'cut',
					bind: 'command+x',
					icon: 'ic:baseline-content-cut',
					perform: async () => {
						await Tq.actions.perform('copy')
						await Tq.actions.perform('delete')
					},
				},
				{
					id: 'paste',
					bind: 'command+v',
					icon: 'ic:baseline-content-paste',
					perform: async () => {
						const clipboard = await navigator.clipboard.readText()

						if (copiedGlyphs.value) {
							if (clipboard === copiedGlyphs.value.aeKeyframeData) {
								insertGlyphs(copiedGlyphs.value.glyphs)
							}
						} else if (clipboard.startsWith('Adobe After Effects')) {
							const aeKeyframeData = parseAEKeyframe(clipboard)

							const layer = aeKeyframeData.layers[0]

							const keyframes = layer.properties.flatMap(p => p.keyframes)
							const minFrame = Math.min(...keyframes.map(k => k.frame))
							const maxFrame = Math.max(...keyframes.map(k => k.frame))

							const frames = Array(maxFrame - minFrame + 1)
								.fill(null)
								.map(
									() =>
										({
											index: null,
											position: null,
											scale: null,
										}) as {
											index: number | null
											position: vec2 | null
											scale: number | null
										}
								)

							for (const prop of layer.properties) {
								if (prop.type === 'Time Remap') {
									for (const keyframe of prop.keyframes) {
										const frame = frames[keyframe.frame - minFrame]
										frame.index = Math.round(keyframe.values[0] * 24)
									}
								}
							}

							let index = 0,
								position: vec2 = [0, 0],
								scale = 1

							for (let f = 0; f < frames.length; f++) {
								const frame = frames[f] ?? {
									index: null,
									position: null,
									scale: null,
								}

								if (frame.index === null) {
									frame.index = index
								}
								if (frame.position === null) {
									frame.position = position
								}
								if (frame.scale === null) {
									frame.scale = scale
								}

								index = frame.index
								position = frame.position
								scale = frame.scale
							}

							const glyphs: Glyph[] = []
							let lastFrame = 0

							for (let f = 0; f <= frames.length; f++) {
								const frame = frames[f] ?? {
									index: null,
									position: null,
									scale: null,
								}
								const prevFrame = frames[Math.max(0, f - 1)]

								if (
									frame.index !== prevFrame.index ||
									!frame.position ||
									!prevFrame.position ||
									!vec2.eq(frame.position, prevFrame.position) ||
									frame.scale !== prevFrame.scale
								) {
									const duration = f - lastFrame
									const transform = mat2d.fromTRS(position, 0, scale)
									const info = await api.lookup({index: prevFrame.index!})

									if (info.status !== 'success') {
										throw new Error('Failed to lookup glyph')
									}

									const glyph = toGlyph({
										...info.result,
										transform,
										duration,
									})

									glyphs.push(glyph)

									lastFrame = f
								}
							}

							insertGlyphs(glyphs)
						}
					},
				},
			],
		},
		{
			id: 'increase_duration',
			bind: ['command+up', 'e'],
			perform() {
				offsetSelectedGlyphsDuration(1)
			},
		},
		{
			id: 'decrease_duration',
			bind: ['command+down', 's'],
			perform() {
				offsetSelectedGlyphsDuration(-1)
			},
		},
		{
			id: 'paste-keyframes',
			bind: ['command+shift+v'],
			perform: async () => {
				const clipboard = await navigator.clipboard.readText()

				const {
					layers: [layer],
				} = parseAEKeyframe(clipboard)

				const timeRemap = layer.properties.find(
					p => p.type === 'Time Remap'
				)?.keyframes

				if (!timeRemap) return
			},
		},
	])

	// Actions
	function insertGlyphs(glyphInfos: (Glyph | GlyphInfo)[]) {
		const glyphs = glyphInfos.map(toGlyph)

		const firstSel = selections.value[0]

		if (firstSel) {
			if (firstSel.type === 'item') {
				const item = project.items[firstSel.index]
				if (item?.type === 'glyphSequence') {
					item.glyphs.push(...glyphs)
				}
			} else if (firstSel.type === 'sequenceChar') {
				const {charIndex, index, gap} = firstSel
				const item = project.items[index]
				if (item?.type !== 'glyphSequence') return
				const insertIndex = charIndex + (gap ? 0 : 1)
				item.glyphs.splice(insertIndex, 0, ...glyphs)
				firstSel.charIndex = insertIndex + glyphs.length - 1
			}
		} else {
			// No selection
			const itemCount = project.items.push({
				type: 'glyphSequence',
				id: 'seq_' + uniqueId(),
				color: Tq.theme.colorAccent,
				position: itemInsertPosition.value,
				glyphs: glyphs,
			})

			selections.value = [
				{
					type: 'item',
					index: itemCount - 1,
				},
			]
		}
	}

	return {
		selections,
		isPlaying,
		insertGlyphs,
		itemInsertPosition,
		hoveredGlyphs,
	}
})
