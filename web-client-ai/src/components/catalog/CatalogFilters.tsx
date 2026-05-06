'use client'

import { ChevronRight } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ApiVariable } from '@/lib/api-types'
import { cn } from '@/utils/cn'

interface CatalogFiltersProps {
	params: Record<string, string>
	variables: ApiVariable[]
	genres: string[]
	countries: string[]
	years: string[]
}

interface LocalState {
	genre: string
	year: string
	country: string
	order: string
	ai: boolean
	[key: string]: string | boolean
}

interface FilterOption {
	value: string
	label: string
}

interface FilterConfig {
	key: string
	label: string
	options: FilterOption[]
}

interface FilterSectionConfig {
	title: string
	description: string
	badge?: string
	filters: FilterConfig[]
}

function useIsMobileFilters() {
	const [isMobile, setIsMobile] = useState(false)

	useEffect(() => {
		const mediaQuery = window.matchMedia('(max-width: 520px)')
		const update = () => setIsMobile(mediaQuery.matches)

		update()
		mediaQuery.addEventListener('change', update)

		return () => mediaQuery.removeEventListener('change', update)
	}, [])

	return isMobile
}

function FilterOptionsList({
	options,
	value,
	onSelect,
	className,
	groupName,
}: {
	options: FilterOption[]
	value: string
	onSelect: (value: string) => void
	className?: string
	groupName: string
}) {
	return (
		<ul className={cn('space-y-4', className)}>
			{options.map(option => {
				const isChecked = option.value === value

				return (
					<li
						key={`${groupName}-${option.value}-${option.label}`}
						className='group flex w-full cursor-pointer items-center justify-between gap-x-6'
						onClick={() => onSelect(option.value)}
					>
						<span className='truncate text-lg font-medium'>{option.label}</span>
						<input
							type='radio'
							name={groupName}
							checked={isChecked}
							readOnly
							className='group-hover:[&:not(:checked)]:bg-accent-blue
								pointer-events-none flex-shrink-0 cursor-pointer transition-colors
								duration-100 ease-linear'
						/>
					</li>
				)
			})}
		</ul>
	)
}

function FilterSelect({
	config,
	value,
	isOpen,
	isMobile,
	onToggle,
	onChange,
}: {
	config: FilterConfig
	value: string
	isOpen: boolean
	isMobile: boolean
	onToggle: () => void
	onChange: (value: string) => void
}) {
	const selectRef = useRef<HTMLDivElement>(null)
	const dropdownRef = useRef<HTMLUListElement>(null)
	const selectedLabel =
		config.options.find(option => option.value === value)?.label ?? config.label

	useEffect(() => {
		if (!isOpen || isMobile) return

		const handleClick = (event: MouseEvent) => {
			const target = event.target as Node
			const isOutside =
				selectRef.current &&
				!selectRef.current.contains(target) &&
				dropdownRef.current &&
				!dropdownRef.current.contains(target)

			if (isOutside) {
				onToggle()
			}
		}

		document.addEventListener('mousedown', handleClick)
		return () => document.removeEventListener('mousedown', handleClick)
	}, [isOpen, isMobile, onToggle])

	useEffect(() => {
		if (!isOpen || !isMobile) return

		document.body.classList.add('overflow-hidden')
		return () => document.body.classList.remove('overflow-hidden')
	}, [isOpen, isMobile])

	return (
		<div ref={selectRef} className='relative w-full'>
			<div
				className={`text-text-info caption-2 transition-opacity duration-50
					ease-linear ${isOpen || value ? 'opacity-100' : 'opacity-0'}`}
			>
				{config.label}
			</div>
			<button
				type='button'
				onClick={onToggle}
				className='body-1 flex w-full items-center justify-between'
			>
				<span className='max-w-[90%] truncate text-left'>
					{selectedLabel || config.label}
				</span>
				<ChevronRight
					className={`xsm:rotate-90 transition-transform duration-150 ease-linear ${
						isOpen ? 'xsm:rotate-270' : ''
					}`}
				/>
			</button>
			<div className='primary-gradient mt-[0.125rem] h-[0.125rem] w-full' />

			{!isMobile && (
				<ul
					ref={dropdownRef}
					className={cn(
						`scrollbar-hidden options-dropdown overflow-y-scroll ${
							isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
						}`,
					)}
				>
					<FilterOptionsList
						options={config.options}
						value={value}
						onSelect={onChange}
						groupName={`catalog-filter-${config.key}`}
					/>
				</ul>
			)}

			{isMobile && isOpen && (
				<div
					className='bg-dark-purple/90 fixed inset-0 z-50 min-h-full w-full'
					onMouseDown={onToggle}
				>
					<section
						className='bg-medium-dark-purple absolute top-1/2 left-1/2 flex
							max-h-[85vh] w-[85vw] -translate-x-1/2 -translate-y-1/2 flex-col
							gap-y-5 rounded-2xl px-4 py-6'
						onMouseDown={event => event.stopPropagation()}
					>
						<h3 className='header-3'>{config.label}</h3>
						<div className='scrollbar-hidden options-modal overflow-y-scroll'>
							<FilterOptionsList
								options={config.options}
								value={value}
								onSelect={onChange}
								groupName={`catalog-modal-${config.key}`}
							/>
						</div>

						<div className='mt-4 flex w-full flex-col space-y-3'>
							<button
								type='button'
								onClick={onToggle}
								className='button-1 primary-gradient button-primary py-[0.625rem]'
							>
								Применить
							</button>
							<button
								type='button'
								onClick={onToggle}
								className='button-1 button-primary bg-blue py-[0.625rem]'
							>
								Назад
							</button>
						</div>
					</section>
				</div>
			)}
		</div>
	)
}

