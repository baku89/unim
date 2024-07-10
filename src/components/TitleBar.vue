<script lang="ts" setup>
import Tq from 'tweeq'

import {useAppStateStore} from '@/store/appState'
import {useProjectStore} from '@/store/project'

const appState = useAppStateStore()

const project = useProjectStore()
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
		</template>
	</Tq.TitleBar>
</template>
