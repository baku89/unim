import {useFetch} from '@vueuse/core'
import {mat2d} from 'linearly'
import {defineStore} from 'pinia'
import {computed, ref, toRaw, watchEffect} from 'vue'

import {useSettings} from '@/settings'
import {Glyph} from '@/store/project'

type SearchResponse = APIResponse<SearchResponseResult>

export type APIResponse<T> =
	| {status: 'error'; message: string}
	| {status: 'success'; result: T}

interface SearchResponseResult {
	original: GlyphInfo
	code: {
		before: GlyphInfo[]
		after: GlyphInfo[]
	}
	similarity: GlyphInfoSimilarity[]
}

export interface GlyphInfo {
	code_num: number[]
	code_str: string
	font: string
	name: string
	index: number
	path: string
	type: 'original' | 'skeleton' | 'island'
}

interface GlyphInfoSimilarity extends GlyphInfo {
	dist: number
}

export function infoToGlyph(info: GlyphInfo): Glyph {
	info = toRaw(info)

	return {
		path: info.path,
		transform: mat2d.I,
		modified: false,
		code: info.code_num,
		index: info.index,
		name: info.name,
		fontName: info.font,
		duration: 1,
		meta: {},
	}
}

export const useAPIStore = defineStore('api', () => {
	const settings = useSettings()

	const searchWord = ref('')
	const searchBy = ref<'char' | 'code' | 'index'>('char')
	const filterBy = ref<'code' | 'similarity'>('code')

	const restURL = computed(() => {
		if (!searchWord.value) {
			return ''
		}
		return (
			settings.apiURL.value +
			'/search?' +
			new URLSearchParams({[searchBy.value]: searchWord.value}).toString()
		)
	})

	const {isFetching, data} = useFetch(restURL, {refetch: true})
		.get()
		.json<SearchResponse>()

	const result = ref<SearchResponseResult | null>(null)

	watchEffect(() => {
		if (data.value?.status !== 'success') return
		result.value = data.value.result
	})

	function searchByGlyph(glyph: Glyph | GlyphInfo) {
		searchWord.value = glyph.index.toString()
		searchBy.value = 'index'
	}

	return {isFetching, result, searchBy, filterBy, searchWord, searchByGlyph}
})
