import Image from 'next/image'
import Link from 'next/link'
import { memo } from 'react'
import type { MovieCardProps } from './movie-card.types'
import ImageWithFallback from './ImageWithFallback'
import { formatDuration } from '@/utils/formatDuration'
import { getProviderIcon } from '@/utils/getProviderIcon'

const MovieCardVertical = memo(function MovieCardVertical({
	slug,
	name,
	type,
	year,
	image,
	rating,
	provider,
	duration,
}: MovieCardProps) {
	const providerIcon = getProviderIcon(provider)

	return (
		<Link href={`/movie/${slug}`}>
			<article
				className='group group/poster w-[14.8125rem] max-xl:w-[13rem]
					max-lg:w-[11.25rem] max-md:w-[9.5rem] max-sm:w-[8.5rem]'
			>
				<div
					className='relative aspect-[237/339] transition-transform duration-300
						ease-in-out pointer-coarse:duration-75
						pointer-coarse:group-active/poster:scale-95
						pointer-fine:group-hover:scale-[var(--scale)]'
				>
					<ImageWithFallback
						src={image}
						className='h-full w-full rounded-2xl'
						width={237}
						height={339}
						alt='movie-image'
						fallbackSrc='/images/fallbacks/no-movie-card-vertical.png'
					/>
					<div
						className={`text-text-default-active absolute bottom-2 left-1/2 flex
							w-[95%] -translate-x-1/2 items-stretch ${
								rating > 0 ? 'justify-between' : 'justify-end'
							}`}
					>
						{rating > 0 && (
							<div
								className='bg-transparent-black flex h-7 items-center rounded-lg
									px-[0.375rem] text-[1.25rem] font-bold transition-transform
									duration-300 ease-in-out max-xl:text-lg max-lg:text-base
									max-md:text-sm max-sm:h-[1.375rem] max-sm:px-1 max-sm:text-sm
									sm:h-[1.375rem] md:h-6 lg:h-[1.625rem] xl:h-7
									pointer-fine:group-hover:scale-[var(--reverse-scale)]'
							>
								{Number(rating).toFixed(1)}
							</div>
						)}
						{providerIcon && (
							<Image
								src={providerIcon.src}
								width={providerIcon.width}
								height={providerIcon.height}
								alt='provider'
								className={`w-auto transition-transform duration-300 ease-in-out
								max-sm:h-[1.375rem] sm:h-[1.375rem] md:h-6 lg:h-[1.625rem]
								xl:h-7 pointer-fine:group-hover:scale-[var(--reverse-scale)]`}
							/>
						)}
					</div>
				</div>
				<div
					className='transition-all duration-300 ease-in-out
						group-hover:translate-y-[0.75rem]
						md:group-hover:translate-y-[0.875rem]
						lg:group-hover:translate-y-[1rem]
						xl:group-hover:translate-y-[1.125rem]'
				>
					<div
						className='text-text-default-active mt-2 max-w-full truncate text-xl
							max-lg:text-base max-lg:text-[1rem] max-sm:mt-1 max-sm:text-sm'
					>
						{name}
					</div>
					<div
						className='text-text-info flex items-center text-lg
							max-lg:text-[1rem] max-sm:mt-[0.125rem] max-sm:text-xs'
					>
						{year && <div className='with-comma max-sm:after:mr-1'>{year}</div>}
						{type === 'movie' && duration != null && duration > 0 && (
							<div className='with-comma max-sm:after:mr-1'>
								{formatDuration(duration)}
							</div>
						)}
					</div>
				</div>
			</article>
		</Link>
	)
})

export default MovieCardVertical
