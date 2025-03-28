import {vec2} from 'linearly'

export function getAnscestor<T>(
	target: EventTarget | null,
	f: (el: HTMLElement) => T | undefined
): T | null {
	while (target instanceof HTMLElement) {
		const res = f(target)
		if (res !== undefined) {
			return res
		}

		target = target.parentNode
	}
	return null
}

export function getGrapheme(str: string) {
	const segmenter = new (Intl as any).Segmenter('en-US', {
		granularity: 'grapheme',
	})
	// The Segments object iterator that is used here iterates over characters in grapheme clusters,
	// which may consist of multiple Unicode characters
	return [...segmenter.segment(str)].map(s => s.segment)
}

export function blobToBase64(blob: Blob, size: vec2): Promise<string> {
	return new Promise((resolve, reject) => {
		// Resize the image
		const img = new Image()
		img.onload = () => {
			const canvas = document.createElement('canvas')
			canvas.width = size[0]
			canvas.height = size[1]
			const ctx = canvas.getContext('2d')
			if (ctx === null) {
				reject('Failed to get 2d context')
				return
			}
			ctx.drawImage(img, 0, 0, ...size)
			const base64 = canvas.toDataURL('image/png')
			resolve(base64.split(',')[1])
		}
		img.src = URL.createObjectURL(blob)
	})
}
