import {mat2d} from 'linearly'

import {Shape} from './Shape'

interface GuideLayer {
	visible: boolean
	shape: Shape
}

interface AppState {
	viewport: {
		transform: mat2d
		guides: GuideLayer[]
	}
}

interface Viewport {
	transform: mat2d
	shapes: Shape[]
}
