import express from 'express'
import cors from 'cors'
import { CompatibilityLevel, RuleConnector, VariableKind } from '@prisma/client'
import {
	clearAuthCookie,
	createAuthCookie,
	getSessionUser,
	requireAdmin,
	isValidCredentials,
} from './auth.js'
import { config } from './config.js'
import { prisma } from './db.js'
import { buildRecommendations } from './engine.js'
import { serializeMovie, serializeRule, serializeVariable } from './serializers.js'
import {
	movieSchema,
	ruleSchema,
	searchSchema,
	termSchema,
	variableSchema,
} from './validators.js'

const app = express()

app.use(
	cors({
		origin: config.corsOrigin,
		credentials: true,
	}),
)
app.use(express.json({ limit: '2mb' }))

app.get('/health', (_req, res) => {
	res.json({ ok: true })
})

app.post('/api/auth/login', (req, res) => {
	const login = String(req.body?.login ?? '')
	const password = String(req.body?.password ?? '')

	if (!login || !password) {
		return res.status(400).json({ message: 'Введите логин и пароль' })
	}

	if (!isValidCredentials(login, password)) {
		return res.status(401).json({ message: 'Неверный логин или пароль' })
	}

	res.setHeader('Set-Cookie', createAuthCookie())
	return res.json({
		authenticated: true,
		user: {
			login: config.adminLogin,
			role: 'admin',
		},
	})
})

app.get('/api/auth/session', (req, res) => {
	const user = getSessionUser(req)

	if (!user) {
		return res.status(401).json({ authenticated: false })
	}

	return res.json({
		authenticated: true,
		user: {
			login: user.login,
			role: user.role,
		},
	})
})

app.post('/api/auth/logout', (_req, res) => {
	res.setHeader('Set-Cookie', clearAuthCookie())
	return res.status(204).send()
})

async function loadVariables() {
	return prisma.fuzzyVariable.findMany({
		include: {
			terms: {
				orderBy: { label: 'asc' },
			},
		},
		orderBy: { displayOrder: 'asc' },
	})
}

async function loadRules() {
	return prisma.fuzzyRule.findMany({
		include: {
			conditions: {
				include: {
					variable: true,
				},
				orderBy: { id: 'asc' },
			},
		},
		orderBy: { id: 'asc' },
	})
}

async function loadMovies() {
	return prisma.movie.findMany({
		include: {
			variableValues: {
				include: {
					variable: true,
				},
			},
		},
		orderBy: { title: 'asc' },
	})
}

app.use('/api/admin', requireAdmin)

app.get('/api/public/filters', async (_req, res) => {
	const [variables, movies] = await Promise.all([loadVariables(), loadMovies()])
	const genres = Array.from(new Set(movies.flatMap(movie => movie.genres))).sort((a, b) =>
		a.localeCompare(b, 'ru'),
	)
	const countries = Array.from(new Set(movies.map(movie => movie.country))).sort((a, b) =>
		a.localeCompare(b, 'ru'),
	)
	const years = Array.from(new Set(movies.map(movie => String(movie.year)))).sort(
		(left, right) => Number(right) - Number(left),
	)

	res.json({
		variables: variables
			.filter(item => item.exposeInSearch && item.isActive)
			.map(serializeVariable),
		genres,
		countries,
		years,
	})
})

app.post('/api/public/catalog/search', async (req, res) => {
	const payload = searchSchema.parse(req.body)
	const [variables, rules, movies] = await Promise.all([
		loadVariables(),
		loadRules(),
		loadMovies(),
	])

	const recommendations = buildRecommendations({
		variables: variables.filter(item => item.isActive),
		rules: rules.filter(item => item.isActive),
		movies,
		payload,
	})

	const searchableVariables = variables
		.filter(item => item.exposeInSearch && item.isActive)
		.map(serializeVariable)

	const summary = {
		title: 'Выдача сформирована модулем нечеткого вывода',
		description: `Система проанализировала ${recommendations.length} фильмов и применила активные правила Мамдани из PostgreSQL.`,
		metrics: [
			{ label: 'Фильмов в выборке', value: String(recommendations.length) },
			{
				label: 'Средний AI-балл',
				value:
					recommendations.length > 0
						? (
								recommendations.reduce((sum, item) => sum + item.score, 0) /
								recommendations.length
							).toFixed(1)
						: '0.0',
			},
			{
				label: 'Активных правил',
				value: String(rules.filter(item => item.isActive).length),
			},
		],
	}

	res.json({
		summary,
		variables: searchableVariables,
		movies: recommendations.map(item => ({
			...serializeMovie(item.movie),
			score: item.score,
			reasons: item.reasons,
			rules: item.rules,
		})),
	})
})