function FilterSection({
	section,
	form,
	openSelect,
	isMobile,
	setOpenSelect,
	update,
}: {
	section: FilterSectionConfig
	form: LocalState
	openSelect: string | null
	isMobile: boolean
	setOpenSelect: React.Dispatch<React.SetStateAction<string | null>>
	update: (key: string, value: string | boolean) => void
}) {
	return (
		<section
			className='bg-blue-dark rounded-2xl px-10 pt-7 pb-10 max-xl:px-9
				max-xl:pt-6 max-xl:pb-9 max-lg:px-7 max-lg:pt-[1.375rem] max-lg:pb-8
				max-md:px-6 max-md:pt-5 max-md:pb-7 max-sm:px-5'
		>
			<div className='mb-7 flex flex-wrap items-start justify-between gap-4 max-md:mb-6'>
				<div className='max-w-3xl space-y-2'>
					<div className='flex flex-wrap items-center gap-3'>
						<h3 className='header-3'>{section.title}</h3>
						{section.badge ? (
							<span
								className='primary-gradient text-text-default-active rounded-full
									px-3 py-1 text-sm font-medium uppercase tracking-[0.08em]'
							>
								{section.badge}
							</span>
						) : null}
					</div>
					<p className='text-text-info max-w-3xl text-base leading-6 max-sm:text-sm'>
						{section.description}
					</p>
				</div>
			</div>

			<div
				className='max-xsm:grid-cols-1! grid w-full justify-between gap-8
					max-lg:grid-cols-2 max-lg:gap-x-24 max-lg:gap-y-5 max-md:gap-x-12
					lg:grid-cols-3'
			>
				{section.filters.map(config => (
					<FilterSelect
						key={config.key}
						config={config}
						value={String(form[config.key] ?? '')}
						isOpen={openSelect === config.key}
						isMobile={isMobile}
						onToggle={() =>
							setOpenSelect(current => (current === config.key ? null : config.key))
						}
						onChange={value => update(config.key, value)}
					/>
				))}
			</div>
		</section>
	)
}

