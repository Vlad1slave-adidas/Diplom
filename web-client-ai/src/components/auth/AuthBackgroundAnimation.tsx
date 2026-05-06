'use client'

import Lottie from 'lottie-react'
import { useEffect, useState } from 'react'

type AnimationData = Record<string, unknown>

async function unzipEntry(buffer: ArrayBuffer, targetName: string) {
	const view = new DataView(buffer)
	const bytes = new Uint8Array(buffer)
	const decoder = new TextDecoder()
	let offset = 0

	while (offset + 30 <= bytes.length) {
		const signature = view.getUint32(offset, true)
		if (signature !== 0x04034b50) break

		const compressionMethod = view.getUint16(offset + 8, true)
		const compressedSize = view.getUint32(offset + 18, true)
		const fileNameLength = view.getUint16(offset + 26, true)
		const extraFieldLength = view.getUint16(offset + 28, true)
		const fileNameStart = offset + 30
		const fileNameEnd = fileNameStart + fileNameLength
		const fileName = decoder.decode(bytes.slice(fileNameStart, fileNameEnd))
		const dataStart = fileNameEnd + extraFieldLength
		const dataEnd = dataStart + compressedSize

		if (fileName === targetName) {
			const entryBytes = bytes.slice(dataStart, dataEnd)

			if (compressionMethod === 0) {
				return entryBytes
			}

			if (compressionMethod === 8) {
				const decompressedStream = new Response(entryBytes).body?.pipeThrough(
					new DecompressionStream('deflate-raw'),
				)

				if (!decompressedStream) {
					throw new Error('Не удалось распаковать dotLottie-архив')
				}

				return new Uint8Array(await new Response(decompressedStream).arrayBuffer())
			}

			throw new Error(`Неподдерживаемый метод сжатия: ${compressionMethod}`)
		}

		offset = dataEnd
	}

	throw new Error(`Файл ${targetName} не найден внутри dotLottie`)
}

async function loadAnimationData() {
	try {
		const response = await fetch('/animations/bg.lottie', { cache: 'force-cache' })
		if (!response.ok) {
			throw new Error('dotLottie недоступен')
		}

		const archive = await response.arrayBuffer()
		const jsonBytes = await unzipEntry(archive, 'a/bg.json')
		const jsonText = new TextDecoder().decode(jsonBytes)
		return JSON.parse(jsonText) as AnimationData
	} catch {
		const fallbackResponse = await fetch('/animations/bg.json', {
			cache: 'force-cache',
		})

		if (!fallbackResponse.ok) {
			throw new Error('Не удалось загрузить fallback-анимацию')
		}

		return (await fallbackResponse.json()) as AnimationData
	}
}

export default function AuthBackgroundAnimation() {
	const [animationData, setAnimationData] = useState<AnimationData | null>(null)

	useEffect(() => {
		let isActive = true

		void loadAnimationData().then(data => {
			if (isActive) {
				setAnimationData(data)
			}
		})

		return () => {
			isActive = false
		}
	}, [])

	return (
		<div aria-hidden='true' className='absolute inset-0 z-0 overflow-hidden'>
			{animationData ? (
				<Lottie
					animationData={animationData}
					loop
					className='h-full w-full scale-[1.08]'
					rendererSettings={{
						preserveAspectRatio: 'xMidYMid slice',
					}}
				/>
			) : (
				<div className='h-full w-full bg-[radial-gradient(circle_at_top,#1f4da633,transparent_45%),radial-gradient(circle_at_bottom,#8b51a733,transparent_40%),linear-gradient(180deg,#060919_0%,#0d143b_100%)]' />
			)}
		</div>
	)
}
