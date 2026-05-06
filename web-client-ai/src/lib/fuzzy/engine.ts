import type { DepthValue, Movie, MoodValue, PaceValue } from '../data/movies'

export type TimeBudget = 'short' | 'medium' | 'long'
export type AudiencePreference = 'any' | 'family' | 'adult'

export interface FuzzySearchInput {
	mood: MoodValue
	preferredGenre: string
	timeBudget: TimeBudget
	pacePreference: PaceValue
	storyDepth: DepthValue
	audiencePreference: AudiencePreference
}

interface FuzzyMembershipResult {
	low: number
	medium: number
	high: number
}

interface RuleEvaluation {
	label: string
	strength: number
	output: 'weak' | 'moderate' | 'strong' | 'ideal'
}

export interface MovieRecommendation {
	movie: Movie
	score: number
	reasons: string[]
	memberships: {
		mood: FuzzyMembershipResult
		genre: FuzzyMembershipResult
		time: FuzzyMembershipResult
		pace: FuzzyMembershipResult
		depth: FuzzyMembershipResult
		audience: FuzzyMembershipResult
	}
	rules: RuleEvaluation[]
	searchContext?: Record<string, string>
}

const moodCenters: Record<MoodValue, number> = {
	calm: 20,
	light: 45,
	thoughtful: 65,
	intense: 85,
}

const paceCenters: Record<PaceValue, number> = {
	slow: 24,
	balanced: 55,
	fast: 86,
}

const depthCenters: Record<DepthValue, number> = {
	light: 25,
	layered: 58,
	complex: 88,
}

function clamp(value: number) {
	return Math.max(0, Math.min(1, value))
}

function triangular(x: number, left: number, peak: number, right: number) {
	if (x <= left || x >= right) return 0
	if (x === peak) return 1
	if (x < peak) return clamp((x - left) / (peak - left))
	return clamp((right - x) / (right - peak))
}

function shoulderLeft(x: number, left: number, right: number) {
	if (x <= left) return 1
	if (x >= right) return 0
	return clamp((right - x) / (right - left))
}

function shoulderRight(x: number, left: number, right: number) {
	if (x <= left) return 0
	if (x >= right) return 1
	return clamp((x - left) / (right - left))
}

function toMembershipBands(value: number): FuzzyMembershipResult {
	return {
		low: shoulderLeft(value, 25, 55),
		medium: triangular(value, 30, 55, 80),
		high: shoulderRight(value, 55, 80),
	}
}

function similarityByDistance(left: number, right: number, weight = 1) {
	return clamp((100 - Math.abs(left - right) * weight) / 100) * 100
}

function getMoodCompatibility(mood: MoodValue, movie: Movie) {
	return similarityByDistance(moodCenters[mood], moodCenters[movie.moodValue], 1)
}

function getPaceCompatibility(pacePreference: PaceValue, movie: Movie) {
	return similarityByDistance(
		paceCenters[pacePreference],
		paceCenters[movie.paceValue],
		1.05,
	)
}

function getDepthCompatibility(storyDepth: DepthValue, movie: Movie) {
	return similarityByDistance(
		depthCenters[storyDepth],
		depthCenters[movie.depthValue],
		1,
	)
}

function getGenreSimilarity(preferredGenre: string, movie: Movie) {
	if (!preferredGenre) return 65
	if (movie.genres.includes(preferredGenre)) return 100

	const neighbors: Record<string, string[]> = {
		Комедия: ['Семейный', 'Романтика', 'Мелодрама'],
		Драма: ['История', 'Мелодрама', 'Семейный'],
		Триллер: ['Детектив', 'Боевик', 'Фантастика'],
		Фантастика: ['Триллер', 'Драма', 'Приключения'],
		Семейный: ['Комедия', 'Приключения', 'Мелодрама'],
		Приключения: ['Боевик', 'Семейный', 'Фантастика', 'Спорт'],
		Мелодрама: ['Драма', 'Комедия', 'Романтика'],
		Боевик: ['Триллер', 'Приключения', 'Фантастика'],
		Детектив: ['Триллер', 'Драма'],
		Спорт: ['Драма', 'Приключения'],
		История: ['Драма'],
		Романтика: ['Комедия', 'Мелодрама'],
	}

	if (
		neighbors[preferredGenre]?.some(neighbor => movie.genres.includes(neighbor))
	) {
		return 72
	}

	return 22
}

