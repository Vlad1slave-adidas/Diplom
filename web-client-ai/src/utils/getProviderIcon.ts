import type { Provider } from '@/lib/data/movies'

export function getProviderIcon(provider?: Provider) {
	switch (provider) {
		case 'start':
			return { src: '/icons/start.svg', width: 89, height: 28 }
		case 'premier':
			return { src: '/icons/premier.svg', width: 109, height: 28 }
		case 'viju':
			return { src: '/icons/viju.svg', width: 44, height: 28 }
		default:
			return null
	}
}
