<script setup lang="ts">
import {computed} from 'vue'
import {title} from 'case'

import {GlyphInfo} from '../store/api'
import GlyphThumb from './GlyphThumb.vue'

const props = defineProps<GlyphInfo & {original?: boolean}>()

const code = computed(() => {
	return 'U+' + props.code_str.replaceAll('_', ',').replaceAll(/U\+0*/g, '')
})
</script>

<template>
	<div class="GlyphInfo" :class="{original}">
		<div class="code">{{ code }}</div>
		<div class="name">
			{{ title(name.toLowerCase().replaceAll('_', ', ')) }}
		</div>
		<GlyphThumb class="glyph" :path="path" />
	</div>
</template>

<style lang="stylus" scoped>
.GlyphInfo
	position relative
	aspect-ratio 1
	border-radius var(--tq-radius-input)
	width 100%

	&:hover
		background var(--tq-color-accent-soft)

	&.original
		box-shadow 0 0 0 3px var(--tq-color-accent) inset

.name
.code
	left 0.5em
	max-width 100%
	overflow hidden
	text-overflow ellipsis
	position absolute

.code
	top 0.5em

.name
	bottom 0.5em
	color var(--tq-color-background)

.code
	color var(--tq-color-text-mute)
	font-family var(--tq-font-code)
	user-select all
	font-size 0.8em

.glyph
	position absolute
	top 0
	left 0
	width 100%
	height 100%
	z-index 100
	fill currentColor
	pointer-events none
</style>
../store/api
