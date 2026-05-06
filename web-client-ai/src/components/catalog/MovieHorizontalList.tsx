import type { ApiRecommendationMovie } from '@/lib/api-types'
import { cn } from '@/utils/cn'
import MovieCardHorizontal from '@/components/ui/MovieCardHorizontal'

interface MovieHorizontalListProps {
	movies: ApiRecommendationMovie[]
	className?: string
	searchQuery?: string
}

export default function MovieHorizontalList({
	movies,
	className,
	searchQuery,
}: MovieHorizontalListProps) {
	if (movies.length === 0) {
		return (
			<div className='default-px'>
				<div className='bg-blue-dark rounded-2xl px-10 py-10 max-md:px-6 max-md:py-8 max-sm:px-5 max-sm:py-6'>
					<h3 className='title-1 text-text-default-active'>
						Подходящие фильмы не найдены
					</h3>
					<p className='body-2 mt-3'>
						Измените сочетание параметров AI-подбора или ослабьте обычные фильтры.
					</p>
				</div>
			</div>
		)
	}

	return (
		<div
			className={cn(
				`max-xsm:grid-cols-1! grid grid-cols-4 items-stretch gap-8
					max-2xl:grid-cols-3 max-lg:grid-cols-2 max-lg:gap-x-7
					max-lg:gap-y-5 max-md:gap-x-6 max-md:gap-y-4
					max-sm:gap-x-4 max-sm:gap-y-3`,
				className,
			)}
		>
			{movies.map(item => (
				<MovieCardHorizontal
					key={item.id}
					id={item.id}
					slug={item.slug}
					name={item.title}
					type='movie'
					image={item.poster}
					provider={item.provider}
					rating={item.rating}
					duration={item.duration}
					year={item.year}
					explanation={item.reasons[0]}
					score={item.score}
					searchQuery={searchQuery}
				/>
			))}
		</div>
	)
}
