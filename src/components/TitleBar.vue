<script lang="ts" setup>
import * as Tq from 'tweeq'

import {useAppStateStore} from '@/store/appState'
import {useProjectStore} from '@/store/project'
import {useViewportStore} from '@/store/viewport'

const appState = useAppStateStore()
const project = useProjectStore()
const viewport = useViewportStore()
</script>

<template>
	<Tq.TitleBar name="Unimate" icon="favicon.svg">
		<template #center>
			<Tq.InputGroup>
				<Tq.InputCheckbox
					v-model="appState.isPlaying"
					:icon="appState.isPlaying ? 'mdi:pause' : 'mdi:play'"
					inlinePosition="start"
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
					inlinePosition="end"
				/>
			</Tq.InputGroup>
			<Tq.InputGroup>
				<Tq.InputCheckbox
					v-model="viewport.showOnionskin"
					icon="fluent-emoji-high-contrast:onion"
					inlinePosition="start"
				/>
				<Tq.InputNumber
					:modelValue="-viewport.onionskinCount[0]"
					:precision="0"
					:min="-5"
					:max="0"
					:step="1"
					style="width: 3em"
					inlinePosition="middle"
					@update:modelValue="viewport.onionskinCount[0] = -$event"
				/>
				<Tq.InputNumber
					v-model="viewport.onionskinCount[1]"
					:precision="0"
					:min="0"
					:max="5"
					:step="1"
					style="width: 3em"
					inlinePosition="end"
				/>
			</Tq.InputGroup>
		</template>
	</Tq.TitleBar>
</template>
