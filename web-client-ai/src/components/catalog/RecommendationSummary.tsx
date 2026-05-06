import type { PublicCatalogResponse } from '@/lib/api-types'

export default function RecommendationSummary({
	summary,
}: {
	summary: PublicCatalogResponse['summary']
}) {
	return (
		<section
			className='bg-blue-dark mt-8 mb-8 rounded-2xl px-10 py-7 max-lg:mt-7
				max-lg:mb-7 max-lg:px-7 max-lg:py-6 max-md:px-6 max-sm:mt-6
				max-sm:mb-6 max-sm:px-5 max-sm:py-5'
		>
			<h3 className='title-1 text-text-default-active'>{summary.title}</h3>
			<p className='body-2 mt-3'>{summary.description}</p>
			<div className='mt-5 flex flex-wrap gap-3'>
				{summary.metrics.map(metric => (
					<div
						key={metric.label}
						className='bg-blue rounded-2xl px-4 py-3 max-sm:w-full'
					>
						<div className='caption-2 text-text-default'>{metric.label}</div>
						<div className='title-4 text-text-default-active mt-1'>
							{metric.value}
						</div>
					</div>
				))}
			</div>
		</section>
	)
}
