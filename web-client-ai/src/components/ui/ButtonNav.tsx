'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/utils/cn'

interface ButtonNavProps {
	text?: string
	icon?: React.ReactElement
	className?: string
	link: string
}

export default function ButtonNav({
	text,
	link,
	icon,
	className,
}: ButtonNavProps) {
	const pathname = usePathname()

	return (
		<Link
			className={cn(
				`max-sm:active:text-text-default-active hover:text-text-default-active
				text-text-default flex items-center gap-2 text-lg duration-200
				ease-linear max-2xl:text-base max-sm:duration-100`,
				className,
				pathname === link && 'text-text-default-active',
			)}
			href={link}
		>
			{icon}
			{text}
		</Link>
	)
}
