<script lang="ts" setup>
import {Rect} from '@baku89/pave'
import {useMagicKeys} from '@vueuse/core'
import * as Bndr from 'bndr-js'
import {mat2d, vec2} from 'linearly'
import {useBndr} from 'tweeq'
import Tq from 'tweeq'
import { ref, shallowRef} from 'vue'

import {useAppStateStore} from '@/store/appState'

import {useProjectStore} from '../store/project'
import ItemGlyphSequence from './ItemGlyphSequence.vue'

const project = useProjectStore()
const appState = useAppStateStore()

const $root = ref<HTMLElement | null>(null)

const transform = shallowRef<mat2d>(mat2d.I)

const visibleRect = shallowRef<[topLeft: vec2, bottomRight: vec2]>([
	vec2.zero,
	vec2.zero,
])

function onPointerleave() {
	appState.itemInsertPosition = Rect.center(visibleRect.value)
}

useBndr($root, root => {
	const emitter = Bndr.pointer(root).left

	emitter.drag().on(dd => {
		if (dd.type === 'down') {
			if ((dd.event.target as Element)?.parentNode === root) {
				appState.selections = []
			}
		} else if (dd.type === 'drag') {
			const [sx, , , sy] = transform.value

			const delta = vec2.mul(dd.delta, [1 / sx, 1 / sy])

			for (const selection of appState.selections) {
				if (selection.type !== 'item') continue

				const item = project.items[selection.index]
				if (item === undefined) continue

				item.position = vec2.add(item.position, delta)
			}
		}
	})
})

const {Command: commandKeyPressed} = useMagicKeys()

function onSelectItem(
	index: number,
	char: false | {charIndex: number; gap: boolean}
) {
	if (!commandKeyPressed.value) {
		appState.selections = []
	}

	if (!char) {
		appState.selections.push({
			type: 'item',
			index,
		})
	} else {
		appState.selections.push({
			type: 'sequenceChar',
			index: index,
			...char,
		})
	}
}
</script>

<template>
	<div class="PaneItems" ref="$root" @pointerleave="onPointerleave">
		<Tq.PaneZUI
			v-model:transform="transform"
			v-model:visibleRect="visibleRect"
			background="dots"
		>
			<template v-for="(item, index) in project.items">
				<ItemGlyphSequence
					:key="index"
					v-if="item.type === 'glyphSequence'"
					v-bind="item"
					:index="index"
					@select="onSelectItem(index, $event)"
				/>
			</template>
		</Tq.PaneZUI>
	</div>
</template>

<style lang="stylus" scoped>
.PaneItems
	height 100%
</style>
