'use client'

import Image from 'next/image'
import type { HeroSliderItem } from '@/components/ui/HeroSlider'
import ButtonWatchMovie from '@/components/ui/ButtonWatchMovie'
import { formatDuration } from '@/utils/formatDuration'

type HeroInfoProps = Pick<
	HeroSliderItem,
	| 'name'
	| 'year'
	| 'genre'
	| 'duration'
	| 'ageRating'
	| 'imdbRating'
	| 'description'
	| 'isHeroSlider'
	| 'slug'
	| 'kinopoiskRating'
>

export default function HeroInfo({
	name,
	kinopoiskRating,
	year,
	genre,
	duration,
	ageRating,
	imdbRating,
	description,
	isHeroSlider,
	slug,
}: HeroInfoProps) {
	return (
		<div
			className={`text-text-default-active flex w-full flex-col gap-6
				text-center text-xl max-xl:gap-5 max-lg:gap-4 max-md:max-w-full ${
					isHeroSlider
						? `max-md:px-px-md max-sm:px-px-sm items-center md:w-[50%] md:pl-12
							lg:w-[40%] lg:pl-16 xl:pl-20`
						: 'default-px items-start max-md:items-center md:w-[50%]'
				}`}
		>
			<h1
				className={`line-clamp-4 text-6xl max-xl:text-5xl max-lg:text-[2.625rem]
					max-md:text-4xl max-sm:text-[1.75rem]
					${!isHeroSlider ? 'text-left max-md:text-center' : ''}`}
			>
				{name}
			</h1>
			<div
				className='flex items-center gap-4 whitespace-nowrap max-xl:gap-3
					max-xl:text-lg max-md:text-base max-sm:text-sm'
			>
				{kinopoiskRating > 0 && (
					<div className='flex shrink-0 items-center gap-2'>
						<Image
							src='/icons/kinopoisk-logo.svg'
							alt='kinopoisk-logo'
							width={18}
							height={18}
							className='provider-icon'
						/>
						<div>{Number(kinopoiskRating).toFixed(1)}</div>
					</div>
				)}
				{!isHeroSlider && imdbRating > 0 && (
					<div className='flex items-center gap-2 max-sm:hidden'>
						<Image
							src='/icons/IMDB-logo.svg'
							alt='imdb-logo'
							width={36}
							height={18}
							className='provider-icon'
						/>
						<div>{Number(imdbRating).toFixed(1)}</div>
					</div>
				)}
				{year && <div>{year}</div>}
				{genre && <div>{genre.split(',').slice(0, 1)}</div>}
				<div>Фильм</div>
				{!isHeroSlider && duration != null && duration > 0 && (
					<div className='text-xl max-xl:text-lg max-md:text-base max-sm:hidden'>
						{formatDuration(duration)}
					</div>
				)}
				<div>{ageRating.toString()}+</div>
			</div>

			{!isHeroSlider && (
				<div className='text-start max-lg:text-base max-md:text-center'>
					<p
						className={
							description ? 'mb-6 line-clamp-3 max-lg:mb-5 max-sm:mb-4' : undefined
						}
					>
						{description}
					</p>
				</div>
			)}

			<div
				className='max-md:default-px flex items-stretch gap-3 max-md:w-full
					max-md:max-w-[25rem]'
			>
				<ButtonWatchMovie
					text='Смотреть фильм'
					className='px-16 py-[0.625rem] text-xl max-xl:text-lg max-lg:px-12
						max-lg:py-2 max-md:w-full max-md:px-0 max-md:py-[0.6875rem]'
					link={`/movie/${slug}`}
				/>
			</div>
		</div>
	)
}