function getTimeCompatibility(timeBudget: TimeBudget, duration: number) {
	switch (timeBudget) {
		case 'short':
			if (duration <= 95) return 100
			if (duration <= 110) return 75
			if (duration <= 125) return 40
			return 10
		case 'medium':
			if (duration < 90) return 62
			if (duration <= 120) return 100
			if (duration <= 135) return 78
			return 36
		case 'long':
			if (duration < 100) return 28
			if (duration <= 120) return 76
			if (duration <= 145) return 100
			return 82
	}
}

function getAudienceCompatibility(
	audiencePreference: AudiencePreference,
	movie: Movie,
) {
	switch (audiencePreference) {
		case 'any':
			return 65
		case 'family':
			return movie.familyFriendly ? 100 : 18
		case 'adult':
			return movie.familyFriendly ? 45 : 100
	}
}

function explainReasons(
	movie: Movie,
	score: number,
	input: FuzzySearchInput,
	values: {
		mood: number
		genre: number
		time: number
		pace: number
		depth: number
		audience: number
	},
) {
	const reasons: string[] = []

	if (values.mood >= 75) {
		reasons.push(
			`Настроение фильма хорошо совпадает с запросом: ${movie.moodLabel.toLowerCase()}.`,
		)
	}

	if (values.genre >= 75) {
		reasons.push(
			`Жанровый профиль близок к предпочтению пользователя: ${movie.genres.join(', ')}.`,
		)
	}

	if (values.time >= 75) {
		reasons.push(
			`Длительность ${movie.duration} минут хорошо вписывается в выбранный временной бюджет.`,
		)
	}

	if (values.pace >= 75) {
		reasons.push(`Темп фильма соответствует ожиданию: ${movie.paceLabel.toLowerCase()}.`)
	}

	if (values.depth >= 75) {
		reasons.push(
			`Глубина сюжета совпадает с запросом на ${input.storyDepth === 'complex' ? 'сложную' : input.storyDepth === 'layered' ? 'многослойную' : 'лёгкую'} историю.`,
		)
	}

	if (values.audience >= 75 && input.audiencePreference !== 'any') {
		reasons.push(
			input.audiencePreference === 'family'
				? 'Фильм подходит для семейного просмотра.'
				: 'Фильм лучше подходит для взрослой аудитории.',
		)
	}

	if (score >= 80 && reasons.length < 3) {
		reasons.push('Несколько активных правил Мамдани усилили рекомендацию одновременно.')
	}

	if (reasons.length === 0) {
		reasons.push(
			'Картина получила итоговый балл за сбалансированное совпадение по нескольким критериям.',
		)
	}

	return reasons.slice(0, 4)
}

