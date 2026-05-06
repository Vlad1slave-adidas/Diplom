import test from 'node:test'
import assert from 'node:assert/strict'
import { movies } from '../src/lib/data/movies.ts'
import { evaluateMovie, rankMoviesWithMamdani } from '../src/lib/fuzzy/engine.ts'

test('короткий спокойный запрос выше оценивает спокойную семейную драму, чем напряжённый боевик', () => {
	const calmMovie = movies.find(movie => movie.slug === 'tikhiy-bereg')
	const actionMovie = movies.find(movie => movie.slug === 'ulitsa-ogney')

	assert.ok(calmMovie)
	assert.ok(actionMovie)

	const calmScore = evaluateMovie(calmMovie, {
		mood: 'calm',
		preferredGenre: 'Семейный',
		timeBudget: 'short',
		pacePreference: 'slow',
		storyDepth: 'layered',
		audiencePreference: 'family',
	}).score

	const actionScore = evaluateMovie(actionMovie, {
		mood: 'calm',
		preferredGenre: 'Семейный',
		timeBudget: 'short',
		pacePreference: 'slow',
		storyDepth: 'layered',
		audiencePreference: 'family',
	}).score

	assert.ok(calmScore > actionScore)
})

test('точное совпадение жанра усиливает рекомендацию', () => {
	const comedy = movies.find(movie => movie.slug === 'letniy-kod')

	assert.ok(comedy)

	const exactGenre = evaluateMovie(comedy, {
		mood: 'light',
		preferredGenre: 'Комедия',
		timeBudget: 'medium',
		pacePreference: 'balanced',
		storyDepth: 'light',
		audiencePreference: 'family',
	}).score

	const wrongGenre = evaluateMovie(comedy, {
		mood: 'light',
		preferredGenre: 'Триллер',
		timeBudget: 'medium',
		pacePreference: 'balanced',
		storyDepth: 'light',
		audiencePreference: 'family',
	}).score

	assert.ok(exactGenre > wrongGenre)
})

test('ранжирование возвращает фильмы по убыванию итогового балла', () => {
	const results = rankMoviesWithMamdani(movies.slice(0, 6), {
		mood: 'thoughtful',
		preferredGenre: 'Драма',
		timeBudget: 'long',
		pacePreference: 'balanced',
		storyDepth: 'complex',
		audiencePreference: 'adult',
	})

	assert.ok(results[0].score >= results[1].score)
	assert.ok(results[1].score >= results[2].score)
})

test('предпочтение семейного просмотра повышает оценку семейного фильма', () => {
	const familyMovie = movies.find(movie => movie.slug === 'gromkiy-den')
	const adultMovie = movies.find(movie => movie.slug === 'ulitsa-ogney')

	assert.ok(familyMovie)
	assert.ok(adultMovie)

	const familyScore = evaluateMovie(familyMovie, {
		mood: 'light',
		preferredGenre: 'Комедия',
		timeBudget: 'short',
		pacePreference: 'fast',
		storyDepth: 'light',
		audiencePreference: 'family',
	}).score

	const adultScore = evaluateMovie(adultMovie, {
		mood: 'light',
		preferredGenre: 'Комедия',
		timeBudget: 'short',
		pacePreference: 'fast',
		storyDepth: 'light',
		audiencePreference: 'family',
	}).score

	assert.ok(familyScore > adultScore)
})
