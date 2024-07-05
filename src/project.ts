import {mat2d, vec2} from 'linearly'

interface Glyph {
	path: Path2D
	transform: mat2d
	/** 元のグリフから編集されているか */
	modified: boolean
	/** コードポイント */
	code: number | number[]
	/** Unicodeの名前 */
	name: string
	fontName: string
	duration: number
	/** 追加のアトリビュート、偏の位置とか */
	meta: Record<string, number | vec2 | string | boolean>
}

/**
 * グリフのユーザー編集可能なメタデータ
 */
interface GlyphMeta {}

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

interface Timeline {
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
	position: vec2
}

interface ItemComment extends BaseItem {
	type: 'comment'
	content: string
}

/**
 * アイテムビュー上のグリフの連なり
 */
interface ItemGlyphSequence extends BaseItem {
	type: 'glyphSequence'
	glyphs: Glyph[]
}
type Item = ItemComment | ItemGlyphSequence

type SemVer = `${number}.${number}.${number}`

interface UnimProject {
	version: SemVer
	items: Item[]
	timeline: Timeline
}
