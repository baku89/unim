interface ShapeStyle {
	fill?: string
	/** vector scale されない、つねに1pxで描かれる */
	stroke?: string
	strokeDashArray?: number[]
}

export interface Shape {
	style: ShapeStyle
	path: string
}
