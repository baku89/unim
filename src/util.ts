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
