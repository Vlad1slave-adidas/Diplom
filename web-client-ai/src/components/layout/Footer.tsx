import Link from 'next/link'

interface FooterProps {
	role: 'admin' | null
}

export default function Footer({ role }: FooterProps) {
	const footerLinks = [
		{ href: '/', label: 'Главная' },
		{ href: '/collection/movies', label: 'Каталог фильмов' },
		{
			href: '/collection/movies?mood=calm&preferred_genre=семейный&time_budget=short&pace=slow&story_depth=light&audience=family&ai=true',
			label: 'AI-подбор',
		},
		...(role === 'admin' ? [{ href: '/admin', label: 'Админка' }] : []),
	]

	return (
		<footer
			className='w-full border-t-[0.125rem] border-t-gray-600/50 pt-12 pb-6
				max-xl:pt-10 max-lg:pt-8 max-sm:pt-6 max-sm:pb-8'
		>
			<div
				className='flex w-full flex-wrap justify-between max-md:text-sm
					max-sm:flex-col max-sm:gap-8'
			>
				<div className='max-w-2xl'>
					<h2 className='title-1'>FilmSense</h2>
					<p className='caption-1 mt-3'>
						Локальный учебный онлайн-кинотеатр с интеллектуальной системой
						подбора фильмов на базе алгоритма Мамдани.
					</p>
				</div>

				<nav className='flex flex-col gap-3 max-lg:gap-2'>
					{footerLinks.map(item => (
						<Link
							key={item.href}
							className='hover:text-text-default-active text-text-default
								text-sm duration-200 ease-linear max-md:!text-xs'
							href={item.href}
						>
							{item.label}
						</Link>
					))}
				</nav>
			</div>

			<p className='text-text-default/60 caption-2 mt-18 max-xl:mt-15 max-lg:mt-8'>
				© FilmSense. Все данные о фильмах используются локально в рамках
				учебного проекта.
			</p>
		</footer>
	)
}