app.get('/api/public/home', async (_req, res) => {
	const [movies, variables, rules] = await Promise.all([
		loadMovies(),
		loadVariables(),
		loadRules(),
	])
	const recommendations = buildRecommendations({
		movies,
		variables: variables.filter(item => item.isActive),
		rules: rules.filter(item => item.isActive),
		payload: {
			inputs: {
				mood: 'light',
				preferred_genre: 'комедия',
				time_budget: 'medium',
				pace: 'balanced',
				story_depth: 'light',
				audience: 'family',
			},
			filters: { order: 'recommendation' },
		},
	}).slice(0, 8)

	res.json({
		heroSlides: movies.slice(0, 4).map(movie => ({
			id: movie.id,
			type: 'movie',
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
		})),
		aiPicks: recommendations.map(item => ({
			...serializeMovie(item.movie),
			score: item.score,
		})),
		shelves: [
			{
				title: 'Высокий рейтинг',
				description: 'Лучшие фильмы каталога по пользовательскому рейтингу.',
				movies: movies
					.slice()
					.sort((left, right) => right.rating - left.rating)
					.slice(0, 8)
					.map(serializeMovie),
			},
			{
				title: 'Семейный просмотр',
				description: 'Фильмы для совместного просмотра.',
				movies: movies
					.filter(movie => movie.familyFriendly)
					.slice(0, 8)
					.map(serializeMovie),
			},
			{
				title: 'Длинный вечер',
				description: 'Картины для глубокого и длительного просмотра.',
				movies: movies
					.filter(movie => movie.duration >= 110)
					.slice(0, 8)
					.map(serializeMovie),
			},
		],
	})
})

app.get('/api/public/movies/:slug', async (req, res) => {
	const movie = await prisma.movie.findUnique({
		where: { slug: req.params.slug },
		include: {
			variableValues: {
				include: {
					variable: true,
				},
			},
		},
	})

	if (!movie) {
		return res.status(404).json({ message: 'Movie not found' })
	}

	const selectedInputs = Object.fromEntries(
		Object.entries(req.query).map(([key, value]) => [key, String(value)]),
	)

	let explanation = null
	if (selectedInputs.ai === 'true') {
		const [variables, rules] = await Promise.all([loadVariables(), loadRules()])
		const [recommendation] = buildRecommendations({
			movies: [movie],
			variables: variables.filter(item => item.isActive),
			rules: rules.filter(item => item.isActive),
			payload: {
				inputs: selectedInputs,
				filters: {
					order: selectedInputs.order,
					genre: selectedInputs.genre,
					year: selectedInputs.year,
					country: selectedInputs.country,
				},
			},
		})

		explanation = recommendation
			? {
					score: recommendation.score.toFixed(1),
					reasons: recommendation.reasons,
					rules: recommendation.rules,
				}
			: null
	}

	return res.json({
		movie: serializeMovie(movie),
		explanation,
	})
})

app.get('/api/admin/bootstrap', async (_req, res) => {
	const [movies, variables, rules] = await Promise.all([
		loadMovies(),
		loadVariables(),
		loadRules(),
	])

	res.json({
		movies: movies.map(serializeMovie),
		variables: variables.map(serializeVariable),
		rules: rules.map(serializeRule),
		levelOptions: Object.values(CompatibilityLevel),
		kindOptions: Object.values(VariableKind),
	})
})

app.get('/api/admin/movies', async (_req, res) => {
	const movies = await loadMovies()
	res.json({ movies: movies.map(serializeMovie) })
})

app.post('/api/admin/movies', async (req, res) => {
	const payload = movieSchema.parse(req.body)
	const variables = await prisma.fuzzyVariable.findMany({
		where: { kind: VariableKind.SCORE },
	})

	const created = await prisma.movie.create({
		data: {
			slug: payload.slug,
			title: payload.title,
			year: payload.year,
			country: payload.country,
			genres: payload.genres,
			duration: payload.duration,
			ageRating: payload.ageRating,
			rating: payload.rating,
			shortDescription: payload.shortDescription,
			description: payload.description,
			poster: payload.poster,
			backdrop: payload.backdrop,
			provider: payload.provider,
			familyFriendly: payload.familyFriendly,
			variableValues: {
				create: variables.map(variable => ({
					variableId: variable.id,
					value: payload.scoreValues[variable.key] ?? 50,
				})),
			},
		},
		include: {
			variableValues: {
				include: {
					variable: true,
				},
			},
		},
	})

	res.status(201).json({ movie: serializeMovie(created) })
})

