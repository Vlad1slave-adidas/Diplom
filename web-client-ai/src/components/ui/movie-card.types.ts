import type { Provider } from '@/lib/data/movies'

export interface MovieCardProps {
	id: number
	slug: string
	name: string
	type: 'series' | 'movie'
	year: number
	image: string
	rating: number
	duration?: number
	seasons?: number
	provider?: Provider
	hasSize?: boolean
	onClick?: () => void
	explanation?: string
	score?: number
	searchQuery?: string
}
