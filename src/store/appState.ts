import {whenever} from '@vueuse/core'
import {uniqueId} from 'lodash'
import {defineStore} from 'pinia'
import {useTweeq} from 'tweeq'
import {ref} from 'vue'

import {parseAEKeyframe} from '@/AEKeyframes'
import {GlyphInfo, infoToGlyph} from '@/store/api'

import {useProjectStore} from './project'

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
	const project = useProjectStore()

	const selections = ref<Selection[]>([])

	const Tq = useTweeq()

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

		const fps = project.frameRate

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

			setTimeout(update, (1000 / fps) * glyphs[charIndex].duration)
		}

		setTimeout(update, (1000 / fps) * glyphs[charIndex].duration)
	})

	function offsetSelection(offset: number) {
		for (const selection of selections.value) {
			if (selection.type === 'sequenceChar') {
				const item = project.items[selection.index]
				if (item.type === 'glyphSequence') {
					selection.charIndex =
						(selection.charIndex + offset + item.glyphs.length) %
						item.glyphs.length
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

	Tq.actions.register([
		{
			id: 'deselect',
			bind: 'esc',
			perform() {
				selections.value = []
			},
		},
		{
			id: 'delete_selected',
			bind: 'backspace',
			perform() {
				let nextSelection: Selection[] = []

				if (selections.value.length === 1) {
					const sel = selections.value[0]
					if (sel.type === 'sequenceChar' && !sel.gap) {
						const {index, charIndex} = sel
						const item = project.items[index]

						if (item.type === 'glyphSequence') {
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
			bind: ['command+right', 'f'],
			perform() {
				offsetSelection(1)
			},
		},
		{
			id: 'prev_frame',
			bind: ['command+left', 'd'],
			perform() {
				offsetSelection(-1)
			},
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

				console.log('paste keyframes=', timeRemap)
			},
		},
	])

	// Actions
	function insertGlyphInfos(glyphInfos: GlyphInfo[]) {
		const glyphs = glyphInfos.map(infoToGlyph)

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
				position: [100, 100],
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
		insertGlyphInfos,
	}
})