app.put('/api/admin/movies/:id', async (req, res) => {
	const movieId = Number(req.params.id)
	const payload = movieSchema.parse(req.body)
	const variables = await prisma.fuzzyVariable.findMany({
		where: { kind: VariableKind.SCORE },
	})

	const updated = await prisma.$transaction(async tx => {
		const movie = await tx.movie.update({
			where: { id: movieId },
			data: {
				slug: payload.slug,
				title: payload.title,
				year: payload.year,
				country: payload.country,
				genres: payload.genres,
				duration: payload.duration,
				ageRating: payload.ageRating,
				rating: payload.rating,
				shortDescription: payload.shortDescription,
				description: payload.description,
				poster: payload.poster,
				backdrop: payload.backdrop,
				provider: payload.provider,
				familyFriendly: payload.familyFriendly,
			},
		})

		for (const variable of variables) {
			await tx.movieVariableValue.upsert({
				where: {
					movieId_variableId: {
						movieId,
						variableId: variable.id,
					},
				},
				update: { value: payload.scoreValues[variable.key] ?? 50 },
				create: {
					movieId,
					variableId: variable.id,
					value: payload.scoreValues[variable.key] ?? 50,
				},
			})
		}

		return tx.movie.findUniqueOrThrow({
			where: { id: movie.id },
			include: {
				variableValues: {
					include: {
						variable: true,
					},
				},
			},
		})
	})

	res.json({ movie: serializeMovie(updated) })
})

app.delete('/api/admin/movies/:id', async (req, res) => {
	await prisma.movie.delete({
		where: { id: Number(req.params.id) },
	})
	res.status(204).send()
})

app.post('/api/admin/variables', async (req, res) => {
	const payload = variableSchema.parse(req.body)
	const variable = await prisma.fuzzyVariable.create({
		data: payload,
		include: { terms: true },
	})
	res.status(201).json({ variable: serializeVariable(variable) })
})

app.put('/api/admin/variables/:id', async (req, res) => {
	const payload = variableSchema.parse(req.body)
	const variable = await prisma.fuzzyVariable.update({
		where: { id: Number(req.params.id) },
		data: payload,
		include: { terms: true },
	})
	res.json({ variable: serializeVariable(variable) })
})

app.delete('/api/admin/variables/:id', async (req, res) => {
	await prisma.fuzzyVariable.delete({
		where: { id: Number(req.params.id) },
	})
	res.status(204).send()
})

app.post('/api/admin/terms', async (req, res) => {
	const payload = termSchema.parse(req.body)
	const term = await prisma.fuzzyTerm.create({
		data: payload,
	})
	res.status(201).json({ term })
})

app.put('/api/admin/terms/:id', async (req, res) => {
	const payload = termSchema.parse(req.body)
	const term = await prisma.fuzzyTerm.update({
		where: { id: Number(req.params.id) },
		data: payload,
	})
	res.json({ term })
})

app.delete('/api/admin/terms/:id', async (req, res) => {
	await prisma.fuzzyTerm.delete({
		where: { id: Number(req.params.id) },
	})
	res.status(204).send()
})

app.post('/api/admin/rules', async (req, res) => {
	const payload = ruleSchema.parse(req.body)
	const rule = await prisma.fuzzyRule.create({
		data: {
			name: payload.name,
			description: payload.description,
			isActive: payload.isActive ?? true,
			weight: payload.weight ?? 1,
			connector: payload.connector ?? RuleConnector.AND,
			outputLabel: payload.outputLabel,
			outputFunctionType: payload.outputFunctionType,
			outputA: payload.outputA,
			outputB: payload.outputB,
			outputC: payload.outputC,
			conditions: {
				create: payload.conditions,
			},
		},
		include: {
			conditions: {
				include: { variable: true },
			},
		},
	})

	res.status(201).json({ rule: serializeRule(rule) })
})

app.put('/api/admin/rules/:id', async (req, res) => {
	const ruleId = Number(req.params.id)
	const payload = ruleSchema.parse(req.body)

	const rule = await prisma.$transaction(async tx => {
		await tx.fuzzyRuleCondition.deleteMany({
			where: { ruleId },
		})

		return tx.fuzzyRule.update({
			where: { id: ruleId },
			data: {
				name: payload.name,
				description: payload.description,
				isActive: payload.isActive ?? true,
				weight: payload.weight ?? 1,
				connector: payload.connector ?? RuleConnector.AND,
				outputLabel: payload.outputLabel,
				outputFunctionType: payload.outputFunctionType,
				outputA: payload.outputA,
				outputB: payload.outputB,
				outputC: payload.outputC,
				conditions: {
					create: payload.conditions,
				},
			},
			include: {
				conditions: {
					include: { variable: true },
				},
			},
		})
	})

	res.json({ rule: serializeRule(rule) })
})

app.delete('/api/admin/rules/:id', async (req, res) => {
	await prisma.fuzzyRule.delete({
		where: { id: Number(req.params.id) },
	})
	res.status(204).send()
})

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
	console.error(error)
	res.status(500).json({
		message: error instanceof Error ? error.message : 'Internal server error',
	})
})

app.listen(config.port, () => {
	console.log(`web-client-ai-api listening on http://localhost:${config.port}`)
})
