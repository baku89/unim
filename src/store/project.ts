import {mat2d, vec2} from 'linearly'
import {defineStore} from 'pinia'
import {reactive, toRefs, watchEffect} from 'vue'

export interface Glyph {
	path: string
	transform: mat2d
	/** 元のグリフから編集されているか */
	modified: boolean
	/** コードポイント */
	code: number | number[]
	/** インデックス */
	index: number
	/** Unicodeの名前 */
	name: string
	font: string
	duration: number
	/** 追加のアトリビュート、偏の位置とか */
	meta: Record<string, number | vec2 | string | boolean>
}

interface TimelineGlyphClip {
	glyph: Glyph
	/** 常に一番上のレイヤーが表示される */
	show: boolean
	frame: number
	layer: number
}

/**
 * タイムラインのレイヤー設定
 */
interface TimelineLayer {
	visible: boolean
}

export interface Timeline {
	/** フレーム順に並んでいる */
	clips: TimelineGlyphClip[]
	frameRate: number
	duration: number
	audio: {
		file: File
		/** 頭のフレーム数 */
		offset: number
	}
	layers: TimelineLayer[]
}

/**
 * アイテムビュー上の何らかのアイテム
 */
interface BaseItem {
	color: string
	id: string
	position: vec2
}

export interface ItemComment extends BaseItem {
	type: 'comment'
	content: string
}

/**
 * アイテムビュー上のグリフの連なり
 */
export interface ItemGlyphSequence extends BaseItem {
	type: 'glyphSequence'
	glyphs: Glyph[]
}

export type Item = ItemComment | ItemGlyphSequence

type SemVer = `${number}.${number}.${number}`

export interface UnimProject {
	version: SemVer
	frameRate: 24
	items: Item[]
}

export const useProjectStore = defineStore('project', () => {
	const project = reactive<UnimProject>({
		version: '0.0.1',
		frameRate: 24,
		items: [],
	})

	const savedProject = localStorage.getItem('project')
	if (savedProject) {
		Object.assign(project, JSON.parse(savedProject))
	}

	watchEffect(() => {
		localStorage.setItem('project', JSON.stringify(project))
	})

	return {
		...toRefs(project),
	}
})
