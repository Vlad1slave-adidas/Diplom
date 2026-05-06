import type { Metadata } from 'next'
import CatalogFilters from '@/components/catalog/CatalogFilters'
import MovieHorizontalList from '@/components/catalog/MovieHorizontalList'
import RecommendationSummary from '@/components/catalog/RecommendationSummary'
import CollectionDescription from '@/components/ui/CollectionDescription'
import type {
	PublicCatalogResponse,
	PublicFiltersResponse,
} from '@/lib/api-types'
import { apiFetchServer } from '@/lib/server-api'

type SearchParams = Record<string, string | string[] | undefined>

function normalizeParams(params: SearchParams | undefined) {
	return Object.fromEntries(
		Object.entries(params ?? {}).flatMap(([key, value]) => {
			if (typeof value === 'string') return [[key, value]]
			if (Array.isArray(value) && value[0]) return [[key, value[0]]]
			return []
		}),
	)
}

function createSearchPayload(params: Record<string, string>) {
	const { genre, year, country, order, ...inputs } = params

	return {
		inputs,
		filters: {
			genre,
			year,
			country,
			order: order || 'recommendation',
		},
	}
}

export async function generateMetadata(props: {
	searchParams?: Promise<SearchParams>
}): Promise<Metadata> {
	const params = normalizeParams(await props.searchParams)
	const ai = params.ai === 'true'

	return {
		title: ai
			? 'Интеллектуальный подбор фильмов | FilmSense'
			: 'Каталог фильмов | FilmSense',
		description: ai
			? 'Нечеткий поиск по настроению, жанру, времени, темпу, глубине сюжета и формату просмотра.'
			: 'Локальный каталог фильмов с классическими фильтрами и AI-подбором.',
	}
}

export default async function MoviesPage(props: {
	searchParams?: Promise<SearchParams>
}) {
	const params = normalizeParams(await props.searchParams)
	const [filters, catalog] = await Promise.all([
		apiFetchServer<PublicFiltersResponse>('/api/public/filters'),
		apiFetchServer<PublicCatalogResponse>('/api/public/catalog/search', {
			method: 'POST',
			body: JSON.stringify(createSearchPayload(params)),
		}),
	])

	return (
		<div
			className='margin-top-with-absolute-header page-footer-gap'
			data-scroll-restoration-id='container'
		>
			<div className='default-px'>
				<div className='mt-9 mb-6 max-lg:mt-7 max-lg:mb-5 max-sm:mb-4'>
					<CollectionDescription
						title='Фильмы'
						description='Умный каталог объединяет привычную витрину онлайн-кинотеатра и интеллектуальную систему поиска на базе алгоритма Мамдани. Пользователь задаёт настроение, предпочтительный жанр, временной бюджет, желаемый темп, глубину сюжета и формат просмотра, а система ранжирует локальный каталог по степени соответствия.'
					/>
				</div>

				<div className='mb-6 max-sm:mb-4'>
					<CatalogFilters
						params={params}
						variables={filters.variables}
						genres={filters.genres}
						countries={filters.countries}
						years={filters.years}
					/>
				</div>

				<RecommendationSummary summary={catalog.summary} />
				<MovieHorizontalList
					movies={catalog.movies}
					className='mt-6 max-sm:mt-4'
					searchQuery={new URLSearchParams(params).toString()}
				/>
			</div>
		</div>
	)
}
