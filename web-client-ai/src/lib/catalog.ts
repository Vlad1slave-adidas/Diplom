import {
	movies,
	type DepthValue,
	type MoodValue,
	type Movie,
	type PaceValue,
} from '@/lib/data/movies'
import {
	rankMoviesWithMamdani,
	type AudiencePreference,
	type FuzzySearchInput,
	type MovieRecommendation,
	type TimeBudget,
} from '@/lib/fuzzy/engine'

export interface CatalogSearchParams {
	mood?: string
	preferredGenre?: string
	timeBudget?: string
	pacePreference?: string
	storyDepth?: string
	audiencePreference?: string
	genre?: string
	year?: string
	country?: string
	order?: string
	ai?: string
}

export interface CatalogState {
	mood: MoodValue
	preferredGenre: string
	timeBudget: TimeBudget
	pacePreference: PaceValue
	storyDepth: DepthValue
	audiencePreference: AudiencePreference
	genre: string
	year: string
	country: string
	order: string
	ai: boolean
}

export interface CatalogSummary {
	title: string
	description: string
	metrics: Array<{ label: string; value: string }>
}

export interface MovieExplanation {
	score: string
	reasons: string[]
	backHref: string
}

export const moods = [
	{ value: 'calm', label: 'Спокойное' },
	{ value: 'light', label: 'Лёгкое' },
	{ value: 'thoughtful', label: 'Вдумчивое' },
	{ value: 'intense', label: 'Напряжённое' },
] as const

export const timeBudgets = [
	{ value: 'short', label: 'До 1 ч 40 мин' },
	{ value: 'medium', label: 'Обычный вечер' },
	{ value: 'long', label: 'Готов к длинному просмотру' },
] as const

export const paceOptions = [
	{ value: 'slow', label: 'Медленный темп' },
	{ value: 'balanced', label: 'Сбалансированный темп' },
	{ value: 'fast', label: 'Быстрый темп' },
] as const

export const depthOptions = [
	{ value: 'light', label: 'Лёгкий сюжет' },
	{ value: 'layered', label: 'Многослойная история' },
	{ value: 'complex', label: 'Сложный сюжет' },
] as const

export const audienceOptions = [
	{ value: 'any', label: 'Любой формат просмотра' },
	{ value: 'family', label: 'Семейный просмотр' },
	{ value: 'adult', label: 'Взрослая аудитория' },
] as const

export const sortOptions = [
	{ value: 'recommendation', label: 'Рекомендуемые' },
	{ value: 'rating', label: 'По рейтингу' },
	{ value: 'year', label: 'По году' },
	{ value: 'title', label: 'По названию' },
] as const

export const genres = Array.from(
	new Set(movies.flatMap(movie => movie.genres)),
).sort((a, b) => a.localeCompare(b, 'ru'))

export const countries = Array.from(
	new Set(movies.map(movie => movie.country)),
).sort((a, b) => a.localeCompare(b, 'ru'))

export const years = Array.from(
	new Set(movies.map(movie => String(movie.year))),
).sort((a, b) => Number(b) - Number(a))

function normalizeMood(value?: string): MoodValue {
	return value === 'calm' || value === 'light' || value === 'thoughtful' || value === 'intense'
		? value
		: 'light'
}

function normalizeTimeBudget(value?: string): TimeBudget {
	return value === 'short' || value === 'medium' || value === 'long'
		? value
		: 'medium'
}

function normalizePace(value?: string): PaceValue {
	return value === 'slow' || value === 'balanced' || value === 'fast'
		? value
		: 'balanced'
}

function normalizeDepth(value?: string): DepthValue {
	return value === 'light' || value === 'layered' || value === 'complex'
		? value
		: 'layered'
}

function normalizeAudience(value?: string): AudiencePreference {
	return value === 'any' || value === 'family' || value === 'adult'
		? value
		: 'any'
}

export function normalizeCatalogParams(params: CatalogSearchParams): CatalogState {
	return {
		mood: normalizeMood(params.mood),
		preferredGenre: params.preferredGenre ?? '',
		timeBudget: normalizeTimeBudget(params.timeBudget),
		pacePreference: normalizePace(params.pacePreference),
		storyDepth: normalizeDepth(params.storyDepth),
		audiencePreference: normalizeAudience(params.audiencePreference),
		genre: params.genre ?? '',
		year: params.year ?? '',
		country: params.country ?? '',
		order: params.order ?? 'recommendation',
		ai: params.ai === 'true',
	}
}

function filterCatalog(movieList: Movie[], params: CatalogState) {
	return movieList.filter(movie => {
		if (params.genre && !movie.genres.includes(params.genre)) return false
		if (params.year && String(movie.year) !== params.year) return false
		if (params.country && movie.country !== params.country) return false
		return true
	})
}

function sortClassic(movieList: Movie[], order: string) {
	const sorted = [...movieList]

	switch (order) {
		case 'rating':
			return sorted.sort((a, b) => b.rating - a.rating)
		case 'year':
			return sorted.sort((a, b) => b.year - a.year)
		case 'title':
			return sorted.sort((a, b) => a.title.localeCompare(b.title, 'ru'))
		default:
			return sorted.sort((a, b) => b.rating - a.rating)
	}
}

function buildSearchContext(params: CatalogState) {
	return {
		mood: params.mood,
		preferredGenre: params.preferredGenre,
		timeBudget: params.timeBudget,
		pacePreference: params.pacePreference,
		storyDepth: params.storyDepth,
		audiencePreference: params.audiencePreference,
		genre: params.genre,
		year: params.year,
		country: params.country,
		order: params.order,
		ai: String(params.ai),
	}
}

