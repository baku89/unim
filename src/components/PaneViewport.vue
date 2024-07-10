<script setup lang="ts">
import {useElementBounding} from '@vueuse/core'
import {mat2d, vec2} from 'linearly'
import Tq from 'tweeq'
import {computed, ref} from 'vue'

import {useViewportStore} from '@/store/viewport'

const viewport = useViewportStore()

const $root = ref<HTMLElement | null>(null)

const bound = useElementBounding($root)

const transform = computed<mat2d>(() => {
	if (viewport.transform === 'fit') {
		const resx = 1000
		const resy = 1000

		const viewportRatio = bound.height.value / bound.width.value
		const frameRatio = resy / resx

		if (frameRatio < viewportRatio) {
			// Fit width
			const scale = bound.width.value / resx
			const frameHeight = resy * scale

			const offset: vec2 = [0, (bound.height.value - frameHeight) / 2]

			return mat2d.mul(mat2d.fromTranslation(offset), mat2d.fromScaling(scale))
		} else {
			// Fit height
			const scale = bound.height.value / resy
			const frameWidth = resx * scale

			const offset: vec2 = [(bound.width.value - frameWidth) / 2, 0]

			return mat2d.mul(mat2d.fromTranslation(offset), mat2d.fromScaling(scale))
		}
	} else {
		return viewport.transform
	}
})
</script>

<template>
	<div class="PaneViewport" ref="$root">
		<Tq.PaneZUI :transform="transform">
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
</style>
