'use client'

import { Menu, Sparkles, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import LogoutButton from '@/components/auth/LogoutButton'
import ButtonNav from '@/components/ui/ButtonNav'

interface HeaderProps {
	role: 'admin' | null
}

export default function Header({ role }: HeaderProps) {
	const [isOpen, setIsOpen] = useState(false)
	const navigation = [
		{ href: '/', label: 'Главная' },
		{ href: '/collection/movies', label: 'Фильмы' },
		...(role === 'admin' ? [{ href: '/admin', label: 'Админка' }] : []),
	]

	return (
		<header
			className='default-px relative z-40 flex w-full items-center
				justify-between max-md:absolute max-md:top-6 max-sm:top-8
				md:h-[var(--header-height)]'
		>
			<nav className='flex items-center gap-6 max-2xl:gap-4 max-xl:gap-3'>
				<div className='xs:gap-x-3 max-xs:justify-between flex items-center gap-x-2'>
					<button onClick={() => setIsOpen(!isOpen)} className='hover-text lg:hidden'>
						{isOpen ? (
							<X
								className='active:text-text-default-active text-text-default h-6 w-6 duration-100 ease-linear'
								strokeWidth={1.5}
							/>
						) : (
							<Menu
								className='active:text-text-default-active text-text-default h-6 w-6 duration-100 ease-linear'
								strokeWidth={1.5}
							/>
						)}
					</button>
					<Link href='/'>
						<Image
							className='xs:w-[6.75rem] mr-4 h-auto w-22 xl:w-[7.25rem]'
							src='/images/logo.png'
							alt='logo'
							priority
							height={32}
							width={116}
						/>
					</Link>
				</div>
				<div
					className='flex items-center gap-6 max-2xl:gap-4 max-xl:gap-3
						max-lg:hidden'
				>
					{navigation.map(item => (
						<ButtonNav key={item.href} text={item.label} link={item.href} />
					))}
				</div>
			</nav>

			<div className='flex items-center gap-5 max-2xl:gap-4 max-xl:gap-3'>
				<Link
					href='/collection/movies?mood=thoughtful&preferred_genre=драма&time_budget=long&pace=balanced&story_depth=complex&audience=adult&ai=true'
					className='primary-gradient text-text-default-active hidden items-center gap-2 px-4 py-1 text-lg max-2xl:text-base max-xl:px-3 max-xl:text-sm max-xl:py-1 max-md:hidden'
				>
					<Sparkles className='h-4 w-4' />
					Подобрать
				</Link>
				{role === 'admin' ? (
					<LogoutButton
						className='text-text-default hover:text-text-default-active hidden
							items-center gap-2 text-base duration-200 ease-linear md:flex'
					/>
				) : (
					<Link
						href='/sign-in?redirectPath=/admin'
						className='text-text-default hover:text-text-default-active hidden
							items-center gap-2 text-base duration-200 ease-linear md:flex'
					>
						Войти
					</Link>
				)}
			</div>

			{isOpen && (
				<aside
					className='bg-medium-dark-purple default-px fixed inset-0 top-[4.75rem]
						h-full w-full transform py-8 shadow-lg transition-all duration-300
						ease-in-out lg:hidden'
				>
					<nav className='mb-5 sm:mb-[1.625rem] md:mb-12'>
						<ul className='flex flex-col gap-x-2 gap-y-6'>
							{navigation.map(item => (
								<li key={item.href}>
									<ButtonNav text={item.label} link={item.href} className='sm:text-lg' />
								</li>
							))}
							<li>
								<ButtonNav
									text='AI-поиск'
									link='/collection/movies?mood=light&preferred_genre=комедия&time_budget=medium&pace=balanced&story_depth=light&audience=family&ai=true'
									className='sm:text-lg'
								/>
							</li>
							<li>
								{role === 'admin' ? (
									<LogoutButton
										className='text-text-default hover:text-text-default-active
											flex items-center gap-2 text-lg duration-200 ease-linear
											sm:text-lg'
									/>
								) : (
									<Link
										href='/sign-in?redirectPath=/admin'
										className='text-text-default hover:text-text-default-active
											flex items-center gap-2 text-lg duration-200 ease-linear
											sm:text-lg'
									>
										Войти
									</Link>
								)}
							</li>
						</ul>
					</nav>
				</aside>
			)}
		</header>
	)
}
