import type { Provider } from '@/lib/data/movies'

export interface AuthUser {
	login: string
	role: 'admin'
}

export interface ApiTerm {
	id: number
	key: string
	label: string
	functionType: string
	a: number | null
	b: number | null
	c: number | null
	isActive: boolean
}

export interface ApiVariable {
	id: number
	key: string
	name: string
	description?: string | null
	kind: 'SCORE' | 'GENRE' | 'DURATION' | 'AUDIENCE'
	isActive: boolean
	exposeInSearch: boolean
	displayOrder: number
	terms: ApiTerm[]
}

export interface ApiMovie {
	id: number
	slug: string
	title: string
	year: number
	country: string
	genres: string[]
	duration: number
	ageRating: number
	rating: number
	shortDescription: string
	description: string
	poster: string
	backdrop: string
	provider: Provider
	familyFriendly: boolean
	scoreValues: Record<string, number>
}

export interface ApiRecommendationMovie extends ApiMovie {
	score: number
	reasons: string[]
	rules: Array<{ name: string; strength: number }>
}

export interface ApiRule {
	id: number
	name: string
	description?: string | null
	isActive: boolean
	weight: number
	connector: 'AND' | 'OR'
	outputLabel: string
	outputFunctionType: string
	outputA: number | null
	outputB: number | null
	outputC: number | null
	conditions: Array<{
		id: number
		variableId: number
		variableKey: string
		variableName: string
		expectedLevel: 'LOW' | 'MEDIUM' | 'HIGH'
	}>
}

export interface PublicHomeResponse {
	heroSlides: Array<{
		id: number
		type: 'movie' | 'series'
		name: string
		backgroundImage: string
		kinopoiskRating: number
		year: number
		genre: string
		description?: string
		ageRating: number | string
		imdbRating: number
		thumbnail: string
		duration?: number
		provider: Provider
		slug: string
	}>
	aiPicks: ApiRecommendationMovie[]
	shelves: Array<{
		title: string
		description: string
		movies: ApiMovie[]
	}>
}

export interface PublicFiltersResponse {
	variables: ApiVariable[]
	genres: string[]
	countries: string[]
	years: string[]
}

export interface PublicCatalogResponse {
	summary: {
		title: string
		description: string
		metrics: Array<{ label: string; value: string }>
	}
	variables: ApiVariable[]
	movies: ApiRecommendationMovie[]
}

export interface PublicMovieResponse {
	movie: ApiMovie
	explanation: {
		score: string
		reasons: string[]
		rules: Array<{ name: string; strength: number }>
	} | null
}

export interface AdminBootstrapResponse {
	movies: ApiMovie[]
	variables: ApiVariable[]
	rules: ApiRule[]
	levelOptions: Array<'LOW' | 'MEDIUM' | 'HIGH'>
	kindOptions: Array<'SCORE' | 'GENRE' | 'DURATION' | 'AUDIENCE'>
}

export interface AuthSessionResponse {
	authenticated: boolean
	user: AuthUser
}
