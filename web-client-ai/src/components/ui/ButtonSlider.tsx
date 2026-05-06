import Link from 'next/link'

interface ButtonSliderProps {
	text: string
	additionalText: string
	className?: string
	link?: string
}

export default function ButtonSlider({
	text,
	additionalText,
	className,
	link,
}: ButtonSliderProps) {
	const content = (
		<>
			<div
				className='flex items-baseline gap-2 text-left text-2xl font-bold
					max-xl:text-xl max-sm:text-lg'
			>
				<span>{text}</span>
				<span className='max-sm:hidden pointer-fine:group-hover/section:hidden'>
					›
				</span>
			</div>

			<div
				className='text-text-default
					pointer-fine:group-hover/section:text-text-default-active flex
					-translate-x-full items-baseline gap-[0.375rem] text-xl
					font-light whitespace-nowrap opacity-0 transition-all duration-300
					ease-out max-xl:text-lg max-sm:hidden pointer-coarse:hidden
					pointer-fine:group-hover/section:translate-x-0
					pointer-fine:group-hover/section:opacity-100'
			>
				<span>{additionalText}</span>
				<span>›</span>
			</div>
		</>
	)

	return (
		<Link
			href={link ?? '/collection/movies'}
			className={`default-px text-text-default-active flex items-end gap-x-[1.125rem] ${className}`}
		>
			{content}
		</Link>
	)
}
