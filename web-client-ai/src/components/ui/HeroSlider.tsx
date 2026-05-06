'use client'

import Autoplay from 'embla-carousel-autoplay'
import useEmblaCarousel from 'embla-carousel-react'
import { useCallback, useEffect, useState } from 'react'
import Hero from '@/components/ui/Hero'
import Paging from '@/components/ui/Paging'
import type { Provider } from '@/lib/data/movies'

export interface HeroSliderItem {
	id: number
	type: 'movie' | 'series'
	name: string
	backgroundImage: string
	kinopoiskRating: number
	year: number
	genre: string
	description?: string
	ageRating: number | string
	imdbRating: number
	thumbnail: string
	duration?: number
	provider: Provider
	isHeroSlider?: boolean
	slug: string
}

interface HeroSliderProps {
	slider: HeroSliderItem[]
}

const AUTOPLAY_DURATION_MS = 5000

export default function HeroSlider({ slider }: HeroSliderProps) {
	const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, duration: 20 }, [
		Autoplay({
			playOnInit: true,
			stopOnInteraction: false,
			stopOnFocusIn: false,
			delay: AUTOPLAY_DURATION_MS,
		}),
	])
	const [isAnimating, setIsAnimating] = useState(false)

	const onSelect = useCallback(() => setIsAnimating(true), [])
	const onSettle = useCallback(() => setIsAnimating(false), [])

	useEffect(() => {
		if (!emblaApi) return
		emblaApi.on('select', onSelect)
		emblaApi.on('settle', onSettle)
		return () => {
			emblaApi.off('select', onSelect)
			emblaApi.off('settle', onSettle)
		}
	}, [emblaApi, onSelect, onSettle])

	const goToPrev = useCallback(() => {
		const autoplay = emblaApi?.plugins()?.autoplay
		if (!emblaApi || !autoplay) return
		const isFirst = emblaApi.selectedScrollSnap() === 0
		if (isFirst) {
			emblaApi.scrollTo(slider.length - 1)
		} else {
			emblaApi.scrollPrev()
		}
		autoplay.reset()
	}, [emblaApi, slider.length])

	const goToNext = useCallback(() => {
		const autoplay = emblaApi?.plugins()?.autoplay
		if (!emblaApi || !autoplay) return
		const isLast = emblaApi.selectedScrollSnap() === slider.length - 1
		if (isLast) {
			emblaApi.scrollTo(0)
		} else {
			emblaApi.scrollNext()
		}
		autoplay.reset()
	}, [emblaApi, slider.length])

	const goTo = useCallback(
		(index: number) => {
			const autoplay = emblaApi?.plugins()?.autoplay
			if (!emblaApi || !autoplay) return
			emblaApi.scrollTo(index)
			autoplay.reset()
		},
		[emblaApi],
	)

	return (
		<div className='group relative w-full overflow-hidden' ref={emblaRef}>
			<div className='flex'>
				{slider.map(item => (
					<div key={item.id} className='flex-shrink-0 flex-grow-0 basis-full'>
						<Hero {...item} isHeroSlider={true} />
					</div>
				))}
			</div>

			<div className='max-sm:w-full'>
				<Paging
					emblaApi={emblaApi}
					sliderLength={slider.length}
					onPrev={goToPrev}
					onNext={goToNext}
					onGoTo={goTo}
					isAnimating={isAnimating}
				/>
			</div>
		</div>
	)
}
