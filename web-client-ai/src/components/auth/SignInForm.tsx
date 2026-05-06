'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { getApiBaseUrl } from '@/lib/api'

export default function SignInForm() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const redirectPath = searchParams.get('redirectPath') || '/'
	const [login, setLogin] = useState('')
	const [password, setPassword] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [message, setMessage] = useState<string | null>(null)

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setIsLoading(true)
		setMessage(null)

		try {
			const response = await fetch(`${getApiBaseUrl()}/api/auth/login`, {
				method: 'POST',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					login,
					password,
				}),
			})

			const payload = (await response.json().catch(() => null)) as
				| { message?: string }
				| null

			if (!response.ok) {
				setMessage(payload?.message || 'Не удалось выполнить вход')
				return
			}

			router.replace(redirectPath)
			router.refresh()
		} catch {
			setMessage('Сервис авторизации недоступен. Проверьте backend.')
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className='flex w-full flex-col items-center'>
			<div
				className='mb-6 flex w-full flex-col items-center gap-2 text-center
					max-sm:mb-4 max-sm:gap-1'
			>
				<h4
					className='text-[2rem] leading-10 font-semibold max-lg:text-[1.75rem]
						max-lg:leading-9 max-md:leading-8 max-sm:text-[1.375rem]
						max-sm:leading-7'
				>
					Войти в личный кабинет
				</h4>
				<p className='body-3 text-text-info'>
					Введите логин и пароль администратора, чтобы открыть раздел управления FilmSense.
				</p>
			</div>

			<form
				onSubmit={handleSubmit}
				autoComplete='off'
				className='flex w-full max-w-width-form-content flex-col items-center'
			>
				<div className='w-full space-y-5 max-sm:space-y-4'>
					<label className='block w-full'>
						<div className='caption-2 mb-2 text-text-info'>Логин</div>
						<input
							type='text'
							name='login'
							required
							autoComplete='username'
							value={login}
							onChange={event => {
								setLogin(event.target.value)
								setMessage(null)
							}}
							placeholder='Введите логин'
							className='bg-medium-dark-purple text-text-default-active w-full rounded-2xl px-5 py-4'
						/>
					</label>

					<label className='block w-full'>
						<div className='caption-2 mb-2 text-text-info'>Пароль</div>
						<input
							type='password'
							name='password'
							required
							autoComplete='current-password'
							value={password}
							onChange={event => {
								setPassword(event.target.value)
								setMessage(null)
							}}
							placeholder='Введите пароль'
							className='bg-medium-dark-purple text-text-default-active w-full rounded-2xl px-5 py-4'
						/>
					</label>
				</div>

				{message && (
					<p className='text-red mt-4 w-full text-center text-balance max-md:text-sm'>
						{message}
					</p>
				)}

				<div className='mt-6 w-full max-w-width-form-content max-lg:mt-5 max-sm:mt-4'>
					<button
						type='submit'
						disabled={isLoading}
						className='primary-gradient button-primary w-full py-3 text-xl font-medium disabled:opacity-50 max-md:text-lg max-sm:py-[0.5625rem]'
					>
						{isLoading ? 'Входим...' : 'Войти'}
					</button>
				</div>
			</form>

			<div className='mt-8 flex flex-col items-center gap-3 text-center max-sm:mt-6'>
				<Link href='/sign-in'>
					<Image
						alt='FilmSense'
						width={174}
						height={48}
						priority
						src='/images/logo.png'
						className='h-auto w-[10.875rem] max-sm:w-[9.0625rem]'
					/>
				</Link>
				<p className='caption-2 max-w-md text-text-info'>
					Публичная часть онлайн-кинотеатра доступна без входа. Авторизация нужна
					только для административного раздела.
				</p>
			</div>
		</div>
	)
}
