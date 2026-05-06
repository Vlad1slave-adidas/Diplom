import crypto from 'node:crypto'
import type { NextFunction, Request, Response } from 'express'
import { config } from './config.js'

const oneWeekInSeconds = 60 * 60 * 24 * 7

export type AuthRole = 'admin'

function secureCompare(left: string, right: string) {
	const leftBuffer = Buffer.from(left)
	const rightBuffer = Buffer.from(right)

	if (leftBuffer.length !== rightBuffer.length) return false

	return crypto.timingSafeEqual(leftBuffer, rightBuffer)
}

function parseCookies(header?: string) {
	if (!header) return {}

	return Object.fromEntries(
		header.split(';').map(chunk => {
			const [name, ...rest] = chunk.trim().split('=')
			return [name, decodeURIComponent(rest.join('='))]
		}),
	)
}

function serializeCookie(name: string, value: string, maxAge?: number) {
	const parts = [
		`${name}=${encodeURIComponent(value)}`,
		'Path=/',
		'HttpOnly',
		'SameSite=Lax',
	]

	if (typeof maxAge === 'number') {
		parts.push(`Max-Age=${maxAge}`)
	}

	if (config.nodeEnv === 'production') {
		parts.push('Secure')
	}

	return parts.join('; ')
}

function signSessionValue(login: string) {
	return crypto
		.createHmac('sha256', config.sessionSecret)
		.update(`${login}:admin`)
		.digest('hex')
}

export function createAuthCookie() {
	const payload = `${config.adminLogin}:admin:${signSessionValue(config.adminLogin)}`
	return serializeCookie(config.sessionCookieName, payload, oneWeekInSeconds)
}

export function clearAuthCookie() {
	return serializeCookie(config.sessionCookieName, '', 0)
}

export function isValidCredentials(login: string, password: string) {
	return (
		secureCompare(login, config.adminLogin) &&
		secureCompare(password, config.adminPassword)
	)
}

export function getSessionUser(req: Request) {
	const cookies = parseCookies(req.headers.cookie)
	const sessionValue = cookies[config.sessionCookieName]

	if (!sessionValue) return null

	const [login, roleValue, signature] = sessionValue.split(':')
	if (!login || roleValue !== 'admin' || !signature) return null

	const expectedSignature = signSessionValue(login)
	if (!secureCompare(signature, expectedSignature)) return null
	if (!secureCompare(login, config.adminLogin)) return null

	return {
		login: config.adminLogin,
		role: 'admin' as const,
	}
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
	const user = getSessionUser(req)
	if (!user) {
		return res.status(401).json({ message: 'Требуется авторизация администратора' })
	}

	res.locals.authUser = user
	next()
}
