<script lang="ts" setup>
import {initTweeq, useTweeq} from 'tweeq'

import {useAppActions} from '@/appActions'

import PaneItems from './PaneItems.vue'
import PaneSearch from './PaneSearch.vue'
import PaneViewport from './PaneViewport.vue'
import TitleBar from './TitleBar.vue'

initTweeq('com.baku89.unim', {
	colorMode: 'light',
	accentColor: '#6565f7',
	grayColor: '#9494B8',
	backgroundColor: '#fcfcfc',
})

const Tq = useTweeq()

useAppActions()
</script>

<template>
	<Tq.App>
		<template #title>
			<TitleBar />
		</template>
		<template #default>
			<Tq.PaneSplit
				name="vertical"
				direction="vertical"
				:scroll="[false, false]"
			>
				<template #first>
					<Tq.PaneSplit
						name="preview"
						direction="horizontal"
						:scroll="[false, false]"
					>
						<template #first>
							<PaneViewport />
						</template>
						<template #second>
							<PaneSearch />
						</template>
					</Tq.PaneSplit>
				</template>
				<template #second>
					<PaneItems />
				</template>
			</Tq.PaneSplit>
		</template>
	</Tq.App>
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
