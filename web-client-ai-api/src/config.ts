import dotenv from 'dotenv'

dotenv.config()

export const config = {
	port: Number(process.env.PORT || 4000),
	databaseUrl:
		process.env.DATABASE_URL ||
		'postgresql://2much@localhost:5432/web_client_ai?schema=public',
	corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
	adminLogin: process.env.ADMIN_LOGIN || 'admin',
	adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
	sessionSecret: process.env.SESSION_SECRET || 'filmsense-session-secret',
	sessionCookieName: 'filmsense_admin_session',
	nodeEnv: process.env.NODE_ENV || 'development',
}
