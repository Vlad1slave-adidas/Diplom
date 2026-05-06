import type { Metadata } from 'next'
import { Suspense } from 'react'
import SignInForm from '@/components/auth/SignInForm'
import { getServerSession } from '@/lib/server-api'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
	title: 'Вход в личный кабинет | FilmSense',
}

export default async function SignInPage() {
	if (await getServerSession()) {
		redirect('/')
	}

	return (
		<Suspense fallback={null}>
			<SignInForm />
		</Suspense>
	)
}
