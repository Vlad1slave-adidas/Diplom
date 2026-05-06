'use client'

import { Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { apiFetch, getApiBaseUrl } from '@/lib/api'
import type {
	AdminBootstrapResponse,
	ApiMovie,
	ApiRule,
	ApiVariable,
} from '@/lib/api-types'
import { cn } from '@/utils/cn'

interface AdminDashboardProps {
	initialData: AdminBootstrapResponse
}

type AdminTab = 'movies' | 'variables' | 'rules'

interface MovieFormState {
	slug: string
	title: string
	year: string
	country: string
	genres: string
	duration: string
	ageRating: string
	rating: string
	shortDescription: string
	description: string
	poster: string
	backdrop: string
	provider: string
	familyFriendly: boolean
	scoreValues: Record<string, string>
}

interface VariableFormState {
	key: string
	name: string
	description: string
	kind: 'SCORE' | 'GENRE' | 'DURATION' | 'AUDIENCE'
	isActive: boolean
	exposeInSearch: boolean
	displayOrder: string
}

interface TermFormState {
	key: string
	label: string
	functionType: 'TRIANGULAR' | 'LEFT_SHOULDER' | 'RIGHT_SHOULDER' | 'DISCRETE'
	a: string
	b: string
	c: string
	isActive: boolean
}

interface RuleFormState {
	name: string
	description: string
	isActive: boolean
	weight: string
	connector: 'AND' | 'OR'
	outputLabel: string
	outputFunctionType: 'TRIANGULAR' | 'LEFT_SHOULDER' | 'RIGHT_SHOULDER' | 'DISCRETE'
	outputA: string
	outputB: string
	outputC: string
	conditions: Array<{
		variableId: string
		expectedLevel: 'LOW' | 'MEDIUM' | 'HIGH'
	}>
}

const inputClass =
	'bg-medium-dark-purple text-text-default-active w-full rounded-2xl px-4 py-3 text-base outline-none ring-1 ring-transparent transition focus:ring-accent-blue-secondary'

const textareaClass = `${inputClass} min-h-28 resize-y`
const listPageSize = 8

function emptyMovieForm(scoreKeys: string[]): MovieFormState {
	return {
		slug: '',
		title: '',
		year: '',
		country: '',
		genres: '',
		duration: '',
		ageRating: '',
		rating: '',
		shortDescription: '',
		description: '',
		poster: '',
		backdrop: '',
		provider: 'start',
		familyFriendly: false,
		scoreValues: Object.fromEntries(scoreKeys.map(key => [key, '50'])),
	}
}

function movieToForm(movie: ApiMovie, scoreKeys: string[]): MovieFormState {
	return {
		slug: movie.slug,
		title: movie.title,
		year: String(movie.year),
		country: movie.country,
		genres: movie.genres.join(', '),
		duration: String(movie.duration),
		ageRating: String(movie.ageRating),
		rating: String(movie.rating),
		shortDescription: movie.shortDescription,
		description: movie.description,
		poster: movie.poster,
		backdrop: movie.backdrop,
		provider: movie.provider,
		familyFriendly: movie.familyFriendly,
		scoreValues: Object.fromEntries(
			scoreKeys.map(key => [key, String(movie.scoreValues[key] ?? 50)]),
		),
	}
}

function emptyVariableForm(): VariableFormState {
	return {
		key: '',
		name: '',
		description: '',
		kind: 'SCORE',
		isActive: true,
		exposeInSearch: true,
		displayOrder: '0',
	}
}

function variableToForm(variable: ApiVariable): VariableFormState {
	return {
		key: variable.key,
		name: variable.name,
		description: variable.description || '',
		kind: variable.kind,
		isActive: variable.isActive,
		exposeInSearch: variable.exposeInSearch,
		displayOrder: String(variable.displayOrder),
	}
}

function emptyTermForm(): TermFormState {
	return {
		key: '',
		label: '',
		functionType: 'TRIANGULAR',
		a: '',
		b: '',
		c: '',
		isActive: true,
	}
}

function termToForm(variable: ApiVariable, termId: number): TermFormState {
	const term = variable.terms.find(item => item.id === termId)
	if (!term) return emptyTermForm()

	return {
		key: term.key,
		label: term.label,
		functionType: term.functionType as TermFormState['functionType'],
		a: term.a == null ? '' : String(term.a),
		b: term.b == null ? '' : String(term.b),
		c: term.c == null ? '' : String(term.c),
		isActive: term.isActive,
	}
}

function emptyRuleForm(variables: ApiVariable[]): RuleFormState {
	return {
		name: '',
		description: '',
		isActive: true,
		weight: '1',
		connector: 'AND',
		outputLabel: '',
		outputFunctionType: 'TRIANGULAR',
		outputA: '',
		outputB: '',
		outputC: '',
		conditions: [
			{
				variableId: String(variables[0]?.id ?? ''),
				expectedLevel: 'HIGH',
			},
		],
	}
}

function ruleToForm(rule: ApiRule): RuleFormState {
	return {
		name: rule.name,
		description: rule.description || '',
		isActive: rule.isActive,
		weight: String(rule.weight),
		connector: rule.connector,
		outputLabel: rule.outputLabel,
		outputFunctionType: rule.outputFunctionType as RuleFormState['outputFunctionType'],
		outputA: rule.outputA == null ? '' : String(rule.outputA),
		outputB: rule.outputB == null ? '' : String(rule.outputB),
		outputC: rule.outputC == null ? '' : String(rule.outputC),
		conditions: rule.conditions.map(condition => ({
			variableId: String(condition.variableId),
			expectedLevel: condition.expectedLevel,
		})),
	}
}

async function request(path: string, init?: RequestInit) {
	const response = await fetch(`${getApiBaseUrl()}${path}`, {
		...init,
		headers: {
			'Content-Type': 'application/json',
			...(init?.headers || {}),
		},
	})

	if (!response.ok) {
		throw new Error(`Запрос завершился ошибкой ${response.status}`)
	}

	if (response.status === 204) {
		return null
	}

	return response.json()
}

function AdminSection({
	title,
	description,
	children,
}: {
	title: string
	description: string
	children: React.ReactNode
}) {
	return (
		<section className='bg-blue-dark rounded-2xl px-8 py-8 max-lg:px-6 max-sm:px-5'>
			<div className='mb-6'>
				<h2 className='title-1 text-text-default-active'>{title}</h2>
				<p className='body-2 mt-2'>{description}</p>
			</div>
			{children}
		</section>
	)
}

function Pagination({
	page,
	totalPages,
	onChange,
}: {
	page: number
	totalPages: number
	onChange: (page: number) => void
}) {
	if (totalPages <= 1) return null

	const pages = Array.from({ length: totalPages }, (_, index) => index + 1)

	return (
		<div className='mt-4 flex flex-wrap items-center gap-2'>
			<button
				type='button'
				onClick={() => onChange(Math.max(1, page - 1))}
				disabled={page === 1}
				className='button-primary bg-blue px-4 disabled:opacity-40'
			>
				Назад
			</button>
			{pages.map(item => (
				<button
					key={item}
					type='button'
					onClick={() => onChange(item)}
					className={cn(
						'button-primary px-4',
						item === page ? 'primary-gradient' : 'bg-medium-dark-purple',
					)}
				>
					{item}
				</button>
			))}
			<button
				type='button'
				onClick={() => onChange(Math.min(totalPages, page + 1))}
				disabled={page === totalPages}
				className='button-primary bg-blue px-4 disabled:opacity-40'
			>
				Дальше
			</button>
		</div>
	)
}

export default function AdminDashboard({ initialData }: AdminDashboardProps) {
	const [data, setData] = useState(initialData)
	const [activeTab, setActiveTab] = useState<AdminTab>('movies')
	const scoreVariables = useMemo(
		() => data.variables.filter(variable => variable.kind === 'SCORE'),
		[data.variables],
	)
	const [movieQuery, setMovieQuery] = useState('')
	const [moviePage, setMoviePage] = useState(1)
	const [variableQuery, setVariableQuery] = useState('')
	const [variableKindFilter, setVariableKindFilter] = useState<'all' | ApiVariable['kind']>('all')
	const [variablePage, setVariablePage] = useState(1)
	const [ruleQuery, setRuleQuery] = useState('')
	const [ruleActiveFilter, setRuleActiveFilter] = useState<'all' | 'active' | 'inactive'>('all')
	const [rulePage, setRulePage] = useState(1)
	const [selectedMovieId, setSelectedMovieId] = useState<number | null>(
		data.movies[0]?.id ?? null,
	)
	const [selectedVariableId, setSelectedVariableId] = useState<number | null>(
		data.variables[0]?.id ?? null,
	)
	const [selectedTermId, setSelectedTermId] = useState<number | null>(null)
	const [selectedRuleId, setSelectedRuleId] = useState<number | null>(
		data.rules[0]?.id ?? null,
	)
	const [movieForm, setMovieForm] = useState<MovieFormState>(() =>
		data.movies[0]
			? movieToForm(data.movies[0], scoreVariables.map(variable => variable.key))
			: emptyMovieForm(scoreVariables.map(variable => variable.key)),
	)
	const [variableForm, setVariableForm] = useState<VariableFormState>(() =>
		data.variables[0] ? variableToForm(data.variables[0]) : emptyVariableForm(),
	)
	const [termForm, setTermForm] = useState<TermFormState>(emptyTermForm)
	const [ruleForm, setRuleForm] = useState<RuleFormState>(() =>
		data.rules[0] ? ruleToForm(data.rules[0]) : emptyRuleForm(data.variables),
	)
	const [message, setMessage] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [isSaving, setIsSaving] = useState(false)

	const selectedVariable =
		data.variables.find(variable => variable.id === selectedVariableId) ?? null

	const filteredMovies = useMemo(() => {
		const query = movieQuery.trim().toLowerCase()
		return data.movies.filter(movie => {
			if (!query) return true
			return [movie.title, movie.slug, movie.country, movie.genres.join(' ')]
				.join(' ')
				.toLowerCase()
				.includes(query)
		})
	}, [data.movies, movieQuery])

	const movieTotalPages = Math.max(1, Math.ceil(filteredMovies.length / listPageSize))
	const paginatedMovies = filteredMovies.slice(
		(moviePage - 1) * listPageSize,
		moviePage * listPageSize,
	)

	const filteredVariables = useMemo(() => {
		const query = variableQuery.trim().toLowerCase()
		return data.variables.filter(variable => {
			const matchesQuery =
				!query ||
				[variable.name, variable.key, variable.description || '']
					.join(' ')
					.toLowerCase()
					.includes(query)
			const matchesKind =
				variableKindFilter === 'all' || variable.kind === variableKindFilter

			return matchesQuery && matchesKind
		})
	}, [data.variables, variableKindFilter, variableQuery])

	const variableTotalPages = Math.max(
		1,
		Math.ceil(filteredVariables.length / listPageSize),
	)
	const paginatedVariables = filteredVariables.slice(
		(variablePage - 1) * listPageSize,
		variablePage * listPageSize,
	)

	const filteredRules = useMemo(() => {
		const query = ruleQuery.trim().toLowerCase()
		return data.rules.filter(rule => {
			const matchesQuery =
				!query ||
				[
					rule.name,
					rule.description || '',
					rule.outputLabel,
					rule.conditions.map(condition => condition.variableName).join(' '),
				]
					.join(' ')
					.toLowerCase()
					.includes(query)
			const matchesActive =
				ruleActiveFilter === 'all' ||
				(ruleActiveFilter === 'active' ? rule.isActive : !rule.isActive)

			return matchesQuery && matchesActive
		})
	}, [data.rules, ruleActiveFilter, ruleQuery])

	const ruleTotalPages = Math.max(1, Math.ceil(filteredRules.length / listPageSize))
	const paginatedRules = filteredRules.slice(
		(rulePage - 1) * listPageSize,
		rulePage * listPageSize,
	)

	useEffect(() => {
		setMoviePage(1)
	}, [movieQuery])

	useEffect(() => {
		setVariablePage(1)
	}, [variableKindFilter, variableQuery])

	useEffect(() => {
		setRulePage(1)
	}, [ruleActiveFilter, ruleQuery])

	useEffect(() => {
		if (moviePage > movieTotalPages) setMoviePage(movieTotalPages)
	}, [moviePage, movieTotalPages])

	useEffect(() => {
		if (variablePage > variableTotalPages) setVariablePage(variableTotalPages)
	}, [variablePage, variableTotalPages])

	useEffect(() => {
		if (rulePage > ruleTotalPages) setRulePage(ruleTotalPages)
	}, [rulePage, ruleTotalPages])

	async function refreshBootstrap() {
		const bootstrap = await apiFetch<AdminBootstrapResponse>('/api/admin/bootstrap')
		setData(bootstrap)

		const nextScoreKeys = bootstrap.variables
			.filter(variable => variable.kind === 'SCORE')
			.map(variable => variable.key)

		const nextMovie =
			bootstrap.movies.find(movie => movie.id === selectedMovieId) ?? bootstrap.movies[0]
		setSelectedMovieId(nextMovie?.id ?? null)
		setMovieForm(
			nextMovie
				? movieToForm(nextMovie, nextScoreKeys)
				: emptyMovieForm(nextScoreKeys),
		)

		const nextVariable =
			bootstrap.variables.find(variable => variable.id === selectedVariableId) ??
			bootstrap.variables[0]
		setSelectedVariableId(nextVariable?.id ?? null)
		setVariableForm(nextVariable ? variableToForm(nextVariable) : emptyVariableForm())

		const termStillExists = nextVariable?.terms.some(term => term.id === selectedTermId)
		setSelectedTermId(termStillExists ? selectedTermId : null)
		setTermForm(
			nextVariable && termStillExists && selectedTermId
				? termToForm(nextVariable, selectedTermId)
				: emptyTermForm(),
		)

		const nextRule =
			bootstrap.rules.find(rule => rule.id === selectedRuleId) ?? bootstrap.rules[0]
		setSelectedRuleId(nextRule?.id ?? null)
		setRuleForm(nextRule ? ruleToForm(nextRule) : emptyRuleForm(bootstrap.variables))
	}

	async function runMutation(action: () => Promise<void>, successText: string) {
		setIsSaving(true)
		setError(null)
		setMessage(null)

		try {
			await action()
			await refreshBootstrap()
			setMessage(successText)
		} catch (mutationError) {
			setError(mutationError instanceof Error ? mutationError.message : 'Не удалось сохранить изменения.')
		} finally {
			setIsSaving(false)
		}
	}

	const selectMovie = (movie: ApiMovie) => {
		setSelectedMovieId(movie.id)
		setMovieForm(movieToForm(movie, scoreVariables.map(variable => variable.key)))
	}

	const selectVariable = (variable: ApiVariable) => {
		setSelectedVariableId(variable.id)
		setSelectedTermId(null)
		setVariableForm(variableToForm(variable))
		setTermForm(emptyTermForm())
	}

	const selectTerm = (termId: number) => {
		if (!selectedVariable) return
		setSelectedTermId(termId)
		setTermForm(termToForm(selectedVariable, termId))
	}

	const selectRule = (rule: ApiRule) => {
		setSelectedRuleId(rule.id)
		setRuleForm(ruleToForm(rule))
	}

	return (
		<div className='page-footer-gap margin-top-with-absolute-header'>
			<div className='default-px space-y-8'>
				<div className='mb-2'>
					<h1 className='title-1 text-text-default-active'>Админка FilmSense</h1>
					<p className='body-2 mt-3 max-w-4xl'>
						Управляйте локальным каталогом, входными переменными, функциями
						принадлежности и правилами Мамдани в одном интерфейсе.
					</p>
				</div>

				<div className='flex flex-wrap gap-3'>
					{[
						{ key: 'movies', label: 'Фильмы', count: data.movies.length },
						{
							key: 'variables',
							label: 'Переменные',
							count: data.variables.length,
						},
						{ key: 'rules', label: 'Правила', count: data.rules.length },
					].map(item => (
						<button
							key={item.key}
							type='button'
							onClick={() => setActiveTab(item.key as AdminTab)}
							className={cn(
								'button-primary px-6',
								activeTab === item.key ? 'primary-gradient' : 'bg-blue',
							)}
						>
							{item.label} · {item.count}
						</button>
					))}
				</div>

				{message && (
					<div className='rounded-2xl bg-success-green/15 px-5 py-4 text-white'>
						{message}
					</div>
				)}
				{error && (
					<div className='rounded-2xl bg-red/15 px-5 py-4 text-white'>{error}</div>
				)}

				{activeTab === 'movies' && (
				<AdminSection
					title='Фильмы'
					description='Редактируйте карточки каталога и численные признаки, которые участвуют в нечетком выводе.'
				>
					<div className='grid gap-8 xl:grid-cols-[22rem_minmax(0,1fr)]'>
						<div className='space-y-3'>
							<div className='relative'>
								<Search className='text-text-info absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2' />
								<input
									className='bg-medium-dark-purple text-text-default-active w-full rounded-2xl py-3 pr-4 pl-11 text-base outline-none'
									placeholder='Поиск по названию, slug, стране, жанру'
									value={movieQuery}
									onChange={event => setMovieQuery(event.target.value)}
								/>
							</div>
							<button
								type='button'
								onClick={() => {
									setSelectedMovieId(null)
									setMovieForm(
										emptyMovieForm(scoreVariables.map(variable => variable.key)),
									)
								}}
								className='button-primary primary-gradient w-full px-6'
							>
								Новый фильм
							</button>
							<div className='caption-2 text-text-info'>
								Показано {paginatedMovies.length} из {filteredMovies.length}
							</div>
							<div className='space-y-3'>
								{paginatedMovies.map(movie => (
									<button
										key={movie.id}
										type='button'
										onClick={() => selectMovie(movie)}
										className={`w-full rounded-2xl px-4 py-4 text-left transition ${
											selectedMovieId === movie.id
												? 'bg-accent-blue text-white'
												: 'bg-medium-dark-purple text-text-default-active'
										}`}
									>
										<div className='text-lg font-semibold'>{movie.title}</div>
										<div className='caption-2 mt-1'>
											{movie.year} • {movie.country}
										</div>
									</button>
								))}
							</div>
							<Pagination
								page={moviePage}
								totalPages={movieTotalPages}
								onChange={setMoviePage}
							/>
						</div>

						<form
							className='grid gap-4'
							onSubmit={event => {
								event.preventDefault()
								void runMutation(async () => {
									const payload = {
										slug: movieForm.slug.trim(),
										title: movieForm.title.trim(),
										year: Number(movieForm.year),
										country: movieForm.country.trim(),
										genres: movieForm.genres
											.split(',')
											.map(item => item.trim())
											.filter(Boolean),
										duration: Number(movieForm.duration),
										ageRating: Number(movieForm.ageRating),
										rating: Number(movieForm.rating),
										shortDescription: movieForm.shortDescription.trim(),
										description: movieForm.description.trim(),
										poster: movieForm.poster.trim(),
										backdrop: movieForm.backdrop.trim(),
										provider: movieForm.provider.trim(),
										familyFriendly: movieForm.familyFriendly,
										scoreValues: Object.fromEntries(
											Object.entries(movieForm.scoreValues).map(([key, value]) => [
												key,
												Number(value || 0),
											]),
										),
									}

									if (selectedMovieId) {
										await request(`/api/admin/movies/${selectedMovieId}`, {
											method: 'PUT',
											body: JSON.stringify(payload),
										})
										return
									}

									await request('/api/admin/movies', {
										method: 'POST',
										body: JSON.stringify(payload),
									})
								}, selectedMovieId ? 'Фильм обновлён.' : 'Фильм создан.')
							}}
						>
							<div className='grid gap-4 md:grid-cols-2'>
								<input
									className={inputClass}
									placeholder='Название'
									value={movieForm.title}
									onChange={event =>
										setMovieForm(current => ({ ...current, title: event.target.value }))
									}
								/>
								<input
									className={inputClass}
									placeholder='Slug'
									value={movieForm.slug}
									onChange={event =>
										setMovieForm(current => ({ ...current, slug: event.target.value }))
									}
								/>
								<input
									className={inputClass}
									placeholder='Год'
									type='number'
									value={movieForm.year}
									onChange={event =>
										setMovieForm(current => ({ ...current, year: event.target.value }))
									}
								/>
								<input
									className={inputClass}
									placeholder='Страна'
									value={movieForm.country}
									onChange={event =>
										setMovieForm(current => ({
											...current,
											country: event.target.value,
										}))
									}
								/>
								<input
									className={inputClass}
									placeholder='Жанры через запятую'
									value={movieForm.genres}
									onChange={event =>
										setMovieForm(current => ({ ...current, genres: event.target.value }))
									}
								/>
								<input
									className={inputClass}
									placeholder='Провайдер'
									value={movieForm.provider}
									onChange={event =>
										setMovieForm(current => ({
											...current,
											provider: event.target.value,
										}))
									}
								/>
								<input
									className={inputClass}
									placeholder='Длительность'
									type='number'
									value={movieForm.duration}
									onChange={event =>
										setMovieForm(current => ({
											...current,
											duration: event.target.value,
										}))
									}
								/>
								<input
									className={inputClass}
									placeholder='Возрастной рейтинг'
									type='number'
									value={movieForm.ageRating}
									onChange={event =>
										setMovieForm(current => ({
											...current,
											ageRating: event.target.value,
										}))
									}
								/>
								<input
									className={inputClass}
									placeholder='Рейтинг'
									type='number'
									step='0.1'
									value={movieForm.rating}
									onChange={event =>
										setMovieForm(current => ({
											...current,
											rating: event.target.value,
										}))
									}
								/>
								<label className='flex items-center gap-3 rounded-2xl bg-medium-dark-purple px-4 py-3 text-white'>
									<input
										type='checkbox'
										checked={movieForm.familyFriendly}
										onChange={event =>
											setMovieForm(current => ({
												...current,
												familyFriendly: event.target.checked,
											}))
										}
									/>
									Семейный просмотр
								</label>
								<input
									className={`${inputClass} md:col-span-2`}
									placeholder='Poster URL'
									value={movieForm.poster}
									onChange={event =>
										setMovieForm(current => ({ ...current, poster: event.target.value }))
									}
								/>
								<input
									className={`${inputClass} md:col-span-2`}
									placeholder='Backdrop URL'
									value={movieForm.backdrop}
									onChange={event =>
										setMovieForm(current => ({
											...current,
											backdrop: event.target.value,
										}))
									}
								/>
							</div>

							<textarea
								className={textareaClass}
								placeholder='Короткое описание'
								value={movieForm.shortDescription}
								onChange={event =>
									setMovieForm(current => ({
										...current,
										shortDescription: event.target.value,
									}))
								}
							/>
							<textarea
								className={textareaClass}
								placeholder='Полное описание'
								value={movieForm.description}
								onChange={event =>
									setMovieForm(current => ({
										...current,
										description: event.target.value,
									}))
								}
							/>

							<div className='rounded-2xl bg-medium-dark-purple p-5'>
								<h3 className='title-4 text-text-default-active'>
									Численные признаки для нечеткого вывода
								</h3>
								<div className='mt-4 grid gap-4 md:grid-cols-3'>
									{scoreVariables.map(variable => (
										<div key={variable.id}>
											<div className='caption-2 mb-2'>{variable.name}</div>
											<input
												className={inputClass}
												type='number'
												min='0'
												max='100'
												value={movieForm.scoreValues[variable.key] ?? '50'}
												onChange={event =>
													setMovieForm(current => ({
														...current,
														scoreValues: {
															...current.scoreValues,
															[variable.key]: event.target.value,
														},
													}))
												}
											/>
										</div>
									))}
								</div>
							</div>

							<div className='flex flex-wrap gap-3'>
								<button
									type='submit'
									disabled={isSaving}
									className='button-primary primary-gradient px-6 disabled:opacity-50'
								>
									{selectedMovieId ? 'Сохранить фильм' : 'Создать фильм'}
								</button>
								{selectedMovieId && (
									<button
										type='button'
										disabled={isSaving}
										onClick={() => {
											if (!window.confirm('Удалить фильм?')) return
											void runMutation(
												() =>
													request(`/api/admin/movies/${selectedMovieId}`, {
														method: 'DELETE',
													}).then(() => undefined),
												'Фильм удалён.',
											)
										}}
										className='button-primary bg-blue px-6 disabled:opacity-50'
									>
										Удалить фильм
									</button>
								)}
							</div>
						</form>
					</div>
				</AdminSection>
				)}

				{activeTab === 'variables' && (
				<AdminSection
					title='Переменные и термы'
					description='Управляйте входными шкалами и функциями принадлежности, из которых состоит база знаний.'
				>
					<div className='grid gap-8 xl:grid-cols-[20rem_minmax(0,1fr)]'>
						<div className='space-y-3'>
							<div className='relative'>
								<Search className='text-text-info absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2' />
								<input
									className='bg-medium-dark-purple text-text-default-active w-full rounded-2xl py-3 pr-4 pl-11 text-base outline-none'
									placeholder='Поиск по имени, ключу, описанию'
									value={variableQuery}
									onChange={event => setVariableQuery(event.target.value)}
								/>
							</div>
							<select
								className={inputClass}
								value={variableKindFilter}
								onChange={event =>
									setVariableKindFilter(
										event.target.value as 'all' | ApiVariable['kind'],
									)
								}
							>
								<option value='all'>Все типы</option>
								{data.kindOptions.map(kind => (
									<option key={kind} value={kind}>
										{kind}
									</option>
								))}
							</select>
							<button
								type='button'
								onClick={() => {
									setSelectedVariableId(null)
									setSelectedTermId(null)
									setVariableForm(emptyVariableForm())
									setTermForm(emptyTermForm())
								}}
								className='button-primary primary-gradient w-full px-6'
							>
								Новая переменная
							</button>
							<div className='caption-2 text-text-info'>
								Показано {paginatedVariables.length} из {filteredVariables.length}
							</div>
							{paginatedVariables.map(variable => (
								<button
									key={variable.id}
									type='button'
									onClick={() => selectVariable(variable)}
									className={`w-full rounded-2xl px-4 py-4 text-left transition ${
										selectedVariableId === variable.id
											? 'bg-accent-blue text-white'
											: 'bg-medium-dark-purple text-text-default-active'
									}`}
								>
									<div className='text-lg font-semibold'>{variable.name}</div>
									<div className='caption-2 mt-1'>
										{variable.key} · {variable.kind}
									</div>
								</button>
							))}
							<Pagination
								page={variablePage}
								totalPages={variableTotalPages}
								onChange={setVariablePage}
							/>
						</div>

						<div className='space-y-6'>
							<form
								className='grid gap-4'
								onSubmit={event => {
									event.preventDefault()
									void runMutation(async () => {
										const payload = {
											key: variableForm.key.trim(),
											name: variableForm.name.trim(),
											description: variableForm.description.trim(),
											kind: variableForm.kind,
											isActive: variableForm.isActive,
											exposeInSearch: variableForm.exposeInSearch,
											displayOrder: Number(variableForm.displayOrder),
										}

										if (selectedVariableId) {
											await request(`/api/admin/variables/${selectedVariableId}`, {
												method: 'PUT',
												body: JSON.stringify(payload),
											})
											return
										}

										await request('/api/admin/variables', {
											method: 'POST',
											body: JSON.stringify(payload),
										})
									}, selectedVariableId ? 'Переменная обновлена.' : 'Переменная создана.')
								}}
							>
								<div className='grid gap-4 md:grid-cols-2'>
									<input
										className={inputClass}
										placeholder='Ключ'
										value={variableForm.key}
										onChange={event =>
											setVariableForm(current => ({
												...current,
												key: event.target.value,
											}))
										}
									/>
									<input
										className={inputClass}
										placeholder='Название'
										value={variableForm.name}
										onChange={event =>
											setVariableForm(current => ({
												...current,
												name: event.target.value,
											}))
										}
									/>
									<select
										className={inputClass}
										value={variableForm.kind}
										onChange={event =>
											setVariableForm(current => ({
												...current,
												kind: event.target.value as VariableFormState['kind'],
											}))
										}
									>
										{data.kindOptions.map(kind => (
											<option key={kind} value={kind}>
												{kind}
											</option>
										))}
									</select>
									<input
										className={inputClass}
										placeholder='Порядок'
										type='number'
										value={variableForm.displayOrder}
										onChange={event =>
											setVariableForm(current => ({
												...current,
												displayOrder: event.target.value,
											}))
										}
									/>
								</div>
								<textarea
									className={textareaClass}
									placeholder='Описание'
									value={variableForm.description}
									onChange={event =>
										setVariableForm(current => ({
											...current,
											description: event.target.value,
										}))
									}
								/>
								<div className='flex flex-wrap gap-6 rounded-2xl bg-medium-dark-purple px-5 py-4'>
									<label className='flex items-center gap-3'>
										<input
											type='checkbox'
											checked={variableForm.isActive}
											onChange={event =>
												setVariableForm(current => ({
													...current,
													isActive: event.target.checked,
												}))
											}
										/>
										Активна
									</label>
									<label className='flex items-center gap-3'>
										<input
											type='checkbox'
											checked={variableForm.exposeInSearch}
											onChange={event =>
												setVariableForm(current => ({
													...current,
													exposeInSearch: event.target.checked,
												}))
											}
										/>
										Показывать в подборе
									</label>
								</div>
								<div className='flex flex-wrap gap-3'>
									<button
										type='submit'
										disabled={isSaving}
										className='button-primary primary-gradient px-6 disabled:opacity-50'
									>
										{selectedVariableId
											? 'Сохранить переменную'
											: 'Создать переменную'}
									</button>
									{selectedVariableId && (
										<button
											type='button'
											disabled={isSaving}
											onClick={() => {
												if (!window.confirm('Удалить переменную?')) return
												void runMutation(
													() =>
														request(`/api/admin/variables/${selectedVariableId}`, {
															method: 'DELETE',
														}).then(() => undefined),
													'Переменная удалена.',
												)
											}}
											className='button-primary bg-blue px-6 disabled:opacity-50'
										>
											Удалить переменную
										</button>
									)}
								</div>
							</form>

							{selectedVariable && (
								<div className='rounded-2xl bg-medium-dark-purple p-5'>
									<div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
										<h3 className='title-4 text-text-default-active'>
											Термы переменной «{selectedVariable.name}»
										</h3>
										<button
											type='button'
											onClick={() => {
												setSelectedTermId(null)
												setTermForm(emptyTermForm())
											}}
											className='button-primary bg-blue px-5'
										>
											Новый терм
										</button>
									</div>

									<div className='grid gap-6 xl:grid-cols-[18rem_minmax(0,1fr)]'>
										<div className='space-y-3'>
											{selectedVariable.terms.map(term => (
												<button
													key={term.id}
													type='button'
													onClick={() => selectTerm(term.id)}
													className={`w-full rounded-2xl px-4 py-4 text-left transition ${
														selectedTermId === term.id
															? 'bg-accent-blue text-white'
															: 'bg-blue-dark text-text-default-active'
													}`}
												>
													<div className='text-base font-semibold'>{term.label}</div>
													<div className='caption-2 mt-1'>{term.key}</div>
												</button>
											))}
										</div>

										<form
											className='grid gap-4'
											onSubmit={event => {
												event.preventDefault()
												void runMutation(async () => {
													const payload = {
														variableId: selectedVariable.id,
														key: termForm.key.trim(),
														label: termForm.label.trim(),
														functionType: termForm.functionType,
														a: termForm.a ? Number(termForm.a) : null,
														b: termForm.b ? Number(termForm.b) : null,
														c: termForm.c ? Number(termForm.c) : null,
														isActive: termForm.isActive,
													}

													if (selectedTermId) {
														await request(`/api/admin/terms/${selectedTermId}`, {
															method: 'PUT',
															body: JSON.stringify(payload),
														})
														return
													}

													await request('/api/admin/terms', {
														method: 'POST',
														body: JSON.stringify(payload),
													})
												}, selectedTermId ? 'Терм обновлён.' : 'Терм создан.')
											}}
										>
											<div className='grid gap-4 md:grid-cols-2'>
												<input
													className={inputClass}
													placeholder='Ключ терма'
													value={termForm.key}
													onChange={event =>
														setTermForm(current => ({
															...current,
															key: event.target.value,
														}))
													}
												/>
												<input
													className={inputClass}
													placeholder='Название терма'
													value={termForm.label}
													onChange={event =>
														setTermForm(current => ({
															...current,
															label: event.target.value,
														}))
													}
												/>
												<select
													className={inputClass}
													value={termForm.functionType}
													onChange={event =>
														setTermForm(current => ({
															...current,
															functionType:
																event.target.value as TermFormState['functionType'],
														}))
													}
												>
													<option value='TRIANGULAR'>TRIANGULAR</option>
													<option value='LEFT_SHOULDER'>LEFT_SHOULDER</option>
													<option value='RIGHT_SHOULDER'>RIGHT_SHOULDER</option>
													<option value='DISCRETE'>DISCRETE</option>
												</select>
												<label className='flex items-center gap-3 rounded-2xl bg-blue-dark px-4 py-3 text-white'>
													<input
														type='checkbox'
														checked={termForm.isActive}
														onChange={event =>
															setTermForm(current => ({
																...current,
																isActive: event.target.checked,
															}))
														}
													/>
													Активен
												</label>
												<input
													className={inputClass}
													placeholder='a'
													type='number'
													step='0.1'
													value={termForm.a}
													onChange={event =>
														setTermForm(current => ({
															...current,
															a: event.target.value,
														}))
													}
												/>
												<input
													className={inputClass}
													placeholder='b'
													type='number'
													step='0.1'
													value={termForm.b}
													onChange={event =>
														setTermForm(current => ({
															...current,
															b: event.target.value,
														}))
													}
												/>
												<input
													className={inputClass}
													placeholder='c'
													type='number'
													step='0.1'
													value={termForm.c}
													onChange={event =>
														setTermForm(current => ({
															...current,
															c: event.target.value,
														}))
													}
												/>
											</div>
											<div className='flex flex-wrap gap-3'>
												<button
													type='submit'
													disabled={isSaving}
													className='button-primary primary-gradient px-6 disabled:opacity-50'
												>
													{selectedTermId ? 'Сохранить терм' : 'Создать терм'}
												</button>
												{selectedTermId && (
													<button
														type='button'
														disabled={isSaving}
														onClick={() => {
															if (!window.confirm('Удалить терм?')) return
															void runMutation(
																() =>
																	request(`/api/admin/terms/${selectedTermId}`, {
																		method: 'DELETE',
																	}).then(() => undefined),
																'Терм удалён.',
															)
														}}
														className='button-primary bg-blue px-6 disabled:opacity-50'
													>
														Удалить терм
													</button>
												)}
											</div>
										</form>
									</div>
								</div>
							)}
						</div>
					</div>
				</AdminSection>
				)}

				{activeTab === 'rules' && (
				<AdminSection
					title='Правила Мамдани'
					description='Создавайте и редактируйте активные правила, влияющие на итоговый recommendation score.'
				>
					<div className='grid gap-8 xl:grid-cols-[22rem_minmax(0,1fr)]'>
						<div className='space-y-3'>
							<div className='relative'>
								<Search className='text-text-info absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2' />
								<input
									className='bg-medium-dark-purple text-text-default-active w-full rounded-2xl py-3 pr-4 pl-11 text-base outline-none'
									placeholder='Поиск по названию, описанию, переменным'
									value={ruleQuery}
									onChange={event => setRuleQuery(event.target.value)}
								/>
							</div>
							<select
								className={inputClass}
								value={ruleActiveFilter}
								onChange={event =>
									setRuleActiveFilter(
										event.target.value as 'all' | 'active' | 'inactive',
									)
								}
							>
								<option value='all'>Все правила</option>
								<option value='active'>Только активные</option>
								<option value='inactive'>Только неактивные</option>
							</select>
							<button
								type='button'
								onClick={() => {
									setSelectedRuleId(null)
									setRuleForm(emptyRuleForm(data.variables))
								}}
								className='button-primary primary-gradient w-full px-6'
							>
								Новое правило
							</button>
							<div className='caption-2 text-text-info'>
								Показано {paginatedRules.length} из {filteredRules.length}
							</div>
							{paginatedRules.map(rule => (
								<button
									key={rule.id}
									type='button'
									onClick={() => selectRule(rule)}
									className={`w-full rounded-2xl px-4 py-4 text-left transition ${
										selectedRuleId === rule.id
											? 'bg-accent-blue text-white'
											: 'bg-medium-dark-purple text-text-default-active'
									}`}
								>
									<div className='text-base font-semibold'>{rule.name}</div>
									<div className='caption-2 mt-1'>
										{rule.isActive ? 'Активно' : 'Выключено'} • {rule.connector}
										{' • '}weight {rule.weight}
									</div>
								</button>
							))}
							<Pagination
								page={rulePage}
								totalPages={ruleTotalPages}
								onChange={setRulePage}
							/>
						</div>

						<form
							className='grid gap-4'
							onSubmit={event => {
								event.preventDefault()
								void runMutation(async () => {
									const payload = {
										name: ruleForm.name.trim(),
										description: ruleForm.description.trim(),
										isActive: ruleForm.isActive,
										weight: Number(ruleForm.weight),
										connector: ruleForm.connector,
										outputLabel: ruleForm.outputLabel.trim(),
										outputFunctionType: ruleForm.outputFunctionType,
										outputA: ruleForm.outputA ? Number(ruleForm.outputA) : null,
										outputB: ruleForm.outputB ? Number(ruleForm.outputB) : null,
										outputC: ruleForm.outputC ? Number(ruleForm.outputC) : null,
										conditions: ruleForm.conditions.map(condition => ({
											variableId: Number(condition.variableId),
											expectedLevel: condition.expectedLevel,
										})),
									}

									if (selectedRuleId) {
										await request(`/api/admin/rules/${selectedRuleId}`, {
											method: 'PUT',
											body: JSON.stringify(payload),
										})
										return
									}

									await request('/api/admin/rules', {
										method: 'POST',
										body: JSON.stringify(payload),
									})
								}, selectedRuleId ? 'Правило обновлено.' : 'Правило создано.')
							}}
						>
							<div className='grid gap-4 md:grid-cols-2'>
								<input
									className={inputClass}
									placeholder='Название правила'
									value={ruleForm.name}
									onChange={event =>
										setRuleForm(current => ({ ...current, name: event.target.value }))
									}
								/>
								<input
									className={inputClass}
									placeholder='Выходная метка'
									value={ruleForm.outputLabel}
									onChange={event =>
										setRuleForm(current => ({
											...current,
											outputLabel: event.target.value,
										}))
									}
								/>
								<input
									className={inputClass}
									placeholder='Вес'
									type='number'
									step='0.01'
									value={ruleForm.weight}
									onChange={event =>
										setRuleForm(current => ({
											...current,
											weight: event.target.value,
										}))
									}
								/>
								<select
									className={inputClass}
									value={ruleForm.connector}
									onChange={event =>
										setRuleForm(current => ({
											...current,
											connector: event.target.value as RuleFormState['connector'],
										}))
									}
								>
									<option value='AND'>AND</option>
									<option value='OR'>OR</option>
								</select>
								<select
									className={inputClass}
									value={ruleForm.outputFunctionType}
									onChange={event =>
										setRuleForm(current => ({
											...current,
											outputFunctionType:
												event.target.value as RuleFormState['outputFunctionType'],
										}))
									}
								>
									<option value='TRIANGULAR'>TRIANGULAR</option>
									<option value='LEFT_SHOULDER'>LEFT_SHOULDER</option>
									<option value='RIGHT_SHOULDER'>RIGHT_SHOULDER</option>
									<option value='DISCRETE'>DISCRETE</option>
								</select>
								<label className='flex items-center gap-3 rounded-2xl bg-medium-dark-purple px-4 py-3 text-white'>
									<input
										type='checkbox'
										checked={ruleForm.isActive}
										onChange={event =>
											setRuleForm(current => ({
												...current,
												isActive: event.target.checked,
											}))
										}
									/>
									Активно
								</label>
								<input
									className={inputClass}
									placeholder='output a'
									type='number'
									step='0.1'
									value={ruleForm.outputA}
									onChange={event =>
										setRuleForm(current => ({
											...current,
											outputA: event.target.value,
										}))
									}
								/>
								<input
									className={inputClass}
									placeholder='output b'
									type='number'
									step='0.1'
									value={ruleForm.outputB}
									onChange={event =>
										setRuleForm(current => ({
											...current,
											outputB: event.target.value,
										}))
									}
								/>
								<input
									className={inputClass}
									placeholder='output c'
									type='number'
									step='0.1'
									value={ruleForm.outputC}
									onChange={event =>
										setRuleForm(current => ({
											...current,
											outputC: event.target.value,
										}))
									}
								/>
							</div>

							<textarea
								className={textareaClass}
								placeholder='Описание правила'
								value={ruleForm.description}
								onChange={event =>
									setRuleForm(current => ({
										...current,
										description: event.target.value,
									}))
								}
							/>

							<div className='rounded-2xl bg-medium-dark-purple p-5'>
								<div className='mb-4 flex items-center justify-between gap-3'>
									<h3 className='title-4 text-text-default-active'>Условия</h3>
									<button
										type='button'
										onClick={() =>
											setRuleForm(current => ({
												...current,
												conditions: [
													...current.conditions,
													{
														variableId: String(data.variables[0]?.id ?? ''),
														expectedLevel: 'HIGH',
													},
												],
											}))
										}
										className='button-primary bg-blue px-5'
									>
										Добавить условие
									</button>
								</div>

								<div className='space-y-4'>
									{ruleForm.conditions.map((condition, index) => (
										<div
											key={`${condition.variableId}-${index}`}
											className='grid gap-3 rounded-2xl bg-blue-dark p-4 md:grid-cols-[minmax(0,1fr)_12rem_auto]'
										>
											<select
												className={inputClass}
												value={condition.variableId}
												onChange={event =>
													setRuleForm(current => ({
														...current,
														conditions: current.conditions.map((item, itemIndex) =>
															itemIndex === index
																? {
																		...item,
																		variableId: event.target.value,
																	}
																: item,
														),
													}))
												}
											>
												{data.variables.map(variable => (
													<option key={variable.id} value={variable.id}>
														{variable.name}
													</option>
												))}
											</select>
											<select
												className={inputClass}
												value={condition.expectedLevel}
												onChange={event =>
													setRuleForm(current => ({
														...current,
														conditions: current.conditions.map((item, itemIndex) =>
															itemIndex === index
																? {
																		...item,
																		expectedLevel:
																			event.target
																				.value as RuleFormState['conditions'][number]['expectedLevel'],
																	}
																: item,
														),
													}))
												}
											>
												{data.levelOptions.map(level => (
													<option key={level} value={level}>
														{level}
													</option>
												))}
											</select>
											<button
												type='button'
												onClick={() =>
													setRuleForm(current => ({
														...current,
														conditions:
															current.conditions.length === 1
																? current.conditions
																: current.conditions.filter(
																		(_, itemIndex) => itemIndex !== index,
																	),
													}))
												}
												className='button-primary bg-blue px-5'
											>
												Удалить
											</button>
										</div>
									))}
								</div>
							</div>

							<div className='flex flex-wrap gap-3'>
								<button
									type='submit'
									disabled={isSaving}
									className='button-primary primary-gradient px-6 disabled:opacity-50'
								>
									{selectedRuleId ? 'Сохранить правило' : 'Создать правило'}
								</button>
								{selectedRuleId && (
									<button
										type='button'
										disabled={isSaving}
										onClick={() => {
											if (!window.confirm('Удалить правило?')) return
											void runMutation(
												() =>
													request(`/api/admin/rules/${selectedRuleId}`, {
														method: 'DELETE',
													}).then(() => undefined),
												'Правило удалено.',
											)
										}}
										className='button-primary bg-blue px-6 disabled:opacity-50'
									>
										Удалить правило
									</button>
								)}
							</div>
						</form>
					</div>
				</AdminSection>
				)}
			</div>
		</div>
	)
}
