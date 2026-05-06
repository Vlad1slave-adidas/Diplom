import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { AuthSessionResponse, AuthUser } from './api-types'
import { getApiBaseUrl } from './api'

export async function apiFetchServer<T>(
	path: string,
	init?: RequestInit & { cache?: RequestCache },
): Promise<T> {
	const cookieStore = await cookies()
	const cookieHeader = cookieStore.toString()

	const response = await fetch(`${getApiBaseUrl()}${path}`, {
		...init,
		headers: {
			'Content-Type': 'application/json',
			...(cookieHeader ? { Cookie: cookieHeader } : {}),
			...(init?.headers || {}),
		},
		cache: init?.cache ?? 'no-store',
	})

	if (!response.ok) {
		throw new Error(`API request failed: ${response.status}`)
	}

	return response.json() as Promise<T>
}

export async function getServerSession() {
	const cookieStore = await cookies()
	const cookieHeader = cookieStore.toString()

	if (!cookieHeader) return null

	const response = await fetch(`${getApiBaseUrl()}/api/auth/session`, {
		headers: {
			Cookie: cookieHeader,
		},
		cache: 'no-store',
	})

	if (!response.ok) {
		return null
	}

	const payload = (await response.json()) as AuthSessionResponse
	return payload.user
}

export async function requireServerSession() {
	const user = await getServerSession()

	if (!user) {
		redirect('/sign-in')
	}

	return user
}

export async function requireAdminSession() {
	const user = await getServerSession()

	if (!user) {
		redirect('/sign-in?redirectPath=/admin')
	}

	if (user.role !== 'admin') {
		redirect('/')
	}

	return user
}

export function isAdminUser(user: AuthUser | null) {
	return user?.role === 'admin'
}
