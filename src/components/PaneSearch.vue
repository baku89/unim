<script setup lang="ts">
import {useTweeq} from 'tweeq'
import {computed, ref} from 'vue'

import GlyphInfoViewer from '@/components/GlyphInfoViewer.vue'
import {useAPIStore} from '@/store/api'
import {useAppStateStore} from '@/store/appState'

const api = useAPIStore()

const Tq = useTweeq()
const appState = useAppStateStore()

const filterBy = ref<'code' | 'phash' | 'cnn'>('code')

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
	} else {
		return [{...api.result.original, original: true}, ...api.result.cnn]
	}
})
</script>

<template>
	<div class="PaneSearch">
		<div class="row">
			<Tq.InputString v-model="api.searchWord" />
			<Tq.InputRadio
				v-model="api.searchBy"
				:options="['char', 'code', 'index']"
				style="width: 20rem"
			/>
		</div>
		<div class="row">
			<Tq.InputRadio
				v-model="filterBy"
				:options="['code', 'phash', 'cnn']"
				:labels="['Code', 'pHash', 'CNN']"
			/>
		</div>
		<div class="grid">
			<GlyphInfoViewer
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

.grid
	display grid
	grid-template-columns repeat(auto-fill, minmax(100px, 1fr))

	gap 1em
	flex-grow 1
	overflow scroll
</style>
