import Image from 'next/image'
import type { HeroSliderItem } from '@/components/ui/HeroSlider'

type BackgroundImageProps = Pick<
	HeroSliderItem,
	'backgroundImage' | 'name' | 'isHeroSlider' | 'description'
>

export default function BackgroundImage({
	backgroundImage,
	name,
	isHeroSlider,
	description,
}: BackgroundImageProps) {
	return (
		<div
			className={`md:right-px-md lg:right-px-lg xl:right-px-xl
				2xl:right-px-default relative -z-10 h-auto w-full overflow-hidden
				backface-hidden max-md:top-8 md:absolute md:h-full md:w-[65%] lg:w-[70%]
				${
					!isHeroSlider && description
						? 'max-md:min-h-[26rem] max-sm:min-h-[20rem]'
						: 'max-md:min-h-[30rem] max-sm:min-h-[25rem]'
				}`}
		>
			{backgroundImage ? (
				<>
					<Image
						src={backgroundImage}
						alt={`${name} background`}
						className='h-full w-full object-cover object-center'
						fill
						priority
					/>
					<div className='hero-effects absolute inset-0' />
				</>
			) : (
				<div className='background-image-fallback' />
			)}
		</div>
	)
}
