import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import { getServerSession } from '@/lib/server-api'

export default async function Layout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	const user = await getServerSession()

	return (
		<>
			<div className='flex min-h-screen flex-col'>
				<Header role={user?.role ?? null} />
				<main className='flex-1'>{children}</main>
			</div>
			<div className='default-px'>
				<Footer role={user?.role ?? null} />
			</div>
		</>
	)
}
