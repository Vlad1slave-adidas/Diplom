const easeInOutCubic = (t: number) => {
	return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export const smoothScroll = (
	element: HTMLDivElement,
	target: number,
	duration: number,
	onComplete?: () => void,
) => {
	const start = element.scrollLeft
	const startTime = performance.now()

	const animateScroll = (currentTime: number) => {
		const elapsedTime = currentTime - startTime
		const progress = Math.min(elapsedTime / duration, 1)
		const easedProgress = easeInOutCubic(progress)
		element.scrollLeft = start + (target - start) * easedProgress

		if (progress < 1) {
			requestAnimationFrame(animateScroll)
		} else {
			onComplete?.()
		}
	}

	requestAnimationFrame(animateScroll)
}
