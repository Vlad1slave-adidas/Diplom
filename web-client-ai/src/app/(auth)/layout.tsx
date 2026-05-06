import Image from 'next/image'
import Link from 'next/link'
import AuthBackgroundAnimation from '@/components/auth/AuthBackgroundAnimation'

export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<div
			className='bg-dark-purple relative my-auto flex min-h-[100dvh] w-full
				items-center justify-center overflow-y-auto py-20'
		>
			<AuthBackgroundAnimation />

			<div
				className='bg-blue-dark relative z-10 mx-4 flex w-full max-w-[38.5rem]
					flex-col items-center rounded-[1.25rem] px-8 pt-[3rem] pb-[3.5rem]
					max-md:w-full max-md:rounded-[1rem] max-md:px-6 max-md:pt-[2.5rem]
					max-md:pb-[2.75rem] max-sm:rounded-[0.875rem] max-sm:px-4 max-sm:pt-8
					max-sm:pb-6'
			>
				<div className='mb-5 flex w-full flex-col items-center max-sm:mb-4'>
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
				</div>

				<div className='w-full'>{children}</div>
			</div>
		</div>
	)
}
