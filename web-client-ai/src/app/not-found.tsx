import Link from 'next/link'

export default function NotFound() {
	return (
		<div className='flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center'>
			<p className='text-text-info text-sm uppercase tracking-[0.2em]'>404</p>
			<h1 className='text-4xl font-bold text-white max-sm:text-3xl'>
				Страница не найдена
			</h1>
			<p className='text-text-default max-w-2xl text-lg max-sm:text-sm'>
				Нужный фильм или раздел не найден. Вернитесь в каталог и запустите
				подбор снова.
			</p>
			<Link
				href='/collection/movies'
				className='primary-gradient rounded-full px-6 py-3 text-base font-semibold text-white'
			>
				Открыть каталог
			</Link>
		</div>
	)
}
