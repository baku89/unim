<script setup lang="ts">
withDefaults(
	defineProps<{
		path: string
		scale?: number
	}>(),
	{
		scale: 1,
	}
)
</script>

<template>
	<svg
		class="GlyphThumb"
		viewBox="0 0 1000 1000"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path :d="path" :transform="`scale(${scale})`" transform-origin="500 500" />
	</svg>
</template>

<style lang="stylus" scoped>
.GlyphThumb
	pointer-events none
</style>
