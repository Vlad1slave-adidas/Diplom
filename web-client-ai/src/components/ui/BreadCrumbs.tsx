import ButtonNav from './ButtonNav'
import { cn } from '@/utils/cn'

interface BreadCrumbsProps {
	type?: 'movie' | 'series'
	name: string
	className?: string
	nameClassName?: string
	sectionText?: string
	sectionLink?: string
	sectionClassName?: string
}

export default function BreadCrumbs({
	type,
	name,
	className,
	nameClassName,
	sectionText,
	sectionLink,
	sectionClassName,
}: BreadCrumbsProps) {
	const defaultSection =
		type === 'movie'
			? { text: 'Фильмы', link: '/collection/movies' }
			: { text: 'Сериалы', link: '/collection/series' }

	const breadcrumbSection = {
		text: sectionText ?? defaultSection.text,
		link: sectionLink ?? defaultSection.link,
	}

	return (
		<div
			className={cn(
				`text-text-default absolute top-2 left-0 flex text-lg
					max-lg:text-base max-md:hidden`,
				className,
			)}
		>
			<ButtonNav
				text={breadcrumbSection.text}
				link={breadcrumbSection.link}
				className={cn(
					'with-slash-divider cursor-pointer hover-text gap-0',
					sectionClassName,
				)}
			/>

			<span
				className={cn(
					`with-slash-divider text-lg max-xl:text-base`,
					nameClassName,
				)}
			>
				{name}
			</span>
		</div>
	)
}