export default function CatalogFilters({
	params,
	variables,
	genres,
	countries,
	years,
}: CatalogFiltersProps) {
	const router = useRouter()
	const pathname = usePathname()
	const isMobile = useIsMobileFilters()
	const [openSelect, setOpenSelect] = useState<string | null>(null)
	const [form, setForm] = useState<LocalState>(() => {
		const nextState: LocalState = {
			order: params.order || 'recommendation',
			genre: params.genre || '',
			year: params.year || '',
			country: params.country || '',
			ai: params.ai !== 'false',
		}

		for (const variable of variables) {
			nextState[variable.key] = params[variable.key] || ''
		}

		return nextState
	})

	const aiFilters = useMemo<FilterConfig[]>(
		() =>
			variables.map(variable => ({
				key: variable.key,
				label: variable.name,
				options: [
					{ value: '', label: `Любое значение: ${variable.name}` },
					...variable.terms
						.filter(term => term.isActive)
						.map(term => ({
							value: term.key,
							label: term.label,
						})),
				],
			})),
		[variables],
	)

	const catalogFilters = useMemo<FilterConfig[]>(
		() => [
			{
				key: 'genre',
				label: 'Жанр каталога',
				options: [
					{ value: '', label: 'Все жанры' },
					...genres.map(item => ({ value: item, label: item })),
				],
			},
			{
				key: 'year',
				label: 'Год',
				options: [
					{ value: '', label: 'Все годы' },
					...years.map(item => ({ value: item, label: item })),
				],
			},
			{
				key: 'country',
				label: 'Страна',
				options: [
					{ value: '', label: 'Все страны' },
					...countries.map(item => ({ value: item, label: item })),
				],
			},
			{
				key: 'order',
				label: 'Сортировка',
				options: [
					{ value: 'recommendation', label: 'Рекомендуемые' },
					{ value: 'rating', label: 'По рейтингу' },
					{ value: 'year', label: 'По году' },
					{ value: 'title', label: 'По названию' },
				],
			},
		],
		[genres, countries, years],
	)

	const sections = useMemo<FilterSectionConfig[]>(
		() => [
			{
				title: 'Интеллектуальный подбор',
				description:
					'Эти параметры участвуют в нечетком выводе по алгоритму Мамдани и влияют на то, как система ранжирует фильмы по настроению, темпу, глубине сюжета и формату просмотра.',
				badge: 'Mamdani AI',
				filters: aiFilters,
			},
			{
				title: 'Фильтры каталога',
				description:
					'Эти фильтры сужают витрину по жёстким критериям и помогают уточнить каталог по жанру, году, стране и способу сортировки.',
				filters: catalogFilters,
			},
		],
		[aiFilters, catalogFilters],
	)

	const update = (key: string, value: string | boolean) => {
		setForm(current => ({ ...current, [key]: value }))
		if (!isMobile) {
			setOpenSelect(null)
		}
	}

	const apply = () => {
		const searchParams = new URLSearchParams()
		searchParams.set('order', String(form.order))
		if (form.ai) searchParams.set('ai', 'true')

		for (const variable of variables) {
			const value = String(form[variable.key] ?? '')
			if (value) {
				searchParams.set(variable.key, value)
			}
		}

		for (const key of ['genre', 'year', 'country']) {
			const value = String(form[key] ?? '')
			if (value) {
				searchParams.set(key, value)
			}
		}

		router.replace(`${pathname}?${searchParams.toString()}`, {
			scroll: false,
		})
	}

	const reset = () => {
		setOpenSelect(null)
		router.replace('/collection/movies', { scroll: false })
	}

	return (
		<div className='space-y-5 max-sm:space-y-4'>
			{sections.map(section => (
				<FilterSection
					key={section.title}
					section={section}
					form={form}
					openSelect={openSelect}
					isMobile={isMobile}
					setOpenSelect={setOpenSelect}
					update={update}
				/>
			))}

			<div
				className='bg-blue-dark flex flex-col gap-3 rounded-2xl px-10 py-6
					max-xl:px-9 max-lg:px-7 max-md:px-6 max-sm:px-5'
			>
				<button
					type='button'
					onClick={apply}
					className='button-primary primary-gradient px-6'
				>
					Применить
				</button>
				<button
					type='button'
					onClick={reset}
					className='button-primary bg-blue px-6'
				>
					Сбросить
				</button>
			</div>
		</div>
	)
}
