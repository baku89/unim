<script lang="ts" setup>
import {useMagicKeys} from '@vueuse/core'
import * as Bndr from 'bndr-js'
import {mat2d, vec2} from 'linearly'
import {useBndr} from 'tweeq'
import {computed, ref} from 'vue'

import {useAppStateStore} from '@/store/appState'
import {useZUI} from '@/use/useZUI'

import {useProjectStore} from '../store/project'
import ItemGlyphSequence from './ItemGlyphSequence.vue'

const project = useProjectStore()
const appState = useAppStateStore()

const $root = ref<HTMLElement | null>(null)

const transform = ref<mat2d>(mat2d.I)

useBndr($root, root => {
	const emitter = Bndr.pointer(root).button('left')

	emitter.drag().on(dd => {
		if (dd.type === 'down') {
			if (dd.event.target === root) {
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

useZUI($root, delta => {
	transform.value = mat2d.mul(delta, transform.value)
})

const {Command} = useMagicKeys()

function onSelectItem(
	index: number,
	char: false | {charIndex: number; gap: boolean}
) {
	if (!Command.value) {
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

const rootStyles = computed(() => {
	const [a, , , d, tx, ty] = transform.value

	const size = 20

	return {
		backgroundPosition: `${tx}px ${ty}px`,
		backgroundSize: `${size * a}px ${size * d}px`,
	}
})

const transformStyles = computed(() => {
	return {
		transform: `matrix(${transform.value.join(',')})`,
	}
})
</script>

<template>
	<div class="PaneItems" ref="$root" :style="rootStyles">
		<div class="transform" :style="transformStyles">
			<template v-for="(item, index) in project.items">
				<ItemGlyphSequence
					:key="index"
					v-if="item.type === 'glyphSequence'"
					v-bind="item"
					:index="index"
					@select="onSelectItem(index, $event)"
				/>
			</template>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.PaneItems
	position relative
	height 100%
	--bg var(--tq-color-background)
	background-image linear-gradient(to right, transparent 1px, var(--bg) 1px), linear-gradient(to bottom, transparent 1px, var(--bg) 1px)
	background-size 20px
	background-color var(--tq-color-gray-on-background)

.transform
	position absolute
	pointer-events none
	transform-origin 0 0
	width 100%
	height 100%

	& > *
		pointer-events all
</style>
