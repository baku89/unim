<script setup lang="ts">
import {mat2d, vec2} from 'linearly'
import {Rect} from 'geome'
import * as Tq from 'tweeq'
import {computed, shallowRef} from 'vue'

import {useViewportStore} from '@/store/viewport'

const viewport = useViewportStore()

const paneSize = shallowRef<vec2>([0, 0])

const transform = computed<mat2d>(() => {
	if (viewport.transform === 'fit') {
		const glyphRect = Rect.bySize([0, 0], [1000, 1000])
		const viewportRect = Rect.bySize([0, 0], paneSize.value)

		return Rect.objectFit(viewportRect, glyphRect)
	} else {
		return viewport.transform
	}
})
</script>

<template>
	<div class="PaneViewport" ref="$root">
		<Tq.PaneZUI
			:transform="transform"
			@update:transform="viewport.transform = $event"
			v-model:size="paneSize"
		>
			<svg
				class="viewport"
				viewBox="0 0 1000 1000"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					v-for="(shape, index) in viewport.shapes"
					:d="shape.path"
					v-bind="{fill: 'none', ...shape.style}"
					:key="index"
				/>
			</svg>
		</Tq.PaneZUI>
	</div>
</template>

<style lang="stylus" scoped>
.PaneViewport
	height 100%
	background #eee

.viewport
	background white
	width 1000px
	fill none

	path
		vector-effect non-scaling-stroke
		stroke-width 1.5
</style>
