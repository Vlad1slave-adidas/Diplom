import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Hero from '@/components/ui/Hero'
import MovieDescription from '@/components/ui/MovieDescription'
import { getApiBaseUrl } from '@/lib/api'
import type { PublicMovieResponse } from '@/lib/api-types'

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

async function fetchMovie(slug: string, searchParams?: Record<string, string>) {
	const query = searchParams ? new URLSearchParams(searchParams).toString() : ''
	const url = `${getApiBaseUrl()}/api/public/movies/${slug}${query ? `?${query}` : ''}`
	const cookieHeader = (await cookies()).toString()
	const response = await fetch(url, {
		cache: 'no-store',
		headers: cookieHeader
			? {
					Cookie: cookieHeader,
				}
			: undefined,
	})

	if (response.status === 404) {
		return null
	}

	if (!response.ok) {
		throw new Error(`API request failed: ${response.status}`)
	}

	return (await response.json()) as PublicMovieResponse
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>
}): Promise<Metadata> {
	const { slug } = await params
	const payload = await fetchMovie(slug)

	if (!payload) {
		return { title: 'Фильм не найден | FilmSense' }
	}

	return {
		title: `${payload.movie.title} (${payload.movie.year}) | FilmSense`,
		description: payload.movie.shortDescription,
	}
}

export default async function MoviePage({
	params,
	searchParams,
}: {
	params: Promise<{ slug: string }>
	searchParams?: Promise<SearchParams>
}) {
	const { slug } = await params
	const selectedParams = normalizeParams(await searchParams)
	const payload = await fetchMovie(slug, selectedParams)

	if (!payload) {
		notFound()
	}

	const backHref = `/collection/movies${Object.keys(selectedParams).length ? `?${new URLSearchParams(selectedParams).toString()}` : ''}`

	return (
		<div className='page-footer-gap w-full'>
			<div className='page-block-stack'>
				<Hero
					id={payload.movie.id}
					type='movie'
					name={payload.movie.title}
					backgroundImage={payload.movie.backdrop}
					kinopoiskRating={payload.movie.rating}
					year={payload.movie.year}
					genre={payload.movie.genres.join(', ')}
					description={payload.movie.shortDescription}
					ageRating={payload.movie.ageRating}
					imdbRating={payload.movie.rating}
					thumbnail={payload.movie.poster}
					duration={payload.movie.duration}
					provider={payload.movie.provider}
					slug={payload.movie.slug}
				/>

				<div className='default-px'>
					<MovieDescription
						title={payload.movie.title}
						description={payload.movie.description}
						genres={payload.movie.genres.join(',')}
						year={payload.movie.year}
						countries={payload.movie.country}
						duration={payload.movie.duration}
						kinopoiskRating={payload.movie.rating}
						ageRating={payload.movie.ageRating}
						imdbRating={payload.movie.rating}
					/>
				</div>

				<div className='default-px'>
					<section
						className='bg-blue-dark rounded-2xl px-10 py-8 max-lg:px-7 max-lg:py-7
							max-md:px-6 max-sm:px-5 max-sm:py-5'
					>
						<h2 className='header-3'>Почему фильм рекомендован</h2>
						<p className='body-2 mt-3'>
							Ниже показано краткое объяснение результата работы системы Мамдани.
						</p>
						{payload.explanation ? (
							<>
								<div className='mt-5 flex flex-wrap items-center gap-4'>
									<div className='title-2 primary-gradient bg-clip-text text-transparent'>
										AI-оценка: {payload.explanation.score}
									</div>
									<Link href={backHref} className='button-2 hover-text'>
										Вернуться к подбору
									</Link>
								</div>
								<ul className='body-2 mt-4 space-y-2'>
									{payload.explanation.reasons.map(reason => (
										<li key={reason}>{reason}</li>
									))}
								</ul>
							</>
						) : (
							<p className='body-2 mt-4'>
								Фильм открыт вне режима AI-подбора, поэтому объяснение не
								сформировано.
							</p>
						)}
					</section>
				</div>
			</div>
		</div>
	)
}
