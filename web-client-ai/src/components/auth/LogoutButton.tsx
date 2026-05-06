'use client'

import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { getApiBaseUrl } from '@/lib/api'

interface LogoutButtonProps {
	className?: string
}

export default function LogoutButton({ className }: LogoutButtonProps) {
	const router = useRouter()
	const [isLoading, setIsLoading] = useState(false)

	async function handleLogout() {
		setIsLoading(true)

		try {
			await fetch(`${getApiBaseUrl()}/api/auth/logout`, {
				method: 'POST',
				credentials: 'include',
			})
		} finally {
			router.replace('/sign-in')
			router.refresh()
			setIsLoading(false)
		}
	}

	return (
		<button
			type='button'
			onClick={handleLogout}
			disabled={isLoading}
			className={className}
		>
			<LogOut className='h-4 w-4' />
			{isLoading ? 'Выходим...' : 'Выйти'}
		</button>
	)
}