function applyRules(
	mood: FuzzyMembershipResult,
	genre: FuzzyMembershipResult,
	time: FuzzyMembershipResult,
	pace: FuzzyMembershipResult,
	depth: FuzzyMembershipResult,
	audience: FuzzyMembershipResult,
) {
	const rules: RuleEvaluation[] = [
		{
			label: 'Ключевые критерии и дополнительные признаки совпали сильно',
			strength: Math.min(
				mood.high,
				genre.high,
				time.high,
				Math.max(pace.high, depth.high),
			),
			output: 'ideal',
		},
		{
			label: 'Настроение, жанр и темп совпали',
			strength: Math.min(mood.high, genre.high, pace.high),
			output: 'strong',
		},
		{
			label: 'Настроение, время и глубина сюжета совпали',
			strength: Math.min(mood.high, time.high, depth.high),
			output: 'strong',
		},
		{
			label: 'Подходит по жанру, времени и формату просмотра',
			strength: Math.min(genre.high, time.high, audience.high),
			output: 'strong',
		},
		{
			label: 'Большинство критериев на среднем уровне',
			strength: Math.min(
				Math.max(mood.medium, mood.high),
				Math.max(genre.medium, genre.high),
				Math.max(time.medium, time.high),
				Math.max(pace.medium, depth.medium),
			),
			output: 'moderate',
		},
		{
			label: 'Совпали второстепенные признаки при среднем жанровом соответствии',
			strength: Math.min(pace.high, depth.high, genre.medium),
			output: 'moderate',
		},
		{
			label: 'Один из ключевых критериев не совпал',
			strength: Math.max(
				mood.low,
				genre.low,
				time.low,
				Math.min(audience.low, genre.medium),
			),
			output: 'weak',
		},
	]

	return rules.filter(rule => rule.strength > 0)
}

function defuzzify(rules: RuleEvaluation[]) {
	if (rules.length === 0) {
		return 0
	}

	const domain = Array.from({ length: 101 }, (_, index) => index)
	let numerator = 0
	let denominator = 0

	for (const x of domain) {
		const weak = Math.min(
			Math.max(
				...rules
					.filter(rule => rule.output === 'weak')
					.map(rule => rule.strength),
				0,
			),
			shoulderLeft(x, 15, 40),
		)
		const moderate = Math.min(
			Math.max(
				...rules
					.filter(rule => rule.output === 'moderate')
					.map(rule => rule.strength),
				0,
			),
			triangular(x, 30, 55, 75),
		)
		const strong = Math.min(
			Math.max(
				...rules
					.filter(rule => rule.output === 'strong')
					.map(rule => rule.strength),
				0,
			),
			triangular(x, 60, 77, 92),
		)
		const ideal = Math.min(
			Math.max(
				...rules
					.filter(rule => rule.output === 'ideal')
					.map(rule => rule.strength),
				0,
			),
			shoulderRight(x, 82, 96),
		)

		const aggregated = Math.max(weak, moderate, strong, ideal)
		numerator += x * aggregated
		denominator += aggregated
	}

	return denominator === 0 ? 0 : numerator / denominator
}

export function evaluateMovie(
	movie: Movie,
	input: FuzzySearchInput,
): MovieRecommendation {
	const values = {
		mood: getMoodCompatibility(input.mood, movie),
		genre: getGenreSimilarity(input.preferredGenre, movie),
		time: getTimeCompatibility(input.timeBudget, movie.duration),
		pace: getPaceCompatibility(input.pacePreference, movie),
		depth: getDepthCompatibility(input.storyDepth, movie),
		audience: getAudienceCompatibility(input.audiencePreference, movie),
	}

	const memberships = {
		mood: toMembershipBands(values.mood),
		genre: toMembershipBands(values.genre),
		time: toMembershipBands(values.time),
		pace: toMembershipBands(values.pace),
		depth: toMembershipBands(values.depth),
		audience: toMembershipBands(values.audience),
	}

	const rules = applyRules(
		memberships.mood,
		memberships.genre,
		memberships.time,
		memberships.pace,
		memberships.depth,
		memberships.audience,
	)
	const score = Number(defuzzify(rules).toFixed(2))

	return {
		movie,
		score,
		reasons: explainReasons(movie, score, input, values),
		memberships,
		rules,
	}
}

export function rankMoviesWithMamdani(
	movieList: Movie[],
	input: FuzzySearchInput,
	searchContext?: Record<string, string>,
) {
	return movieList
		.map(movie => ({
			...evaluateMovie(movie, input),
			searchContext,
		}))
		.sort((a, b) => b.score - a.score || b.movie.rating - a.movie.rating)
}
