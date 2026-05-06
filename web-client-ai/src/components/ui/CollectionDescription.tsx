'use client'

import { useState } from 'react'

interface CollectionDescriptionProps {
	title: string
	description: string
}

export default function CollectionDescription({
	title,
	description,
}: CollectionDescriptionProps) {
	const [isHiddenText, setIsHiddenText] = useState(true)

	return (
		<section
			className='max-w-[60%] max-xl:max-w-[70%] max-lg:max-w-[80%]
				max-md:max-w-[90%] max-sm:max-w-full'
		>
			<h2 className='header-2 mb-4 max-lg:mb-3 max-md:mb-2 max-sm:mb-1'>
				{title}
			</h2>
			<p
				className={`body-2 mb-1 leading-5 ${
					isHiddenText && 'line-clamp-2 overflow-hidden text-ellipsis'
				}`}
			>
				{description}
			</p>
			<button
				className='body-2 text-text-default-active/80'
				onClick={() => setIsHiddenText(!isHiddenText)}
			>
				{isHiddenText ? 'Читать полностью' : 'Свернуть'}
			</button>
		</section>
	)
}
