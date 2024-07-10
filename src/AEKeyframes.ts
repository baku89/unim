import {vec2} from 'linearly'

export type AEKeyframeData = {
	frameRate: number
	compSize: vec2
	sourcePixelAspectRatio: number
	compPixelAspectRatio: number
	layers: AELayer[]
}

type AELayer = {
	name: string
	properties: AEProperty[]
}

type AEProperty = {
	type: string
	name: string
	keyframes: AEKeyframe[]
}

type AEKeyframe = {
	frame: number
	values: number[]
}

function iterateLines(text: string) {
	const lines = text.split('\n').filter(line => line.length > 0)

	let i = 0

	return {
		finished() {
			return i >= lines.length
		},
		current() {
			return lines[i].trim()
		},
		next() {
			i++
		},
		indent() {
			return lines[i].match(/^\t*/)?.[0].length || 0
		},
	}
}

export function parseAEKeyframe(text: string): AEKeyframeData {
	const lines = iterateLines(text)

	// Read header information
	const keyframeData: AEKeyframeData = {
		frameRate: 0,
		compSize: [0, 0],
		sourcePixelAspectRatio: 0,
		compPixelAspectRatio: 0,
		layers: [] as AELayer[],
	}

	while (!lines.current().startsWith('Layer')) {
		const [key, value] = lines.current().split('\t')
		switch (key) {
			case 'Units Per Second':
				keyframeData.frameRate = parseInt(value, 10)
				break
			case 'Source Width':
				keyframeData.compSize = [parseInt(value, 10), keyframeData.compSize[1]]
				break
			case 'Source Height':
				keyframeData.compSize = [keyframeData.compSize[0], parseInt(value, 10)]
				break
			case 'Source Pixel Aspect Ratio':
				keyframeData.sourcePixelAspectRatio = parseFloat(value)
				break
			case 'Comp Pixel Aspect Ratio':
				keyframeData.compPixelAspectRatio = parseFloat(value)
				break
		}

		lines.next()
	}

	// Read layers and properties
	let currentLayer: AELayer | null = null

	while (!lines.finished()) {
		const line = lines.current()

		if (line === 'Layer') {
			if (currentLayer) {
				keyframeData.layers.push(currentLayer)
			}
			currentLayer = {name: 'Layer', properties: []}
			lines.next()
		} else if (line === 'End of Keyframe Data') {
			if (currentLayer) {
				keyframeData.layers.push(currentLayer)
			}
			return keyframeData
		} else {
			const [type, name] = line.split('\t')
			const keyframes: AEKeyframe[] = []
			lines.next()
			lines.next()

			while (lines.indent() > 0) {
				const frameLine = lines.current()
				const [frame, ...values] = frameLine.split('\t').map(v => parseFloat(v))
				keyframes.push({frame, values})
				lines.next()
			}

			currentLayer!.properties.push({
				type,
				name,
				keyframes,
			})
		}
	}

	throw new Error('Unexpected end of file')
}

export function encodeAEKeyframe(data: AEKeyframeData): string {
	const lines = [
		'Adobe After Effects 9.0 Keyframe Data',
		'',
		`\tUnits Per Second\t${data.frameRate}`,
		`\tSource Width\t${data.compSize[0] ?? 1000}`,
		`\tSource Height\t${data.compSize[1] ?? 1000}`,
		`\tSource Pixel Aspect Ratio\t${data.sourcePixelAspectRatio ?? 1}`,
		`\tComp Pixel Aspect Ratio\t${data.compPixelAspectRatio ?? 1}`,
		'',
	]

	for (const layer of data.layers) {
		lines.push('Layer')

		for (const prop of layer.properties) {
			lines.push([prop.type, prop.name].filter(s => s).join('\t'))

			if (prop.type === 'Time Remap') {
				lines.push('\tFrame\tseconds\t')
			}

			for (const keyframe of prop.keyframes) {
				lines.push(`\t${keyframe.frame}\t${keyframe.values.join('\t')}\t`)
			}

			lines.push('')
		}
	}

	lines.push('End of Keyframe Data')
	lines.push('')

	return lines.join('\n')
}
