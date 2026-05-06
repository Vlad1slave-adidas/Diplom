'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useDebouncedCallback } from 'use-debounce'
import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/utils/cn'
import { smoothScroll } from '@/utils/smoothScroll'

interface CardsSliderProps {
	children: React.ReactNode
	button?: React.JSX.Element
	title?: string
	className?: string
	classNameForTitle?: string
}

type ScrollPos = 'start' | 'middle' | 'end'

export default function CardsSlider({
	children,
	button,
	title,
	className,
	classNameForTitle,
}: CardsSliderProps) {
	const containerRef = useRef<HTMLDivElement>(null)
	const [scrollAmount, setScrollAmount] = useState(300)
	const [scrollPos, setScrollPos] = useState<ScrollPos>('start')
	const [isScrollable, setIsScrollable] = useState(false)

	const updateScrollAmount = useDebouncedCallback(() => {
		if (!containerRef.current) return
		setScrollAmount(containerRef.current.offsetWidth / 1.5)
		setIsScrollable(
			containerRef.current.scrollWidth > containerRef.current.clientWidth,
		)
	}, 200)

	const updateScrollPos = useDebouncedCallback(() => {
		if (!containerRef.current) return
		const { scrollLeft, scrollWidth, clientWidth } = containerRef.current

		if (scrollLeft <= 0) {
			setScrollPos('start')
		} else if (scrollLeft + clientWidth >= scrollWidth - 1) {
			setScrollPos('end')
		} else {
			setScrollPos('middle')
		}
	}, 100)

	useEffect(() => {
		updateScrollAmount()
		const handleResize = () => {
			updateScrollAmount()
			updateScrollPos()
		}

		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [updateScrollAmount, updateScrollPos])

	useEffect(() => {
		const container = containerRef.current
		if (!container) return
		container.addEventListener('scroll', updateScrollPos)
		updateScrollPos()
		return () => container.removeEventListener('scroll', updateScrollPos)
	}, [updateScrollPos])

	const prevSlide = useCallback(() => {
		if (!containerRef.current) return
		smoothScroll(containerRef.current, containerRef.current.scrollLeft - scrollAmount, 300)
	}, [scrollAmount])

	const nextSlide = useCallback(() => {
		if (!containerRef.current) return
		smoothScroll(containerRef.current, containerRef.current.scrollLeft + scrollAmount, 300)
	}, [scrollAmount])

	const btnBase =
		'max-sm:p-2 pointer-coarse:hidden absolute top-1/2 z-40 -translate-y-1/2 rounded-full bg-blue p-3 text-white transition-opacity duration-300 '
	const shadowBase =
		'pointer-events-none pointer-coarse:hidden absolute top-1/2 z-30 h-[100%] w-full -translate-y-1/2 transition-opacity duration-300 ease-in-out'

	return (
		<section className='group/section relative'>
			{title && (
				<h2
					className={cn(
						`default-px text-[2rem] font-semibold max-xl:text-3xl
						max-lg:text-[1.75rem] max-md:text-[1.625rem] max-sm:text-2xl`,
						classNameForTitle,
					)}
				>
					{title}
				</h2>
			)}
			{button && button}

			<div className='relative'>
				<div
					className={cn(
						shadowBase,
						'shadow-cards-slider-left',
						scrollPos === 'start' && 'pointer-events-none opacity-0',
						scrollPos === 'middle' && 'opacity-100',
						scrollPos === 'end' && 'opacity-0 group-hover/section:opacity-100',
						!isScrollable && 'hidden',
					)}
				/>
				<button
					onClick={prevSlide}
					className={cn(
						btnBase,
						'left-3',
						scrollPos === 'start' && 'pointer-events-none opacity-0',
						scrollPos === 'middle' && 'opacity-100',
						scrollPos === 'end' && 'opacity-0 group-hover/section:opacity-100',
						!isScrollable && 'hidden',
					)}
				>
					<ChevronLeft className='aspect-square h-auto w-6 max-lg:w-5' />
				</button>

				<div
					className={cn(
						shadowBase,
						'shadow-cards-slider-right',
						scrollPos === 'start' && 'opacity-0 group-hover/section:opacity-100',
						scrollPos === 'middle' && 'opacity-100',
						scrollPos === 'end' && 'pointer-events-none opacity-0',
						!isScrollable && 'hidden',
					)}
				/>
				<button
					onClick={nextSlide}
					className={cn(
						btnBase,
						'right-3',
						scrollPos === 'start' && 'opacity-0 group-hover/section:opacity-100',
						scrollPos === 'middle' && 'opacity-100',
						scrollPos === 'end' && 'pointer-events-none opacity-0',
						!isScrollable && 'hidden',
					)}
				>
					<ChevronRight className='aspect-square h-auto w-6 max-lg:w-5' />
				</button>

				<div
					className='relative -mb-6 w-full overflow-hidden max-xl:-mb-5
						max-lg:-mb-4 max-sm:-mb-3'
				>
					<div
						ref={containerRef}
						className={cn(
							`default-px scrollbar-hidden flex w-full gap-x-8 overflow-x-hidden
							py-6 max-xl:gap-x-7 max-xl:py-5 max-lg:gap-x-6 max-lg:py-4
							max-md:gap-x-5 max-sm:gap-x-3 max-sm:py-3 pointer-coarse:snap-x
							pointer-coarse:snap-mandatory pointer-coarse:overflow-auto`,
							className,
						)}
					>
						{children}
					</div>
				</div>
			</div>
		</section>
	)
}
