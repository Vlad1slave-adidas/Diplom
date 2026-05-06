'use client'

import type { EmblaCarouselType } from 'embla-carousel'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useAutoplayProgress } from '@/hooks/useAutoplayProgress'

interface PagingProps {
	sliderLength: number
	onPrev: () => void
	onNext: () => void
	onGoTo: (index: number) => void
	emblaApi: EmblaCarouselType | undefined
	isAnimating: boolean
}

export default function Paging({
	sliderLength,
	onPrev,
	onNext,
	onGoTo,
	emblaApi,
	isAnimating,
}: PagingProps) {
	const progressRefs = useRef<(HTMLDivElement | null)[]>([])
	const [currentSlide, setCurrentSlide] = useState(0)
	useAutoplayProgress(emblaApi, progressRefs)

	useEffect(() => {
		if (!emblaApi) return
		const updateCurrentSlide = () => setCurrentSlide(emblaApi.selectedScrollSnap())
		emblaApi.on('select', updateCurrentSlide)
		updateCurrentSlide()
		return () => {
			emblaApi.off('select', updateCurrentSlide)
		}
	}, [emblaApi])

	return (
		<div
			className='absolute bottom-0 left-1/2 flex -translate-x-1/2 items-center
				justify-center gap-2 transition-all duration-200 ease-linear max-md:mt-8
				max-md:hidden pointer-coarse:hidden pointer-fine:opacity-0
				pointer-fine:group-hover:opacity-100'
		>
			<button
				onClick={onPrev}
				disabled={isAnimating}
				className='text-text-default-active cursor-pointer transition-opacity
					duration-75 ease-in-out disabled:opacity-50'
			>
				<ChevronLeft className='aspect-square h-auto w-6' />
			</button>

			<div className='flex gap-3 max-sm:hidden'>
				{Array.from({ length: sliderLength }).map((_, index) => (
					<button
						key={index}
						onClick={() => onGoTo(index)}
						disabled={isAnimating}
						className={`bg-paging relative h-[0.3125rem] overflow-hidden
						rounded-lg transition-all duration-250 max-md:h-1 ${
							currentSlide === index
								? 'w-[var(--animation-end-width)]'
								: 'w-8 max-lg:w-5'
						}`}
					>
						<div
							ref={el => {
								progressRefs.current[index] = el
							}}
							className='progress-bar'
						/>
					</button>
				))}
			</div>

			<button
				onClick={onNext}
				disabled={isAnimating}
				className='text-text-default-active cursor-pointer transition-opacity
					duration-75 ease-in-out disabled:opacity-50'
			>
				<ChevronRight className='aspect-square h-auto w-6' />
			</button>
		</div>
	)
}
