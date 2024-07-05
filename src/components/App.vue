<script lang="ts" setup>
import {initTweeq, useTweeq} from 'tweeq'

import TitleBar from './TitleBar.vue'

initTweeq('com.baku89.unim', {
	colorMode: 'light',
	accentColor: '#6565f7',
	grayColor: '#9494B8',
	backgroundColor: '#fcfcfc',
})

const Tq = useTweeq()
</script>

<template>
	<div class="App">
		<Tq.CommandPalette />
		<Tq.PaneModalComplex />
		<TitleBar />
		<main class="main">
			<Tq.PaneSplit name="vertical" direction="vertical">
				<template #first>
					<Tq.PaneSplit
						name="preview"
						direction="horizontal"
						:scroll="[false, false]"
					>
						<template #first> Viewport </template>
						<template #second> Search </template>
					</Tq.PaneSplit>
				</template>
				<template #second>
					<Tq.PaneSplit
						name="control"
						direction="vertical"
						:scroll="[false, false]"
					>
						<template #first> Timeline </template>
						<template #second> Node </template>
					</Tq.PaneSplit>
				</template>
			</Tq.PaneSplit>
		</main>
	</div>
</template>

<style lang="stylus" scoped>
.main
	position fixed
	inset var(--app-margin-top) 0 0

.viewport
	width 100%
	height 100%

.control
	padding var(--tq-pane-padding) calc(var(--tq-pane-padding) - var(--tq-scrollbar-width)) var(--tq-pane-padding) var(--tq-pane-padding)

.timeline
	padding-top var(--tq-pane-padding)
	padding-left var(--tq-pane-padding)
	width 100%
	height 100%
</style>
