import type { Metadata } from 'next'
import AdminDashboard from '@/components/admin/AdminDashboard'
import type { AdminBootstrapResponse } from '@/lib/api-types'
import { apiFetchServer, requireAdminSession } from '@/lib/server-api'

export const metadata: Metadata = {
	title: 'Админка | FilmSense',
	description:
		'Управление локальным каталогом фильмов, переменными и правилами Мамдани.',
}

export default async function AdminPage() {
	await requireAdminSession()
	const bootstrap = await apiFetchServer<AdminBootstrapResponse>(
		'/api/admin/bootstrap',
	)

	return <AdminDashboard initialData={bootstrap} />
}
