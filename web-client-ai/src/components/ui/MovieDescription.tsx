import Image from 'next/image'
import { formatDuration } from '@/utils/formatDuration'

interface MovieDescriptionProps {
	title: string
	description: string
	genres: string
	year: number
	countries: string
	duration?: number
	kinopoiskRating: number
	ageRating: number
	imdbRating: number
}

export default function MovieDescription({
	title,
	description,
	genres,
	year,
	countries,
	duration,
	kinopoiskRating,
	ageRating,
	imdbRating,
}: MovieDescriptionProps) {
	return (
		<section
			className='text-text-default-active flex w-full items-center
				justify-between pr-12 max-xl:pr-8 max-lg:pr-2 max-md:pr-0
				max-sm:flex-col'
		>
			<div className='max-w-1/2 max-sm:mb-3 max-sm:max-w-full'>
				<h2
					className='mb-3 text-[2.5rem] leading-13 font-semibold
						max-xl:text-[2.25rem] max-lg:text-[2rem] max-lg:leading-11
						max-sm:mb-1 max-sm:text-[1.75rem] max-sm:leading-9'
				>
					{`Фильм «${title}» смотреть в хорошем качестве`}
				</h2>
				<p
					className='= text-[1.375rem] max-xl:text-xl max-md:text-lg
						max-sm:text-base'
				>
					{description}
				</p>
			</div>

			<div
				className='flex max-w-[40%] flex-col gap-3 text-[1.25rem] max-xl:gap-2
					max-xl:text-lg max-lg:text-[1rem] max-sm:w-full max-sm:max-w-full'
			>
				<div className='space-y-[0.125rem] sm:space-y-1'>
					<p className='additional-text'>Жанры</p>
					<div className='flex flex-wrap items-center'>
						{genres.split(',').map((genre, index) => (
							<p className='with-comma max-sm:text-sm' key={index}>
								{genre}
							</p>
						))}
					</div>
				</div>

				<div>
					<p className='additional-text'>Производство</p>
					<p className='max-sm:text-sm'>
						<span className='with-comma'>{year}</span>
						<span className='with-comma'>{countries}</span>
					</p>
				</div>

				<div
					className='grid grid-cols-2 gap-x-16 gap-y-3 max-xl:gap-x-12
						max-lg:gap-x-8'
				>
					{duration != null && duration > 0 && (
						<div className='max-sm:text-sm'>
							<p className='additional-text'>Длительность</p>
							<p>{formatDuration(duration)}</p>
						</div>
					)}

					{kinopoiskRating > 0 && (
						<div>
							<p className='additional-text'>Рейтинг Кинопоиск</p>
							<div className='flex gap-2'>
								<Image
									src='/icons/kinopoisk-logo.svg'
									alt='kinopoisk-logo'
									width={18}
									height={18}
									className='w-auto max-sm:h-4'
								/>
								<p className='max-sm:text-sm'>
									{Number(kinopoiskRating).toFixed(1)}
								</p>
							</div>
						</div>
					)}

					<div className='max-sm:text-sm'>
						<p className='additional-text'>Возрастной рейтинг</p>
						<p>{ageRating}+</p>
					</div>

					{imdbRating > 0 && (
						<div>
							<p className='additional-text'>Рейтинг IMDb</p>
							<div className='flex gap-2'>
								<Image
									src='/icons/IMDB-logo.svg'
									alt='imdb-logo'
									height={18}
									width={36}
									className='w-auto max-sm:h-4'
								/>
								<p className='max-sm:text-sm'>
									{Number(imdbRating).toFixed(1)}
								</p>
							</div>
						</div>
					)}
				</div>
			</div>
		</section>
	)
}
