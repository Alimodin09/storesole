import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
	oxc: false,
	server: {
		host: '127.0.0.1',
		port: 5173,
		strictPort: true,
		hmr: {
			host: '127.0.0.1',
			port: 5173,
			overlay: false,
		},
	},
    plugins: [
        laravel({
            input: ['resources/js/main.jsx'],
            refresh: true,
        }),
		react({
			include: [/resources\/js\/.*\.[jt]sx?$/],
		}),
    ],
});