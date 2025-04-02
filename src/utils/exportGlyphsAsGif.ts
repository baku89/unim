import {Glyph} from '@/store/project'

export function importJS(src: string) {
	// strictモードを回避するため、Function constructorを使用
	const script = document.createElement('script')
	script.src = src
	document.head.appendChild(script)

	console.log('importing GIFEncoder')

	return new Promise<void>(resolve => {
		script.onload = () => {
			resolve()
		}
	})
}

export async function exportGlyphsAsGif(
	glyphs: Glyph[],
	options: {
		background: string
		textColor: string
		frameRate: number
	}
) {
	await importJS('./GIFEncoder.js')
	await importJS('./LZWEncoder.js')
	await importJS('./NeuQuant.js')

	const GIFEncoder = (window as any).GIFEncoder
	const encoder = new GIFEncoder()

	encoder.setRepeat(0)
	encoder.setDelay(1000 / options.frameRate)
	encoder.setQuality(10)
	encoder.start()

	const canvas = document.createElement('canvas')
	canvas.width = canvas.height = 1000
	const ctx = canvas.getContext('2d', {willReadFrequently: true})!

	for (const glyph of glyphs) {
		// Fill the canvas with a white background
		ctx.fillStyle = options.background
		ctx.fillRect(0, 0, canvas.width, canvas.height)

		// Then draw the glyph
		ctx.fillStyle = options.textColor
		const path = new Path2D(glyph.path)
		ctx.fill(path)

		encoder.addFrame(ctx)
	}

	encoder.finish()
	const binaryGif = encoder.stream().getData()

	const src = 'data:image/gif;base64,' + btoa(binaryGif)

	// Download the GIF
	const a = document.createElement('a')
	a.href = src
	a.download = 'unim.gif'
	a.click()
}
