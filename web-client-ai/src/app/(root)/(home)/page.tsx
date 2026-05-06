import type { Metadata } from 'next'
import ButtonSlider from '@/components/ui/ButtonSlider'
import CardsSlider from '@/components/ui/CardsSlider'
import HeroSlider from '@/components/ui/HeroSlider'
import MovieCardVertical from '@/components/ui/MovieCardVertical'
import type { PublicHomeResponse } from '@/lib/api-types'
import { apiFetchServer } from '@/lib/server-api'

export const metadata: Metadata = {
	title: 'FilmSense | Главная',
	description:
		'Интеллектуальный онлайн-кинотеатр с локальным каталогом и нечетким подбором фильмов.',
}

export default async function HomePage() {
	const home = await apiFetchServer<PublicHomeResponse>('/api/public/home')

	return (
		<div className='page-footer-gap'>
			<div className='page-block-stack'>
				<HeroSlider slider={home.heroSlides} />

				<CardsSlider
					button={
						<ButtonSlider
							text='AI-подбор для лёгкого вечера'
							additionalText='Смотреть все'
							link='/collection/movies?mood=light&preferred_genre=комедия&time_budget=medium&pace=balanced&story_depth=light&audience=family&ai=true'
						/>
					}
				>
					{home.aiPicks.map(movie => (
						<div key={movie.id} className='pointer-coarse:snap-center'>
							<MovieCardVertical
								id={movie.id}
								slug={movie.slug}
								name={movie.title}
								type='movie'
								year={movie.year}
								image={movie.poster}
								rating={movie.rating}
								provider={movie.provider}
								duration={movie.duration}
							/>
						</div>
					))}
				</CardsSlider>

				{home.shelves.map(shelf => (
					<CardsSlider
						key={shelf.title}
						button={
							<ButtonSlider
								text={shelf.title}
								additionalText='Смотреть все'
								link='/collection/movies'
							/>
						}
					>
						{shelf.movies.map(movie => (
							<div key={movie.id} className='pointer-coarse:snap-center'>
								<MovieCardVertical
									id={movie.id}
									slug={movie.slug}
									name={movie.title}
									type='movie'
									year={movie.year}
									image={movie.poster}
									rating={movie.rating}
									provider={movie.provider}
									duration={movie.duration}
								/>
							</div>
						))}
					</CardsSlider>
				))}
			</div>
		</div>
	)
}
