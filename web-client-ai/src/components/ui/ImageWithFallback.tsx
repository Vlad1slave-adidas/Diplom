'use client'

import Image from 'next/image'
import { useState } from 'react'

interface ImageWithFallbackProps {
	src: string
	fallbackSrc: string
	className?: string
	width: number
	height: number
	alt: string
}

export default function ImageWithFallback({
	alt,
	src,
	fallbackSrc,
	className,
	width,
	height,
}: ImageWithFallbackProps) {
	const [imgSrc, setImgSrc] = useState(src)

	return (
		<Image
			className={className}
			width={width}
			height={height}
			src={imgSrc || fallbackSrc}
			onError={() => setImgSrc(fallbackSrc)}
			alt={alt}
			quality={75}
		/>
	)
}
