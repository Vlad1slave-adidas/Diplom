export function formatDuration(minutes: number) {
	const hours = Math.floor(minutes / 60)
	const restMinutes = minutes % 60

	if (hours === 0) {
		return `${restMinutes} мин`
	}

	return `${hours} ч ${restMinutes} мин`
}