function averageScore(recommendations: MovieRecommendation[]) {
	if (recommendations.length === 0) return 0
	return (
		recommendations.reduce((sum, item) => sum + item.score, 0) /
		recommendations.length
	)
}

function createInput(params: CatalogState): FuzzySearchInput {
	return {
		mood: params.mood,
		preferredGenre: params.preferredGenre,
		timeBudget: params.timeBudget,
		pacePreference: params.pacePreference,
		storyDepth: params.storyDepth,
		audiencePreference: params.audiencePreference,
	}
}

function getModeLabel(params: CatalogState) {
	const mood = moods.find(item => item.value === params.mood)?.label ?? 'Лёгкое'
	const time =
		timeBudgets.find(item => item.value === params.timeBudget)?.label ??
		'Обычный вечер'
	const pace =
		paceOptions.find(item => item.value === params.pacePreference)?.label ??
		'Сбалансированный темп'

	return `${mood} / ${time} / ${pace}`
}

export function buildCatalogView(params: CatalogSearchParams) {
	const normalizedParams = normalizeCatalogParams(params)
	const filteredMovies = filterCatalog(movies, normalizedParams)

	let results: MovieRecommendation[]
	if (normalizedParams.ai) {
		results = rankMoviesWithMamdani(
			filteredMovies,
			createInput(normalizedParams),
			buildSearchContext(normalizedParams),
		)
	} else {
		results = sortClassic(filteredMovies, normalizedParams.order).map(movie => ({
			movie,
			score: movie.rating * 10,
			reasons: [movie.shortDescription],
			memberships: {
				mood: { low: 0, medium: 0, high: 0 },
				genre: { low: 0, medium: 0, high: 0 },
				time: { low: 0, medium: 0, high: 0 },
				pace: { low: 0, medium: 0, high: 0 },
				depth: { low: 0, medium: 0, high: 0 },
				audience: { low: 0, medium: 0, high: 0 },
			},
			rules: [],
		}))
	}

	if (normalizedParams.order !== 'recommendation') {
		results = [...results].sort((a, b) => {
			switch (normalizedParams.order) {
				case 'rating':
					return b.movie.rating - a.movie.rating
				case 'year':
					return b.movie.year - a.movie.year
				case 'title':
					return a.movie.title.localeCompare(b.movie.title, 'ru')
				default:
					return b.score - a.score
			}
		})
	}

	const summary: CatalogSummary = normalizedParams.ai
		? {
				title: 'Выдача сформирована модулем нечеткого вывода',
				description: `Система проанализировала ${filteredMovies.length} фильмов и ранжировала их по степени соответствия запросу. Теперь в расчёте участвуют шесть входов: настроение, жанровая близость, доступное время, темп, глубина сюжета и формат просмотра.`,
				metrics: [
					{ label: 'Фильмов в выборке', value: String(results.length) },
					{
						label: 'Средний AI-балл',
						value: averageScore(results).toFixed(1),
					},
					{
						label: 'Режим',
						value: getModeLabel(normalizedParams),
					},
				],
			}
		: {
				title: 'Каталог отсортирован классическим способом',
				description:
					'AI-подбор отключён, показаны локальные данные каталога без нечеткого ранжирования.',
				metrics: [
					{ label: 'Фильмов в выборке', value: String(results.length) },
					{ label: 'Сортировка', value: normalizedParams.order },
				],
			}

	return {
		movies: results,
		summary,
		normalizedParams,
	}
}

export function getMovieBySlug(slug: string) {
	return movies.find(movie => movie.slug === slug)
}

export function buildMovieExplanation(
	movie: Movie,
	params: CatalogSearchParams,
): MovieExplanation | null {
	const normalizedParams = normalizeCatalogParams(params)

	if (!normalizedParams.ai) {
		return null
	}

	const recommendation = rankMoviesWithMamdani(
		[movie],
		createInput(normalizedParams),
		buildSearchContext(normalizedParams),
	)[0]

	return {
		score: recommendation.score.toFixed(1),
		reasons: recommendation.reasons,
		backHref: `/collection/movies?${new URLSearchParams(
			buildSearchContext(normalizedParams),
		).toString()}`,
	}
}

export function getHomeHeroSlides() {
	return movies.slice(0, 4).map(movie => ({
		id: movie.id,
		type: 'movie' as const,
		name: movie.title,
		backgroundImage: movie.backdrop,
		kinopoiskRating: movie.rating,
		year: movie.year,
		genre: movie.genres.join(', '),
		description: movie.shortDescription,
		ageRating: movie.ageRating,
		imdbRating: movie.rating,
		thumbnail: movie.poster,
		duration: movie.duration,
		provider: movie.provider,
		slug: movie.slug,
	}))
}

export function getHomeShelves() {
	return [
		{
			title: 'Спокойный вечер',
			description: 'Фильмы для мягкого и размеренного просмотра.',
			movies: movies.filter(movie => movie.moodValue === 'calm').slice(0, 8),
		},
		{
			title: 'Динамичный просмотр',
			description: 'Картины для зрителя, который ищет темп и напряжение.',
			movies: movies.filter(movie => movie.paceValue === 'fast').slice(0, 8),
		},
		{
			title: 'Вдумчивое кино',
			description: 'Истории с многослойным сюжетом и заметной глубиной.',
			movies: movies.filter(movie => movie.depthValue === 'complex').slice(0, 8),
		},
	]
}

export function getTopRecommendations(input: FuzzySearchInput) {
	return rankMoviesWithMamdani(movies, input).slice(0, 8)
}
