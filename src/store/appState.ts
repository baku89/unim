import {whenever} from '@vueuse/core'
import {uniqueId} from 'lodash'
import {defineStore} from 'pinia'
import {useTweeq} from 'tweeq'
import {ref, watch} from 'vue'

import {parseAEKeyframe} from '@/AEKeyframes'
import {GlyphInfo, infoToGlyph} from '@/store/api'

import {useProjectStore} from './project'

type Selection =
	| {
			type: 'items'
			indices: Set<number>
	  }
	| {
			type: 'sequenceChar'
			itemIndex: number
			charIndex: number
			gap: boolean
	  }

export const useAppStateStore = defineStore('appState', () => {
	const project = useProjectStore()

	const selection = ref<Selection | null>(null)

	const Tq = useTweeq()

	const isPlaying = ref(false)

	watch(selection, (selection, prevSelection) => {
		if (!selection || selection.type === 'items') {
			isPlaying.value = false
		}

		if (selection?.type === 'sequenceChar') {
			if (prevSelection?.type === 'sequenceChar') {
				if (selection.itemIndex !== prevSelection.itemIndex) {
					isPlaying.value = false
				}
			}
		}
	})

	// Play/pause
	whenever(isPlaying, () => {
		if (selection.value?.type !== 'sequenceChar') {
			isPlaying.value = false
			return
		}

		const fps = project.frameRate

		const {itemIndex} = selection.value
		let {charIndex} = selection.value

		const item = project.items[selection.value.itemIndex]

		if (item.type !== 'glyphSequence') {
			isPlaying.value = false
			return
		}

		const {glyphs} = item

		function update() {
			if (!isPlaying.value) return

			charIndex = (charIndex + 1) % glyphs.length

			selection.value = {
				type: 'sequenceChar',
				itemIndex,
				charIndex,
				gap: false,
			}

			setTimeout(update, (1000 / fps) * glyphs[charIndex].duration)
		}

		setTimeout(update, (1000 / fps) * glyphs[charIndex].duration)
	})

	function offsetSelection(offset: number) {
		if (selection.value?.type === 'sequenceChar') {
			const item = project.items[selection.value.itemIndex]
			if (item.type === 'glyphSequence') {
				selection.value.charIndex =
					(selection.value.charIndex + offset + item.glyphs.length) %
					item.glyphs.length
			}
		}
	}

	function offsetSelectedGlyphsDuration(offset: number) {
		if (selection.value?.type === 'items') {
			for (const index of selection.value.indices) {
				const item = project.items[index]
				if (item?.type === 'glyphSequence') {
					for (const glyph of item.glyphs) {
						glyph.duration = Math.max(1, glyph.duration + offset)
					}
				}
			}
		} else if (selection.value?.type === 'sequenceChar') {
			const item = project.items[selection.value.itemIndex]
			if (item.type === 'glyphSequence') {
				const glyph = item.glyphs[selection.value.charIndex]
				glyph.duration = Math.max(1, glyph.duration + offset)
			}
		}
	}

	Tq.actions.register([
		{
			id: 'deselect',
			bind: 'esc',
			perform() {
				selection.value = null
			},
		},
		{
			id: 'delete_selected',
			bind: 'backspace',
			perform() {
				if (selection.value?.type === 'items') {
					const indices = selection.value.indices
					project.items = project.items.filter((_, i) => !indices.has(i))
				} else if (
					selection.value?.type === 'sequenceChar' &&
					!selection.value.gap
				) {
					const item = project.items[selection.value.itemIndex]
					if (item.type === 'glyphSequence') {
						item.glyphs.splice(selection.value.charIndex, 1)
					}
				}

				selection.value = null
			},
		},
		{
			id: 'toggle_play',
			icon: 'mdi:play',
			bind: ['space'],
			perform() {
				if (selection.value?.type === 'items') {
					selection.value = {
						type: 'sequenceChar',
						itemIndex: [...selection.value.indices][0],
						charIndex: 0,
						gap: false,
					}
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

		if (selection.value?.type === 'items') {
			for (const index of selection.value.indices) {
				const item = project.items[index]
				if (item?.type === 'glyphSequence') {
					item.glyphs.push(...glyphs)
				}
			}
		} else if (selection.value?.type === 'sequenceChar') {
			const {charIndex, gap} = selection.value
			const item = project.items[selection.value.itemIndex]
			if (item?.type !== 'glyphSequence') return
			const insertIndex = charIndex + (gap ? 0 : 1)
			item.glyphs.splice(insertIndex, 0, ...glyphs)
			selection.value.charIndex = insertIndex + glyphs.length - 1
		} else {
			const itemIndex =
				project.items.push({
					type: 'glyphSequence',
					id: 'seq_' + uniqueId(),
					color: Tq.theme.colorAccent,
					position: [100, 100],
					glyphs: glyphs,
				}) - 1

			selection.value = {
				type: 'items',
				indices: new Set([itemIndex]),
			}
		}
	}

	return {
		selection,
		isPlaying,
		insertGlyphInfos,
	}
})
