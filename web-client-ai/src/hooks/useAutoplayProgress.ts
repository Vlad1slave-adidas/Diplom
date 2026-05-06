/* eslint-disable react-hooks/immutability */

import type { EmblaCarouselType } from 'embla-carousel'
import { useCallback, useEffect, useRef } from 'react'

export function useAutoplayProgress<ProgressElement extends HTMLElement>(
	emblaApi: EmblaCarouselType | undefined,
	progressNodes: React.RefObject<(ProgressElement | null)[]>,
) {
	const animationName = useRef('')
	const timeoutId = useRef(0)
	const rafId = useRef(0)

	const startProgress = useCallback(() => {
		const autoplay = emblaApi?.plugins()?.autoplay
		if (!autoplay || !progressNodes.current) return

		const timeUntilNext = autoplay.timeUntilNext()
		const selectedIndex = emblaApi.selectedScrollSnap()
		const node = progressNodes.current[selectedIndex]
		if (!node) return
		const progressNode = node

		if (!animationName.current) {
			animationName.current = window.getComputedStyle(progressNode).animationName
		}

		progressNode.style.animationName = 'none'
		progressNode.style.transform = 'translate3d(0,0,0)'

		rafId.current = window.requestAnimationFrame(() => {
			timeoutId.current = window.setTimeout(() => {
				progressNode.style.animationName = animationName.current
				progressNode.style.animationDuration = `${timeUntilNext}ms`
			}, 0)
		})
	}, [emblaApi, progressNodes])

	const resetAllProgress = useCallback(() => {
		cancelAnimationFrame(rafId.current)
		clearTimeout(timeoutId.current)
		progressNodes.current?.forEach(node => {
			if (!node) return
			const progressNode = node
			progressNode.style.animationName = 'none'
			progressNode.style.animationDuration = ''
		})
	}, [progressNodes])

	useEffect(() => {
		const autoplay = emblaApi?.plugins()?.autoplay
		if (!autoplay) return

		const onSelect = () => resetAllProgress()
		emblaApi
			.on('select', onSelect)
			.on('autoplay:timerset', startProgress)
			.on('autoplay:timerstopped', resetAllProgress)

		if (autoplay.isPlaying()) {
			startProgress()
		}

		return () => {
			emblaApi
				.off('select', onSelect)
				.off('autoplay:timerset', startProgress)
				.off('autoplay:timerstopped', resetAllProgress)
		}
	}, [emblaApi, startProgress, resetAllProgress])

	useEffect(() => {
		return () => {
			cancelAnimationFrame(rafId.current)
			clearTimeout(timeoutId.current)
		}
	}, [])
}
