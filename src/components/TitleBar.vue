<script lang="ts" setup>
import Tq from 'tweeq'

import {useAppStateStore} from '@/store/appState'

const appState = useAppStateStore()
</script>

<template>
	<Tq.TitleBar name="Unim" icon="favicon.svg">
		<template #center>
			<div style="display: flex">
				<Tq.InputIconToggle
					v-model="appState.isPlaying"
					:icon="appState.isPlaying ? 'mdi:pause' : 'mdi:play'"
				/>
			</div>
		</template>
	</Tq.TitleBar>
</template>
