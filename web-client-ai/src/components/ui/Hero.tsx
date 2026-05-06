import BreadCrumbs from '@/components/ui/BreadCrumbs'
import BackgroundImage from '@/components/ui/BackgroundImage'
import HeroInfo from '@/components/ui/HeroInfo'
import type { HeroSliderItem } from '@/components/ui/HeroSlider'

export default function Hero(props: HeroSliderItem) {
	const { name, isHeroSlider } = props

	return (
		<section
			className='relative flex h-auto w-full items-center justify-between
				transition-transform duration-75 max-md:h-full max-md:flex-col-reverse
				md:aspect-[16/6] md:py-16'
		>
			{!isHeroSlider && (
				<BreadCrumbs
					type='movie'
					name={name}
					className='default-px'
					sectionText='Фильмы'
					sectionLink='/collection/movies'
				/>
			)}

			<HeroInfo {...props} />
			<BackgroundImage {...props} />
		</section>
	)
}
