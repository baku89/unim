<script setup lang="ts">
import {useTweeq} from 'tweeq'
import {computed, ref} from 'vue'

import GlyphSearchResult from '@/components/GlyphSearchResult.vue'
import {useAPIStore} from '@/store/api'
import {useAppStateStore} from '@/store/appState'

const api = useAPIStore()

const Tq = useTweeq()
const appState = useAppStateStore()

const filterBy = ref<'code' | 'phash' | 'cnn' | 'name'>('code')

const glyphs = computed(() => {
	if (!api.result) return []

	if (filterBy.value === 'code') {
		return [
			...api.result.code.before,
			{...api.result.original, original: true},
			...api.result.code.after,
		]
	} else if (filterBy.value === 'phash') {
		return [{...api.result.original, original: true}, ...api.result.phash]
	} else if (filterBy.value === 'name') {
		return [{...api.result.original, original: true}, ...api.result.name]
	} else {
		return [{...api.result.original, original: true}, ...api.result.cnn]
	}
})

// Tq.actions.register([
// 	{
// 		id: 'searchByImage',
// 		label: 'Search by Image',
// 		icon: 'mdi:image-search',
// 		perform: async () => {
// 			// Copy iamge from clipboard
// 			try {
// 				const contents = await navigator.clipboard.read()

// 				const pngItems = contents.filter(item =>
// 					item.types.includes('image/png')
// 				)

// 				if (pngItems.length === 0) {
// 					// eslint-disable-next-line no-console
// 					console.error('No image found in clipboard')
// 					return
// 				}

// 				const pngItem = pngItems[0]
// 				const blob = await pngItem.getType('image/png')
// 				const base64 = await blobToBase64(blob, [160, 160])

// 				api.searchWord = base64
// 				api.searchBy = 'image'
// 			} catch (e) {
// 				// eslint-disable-next-line no-console
// 				console.error(e)
// 			}
// 		},
// 	},
// ])

function onSearchWordChange() {
	if (api.searchBy === 'index') {
		api.searchBy = 'char'
	}
}
</script>

<template>
	<div class="PaneSearch">
		<div class="row">
			<Tq.InputString
				v-model="api.searchWord"
				@update:modelValue="onSearchWordChange"
			/>
			<Tq.InputRadio
				class="search-by"
				v-model="api.searchBy"
				:options="['char', 'code', 'index' /*, 'image'*/]"
				:icons="[
					'tabler:alphabet-hebrew',
					'material-symbols:table',
					'mdi:numeric',
					// 'mdi:image-search',
				]"
			/>
		</div>
		<div class="row">
			<Tq.InputRadio
				v-model="filterBy"
				:options="['code', 'phash', 'cnn', 'name']"
				:labels="['Code', 'pHash', 'Tokui CNN', 'Name']"
				:icons="[
					'material-symbols:table',
					'line-md:hash',
					'icon-park-outline:neural',
					'mingcute:thought-fill',
				]"
			/>
		</div>
		<div class="grid">
			<GlyphSearchResult
				v-for="glyph in glyphs"
				:key="glyph.code_str"
				v-bind="glyph"
				@click.left="appState.insertGlyphs([glyph])"
				@click.right.prevent="api.searchByGlyph(glyph)"
				@mouseenter="appState.hoveredGlyphs = [glyph]"
				@mouseleave="appState.hoveredGlyphs = []"
			/>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.PaneSearch
	display grid
	grid-template-rows auto auto 1fr
	align-items top
	padding var(--tq-pane-padding)
	height 100%
	gap 1em

.row
	gap var(--tq-input-gap)
	display flex

	& > *
		flex-grow 1

.search-by
	flex-grow 0

.grid
	display grid
	grid-template-columns repeat(auto-fill, minmax(100px, 1fr))
	overflow-x hidden
	scrollbar-gutter stable

	gap 1em
	flex-grow 1
	overflow scroll
</style>
