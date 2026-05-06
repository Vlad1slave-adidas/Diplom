const serverApiBaseUrl =
	process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

const clientApiBaseUrl =
	process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export function getApiBaseUrl() {
	return typeof window === 'undefined' ? serverApiBaseUrl : clientApiBaseUrl
}

export async function apiFetch<T>(
	path: string,
	init?: RequestInit & { cache?: RequestCache },
): Promise<T> {
	const response = await fetch(`${getApiBaseUrl()}${path}`, {
		...init,
		credentials: init?.credentials ?? 'include',
		headers: {
			'Content-Type': 'application/json',
			...(init?.headers || {}),
		},
		cache: init?.cache ?? 'no-store',
	})

	if (!response.ok) {
		throw new Error(`API request failed: ${response.status}`)
	}

	return response.json() as Promise<T>
}
