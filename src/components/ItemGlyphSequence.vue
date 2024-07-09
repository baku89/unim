<script setup lang="ts">
import {computed} from 'vue'

import {useAPIStore} from '@/store/api'
import {useAppStateStore} from '@/store/appState'

import {ItemGlyphSequence} from '../store/project'
import GlyphThumb from './GlyphThumb.vue'

const props = defineProps<
	ItemGlyphSequence & {
		index: number
	}
>()

defineEmits<{
	select: [char: false | {charIndex: number; gap: boolean}]
}>()

const api = useAPIStore()
const appState = useAppStateStore()

const isEntireSelected = computed(() => {
	return (
		appState.selections.findIndex(
			selection => selection.type === 'item' && selection.index === props.index
		) !== -1
	)
})

const charSelections = computed(() => {
	const gaps = new Set<number>()
	const chars = new Set<number>()

	for (const selection of appState.selections) {
		if (selection.type !== 'sequenceChar' || selection.index !== props.index) {
			continue
		}

		if (selection.gap) {
			gaps.add(selection.charIndex)
		} else {
			chars.add(selection.charIndex)
		}
	}

	return {gaps, chars}
})

const styles = computed(() => {
	return {
		transform: `translate(${props.position.map(v => v + 'px').join(',')})`,
	}
})
</script>

<template>
	<div
		class="ItemGlyphSequence"
		:class="{selected: isEntireSelected}"
		:style="styles"
	>
		<div class="id" @pointerdown="$emit('select', false)">{{ id }}</div>
		<div class="glyphs">
			<template v-for="(glyph, charIndex) in glyphs" :key="charIndex">
				<div
					class="gap"
					:class="{selected: charSelections.gaps.has(charIndex)}"
					@pointerdown="$emit('select', {charIndex, gap: true})"
				/>
				<div
					class="glyph"
					:class="{selected: charSelections.chars.has(charIndex)}"
					:style="{aspectRatio: glyph.duration}"
					@pointerdown="$emit('select', {charIndex, gap: false})"
					@click.right.prevent="api.searchByGlyph(glyph)"
				>
					<GlyphThumb class="thumb" :path="glyph.path" :scale="2.5" />
				</div>
			</template>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.ItemGlyphSequence
	position absolute
	border 1px solid var(--tq-color-gray-on-background)
	border-radius 0 var(--tq-input-border-radius) var(--tq-input-border-radius) var(--tq-input-border-radius)
	background white

	&:has(.id:hover)
		outline 2px solid var(--tq-color-input-vivid-accent)

	&.selected
		outline 2px solid var(--tq-color-accent) !important



.id
	position absolute
	bottom 100%
	background v-bind(color)
	color var(--tq-color-background)
	padding 0.25em
	border-radius var(--tq-input-border-radius) var(--tq-input-border-radius) 0 0

.glyphs
	display flex


.gap
	width 1em
	margin 0 -0.5em
	z-index 100

	&:hover
		background var(--tq-color-input-vivid-accent)

	&.selected
		background var(--tq-color-accent)

.glyph
	pointer-events all
	aspect-ratio 1
	height 40px
	border-radius var(--tq-input-border-radius)

	&:hover
		outline 2px solid var(--tq-color-input-vivid-accent)

	&.selected
		outline 2px solid var(--tq-color-accent) !important

.thumb
	width 40px
	aspect-ratio 1
</style>
