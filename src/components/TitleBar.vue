<script lang="ts" setup>
import Tq from 'tweeq'

import {useAppStateStore} from '@/store/appState'
import {useProjectStore} from '@/store/project'
import {useViewportStore} from '@/store/viewport'

const appState = useAppStateStore()
const project = useProjectStore()
const viewport = useViewportStore()
</script>

<template>
	<Tq.TitleBar name="Unim" icon="favicon.svg">
		<template #center>
			<div style="display: flex">
				<Tq.InputIconToggle
					v-model="appState.isPlaying"
					:icon="appState.isPlaying ? 'mdi:pause' : 'mdi:play'"
					horizontalPosition="left"
				/>
				<Tq.InputNumber
					v-model="project.frameRate"
					:precision="0"
					:min="4"
					:max="60"
					:step="1"
					:bar="false"
					suffix=" fps"
					style="width: 5em"
					horizontalPosition="right"
				/>
			</div>
			<div style="display: flex">
				<Tq.InputIconToggle
					v-model="viewport.showOnionskin"
					icon="fluent-emoji-high-contrast:onion"
					horizontalPosition="left"
				/>
				<Tq.InputNumber
					v-model="viewport.onionskinCount[0]"
					:precision="0"
					:min="0"
					:max="5"
					:step="1"
					:bar="false"
					style="width: 3em"
					horizontalPosition="middle"
				/>
				<Tq.InputNumber
					v-model="viewport.onionskinCount[1]"
					:precision="0"
					:min="0"
					:max="5"
					:step="1"
					:bar="false"
					style="width: 3em"
					horizontalPosition="right"
				/>
			</div>
		</template>
	</Tq.TitleBar>
</template>
