import {useFetch} from '@vueuse/core'
import {mat2d} from 'linearly'
import {defineStore} from 'pinia'
import {computed, ref, toRaw, watchEffect} from 'vue'

import {Glyph} from '@/store/project'

import {useSettingsStore} from './settings'

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
	phash: GlyphInfoSimilarity[]
	cnn: GlyphInfoSimilarity[]
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

export function toGlyph(
	info: (GlyphInfo | Glyph) & {transform?: mat2d; duration?: number}
): Glyph {
	info = toRaw(info)

	if ('code_num' in info) {
		return {
			path: info.path,
			transform: info.transform ?? mat2d.I,
			modified: false,
			code: info.code_num,
			index: info.index,
			name: info.name,
			font: info.font,
			duration: info.duration ?? 1,
			meta: {},
		}
	} else {
		return info
	}
}

export const useAPIStore = defineStore('api', () => {
	const settings = useSettingsStore()

	const searchWord = ref('')
	const searchBy = ref<'char' | 'code' | 'index'>('char')

	const restURL = computed(() => {
		if (!searchWord.value) {
			return ''
		}
		return (
			settings.apiURL +
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

	async function lookup(query: {char: string} | {index: number}) {
		let strQuery: Record<string, string> = {}
		if ('index' in query) {
			strQuery = {index: query.index.toString()}
		} else {
			strQuery = query
		}

		const url = `${settings.apiURL}/lookup?${new URLSearchParams(strQuery)}`
		const res = await fetch(url)
		return res.json() as Promise<APIResponse<GlyphInfo>>
	}

	return {isFetching, result, searchBy, searchWord, searchByGlyph, lookup}
})
