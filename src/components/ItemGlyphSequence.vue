<script setup lang="ts">
import {computed} from 'vue'

import {useAPIStore} from '@/store/api'

import {ItemGlyphSequence} from '../store/project'
import GlyphThumb from './GlyphThumb.vue'

const props = defineProps<
	ItemGlyphSequence & {
		selected: boolean | {charIndex: number; gap: boolean}
	}
>()

defineEmits<{
	select: [char: false | {charIndex: number; gap: boolean}]
}>()

const api = useAPIStore()

const styles = computed(() => {
	return {
		transform: `translate(${props.position.map(v => v + 'px').join(',')})`,
	}
})

function isGapSelected(index: number) {
	if (typeof props.selected === 'boolean') return false

	return props.selected.charIndex === index && props.selected.gap
}

function isCharSelected(index: number) {
	if (typeof props.selected === 'boolean') return false

	return props.selected.charIndex === index && !props.selected.gap
}
</script>

<template>
	<div
		class="ItemGlyphSequence"
		:class="{selected: selected === true}"
		:style="styles"
	>
		<div class="id" @pointerdown="$emit('select', false)">{{ id }}</div>
		<div class="glyphs">
			<template v-for="(glyph, charIndex) in glyphs" :key="charIndex">
				<div
					class="gap"
					:class="{selected: isGapSelected(charIndex)}"
					@pointerdown="$emit('select', {charIndex, gap: true})"
				/>
				<div
					class="glyph"
					:class="{selected: isCharSelected(charIndex)}"
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
		outline 2px solid var(--tq-color-accent)



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
		outline 2px solid var(--tq-color-accent)

.thumb
	width 40px
	aspect-ratio 1
</style>
