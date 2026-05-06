import Link from 'next/link'

interface ButtonWatchMovieProps {
	text: string
	className?: string
	link?: string
}

export default function ButtonWatchMovie({
	text,
	className,
	link,
}: ButtonWatchMovieProps) {
	if (link && !link.startsWith('/')) {
		return (
			<a
				href={link}
				target='_blank'
				rel='noreferrer'
				className={`button-primary primary-gradient whitespace-nowrap ${className}`}
			>
				{text}
			</a>
		)
	}

	return link ? (
		<Link
			href={link}
			className={`button-primary primary-gradient whitespace-nowrap ${className}`}
		>
			{text}
		</Link>
	) : (
		<button className={`button-primary primary-gradient whitespace-nowrap ${className}`}>
			{text}
		</button>
	)
}
