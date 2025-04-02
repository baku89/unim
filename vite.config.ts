import vue from '@vitejs/plugin-vue'
import {fileURLToPath} from 'url'
import {defineConfig} from 'vite'
import glsl from 'vite-plugin-glsl'

import {VitePWA} from 'vite-plugin-pwa'

export default defineConfig({
	base: './',
	server: {
		port: 5580,
	},
	plugins: [
		glsl(),
		vue(),
		VitePWA({
			registerType: 'autoUpdate',
			injectRegister: 'auto',
			devOptions: {
				enabled: true,
			},
			manifest: {
				name: 'Unim',
				short_name: 'Unim',
				display: 'standalone',
				display_override: ['window-controls-overlay', 'standalone'],
				icons: [
					{
						src: 'icon.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'any',
					},
				],
			},
		}),
	],
	build: {
		sourcemap: true,
	},
	resolve: {
		alias: [
			{
				find: '@',
				replacement: fileURLToPath(new URL('./src', import.meta.url)),
			},
			{
				find: 'tweeq',
				replacement: fileURLToPath(
					new URL('./dev_modules/tweeq/src', import.meta.url)
				),
			},
		],
	},
})
